// PhishArmor AI - Background Service Worker (Manifest V3)
// Lắng nghe sự kiện điều hướng thời gian thực: Tự động chặn khi người dùng click vào link lừa đảo

const BACKEND_API = "http://127.0.0.1:8000/predict";

// Cache tạm thời các domain đã kiểm tra để tối ưu tốc độ (tránh gọi API lặp lại trong 60s)
const urlCache = new Map();

// Danh sách domain nội bộ / an toàn bỏ qua
const IGNORED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "chrome",
  "extensions",
  "newtab",
  "google.com",
  "google.com.vn"
];

// Hàm kiểm tra URL qua Backend PhishArmor AI
async function inspectUrl(targetUrl) {
  try {
    const urlObj = new URL(targetUrl);
    
    // Bỏ qua các giao thức không phải http/https
    if (!urlObj.protocol.startsWith("http")) return null;
    
    // Bỏ qua localhost và hệ thống nội bộ
    const hostname = urlObj.hostname.toLowerCase();
    if (IGNORED_HOSTS.some(h => hostname.includes(h))) return null;

    // Kiểm tra cache
    if (urlCache.has(targetUrl)) {
      const cached = urlCache.get(targetUrl);
      if (Date.now() - cached.time < 60000) {
        return cached.result;
      }
    }

    // Gửi yêu cầu dự đoán tới PhishArmor API
    const response = await fetch(BACKEND_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl })
    });

    if (!response.ok) return null;
    const data = await response.json();

    // Lưu cache
    urlCache.set(targetUrl, { time: Date.now(), result: data });
    return data;
  } catch (err) {
    console.warn("[PhishArmor] API Error:", err);
    return null;
  }
}

// 1. Tự động kiểm tra trước khi trình duyệt tải trang (onBeforeNavigate)
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Chỉ kiểm tra frame chính (khung trình duyệt người dùng đang xem)
  if (details.frameId !== 0) return;
  const targetUrl = details.url;

  // Bỏ qua trang block của extension để tránh vòng lặp
  if (targetUrl.includes("block.html") || targetUrl.includes("/block")) return;

  const result = await inspectUrl(targetUrl);
  if (!result) return;

  if (result.is_phishing) {
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
  } else {
    // An toàn: Gắn badge màu xanh
    chrome.action.setBadgeText({ text: "SAFE", tabId: details.tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981", tabId: details.tabId });
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
    if (result && result.is_phishing) {
      chrome.action.setBadgeText({ text: "BLOCK", tabId: activeInfo.tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#ef4444", tabId: activeInfo.tabId });
    } else if (result) {
      chrome.action.setBadgeText({ text: "SAFE", tabId: activeInfo.tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#10b981", tabId: activeInfo.tabId });
    }
  } catch (e) {}
});

console.log("[PhishArmor AI] Extension Realtime Detection Engine Loaded Successfully!");
