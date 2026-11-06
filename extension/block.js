// PhishArmor AI - Block Page Logic (Manifest V3 Compliant)

document.addEventListener("DOMContentLoaded", () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const rawUrl = params.get("url");
    const rawTrustScore = params.get("trust_score") || params.get("score");

    if (rawUrl) {
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

    // Hiển thị thống nhất nhãn Trust Score (Điểm tin cậy: Càng thấp càng nguy hiểm)
    let trustScoreNum = 8;
    if (rawTrustScore) {
      const val = parseInt(rawTrustScore, 10);
      if (!isNaN(val)) {
        trustScoreNum = Math.min(100, Math.max(1, val));
      }
    }
    const badgeEl = document.getElementById("risk-badge");
    if (badgeEl) {
      badgeEl.innerText = `Trust Score: ${trustScoreNum}/100`;
    }

    // Xử lý sự kiện click cho các nút hành động (Manifest V3 - Không dùng inline onclick)

    // 1. Nút Quay Lại Trang An Toàn
    const safeBtn = document.getElementById("btn-safe");
    if (safeBtn) {
      safeBtn.addEventListener("click", () => {
        window.location.href = "https://www.google.com";
      });
    }

    // 2. Nút Báo cáo nhầm lẫn (False Positive)
    const reportBtn = document.getElementById("btn-report");
    const toastMsg = document.getElementById("toast-msg");
    if (reportBtn) {
      reportBtn.addEventListener("click", async () => {
        reportBtn.disabled = true;
        reportBtn.style.opacity = "0.7";
        reportBtn.innerText = "Đang gửi báo cáo...";

        try {
          await fetch("http://127.0.0.1:8000/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: rawUrl || window.location.href,
              report_type: "false_positive",
              reason: "Người dùng báo cáo nhầm lẫn từ màn hình cảnh báo tiện ích PhishArmor",
              email: "analyst@phisharmor.vn"
            })
          });
        } catch (e) {
          console.warn("[PhishArmor] Gửi feedback:", e);
        }

        reportBtn.innerText = "✓ Đã báo cáo nhầm lẫn";
        if (toastMsg) {
          toastMsg.style.display = "block";
          toastMsg.innerText = "✓ Đã ghi nhận báo cáo! Hệ thống SOC sẽ tiến hành phúc tra an toàn.";
        }
      });
    }

    // 3. Nút Bỏ qua rủi ro và tiếp tục truy cập (Bypass)
    const bypassBtn = document.getElementById("btn-bypass");
    if (bypassBtn) {
      bypassBtn.addEventListener("click", () => {
        if (rawUrl) {
          if (confirm("⚠️ CẢNH BÁO NGUY HIỂM:\nTrang web này có dấu hiệu lừa đảo và đánh cắp thông tin tài khoản.\nBạn có chắc chắn muốn bỏ qua cảnh báo và tiếp tục truy cập không?")) {
            try {
              chrome.runtime.sendMessage({ action: "bypass_url", url: rawUrl }, () => {
                window.location.href = rawUrl;
              });
            } catch (e) {
              window.location.href = rawUrl;
            }
          }
        }
      });
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
        <span>Cố tình sử dụng tên miền nhái dịch vụ ngân hàng với đuôi tên miền rủi ro cao (.top, .net).</span>
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
