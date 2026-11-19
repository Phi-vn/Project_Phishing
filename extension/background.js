// PhishArmor AI - Background Service Worker (Manifest V3)
// Lắng nghe sự kiện điều hướng thời gian thực: Tự động chặn khi người dùng click vào link lừa đảo

importScripts("config.js");
const BACKEND_API = `${PHISHARMOR_API_BASE}/predict`;

// Cache tạm thời các domain đã kiểm tra để tối ưu tốc độ (tránh gọi API lặp lại trong 60s)
const urlCache = new Map();

// Danh sách URL được người dùng chủ động bỏ qua cảnh báo (Bypass)
const bypassedUrls = new Set();

// Danh sách domain nội bộ / an toàn bỏ qua
const IGNORED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "192.168.",
  "10.",
  "chrome",
  "extensions",
  "newtab",
  "ntp.msn.com",
  "msn.com",
  "bing.com",
  "microsoft.com",
  "live.com",
  "google.com",
  "google.com.vn",
  "claude.ai",
  "anthropic.com",
  "openai.com",
  "chatgpt.com",
  "gemini.google.com",
  "github.com"
];

// Danh bạ xác thực tức thì tại trình duyệt (<1ms - Hoạt động cả khi mạng yếu / rớt mạng)
const CLIENT_SAFE_DOMAINS = [
  "google.com", "google.com.vn", "vnexpress.net", "youtube.com", "facebook.com",
  "github.com", "microsoft.com", "zalo.me", "tuoitre.vn", "thanhnien.vn",
  "dantri.com.vn", "baomoi.com", "wikipedia.org", "claude.ai", "openai.com",
  "chatgpt.com", "vietcombank.com.vn", "mbbank.com.vn", "techcombank.com.vn",
  "bidv.com.vn", "acb.com.vn", "shopee.vn", "lazada.vn", "tiki.vn",
  "dichvucong.gov.vn", "chinhphu.vn", "vneid.gov.vn", "vercel.com", "vercel.app",
  "github.dev", "supabase.co", "cloudflare.com", "render.com", "huggingface.co"
];

const TARGET_BRANDS = [
  "mbbank", "vietcombank", "techcombank", "bidv", "acb", "vpbank", "tpbank",
  "agribank", "shopee", "facebook", "vneid", "vnpay", "momo", "apple", "google"
];

const SENSITIVE_TRIGGERS = [
  "login", "verify", "otp", "auth", "secure", "bank", "voucher", "quatang", "xacthuc", "ebanking"
];

