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
  // Tuyển dụng & Việc làm
  "topcv.vn", "vietnamworks.com", "itviec.com", "careerviet.vn", "careerbuilder.vn",
  "jobsgo.vn", "vieclam24h.vn", "timviec365.vn", "glints.com", "linkedin.com",

  // Báo chí & Tin tức
  "vnexpress.net", "tuoitre.vn", "thanhnien.vn", "dantri.com.vn", "baomoi.com",
  "vietnamnet.vn", "znews.vn", "zingnews.vn", "vtv.vn", "vov.vn", "genk.vn", "tinhte.vn",
  "laodong.vn", "tienphong.vn", "kenh14.vn", "cafef.vn", "cafebiz.vn", "soha.vn",

  // Thương mại điện tử & Chuỗi bán lẻ
  "shopee.vn", "shopee.com", "lazada.vn", "tiki.vn", "sendo.vn",
  "thegioididong.com", "dienmayxanh.com", "fptshop.com.vn", "cellphones.com.vn", "hoanghamobile.com",

  // Ngân hàng & Fintech
  "vietcombank.com.vn", "mbbank.com.vn", "techcombank.com.vn", "techcombank.com", "bidv.com.vn",
  "acb.com.vn", "vpbank.com.vn", "tpbank.com.vn", "tpb.vn", "agribank.com.vn",
  "vib.com.vn", "sacombank.com.vn", "sacombank.com", "hdbank.com.vn", "shb.com.vn", "ocb.com.vn",
  "msb.com.vn", "seabank.com.vn", "momo.vn", "vnpay.vn", "zalopay.vn",

  // Cơ quan Nhà nước & Viễn thông
  "dichvucong.gov.vn", "chinhphu.vn", "vneid.gov.vn", "baohiemxahoi.gov.vn", "thuvienphapluat.vn",
  "viettel.vn", "vietteltelecom.vn", "viettelpost.com.vn", "vinaphone.com.vn", "mobifone.vn", "fpt.vn", "evn.com.vn",

  // Nền tảng Quốc tế & Điện toán đám mây
  "google.com", "google.com.vn", "youtube.com", "facebook.com", "fb.com", "messenger.com", "instagram.com", "github.com",
  "microsoft.com", "cloud.microsoft", "office.com", "office365.com", "live.com", "onedrive.live.com",
  "sharepoint.com", "windows.net", "microsoftonline.com", "azure.com", "visualstudio.com",
  "zalo.me", "chat.zalo.me", "wikipedia.org", "claude.ai", "openai.com", "chatgpt.com",
  "gemini.google.com", "vercel.com", "vercel.app", "github.dev", "supabase.co",
  "cloudflare.com", "render.com", "huggingface.co", "canva.com", "figma.com", "apple.com", "icloud.com"
];

const TARGET_BRANDS = [
  "mbbank", "vietcombank", "techcombank", "bidv", "acb", "vpbank", "tpbank",
  "agribank", "vib", "sacombank", "shopee", "facebook", "vneid", "dichvucong",
  "vnpay", "momo", "apple", "google", "microsoft", "topcv", "viettel"
];

const CLIENT_RISKY_TLDS = [
  ".click", ".top", ".xyz", ".cc", ".icu", ".buzz", ".monster", ".sbs", ".cam",
  ".store", ".online", ".vip", ".club", ".site", ".link", ".cfd", ".skin", ".live",
  ".racing", ".bid", ".loan", ".rest", ".work", ".fit", ".tk", ".ml", ".ga", ".cf", ".gq"
];

const SENSITIVE_TRIGGERS = [
  "login", "verify", "otp", "auth", "secure", "bank", "voucher", "quatang", "xacthuc",
  "ebanking", "dinhdanh", "kichhoat", "biendong", "sodu", "nhanthuong", "traothuong",
  "vayvon", "giaingan", "khoathe", "momatkhau", "vneid", "dvc"
];

