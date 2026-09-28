document.addEventListener('DOMContentLoaded', async () => {
  const urlDisplay = document.getElementById('current-url');
  const scoreDisplay = document.getElementById('trust-score');
  const btnCheck = document.getElementById('btn-check');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const message = document.getElementById('message');
  const systemStatus = document.getElementById('system-status');
  const statusDot = document.getElementById('status-dot');
  const statusPing = document.getElementById('status-ping');
  const sslStatus = document.getElementById('ssl-status');
  const scoreCircle = document.getElementById('score-circle');
  const scoreWrapper = document.getElementById('score-wrapper');
  const body = document.getElementById('body');
  const logoIcon = document.getElementById('logo-icon');
  const urlIndicator = document.getElementById('url-indicator');
  const xaiBox = document.getElementById('xai-box');

  // Lấy URL
  let currentTabUrl = "https://yourbnk-secure-login.net/verify";
  let currentDomain = "yourbnk-secure-login.net";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      currentTabUrl = tab.url;
      const urlObj = new URL(tab.url);
      currentDomain = urlObj.hostname.replace('www.', '');
    }
  } catch(e) {}

  urlDisplay.innerText = currentDomain;

  if (!currentTabUrl.startsWith('https')) {
    sslStatus.className = "flex-shrink-0 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold flex items-center gap-1";
    sslStatus.innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> No SSL';
  }

  const setProgress = (percent) => {
    const circumference = 283;
    const offset = circumference - (percent / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
  };

  btnCheck.addEventListener('click', async () => {
    btnText.innerText = 'Đang phân tích...';
    btnSpinner.classList.remove('hidden');
    btnCheck.disabled = true;
    
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentTabUrl })
      });
      
      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      
      const score = data.confidence ?? 0;
      const isPhishing = data.is_phishing;
      
      if (isPhishing) {
        body.classList.replace('bg-slate-50', 'bg-rose-50/50');
        scoreCircle.setAttribute('stroke', '#ef4444');
        logoIcon.className = "w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30";
        statusDot.className = "relative inline-flex rounded-full h-2 w-2 bg-rose-500";
        statusPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75";
        systemStatus.className = "text-[10px] font-bold text-rose-600 uppercase tracking-widest";
        systemStatus.innerText = 'Nguy hiểm';
        urlIndicator.className = "absolute top-0 left-0 w-1.5 h-full bg-rose-500";
        scoreWrapper.classList.add('danger-pulse');
        scoreWrapper.classList.remove('safe-pulse');
        xaiBox.className = "bg-rose-50/80 rounded-[20px] p-4 border border-rose-100 mb-6";
        
        let displayScore = Math.round(100 - score);
        scoreDisplay.innerText = displayScore;
        setProgress(displayScore);
        scoreDisplay.className = "text-[40px] font-black text-rose-600 tracking-tighter leading-none";
        
        message.innerHTML = `<span class="text-rose-700 font-bold">⚠️ Cảnh báo lừa đảo:</span> ${data.note || 'Trang web có dấu hiệu lừa đảo cao.'}`;
        
      } else {
        body.classList.replace('bg-rose-50/50', 'bg-slate-50');
        scoreCircle.setAttribute('stroke', '#10b981');
        logoIcon.className = "w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30";
        statusDot.className = "relative inline-flex rounded-full h-2 w-2 bg-emerald-500";
        statusPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
        systemStatus.className = "text-[10px] font-bold text-emerald-600 uppercase tracking-widest";
        systemStatus.innerText = 'Bảo vệ an toàn';
        urlIndicator.className = "absolute top-0 left-0 w-1.5 h-full bg-emerald-400";
        scoreWrapper.classList.add('safe-pulse');
        scoreWrapper.classList.remove('danger-pulse');
        xaiBox.className = "bg-emerald-50/80 rounded-[20px] p-4 border border-emerald-100 mb-6";
        
        let displayScore = Math.round(score);
        scoreDisplay.innerText = displayScore;
        setProgress(displayScore);
        scoreDisplay.className = "text-[40px] font-black text-emerald-600 tracking-tighter leading-none";
        
        message.innerHTML = `<span class="text-emerald-700 font-bold">✓ Website an toàn:</span> ${data.note || 'Không phát hiện mã độc hoặc cấu trúc đáng ngờ.'}`;
      }
      
    } catch (err) {
      message.innerHTML = '<span class="text-amber-600 font-bold">Lỗi kết nối tới AI Backend.</span> Vui lòng kiểm tra Server.';
      systemStatus.innerText = 'Mất kết nối';
      statusDot.className = "relative inline-flex rounded-full h-2 w-2 bg-amber-500";
      statusPing.className = "hidden";
    } finally {
      btnText.innerText = 'Quét lại trang';
      btnSpinner.classList.add('hidden');
      btnCheck.disabled = false;
    }
  });
  
  // Tự động quét sau 300ms
  setTimeout(() => {
    btnCheck.click();
  }, 300);
});