// Động cơ phân tích tức thì Client-side (Instant Heuristic Engine < 1ms)
function clientFastInspect(targetUrl) {
  try {
    const urlObj = new URL(targetUrl);
    if (!urlObj.protocol.startsWith("http")) return { is_phishing: false, trust_score: 100, action: "allow" };
    const host = urlObj.hostname.toLowerCase();
    const cleanHost = host.replace("www.", "");
    const fullUrl = targetUrl.toLowerCase();

    // 1. Kiểm tra mạng nội bộ & Whitelist tức thì
    if (
      host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" ||
      host.startsWith("192.168.") || host.startsWith("10.") ||
      CLIENT_SAFE_DOMAINS.some(d => cleanHost === d || cleanHost.endsWith("." + d))
    ) {
      return {
        is_phishing: false,
        trust_score: 99.0,
        action: "allow",
        label: "An toàn (Xác thực tức thì)",
        note: "Tên miền uy tín đạt chuẩn an toàn cao."
      };
    }

    // 2. Bắt tức thì Tấn công ký tự đồng hình (IDN Homograph / Font nhái)
    if (host.includes("xn--") || /[а-яА-ЯёЁ\u0400-\u04FF\u0370-\u03FF]/.test(host)) {
      return {
        is_phishing: true,
        trust_score: 5.0,
        action: "block",
        label: "Lừa đảo (Ký tự đồng hình / Font nhái)",
        note: "Phát hiện tấn công ký tự đồng hình (IDN Homograph / Font chữ nhái) mạo danh thương hiệu."
      };
    }

    // 3. Bắt tức thì Tên miền mạo danh thương hiệu kết hợp từ khóa nhạy cảm
    for (const brand of TARGET_BRANDS) {
      if (cleanHost.includes(brand)) {
        const isOfficial = CLIENT_SAFE_DOMAINS.some(d => cleanHost === d || cleanHost.endsWith("." + d));
        if (!isOfficial) {
          const hasTrigger = SENSITIVE_TRIGGERS.some(t => fullUrl.includes(t));
          if (hasTrigger) {
            return {
              is_phishing: true,
              trust_score: 5.0,
              action: "block",
              label: "Lừa đảo (Nhái thương hiệu)",
              note: `Tên miền không chính chủ kết hợp thương hiệu '${brand.toUpperCase()}' với từ khóa đánh cắp thông tin.`
            };
          }
        }
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

// Hàm kiểm tra URL: Kết hợp Động cơ Cục bộ tức thì + Cloud AI với Timeout 2.5s (Chống đơ khi mạng yếu)
async function inspectUrl(targetUrl) {
  try {
    const urlObj = new URL(targetUrl);
    if (!urlObj.protocol.startsWith("http")) return null;
    const hostname = urlObj.hostname.toLowerCase();
    if (IGNORED_HOSTS.some(h => hostname.includes(h))) return null;

    // 1. Chạy quét tức thì tại trình duyệt trước (0ms - chặn đứng ngay cả khi mạng lag)
    const fast = clientFastInspect(targetUrl);
    if (fast && fast.is_phishing) {
      return fast;
    }
    if (fast && !fast.is_phishing && fast.trust_score >= 95) {
      return fast;
    }

    // 2. Kiểm tra cache RAM
    if (urlCache.has(targetUrl)) {
      const cached = urlCache.get(targetUrl);
      if (Date.now() - cached.time < 60000) {
        return cached.result;
      }
    }

    // 3. Gửi lên máy chủ Cloud AI với thời gian chờ giới hạn 2.5 giây
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(BACKEND_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();

    // Lưu cache
    urlCache.set(targetUrl, { time: Date.now(), result: data });
    return data;
  } catch (err) {
    // Khi mạng yếu / rớt mạng / máy chủ ngủ: Dùng cơ chế Heuristic cục bộ dự phòng
    const fallback = clientFastInspect(targetUrl) || {
      is_phishing: false,
      trust_score: 85.0,
      action: "allow",
      label: "Bảo vệ dự phòng (Mạng yếu)",
      note: "Hệ thống tự động duy trì an toàn cục bộ khi kết nối mạng chập chờn."
    };
    return fallback;
  }
}

// 1. Tự động kiểm tra trước khi trình duyệt tải trang (onBeforeNavigate)
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Chỉ kiểm tra frame chính (khung trình duyệt người dùng đang xem)
  if (details.frameId !== 0) return;
  const targetUrl = details.url;

  // Bỏ qua trang block của extension để tránh vòng lặp
  if (targetUrl.includes("block.html") || targetUrl.includes("/block")) return;

  // Bỏ qua nếu URL nằm trong danh sách người dùng đã chủ động Bypass
  try {
    const targetHost = new URL(targetUrl).hostname.toLowerCase();
    if (bypassedUrls.has(targetUrl) || bypassedUrls.has(targetHost)) return;
  } catch (e) {}

  const result = await inspectUrl(targetUrl);
  if (!result) return;

  if (result.is_phishing && result.action === "block") {
    console.warn(`[PhishArmor] 🚨 PHÁT HIỆN LỪA ĐẢO: ${targetUrl}`);

    // Cập nhật Badge màu đỏ
    chrome.action.setBadgeText({ text: "BLOCK", tabId: details.tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444", tabId: details.tabId });

    // Hiển thị thông báo trên màn hình
    try {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "🛡️ PhishArmor AI - ĐÃ CHẶN WEBSITE LỪA ĐẢO!",
        message: `Trang web "${new URL(targetUrl).hostname}" đã bị chặn tự động do có dấu hiệu lừa đảo trực tuyến!`,
        priority: 2
      });
    } catch (e) {}

    // Lấy điểm tin cậy chuẩn từ Backend
    const trustScore = result.trust_score !== undefined ? Math.round(result.trust_score) : 8;

    // Chuyển hướng người dùng sang trang cảnh báo an toàn
    const blockPageUrl = chrome.runtime.getURL(`block.html?url=${encodeURIComponent(targetUrl)}&trust_score=${trustScore}`);
    chrome.tabs.update(details.tabId, { url: blockPageUrl });
  } else if (result.action === "warn" || (result.trust_score !== undefined && result.trust_score < 80)) {
    // Vùng Vàng (Nghi vấn / Chú ý): Hiển thị huy hiệu màu cam WARN, KHÔNG chặn người dùng
    chrome.action.setBadgeText({ text: "WARN", tabId: details.tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#f59e0b", tabId: details.tabId });
  } else {
    // Vùng Xanh (An toàn): Gắn badge màu xanh
    chrome.action.setBadgeText({ text: "SAFE", tabId: details.tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981", tabId: details.tabId });
  }
});

// 1b. Đón đầu chuyển hướng HTTP 301/302 và kiểm tra an toàn khi trang bắt đầu kết nối (OnCommitted)
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const targetUrl = details.url;
  if (!targetUrl || !targetUrl.startsWith("http") || targetUrl.includes("block.html") || targetUrl.includes("/block")) return;

  try {
    const targetHost = new URL(targetUrl).hostname.toLowerCase();
    if (bypassedUrls.has(targetUrl) || bypassedUrls.has(targetHost)) return;
  } catch (e) {}

  const result = await inspectUrl(targetUrl);
  if (result && result.is_phishing && result.action === "block") {
    const trustScore = result.trust_score !== undefined ? Math.round(result.trust_score) : 8;
    const blockPageUrl = chrome.runtime.getURL(`block.html?url=${encodeURIComponent(targetUrl)}&trust_score=${trustScore}`);
    chrome.tabs.update(details.tabId, { url: blockPageUrl });
  }
});

// 2. Lắng nghe thay đổi tab để cập nhật trạng thái
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!tab || !tab.url || !tab.url.startsWith("http")) {
      chrome.action.setBadgeText({ text: "", tabId: activeInfo.tabId });
      return;
    }
    const result = await inspectUrl(tab.url);
    if (result && result.is_phishing && result.action === "block") {
      chrome.action.setBadgeText({ text: "BLOCK", tabId: activeInfo.tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#ef4444", tabId: activeInfo.tabId });
    } else if (result && (result.action === "warn" || (result.trust_score !== undefined && result.trust_score < 80))) {
      chrome.action.setBadgeText({ text: "WARN", tabId: activeInfo.tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#f59e0b", tabId: activeInfo.tabId });
    } else if (result) {
      chrome.action.setBadgeText({ text: "SAFE", tabId: activeInfo.tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#10b981", tabId: activeInfo.tabId });
    }
  } catch (e) {}
});

// 3. Lắng nghe tin nhắn từ trang Block (Xử lý Bypass mở khóa truy cập)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "bypass_url" && message.url) {
    try {
      const u = new URL(message.url);
      bypassedUrls.add(message.url);
      bypassedUrls.add(u.hostname.toLowerCase());
      bypassedUrls.add(u.href);
    } catch (e) {
      bypassedUrls.add(message.url);
    }
    sendResponse({ status: "ok" });
  }
  return true;
});

console.log("[PhishArmor AI] Extension Realtime Detection Engine Loaded Successfully!");