// Động cơ phân tích tức thì Client-side (Instant Heuristic Engine < 1ms)
function clientFastInspect(targetUrl) {
  try {
    const urlObj = new URL(targetUrl);
    if (!urlObj.protocol.startsWith("http")) return { is_phishing: false, trust_score: 100, action: "allow" };
    const host = urlObj.hostname.toLowerCase();
    const cleanHost = host.replace("www.", "");
    const fullUrl = targetUrl.toLowerCase();

    // 1. Kiểm tra mạng nội bộ, Cơ quan Nhà nước / Giáo dục (.gov.vn, .edu.vn, .gov, .edu) & Whitelist tức thì
    const isGovOrEdu = cleanHost.endsWith(".gov.vn") || cleanHost === "gov.vn" ||
                       cleanHost.endsWith(".edu.vn") || cleanHost === "edu.vn" ||
                       cleanHost.endsWith(".chinhphu.vn") || cleanHost === "chinhphu.vn" ||
                       cleanHost.endsWith(".gov") || cleanHost.endsWith(".edu");
    if (
      host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" ||
      host.startsWith("192.168.") || host.startsWith("10.") ||
      isGovOrEdu ||
      CLIENT_SAFE_DOMAINS.some(d => cleanHost === d || cleanHost.endsWith("." + d))
    ) {
      return {
        is_phishing: false,
        trust_score: 99.0,
        action: "allow",
        label: isGovOrEdu ? "An toàn (Cơ quan Nhà nước / Giáo dục)" : "An toàn (Xác thực tức thì)",
        note: isGovOrEdu ? "Tên miền cơ quan nhà nước / giáo dục được bảo chứng pháp lý." : "Tên miền uy tín đạt chuẩn an toàn cao."
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

    // 3. Bắt tức thì Subdomain Brand Hijacking & Nhái thương hiệu trên các đường dẫn lạ
    const hostParts = cleanHost.split('.');
    const isRiskyTld = CLIENT_RISKY_TLDS.some(t => cleanHost.endsWith(t));

    for (const brand of TARGET_BRANDS) {
      if (cleanHost.includes(brand)) {
        const isOfficial = CLIENT_SAFE_DOMAINS.some(d => cleanHost === d || cleanHost.endsWith("." + d));
        if (!isOfficial) {
          // A. Tên miền chứa thương hiệu trên TLD giá rẻ rủi ro cao (.top, .xyz, .click, .buzz...)
          if (isRiskyTld) {
            return {
              is_phishing: true,
              trust_score: 5.0,
              action: "block",
              label: "Lừa đảo (Nhái thương hiệu trên TLD rủi ro)",
              note: `Tên miền không chính chủ sử dụng đuôi mở rộng rủi ro chứa thương hiệu '${brand.toUpperCase()}'.`
            };
          }

          // B. Subdomain Brand Hijacking (Chèn thương hiệu vào subdomain của tên miền lạ)
          const inSubdomain = hostParts.length > 2 && hostParts.slice(0, -2).some(p => p.includes(brand));
          if (inSubdomain) {
            return {
              is_phishing: true,
              trust_score: 5.0,
              action: "block",
              label: "Lừa đảo (Subdomain Brand Hijacking)",
              note: `Kỹ thuật chèn thương hiệu '${brand.toUpperCase()}' vào subdomain của tên miền lạ '${hostParts.slice(-2).join('.')}'.`
            };
          }

          // C. Cấu trúc tiền tố/hậu tố gạch ngang (brand-, -brand)
          if (cleanHost.includes(`${brand}-`) || cleanHost.includes(`-${brand}`)) {
            return {
              is_phishing: true,
              trust_score: 5.0,
              action: "block",
              label: "Lừa đảo (Cấu trúc nhái thương hiệu)",
              note: `Tên miền sử dụng cấu trúc tiền tố/hậu tố giả mạo thương hiệu '${brand.toUpperCase()}'.`
            };
          }

          // D. Kết hợp thương hiệu với từ khóa nhạy cảm
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

    // 4. Bắt TLD rủi ro cao kết hợp từ khóa lừa đảo
    if (isRiskyTld) {
      const hasTrigger = SENSITIVE_TRIGGERS.some(t => fullUrl.includes(t));
      if (hasTrigger) {
        return {
          is_phishing: true,
          trust_score: 5.0,
          action: "block",
          label: "Lừa đảo (TLD rủi ro + Từ khóa nhạy cảm)",
          note: "Tên miền sử dụng đuôi mở rộng rủi ro kết hợp từ khóa nhạy cảm thường gặp trong tấn công lừa đảo."
        };
      }
    }

    // 5. Bắt đường dẫn chạy trực tiếp bằng IP công cộng (Public Raw IP Phishing)
    const isPublicIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost) &&
                       !cleanHost.startsWith("127.") && !cleanHost.startsWith("192.168.") &&
                       !cleanHost.startsWith("10.") && !cleanHost.startsWith("0.");
    if (isPublicIp) {
      const hasTrigger = SENSITIVE_TRIGGERS.some(t => fullUrl.includes(t));
      if (hasTrigger || !urlObj.protocol.startsWith("https") || urlObj.pathname.length > 1) {
        return {
          is_phishing: true,
          trust_score: 5.0,
          action: "block",
          label: "Lừa đảo (Public IP Phishing)",
          note: "Phát hiện truy cập cổng xác thực trực tiếp qua địa chỉ IP máy chủ công cộng không có tên miền bảo chứng."
        };
      }
    }

    // 6. Bắt đường dẫn hầm ngầm tạm thời (Phishing Tunnel: ngrok, duckdns, loca.lt, trycloudflare)
    const isTunnelHost = cleanHost.endsWith(".ngrok-free.app") || cleanHost.endsWith(".ngrok.io") ||
                         cleanHost.endsWith(".duckdns.org") || cleanHost.endsWith(".loca.lt") ||
                         cleanHost.endsWith(".trycloudflare.com");
    if (isTunnelHost) {
      const hasTrigger = SENSITIVE_TRIGGERS.some(t => fullUrl.includes(t));
      if (hasTrigger) {
        return {
          is_phishing: true,
          trust_score: 5.0,
          action: "block",
          label: "Lừa đảo (Phishing Tunnel)",
          note: "Phát hiện đường dẫn hầm ngầm tạm thời che giấu máy chủ phishing đánh cắp thông tin."
        };
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

// Biến theo dõi số lượng thông báo chưa đọc từ Admin
let globalUnreadNotifications = 0;

async function checkAdminNotifications() {
  try {
    const res = await fetch(`${PHISHARMOR_API_BASE}/api/feedback/notifications`);
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.status === "success") {
      const unread = data.unread_count !== undefined ? data.unread_count : 0;
      globalUnreadNotifications = unread;
      if (unread > 0) {
        chrome.action.setBadgeText({ text: String(unread) });
        chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
      } else {
        chrome.action.setBadgeText({ text: "" });
      }
    }
  } catch (e) {
    // Không log lỗi nếu backend ngủ hoặc offline
  }
}

// Khởi chạy kiểm tra định kỳ mỗi 30s
checkAdminNotifications();
setInterval(checkAdminNotifications, 30000);

// 2. Lắng nghe thay đổi tab để cập nhật trạng thái
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    if (globalUnreadNotifications > 0) {
      chrome.action.setBadgeText({ text: String(globalUnreadNotifications), tabId: activeInfo.tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#2563eb", tabId: activeInfo.tabId });
      return;
    }

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

// 3. Lắng nghe tin nhắn từ trang Block (Bypass) và Popup (Sync thông báo)
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
  } else if (message.action === "sync_notif_count") {
    const unread = message.unreadCount !== undefined ? message.unreadCount : 0;
    globalUnreadNotifications = unread;
    if (unread > 0) {
      chrome.action.setBadgeText({ text: String(unread) });
      chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
    sendResponse({ status: "ok" });
  }
  return true;
});

console.log("[PhishArmor AI] Extension Realtime Detection Engine Loaded Successfully!");
