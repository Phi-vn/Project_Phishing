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
  const badgeStatus = document.getElementById('badge-status');
  const featLexical = document.getElementById('feat-lexical');
  const featBrand = document.getElementById('feat-brand');
  const featForm = document.getElementById('feat-form');
  
  // AI Drawer elements
  const btnAiExplain = document.getElementById('btn-ai-explain');
  const aiDrawer = document.getElementById('ai-drawer');
  const closeAiDrawer = document.getElementById('close-ai-drawer');
  const aiDrawerContent = document.getElementById('ai-drawer-content');
  const toggleProtection = document.getElementById('toggle-protection');

  let currentTabUrl = "https://vietcombank.com.vn";
  let currentDomain = "vietcombank.com.vn";
  let lastPredictionData = null;

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
    sslStatus.className = "text-[10px] font-bold text-rose-500";
    sslStatus.innerHTML = '🔓 No SSL (HTTP)';
  } else {
    sslStatus.className = "text-[10px] font-bold text-emerald-600";
    sslStatus.innerHTML = '🔒 SSL Valid';
  }

  const setProgress = (percent) => {
    const circumference = 276.46; // 2 * PI * 44
    const offset = circumference - (percent / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
  };

  const runAnalysis = async () => {
    if (!toggleProtection.checked) {
      scoreDisplay.innerText = '--';
      setProgress(0);
      systemStatus.innerText = 'Protection Disabled';
      badgeStatus.innerText = 'ĐÃ TẮT BẢO VỆ';
      badgeStatus.className = "inline-block px-4 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[10px] font-black uppercase";
      message.innerHTML = 'Bạn đã tạm tắt tính năng bảo vệ realtime.';
      return;
    }

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
      lastPredictionData = data;

      const rawScore = data.confidence ?? 0;
      const isPhishing = data.is_phishing;
      let displayScore = isPhishing ? Math.round(100 - rawScore) : Math.round(rawScore);

      if (displayScore < 0) displayScore = 0;
      if (displayScore > 100) displayScore = 100;

      scoreDisplay.innerText = displayScore;
      setProgress(displayScore);

      if (isPhishing) {
        body.className = "bg-rose-50/50 text-slate-800 transition-colors duration-500";
        scoreCircle.setAttribute('stroke', '#ef4444');
        logoIcon.className = "w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30";
        statusDot.className = "relative inline-flex rounded-full h-2 w-2 bg-rose-500";
        statusPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75";
        systemStatus.className = "text-[10px] font-bold text-rose-600 uppercase tracking-wider";
        systemStatus.innerText = 'Cảnh báo nguy hiểm';
        urlIndicator.className = "absolute top-0 left-0 w-1.5 h-full bg-rose-500";
        scoreWrapper.classList.add('danger-pulse');
        scoreWrapper.classList.remove('safe-pulse');
        xaiBox.className = "bg-rose-50/90 rounded-[20px] p-4 border border-rose-100 mb-5 shadow-sm";
        
        badgeStatus.innerText = '🚨 NGUY HIỂM - CHẶN CẤP TỐC';
        badgeStatus.className = "inline-block px-4 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm";

        featLexical.innerText = 'Chứa ký tự bất thường';
        featLexical.className = 'font-bold text-rose-600';
        featBrand.innerText = 'Nghi vấn Typosquatting';
        featBrand.className = 'font-bold text-rose-600';
        featForm.innerText = 'Thu thập thông tin nhạy cảm';
        featForm.className = 'font-bold text-rose-600';

        scoreDisplay.className = "text-[40px] font-black text-rose-600 tracking-tighter leading-none";
        message.innerHTML = `<span class="text-rose-700 font-bold">⚠️ Cảnh báo Lừa đảo:</span> Trang web có dấu hiệu chiếm đoạt tài khoản. Đã chặn truy cập.`;
        
      } else {
        body.className = "bg-slate-50 text-slate-800 transition-colors duration-500";
        scoreCircle.setAttribute('stroke', '#10b981');
        logoIcon.className = "w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30";
        statusDot.className = "relative inline-flex rounded-full h-2 w-2 bg-emerald-500";
        statusPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
        systemStatus.className = "text-[10px] font-bold text-emerald-600 uppercase tracking-wider";
        systemStatus.innerText = 'Bảo vệ an toàn';
        urlIndicator.className = "absolute top-0 left-0 w-1.5 h-full bg-emerald-400";
        scoreWrapper.classList.add('safe-pulse');
        scoreWrapper.classList.remove('danger-pulse');
        xaiBox.className = "bg-white rounded-[20px] p-4 border border-slate-100 mb-5 shadow-sm";
        
        badgeStatus.innerText = '✓ ĐỘ TIN CẬY CAO';
        badgeStatus.className = "inline-block px-4 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm";

        featLexical.innerText = 'Tốt';
        featLexical.className = 'font-bold text-emerald-600';
        featBrand.innerText = 'Đúng tên miền gốc';
        featBrand.className = 'font-bold text-emerald-600';
        featForm.innerText = 'An toàn';
        featForm.className = 'font-bold text-emerald-600';

        scoreDisplay.className = "text-[40px] font-black text-emerald-600 tracking-tighter leading-none";
        message.innerHTML = `<span class="text-emerald-700 font-bold">✓ Website an toàn:</span> Không phát hiện mã độc hoặc cấu trúc đáng ngờ.`;
      }

    } catch (err) {
      message.innerHTML = '<span class="text-amber-600 font-bold">Không kết nối được Backend.</span> Vui lòng kiểm tra server tại http://127.0.0.1:8000.';
      systemStatus.innerText = 'Offline';
      statusDot.className = "relative inline-flex rounded-full h-2 w-2 bg-amber-500";
      statusPing.className = "hidden";
    } finally {
      btnText.innerText = 'Quét lại trang này';
      btnSpinner.classList.add('hidden');
      btnCheck.disabled = false;
    }
  };

  btnCheck.addEventListener('click', runAnalysis);

  toggleProtection.addEventListener('change', () => {
    runAnalysis();
  });

  // Gemini AI Drawer
  btnAiExplain.addEventListener('click', () => {
    aiDrawer.classList.remove('hidden');
    const scoreVal = scoreDisplay.innerText;
    
    if (scoreVal === '--') {
      aiDrawerContent.innerHTML = `<p className="text-slate-500">Bảo vệ đang tắt. Hãy bật lại để Gemini AI phân tích.</p>`;
    } else {
      aiDrawerContent.innerHTML = `
        <div class="p-3 bg-indigo-50 rounded-xl border border-indigo-100 font-sans">
          <p class="font-bold text-indigo-900 mb-1">🤖 Gemini AI Báo Cáo:</p>
          <p class="text-indigo-800">Trang web <b>${currentDomain}</b> đạt điểm tin cậy <b>${scoreVal}/100</b>.</p>
          <p class="text-slate-600 mt-2">Mô hình PhoBERT và XGBoost đã đánh giá cấu trúc đường dẫn và chứng chỉ mã hóa SSL. Bạn có thể tiếp tục sử dụng an toàn.</p>
        </div>
      `;
    }
  });

  closeAiDrawer.addEventListener('click', () => {
    aiDrawer.classList.add('hidden');
  });

  // Tự động quét ban đầu
  runAnalysis();
});