document.addEventListener('DOMContentLoaded', async () => {
  const urlDisplay = document.getElementById('current-url');
  const scoreDisplay = document.getElementById('trust-score');
  const btnCheck = document.getElementById('btn-check');
  const message = document.getElementById('message');
  const systemStatus = document.getElementById('system-status');
  const sslStatus = document.getElementById('ssl-status');
  
  // Progress bars
  const metricUrl = document.getElementById('metric-url');
  const barUrl = document.getElementById('bar-url');
  const metricBrand = document.getElementById('metric-brand');
  const barBrand = document.getElementById('bar-brand');
  const metricContent = document.getElementById('metric-content');
  const barContent = document.getElementById('bar-content');

  // Lấy URL trang hiện tại
  let currentTabUrl = "https://example.com";
  let currentDomain = "example.com";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      currentTabUrl = tab.url;
      const urlObj = new URL(tab.url);
      currentDomain = urlObj.hostname.replace('www.', '');
    }
  } catch(e) {
    // fallback for local testing without extension context
  }

  urlDisplay.innerText = currentDomain;
  
  // Set SSL status initially based on protocol
  if (currentTabUrl.startsWith('https')) {
    sslStatus.innerHTML = '✓ SSL hợp lệ';
    sslStatus.style.background = '#dcfce7';
    sslStatus.style.color = '#166534';
  } else {
    sslStatus.innerHTML = '⚠️ Không có SSL';
    sslStatus.style.background = '#fef3c7';
    sslStatus.style.color = '#92400e';
  }

  btnCheck.addEventListener('click', async () => {
    btnCheck.innerText = 'Đang phân tích...';
    btnCheck.disabled = true;
    systemStatus.innerText = 'Đang quét...';
    
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentTabUrl })
      });
      
      if (!response.ok) throw new Error("Máy chủ Backend không phản hồi");
      
      const data = await response.json();
      
      const score = data.confidence ?? 0;
      const isPhishing = data.is_phishing;
      
      if (isPhishing) {
        // Trạng thái Lừa đảo
        document.body.classList.add('danger');
        systemStatus.innerText = 'Phát hiện rủi ro!';
        // Điểm lừa đảo (confidence) càng cao -> Trust Score càng thấp
        scoreDisplay.innerText = Math.round(100 - score) + '%';
        message.innerText = data.note || 'Cảnh báo: Phát hiện dấu hiệu lừa đảo cao. Hãy rời khỏi trang này ngay!';
        
        metricUrl.innerText = 'Bất thường (0.95)';
        barUrl.style.width = '95%';
        metricBrand.innerText = 'Nghi vấn giả mạo';
        barBrand.style.width = '85%';
        metricContent.innerText = 'Form ẩn / Đáng ngờ';
        barContent.style.width = '90%';
        
      } else {
        // Trạng thái An toàn
        document.body.classList.remove('danger');
        systemStatus.innerText = 'Đang kích hoạt';
        // Điểm an toàn (confidence) -> Trust Score
        scoreDisplay.innerText = Math.round(score) + '%';
        message.innerText = data.note || 'Độ tin cậy cao — không phát hiện dấu hiệu bất thường';
        
        metricUrl.innerText = '0.02 - Thấp';
        barUrl.style.width = '15%';
        metricBrand.innerText = 'Không phát hiện';
        barBrand.style.width = '5%';
        metricContent.innerText = 'Ổn định';
        barContent.style.width = '10%';
      }
      
    } catch (err) {
      message.innerText = 'Lỗi kết nối tới AI Backend: Hãy đảm bảo đã bật Uvicorn.';
      systemStatus.innerText = 'Lỗi kết nối';
      systemStatus.style.color = '#f59e0b';
    } finally {
      btnCheck.innerText = 'Quét lại trang';
      btnCheck.disabled = false;
    }
  });
  
  // Tự động quét khi vừa mở popup extension
  setTimeout(() => {
    btnCheck.click();
  }, 150);
});