// PhishArmor AI - Block Page Logic (Manifest V3 Compliant)

document.addEventListener("DOMContentLoaded", () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const rawUrl = params.get("url");
    const rawScore = params.get("score");

    if (rawUrl) {
      // Làm sạch URL để hiển thị gọn gàng
      let displayUrl = rawUrl;
      try {
        const u = new URL(rawUrl);
        displayUrl = u.hostname + (u.pathname !== "/" ? u.pathname : "");
      } catch (e) {
        displayUrl = rawUrl.replace(/^https?:\/\//i, "");
      }

      const blockedUrlEl = document.getElementById("blocked-url");
      if (blockedUrlEl) {
        blockedUrlEl.innerText = displayUrl;
      }
      document.title = "Đã chặn nguy hiểm: " + displayUrl + " - PhishArmor AI";

      // Cập nhật linh hoạt nội dung giải thích XAI theo từng loại URL
      updateDynamicXAI(displayUrl);
    }

    if (rawScore) {
      const scoreNum = parseInt(rawScore) || 90;
      const riskNum = Math.max(5, Math.min(99, 100 - scoreNum));
      const badgeEl = document.getElementById("risk-badge");
      if (badgeEl) {
        badgeEl.innerText = `Risk Score: ${riskNum}/100`;
      }
    }
  } catch (err) {
    console.error("[PhishArmor Block] Error loading parameters:", err);
  }
});

function updateDynamicXAI(targetUrl) {
  const lower = targetUrl.toLowerCase();
  const xaiContentEl = document.getElementById("xai-content");
  if (!xaiContentEl) return;

  // 1. Kịch bản Mạng xã hội (Facebook, Zalo, TikTok, Meta...)
  if (lower.includes("facebook") || lower.includes("fb") || lower.includes("zalo") || lower.includes("gift") || lower.includes("free")) {
    xaiContentEl.innerHTML = `
      <div class="xai-item">
        <span>🚨</span>
        <div>
          <strong>Mạo danh Mạng Xã Hội (Facebook Phishing)</strong>
          <span>Chiêu trò tặng quà ảo (Gift/Free) dụ dỗ người dùng đăng nhập tài khoản.</span>
        </div>
      </div>
      <div class="xai-item">
        <span>🔑</span>
        <div>
          <strong>Đánh cắp Cookie & Tài khoản cá nhân</strong>
          <span>Phát hiện mã nguồn thu thập trái phép mật khẩu đăng nhập và mã xác thực 2 lớp.</span>
        </div>
      </div>
    `;
    return;
  }

  // 2. Kịch bản Sàn thương mại điện tử (Shopee, Lazada, Voucher...)
  if (lower.includes("shopee") || lower.includes("voucher") || lower.includes("tiki") || lower.includes("lazada")) {
    xaiContentEl.innerHTML = `
      <div class="xai-item">
        <span>🎁</span>
        <div>
          <strong>Lừa đảo Khuyến mãi & Quà tặng ảo</strong>
          <span>Lợi dụng thương hiệu TMĐT lớn tung bẫy voucher ảo để kích thích lòng tham.</span>
        </div>
      </div>
      <div class="xai-item">
        <span>🌐</span>
        <div>
          <strong>Tên miền rác nguy hiểm (.xyz, .top, .click)</strong>
          <span>Đuôi tên miền giá rẻ thường xuyên bị các mạng lưới tội phạm sử dụng.</span>
        </div>
      </div>
    `;
    return;
  }

  // 3. Kịch bản Dịch vụ công / Thuế / VNeID
  if (lower.includes("gov") || lower.includes("vneid") || lower.includes("thue") || lower.includes("dichvucong")) {
    xaiContentEl.innerHTML = `
      <div class="xai-item">
        <span>🏛️</span>
        <div>
          <strong>Mạo danh Cổng Dịch vụ công / VNeID Quốc gia</strong>
          <span>Giả mạo cơ quan nhà nước nhằm dụ dỗ nạn nhân tải tệp ứng dụng độc hại (.apk).</span>
        </div>
      </div>
      <div class="xai-item">
        <span>⚠️</span>
        <div>
          <strong>Chiếm đoạt quyền trợ năng thiết bị</strong>
          <span>Ứng dụng độc hại cố gắng kiểm soát thiết bị và tự động trích xuất mã OTP ngân hàng.</span>
        </div>
      </div>
    `;
    return;
  }

  // 4. Mặc định: Ngân hàng / Tài chính
  xaiContentEl.innerHTML = `
    <div class="xai-item">
      <span>🚨</span>
      <div>
        <strong>Tên miền giả mạo thương hiệu (Typosquatting)</strong>
        <span>Cố tình sử dụng tên miền nhái dịch vụ ngân hàng với đuôi tên miền rủi ro cao.</span>
      </div>
    </div>
    <div class="xai-item">
      <span>🔒</span>
      <div>
        <strong>Biểu mẫu thu thập dữ liệu trái phép</strong>
        <span>Phát hiện cấu trúc form tự động đánh cắp mật khẩu ngân hàng và mã OTP.</span>
      </div>
    </div>
  `;
}
