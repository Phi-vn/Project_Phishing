document.addEventListener('DOMContentLoaded', async () => {
  const urlDisplay = document.getElementById('current-url');
  const scoreDisplay = document.getElementById('trust-score');
  const badge = document.getElementById('badge');
  const btnCheck = document.getElementById('btn-check');

  // Lấy URL trang hiện tại
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    urlDisplay.innerText = tab.url;
  }

  btnCheck.addEventListener('click', async () => {
    btnCheck.innerText = 'Đang phân tích...';
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab?.url || "https://vnexpress.net/" })
      });
      const data = await response.json();
      
      // Lấy điểm số từ dữ liệu trả về
      const score = data.trust_score ?? 92;
      scoreDisplay.innerText = score + '%';

      if (data.is_phishing) {
        badge.innerText = 'Nguy hiểm';
        badge.style.background = '#FEE2E2';
        badge.style.color = '#991B1B';
      } else {
        badge.innerText = 'An toàn';
        badge.style.background = '#DCFCE7';
        badge.style.color = '#166534';
      }
    } catch (err) {
      alert('Không kết nối được tới Backend: ' + err.message);
    } finally {
      btnCheck.innerText = 'Quét kiểm tra ngay';
    }
  });
});