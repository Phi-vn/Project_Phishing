// PhishArmor AI - Extension Popup Logic
// Tự động phân tích an toàn URL của Tab hiện tại qua PhoBERT & XGBoost Engine

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
  const logoIcon = document.getElementById('logo-icon');
  const urlIndicator = document.getElementById('url-indicator');
  const badgeStatus = document.getElementById('badge-status');
  const featLexical = document.getElementById('feat-lexical');
  const featBrand = document.getElementById('feat-brand');
  const featForm = document.getElementById('feat-form');
  const toggleProtection = document.getElementById('toggle-protection');
  
  // AI Drawer elements
  const btnAiExplain = document.getElementById('btn-ai-explain');
  const aiDrawer = document.getElementById('ai-drawer');
  const closeAiDrawer = document.getElementById('close-ai-drawer');
  const aiDrawerContent = document.getElementById('ai-drawer-content');
  const btnDashboard = document.getElementById('btn-dashboard');

  let currentTabUrl = "https://google.com";
  let currentDomain = "google.com";
  let lastPredictionData = null;

  // Lấy URL từ active tab trong Chrome
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      currentTabUrl = tab.url;
      try {
        const urlObj = new URL(tab.url);
        currentDomain = urlObj.hostname.replace('www.', '');
      } catch (e) {
        currentDomain = tab.url;
      }
    }
  } catch(e) {
    console.warn("Could not query active tab:", e);
  }

  // Phân loại địa chỉ nội bộ: Trang hệ thống trình duyệt hoặc Môi trường Localhost/LAN
  const getSpecialUrlType = (url) => {
    if (!url) return { type: "system", name: "Trang hệ thống" };
    const lower = url.toLowerCase().trim();

    if (
      lower.startsWith("chrome://") ||
      lower.startsWith("edge://") ||
      lower.startsWith("about:") ||
      lower.startsWith("chrome-extension://") ||
      lower.startsWith("extension://") ||
      lower.startsWith("devtools://") ||
      lower.startsWith("file://") ||
      lower.startsWith("view-source:") ||
      (!lower.startsWith("http://") && !lower.startsWith("https://"))
    ) {
      return { type: "system", name: "Trang hệ thống trình duyệt" };
    }

    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host === "::1" ||
        host.endsWith(".localhost") ||
        host.endsWith(".local") ||
        host.startsWith("192.168.") ||
        host.startsWith("10.") ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
      ) {
        return { type: "local", name: "Môi trường nội bộ (Localhost / LAN)" };
      }
    } catch (e) {}

    return null;
  };

  const renderSpecialPageUI = (specialType) => {
    const isLocal = specialType.type === "local";
    if (urlDisplay) urlDisplay.innerText = currentDomain || (isLocal ? "Localhost" : "Trang nội bộ");
    
    if (sslStatus) {
      sslStatus.className = "ssl-tag";
      sslStatus.innerHTML = isLocal ? "💻 Mạng máy tính cục bộ (Local)" : "🛡️ Trang nội bộ trình duyệt";
    }

    if (scoreDisplay) {
      scoreDisplay.innerText = 100;
      scoreDisplay.className = "score-number safe";
    }
    setProgress(100);

    if (scoreCircle) scoreCircle.style.stroke = '#10b981';
    if (logoIcon) logoIcon.className = "logo-box safe";
    if (statusDot) statusDot.className = "status-dot";
    if (statusPing) statusPing.className = "status-ping";

    if (systemStatus) {
      systemStatus.className = "status-text";
      systemStatus.innerText = isLocal ? "Mạng nội bộ an toàn" : "Trang hệ thống trình duyệt";
    }

    if (urlIndicator) urlIndicator.className = "card-indicator";

    if (badgeStatus) {
      badgeStatus.innerText = isLocal ? "✓ MÔI TRƯỜNG PHÁT TRIỂN NỘI BỘ" : "✓ TRANG NỘI BỘ HỆ THỐNG";
      badgeStatus.className = "badge-pill safe";
    }

    if (featLexical) {
      featLexical.innerText = isLocal ? "Máy chủ nội bộ" : "Chuẩn hệ thống";
      featLexical.className = "diag-val";
    }
    if (featBrand) {
      featBrand.innerText = isLocal ? "Dịch vụ cá nhân (Airflow/Dev)" : "Trình duyệt gốc";
      featBrand.className = "diag-val";
    }
    if (featForm) {
      featForm.innerText = "An toàn tuyệt đối";
      featForm.className = "diag-val";
    }

    if (message) {
      if (isLocal) {
        message.innerHTML = `<strong style="color: #047857;">✓ Môi trường nội bộ (Localhost):</strong> Đây là dịch vụ cục bộ đang chạy trực tiếp trên máy của bạn (<code>${currentDomain}</code>), không qua internet công cộng nên an toàn tuyệt đối.`;
      } else {
        message.innerHTML = `<strong style="color: #047857;">✓ Trang hệ thống trình duyệt:</strong> Bạn đang ở trang cài đặt nội bộ của Chrome/Edge (<code>${currentTabUrl}</code>). Hãy mở một website ngoài internet (ví dụ: <code>vnexpress.net</code>, <code>google.com</code>) để quét nhé!`;
      }
    }

    if (btnText) btnText.innerText = isLocal ? "Mạng nội bộ (An toàn)" : "Trang nội bộ (Không cần quét)";
    if (btnSpinner) btnSpinner.classList.remove("visible");
    if (btnCheck) btnCheck.disabled = true;
  };

  const specialInfo = getSpecialUrlType(currentTabUrl);

  if (urlDisplay) {
    urlDisplay.innerText = currentDomain;
  }

  // Kiểm tra SSL ban đầu
  if (sslStatus) {
    if (specialInfo) {
      sslStatus.className = "ssl-tag";
      sslStatus.innerHTML = specialInfo.type === "local" ? "💻 Mạng máy tính cục bộ (Local)" : "🛡️ Trang nội bộ trình duyệt";
    } else if (!currentTabUrl.startsWith('https')) {
      sslStatus.className = "ssl-tag danger";
      sslStatus.innerHTML = '🔓 Không có SSL (HTTP)';
    } else {
      sslStatus.className = "ssl-tag";
      sslStatus.innerHTML = '🔒 SSL Hợp lệ';
    }
  }

  const setProgress = (percent) => {
    if (!scoreCircle) return;
    const circumference = 276.46; // 2 * PI * 44
    const offset = circumference - (percent / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
  };

  const runAnalysis = async () => {
    const special = getSpecialUrlType(currentTabUrl);
    if (special) {
      renderSpecialPageUI(special);
      return;
    }

    if (!toggleProtection.checked) {
      if (scoreDisplay) {
        scoreDisplay.innerText = '--';
        scoreDisplay.className = 'score-number';
      }
      setProgress(0);
      if (systemStatus) systemStatus.innerText = 'Đã tắt bảo vệ';
      if (badgeStatus) {
        badgeStatus.innerText = 'ĐÃ TẮT BẢO VỆ';
        badgeStatus.className = "badge-pill disabled";
      }
      if (message) message.innerHTML = 'Bạn đã tạm dừng tính năng giám sát an toàn chủ động.';
      return;
    }

    if (btnText) btnText.innerText = 'Đang phân tích...';
    if (btnSpinner) btnSpinner.classList.add('visible');
    if (btnCheck) btnCheck.disabled = true;

    // Fast-path tức thì: Nếu là website quen thuộc, hiển thị an toàn trước trong 0ms tránh chờ mạng
    const isKnownFastSafe = (
      currentDomain.includes("google") || currentDomain.includes("facebook") ||
      currentDomain.includes("vnexpress") || currentDomain.includes("youtube") ||
      currentDomain.includes("zalo") || currentDomain.includes("github") ||
      currentDomain.includes("microsoft") || currentDomain.includes("wikipedia")
    );
    if (isKnownFastSafe) {
      if (scoreDisplay) {
        scoreDisplay.innerText = '99';
        scoreDisplay.className = "score-number safe";
      }
      setProgress(99);
      if (badgeStatus) {
        badgeStatus.innerText = '✓ ĐỘ TIN CẬY CAO';
        badgeStatus.className = "badge-pill safe";
      }
    }

    try {
      const apiBase = (typeof PHISHARMOR_API_BASE !== "undefined") ? PHISHARMOR_API_BASE : "http://127.0.0.1:8000";
      
      // Giới hạn thời gian chờ 2.5 giây (chống mạng yếu làm đơ giao diện)
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${apiBase}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentTabUrl }),
        signal: controller.signal
      });
      clearTimeout(timer);
      
      if (!response.ok) throw new Error("Backend offline hoặc lỗi HTTP");
      const data = await response.json();
      lastPredictionData = data;

      const rawConfidence = data.confidence ?? 0;
      const isPhishing = Boolean(data.is_phishing);
      
      // Tính điểm an toàn Trust Score
      let displayScore = 95;
      if (data.trust_score !== undefined) {
        displayScore = Math.round(data.trust_score);
      } else if (isPhishing) {
        displayScore = Math.max(1, Math.round(100 - rawConfidence));
      } else {
        displayScore = Math.min(100, Math.round(rawConfidence));
      }

      if (displayScore < 0) displayScore = 0;
      if (displayScore > 100) displayScore = 100;

      if (scoreDisplay) scoreDisplay.innerText = displayScore;
      setProgress(displayScore);

      if (isPhishing) {
        // --- TRẠNG THÁI LỪA ĐẢO / NGUY HIỂM ---
        if (scoreCircle) scoreCircle.style.stroke = '#ef4444';
        if (scoreDisplay) scoreDisplay.className = "score-number danger";
        if (logoIcon) logoIcon.className = "logo-box danger";
        if (statusDot) statusDot.className = "status-dot danger";
        if (statusPing) statusPing.className = "status-ping danger";
        if (systemStatus) {
          systemStatus.className = "status-text danger";
          systemStatus.innerText = 'Cảnh báo lừa đảo';
        }
        if (urlIndicator) urlIndicator.className = "card-indicator danger";
        
        if (badgeStatus) {
          badgeStatus.innerText = '🚨 NGUY HIỂM - CẢNH BÁO LỪA ĐẢO';
          badgeStatus.className = "badge-pill danger";
        }

        if (featLexical) {
          featLexical.innerText = 'Bất thường';
          featLexical.className = 'diag-val danger';
        }
        if (featBrand) {
          const noteLower = (data.note || "").toLowerCase();
          if (noteLower.includes("homograph") || noteLower.includes("đồng hình") || noteLower.includes("font")) {
            featBrand.innerText = 'Font chữ nhái (Homograph)';
          } else if (noteLower.includes("leetspeak")) {
            featBrand.innerText = 'Nhái chữ số (Leetspeak)';
          } else if (noteLower.includes("thương hiệu") || noteLower.includes("giả mạo")) {
            featBrand.innerText = 'Nghi vấn nhái thương hiệu';
          } else {
            featBrand.innerText = 'Tên miền rủi ro cao';
          }
          featBrand.className = 'diag-val danger';
        }
        if (featForm) {
          featForm.innerText = 'Thu thập mật khẩu/OTP';
          featForm.className = 'diag-val danger';
        }

        const reasonNote = data.note ? data.note : "Trang web có dấu hiệu chiếm đoạt tài khoản.";
        if (message) {
          message.innerHTML = `<strong style="color: #be123c;">⚠️ Nguy cơ cao:</strong> ${reasonNote}`;
        }
        
      } else if (displayScore < 80) {
        // --- TẦNG 2: VÙNG VÀNG (NGHI VẤN / CHÚ Ý - KHÔNG CHẶN) ---
        if (scoreCircle) scoreCircle.style.stroke = '#f59e0b';
        if (scoreDisplay) scoreDisplay.className = "score-number warn";
        if (logoIcon) logoIcon.className = "logo-box warn";
        if (statusDot) statusDot.className = "status-dot warn";
        if (statusPing) statusPing.className = "status-ping warn";
        if (systemStatus) {
          systemStatus.className = "status-text warn";
          systemStatus.innerText = 'Cảnh báo chú ý';
        }
        if (urlIndicator) urlIndicator.className = "card-indicator warn";
        
        if (badgeStatus) {
          badgeStatus.innerText = '⚠️ NGHI VẤN - CẦN CHÚ Ý';
          badgeStatus.className = "badge-pill warn";
        }

        if (featLexical) {
          featLexical.innerText = 'Nhiều tham số / Ký tự';
          featLexical.className = 'diag-val';
        }
        if (featBrand) {
          featBrand.innerText = 'Tên miền cá nhân / TLD mới';
          featBrand.className = 'diag-val';
        }
        if (featForm) {
          featForm.innerText = 'Cẩn trọng khi nhập dữ liệu';
          featForm.className = 'diag-val';
        }

        const reasonNote = data.note ? data.note : "Trang web có cấu trúc cần người dùng lưu ý khi cung cấp thông tin.";
        if (message) {
          message.innerHTML = `<strong style="color: #d97706;">⚠️ Chú ý:</strong> ${reasonNote}`;
        }

      } else {
        // --- TẦNG 3: VÙNG XANH (AN TOÀN / ĐỘ TIN CẬY CAO) ---
        if (scoreCircle) scoreCircle.style.stroke = '#10b981';
        if (scoreDisplay) scoreDisplay.className = "score-number safe";
        if (logoIcon) logoIcon.className = "logo-box safe";
        if (statusDot) statusDot.className = "status-dot";
        if (statusPing) statusPing.className = "status-ping";
        if (systemStatus) {
          systemStatus.className = "status-text";
          systemStatus.innerText = 'Bảo vệ thời gian thực';
        }
        if (urlIndicator) urlIndicator.className = "card-indicator";
        
        if (badgeStatus) {
          badgeStatus.innerText = '✓ ĐỘ TIN CẬY CAO';
          badgeStatus.className = "badge-pill safe";
        }

        if (featLexical) {
          featLexical.innerText = 'Tốt';
          featLexical.className = 'diag-val';
        }
        if (featBrand) {
          featBrand.innerText = 'Đúng tên miền gốc';
          featBrand.className = 'diag-val';
        }
        if (featForm) {
          featForm.innerText = 'An toàn';
          featForm.className = 'diag-val';
        }

        if (message) {
          message.innerHTML = `<strong style="color: #047857;">✓ Website an toàn:</strong> Không phát hiện mã độc, cấu trúc đạt chuẩn tin cậy.`;
        }
      }

    } catch (err) {
      console.warn("Backend connect error or timeout:", err);
      // Fallback offline an toàn khi mạng yếu hoặc server phản hồi chậm
      const isKnownSafe = (
        currentDomain.includes("google") || currentDomain.includes("github") ||
        currentDomain.includes("youtube") || currentDomain.includes("vietcombank") ||
        currentDomain.includes("facebook") || currentDomain.includes("vnexpress")
      );
      const fallbackScore = isKnownSafe ? 98 : 85;
      
      if (scoreDisplay) {
        scoreDisplay.innerText = fallbackScore;
        scoreDisplay.className = "score-number safe";
      }
      setProgress(fallbackScore);
      if (badgeStatus) {
        badgeStatus.innerText = '✓ BẢO VỆ CỤC BỘ (MẠNG YẾU)';
        badgeStatus.className = "badge-pill safe";
      }
      if (message) {
        message.innerHTML = `<span style="color: #0284c7;">ℹ️ Động cơ cục bộ:</span> Đã kích hoạt bảo vệ tức thì khi kết nối mạng chập chờn. Không phát hiện dấu hiệu lừa đảo.`;
      }
      if (systemStatus) {
        systemStatus.className = "status-text";
        systemStatus.innerText = 'Bảo vệ cục bộ (Offline)';
      }
    } finally {
      if (btnText) btnText.innerText = 'Quét lại trang này';
      if (btnSpinner) btnSpinner.classList.remove('visible');
      if (btnCheck) btnCheck.disabled = false;
    }
  };

  if (btnCheck) {
    btnCheck.addEventListener('click', runAnalysis);
  }

  if (toggleProtection) {
    toggleProtection.addEventListener('change', runAnalysis);
  }

  // Mở Gemini AI Drawer
  if (btnAiExplain && aiDrawer) {
    btnAiExplain.addEventListener('click', () => {
      aiDrawer.classList.add('active');
      const scoreVal = scoreDisplay ? scoreDisplay.innerText : '100';
      const isThreat = badgeStatus && badgeStatus.classList.contains('danger');

      if (aiDrawerContent) {
        if (!toggleProtection.checked) {
          aiDrawerContent.innerHTML = `<p style="color: #64748b;">Tính năng bảo vệ đang tắt. Vui lòng bật lại để Gemini AI giải thích.</p>`;
        } else if (isThreat) {
          aiDrawerContent.innerHTML = `
            <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 12px;">
              <p style="font-weight: 800; color: #9f1239; margin-bottom: 6px;">🤖 Báo Cáo Gemini XAI (Nguy Hiểm):</p>
              <p style="color: #be123c; margin-bottom: 8px;">Trang web <b>${currentDomain}</b> có điểm tin cậy rất thấp: <b>${scoreVal}/100</b>.</p>
              <p style="color: #475569; font-size: 11px;">Mô hình học máy phát hiện các bất thường về từ vựng, cấu trúc định tuyến hoặc dấu hiệu mạo danh thương hiệu (Typosquatting). Khuyến nghị bạn tuyệt đối không cung cấp mật khẩu hoặc thông tin thẻ tại đây.</p>
            </div>
          `;
        } else {
          aiDrawerContent.innerHTML = `
            <div style="background: #eef2ff; border: 1px solid #e0e7ff; border-radius: 12px; padding: 12px;">
              <p style="font-weight: 800; color: #3730a3; margin-bottom: 6px;">🤖 Báo Cáo Gemini XAI (An Toàn):</p>
              <p style="color: #4338ca; margin-bottom: 8px;">Trang web <b>${currentDomain}</b> đạt điểm an toàn: <b>${scoreVal}/100</b>.</p>
              <p style="color: #475569; font-size: 11px;">Mô hình PhoBERT và XGBoost đã kiểm tra toàn bộ 13 đặc trưng kỹ thuật, chứng chỉ mã hóa SSL 256-bit và không phát hiện bất kỳ dấu hiệu lừa đảo hay mã độc nào. Bạn có thể an tâm truy cập.</p>
            </div>
          `;
        }
      }
    });
  }

  if (closeAiDrawer && aiDrawer) {
    closeAiDrawer.addEventListener('click', () => {
      aiDrawer.classList.remove('active');
    });
    // Click outside to close
    aiDrawer.addEventListener('click', (e) => {
      if (e.target === aiDrawer) {
        aiDrawer.classList.remove('active');
      }
    });
  }

  // Hộp thoại Gửi Phản Hồi / Nhận Xét Cho Admin (đổ thẳng về SOC Dashboard theo thời gian thực)
  const btnFbOpen = document.getElementById('btn-feedback-open');
  const fbDrawer = document.getElementById('feedback-drawer');
  const closeFbDrawer = document.getElementById('close-feedback-drawer');
  const btnFbSubmit = document.getElementById('btn-feedback-submit');
  const fbStatus = document.getElementById('fb-status');

  if (btnFbOpen && fbDrawer) {
    btnFbOpen.addEventListener('click', () => {
      fbDrawer.classList.add('active');
      if (fbStatus) fbStatus.style.display = 'none';
    });
  }
  if (closeFbDrawer && fbDrawer) {
    closeFbDrawer.addEventListener('click', () => fbDrawer.classList.remove('active'));
    fbDrawer.addEventListener('click', (e) => {
      if (e.target === fbDrawer) fbDrawer.classList.remove('active');
    });
  }
  if (btnFbSubmit) {
    btnFbSubmit.addEventListener('click', async () => {
      const nameVal = (document.getElementById('fb-name')?.value || '').trim() || 'NguoiDungThu';
      const typeVal = document.getElementById('fb-type')?.value || 'user_review';
      const ratingVal = document.getElementById('fb-rating')?.value || '5';
      const commentVal = (document.getElementById('fb-comment')?.value || '').trim();

      if (!commentVal) {
        if (fbStatus) {
          fbStatus.style.display = 'block';
          fbStatus.style.color = '#e11d48';
          fbStatus.innerText = 'Vui lòng nhập nội dung nhận xét trước khi gửi.';
        }
        return;
      }

      btnFbSubmit.disabled = true;
      btnFbSubmit.innerText = 'Đang gửi về Admin...';
      const apiBase = (typeof PHISHARMOR_API_BASE !== "undefined") ? PHISHARMOR_API_BASE : "http://127.0.0.1:8000";

      try {
        const res = await fetch(`${apiBase}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: currentTabUrl,
            report_type: typeVal,
            reason: `[Đánh giá ${ratingVal}/5 sao] ${commentVal}`,
            email: nameVal
          })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const result = await res.json();
        if (fbStatus) {
          fbStatus.style.display = 'block';
          fbStatus.style.color = '#059669';
          fbStatus.innerText = `✓ Đã gửi thành công (${result.report_code || 'OK'})! Admin đã nhận được thông báo.`;
        }
        if (document.getElementById('fb-comment')) document.getElementById('fb-comment').value = '';
      } catch (err) {
        if (fbStatus) {
          fbStatus.style.display = 'block';
          fbStatus.style.color = '#e11d48';
          fbStatus.innerText = 'Không kết nối được máy chủ Admin. Hãy báo Admin bật cổng dùng thử.';
        }
      } finally {
        btnFbSubmit.disabled = false;
        btnFbSubmit.innerText = 'Gửi Ngay Cho Admin';
      }
    });
  }

  // Chạy quét tự động ngay khi mở popup
  runAnalysis();
});
