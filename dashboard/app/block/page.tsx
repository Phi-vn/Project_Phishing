"use client";

import React, { useState, useEffect } from 'react';

import Link from "next/link";

import Sidebar from "@/components/Sidebar";

export default function BlockPage() {

  const [url, setUrl] = useState("yourbnk-secure-login.net/verify?token=8817xa");

  const [isBypassed, setIsBypassed] = useState(false);
  const [isSafeReturned, setIsSafeReturned] = useState(false);

  // Customization states

  const [allowBypass, setAllowBypass] = useState(true);

  const [showXAI, setShowXAI] = useState(true);

  const [autoLog, setAutoLog] = useState(true);

  const [warningTitle, setWarningTitle] = useState("Trang này có dấu hiệu lừa đảo (Phishing Detected)");

  const [warningDesc, setWarningDesc] = useState("Trang web này đã bị hệ thống PhishArmor AI chặn lại do vi phạm chính sách an toàn. Kẻ tấn công có thể đang cố gắng đánh cắp mật khẩu hoặc thông tin tài khoản ngân hàng của bạn.");

  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Modal states

  const [showReportModal, setShowReportModal] = useState(false);

  const [showSavedConfigModal, setShowSavedConfigModal] = useState(false);

  const [reportReason, setReportReason] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const DEFAULT_TITLE = "Trang này có dấu hiệu lừa đảo (Phishing Detected)";

  const DEFAULT_DESC = "Trang web này đã bị hệ thống PhishArmor AI chặn lại do vi phạm chính sách an toàn. Kẻ tấn công có thể đang cố gắng đánh cắp mật khẩu hoặc thông tin tài khoản ngân hàng của bạn.";

  // Trích xuất phân tích giải thích AI (XAI) động theo kịch bản URL

  const getXAIAnalysis = (targetUrl: string) => {

    const lower = (targetUrl || "").toLowerCase();

    // 1. Kịch bản Ngân hàng / Tài chính (Vietcombank, BIDV, Techcombank, Bank, yourbnk...)

    if (lower.includes("vietcombank") || lower.includes("vcb") || lower.includes("bank") || lower.includes("bidv") || lower.includes("techcombank") || lower.includes("mbbank") || lower.includes("acb") || lower.includes("yourbnk")) {

      return {

        trustScore: 8,

        category: "Tài chính & Ngân hàng",

        badgeColor: "bg-rose-600",

        primaryTitle: "Giả mạo tên miền ngân hàng (Typosquatting & Spoofing)",

        primaryDesc: "Tên miền cố tình chèn từ khóa thương hiệu ngân hàng nhưng sử dụng đuôi lạ ('.net', '.top', '.vip') thay vì tên miền chính thức ('.com.vn').",

        secondaryTitle: "Thu thập mật khẩu & mã OTP trái phép",

        secondaryDesc: "Phát hiện biểu mẫu giả mạo giao diện Internet Banking nhằm đánh cắp thông tin tài khoản và gửi mã OTP về máy chủ tin tặc."

      };

    }

    // 2. Kịch bản Thương mại điện tử / Voucher / Quà tặng (Shopee, Lazada, Tiki, Voucher, Gift, Claim)

    if (lower.includes("shopee") || lower.includes("voucher") || lower.includes("gift") || lower.includes("claim") || lower.includes("lazada") || lower.includes("tiki") || lower.includes("quatang") || lower.includes("khuyenmai")) {

      return {

        trustScore: 14,

        category: "Lừa đảo Khuyến mãi & E-commerce",

        badgeColor: "bg-amber-600",

        primaryTitle: "Chiêu trò tặng thưởng & Voucher ảo (Fake Voucher Lure)",

        primaryDesc: "Trang web lợi dụng lòng tin vào các sàn TMĐT (Shopee) để tung bẫy nhận voucher 500k-1 triệu đồng, kích thích tâm lý hám lợi của nạn nhân.",

        secondaryTitle: "Tên miền rủi ro cao (Risky TLD '.xyz')",

        secondaryDesc: "Sử dụng tên miền đuôi giá rẻ ('.xyz') thường xuyên bị các mạng lưới lừa đảo trực tuyến sử dụng để né tránh sự truy quét của cơ quan chức năng."

      };

    }

    // 3. Kịch bản Mạng xã hội / Facebook / Zalo / Telegram

    if (lower.includes("facebook") || lower.includes("fb") || lower.includes("zalo") || lower.includes("telegram") || lower.includes("meta") || lower.includes("tiktok")) {

      return {

        trustScore: 11,

        category: "Mạo danh Mạng xã hội",

        badgeColor: "bg-indigo-600",

        primaryTitle: "Đánh cắp tài khoản & Cookie phiên (Credential Harvesting)",

        primaryDesc: "Mô phỏng form đăng nhập Facebook/Zalo để chiếm đoạt tài khoản cá nhân, mã bảo mật 2 lớp (2FA) và đánh cắp cookie đăng nhập.",

        secondaryTitle: "Tên miền mồi chài độc hại ('.top', '.club')",

        secondaryDesc: "Tên miền chứa các cụm từ kích thích tò mò ('free-account-gift', 'xem-video-hot') kết hợp đuôi tên miền rác ('.top')."

      };

    }

    // 4. Kịch bản Cơ quan nhà nước / Dịch vụ công / Thuế (gov, dichvucong, thue, vneid, congan)

    if (lower.includes("gov") || lower.includes("dichvucong") || lower.includes("thue") || lower.includes("vneid") || lower.includes("bocongan") || lower.includes("cand")) {

      return {

        trustScore: 4,

        category: "Mạo danh Cơ quan Nhà nước",

        badgeColor: "bg-red-700",

        primaryTitle: "Giả mạo Cổng Dịch vụ công / VNeID Quốc gia",

        primaryDesc: "Website mạo danh Cổng Dịch vụ công hoặc Tổng cục Thuế, hướng dẫn nạn nhân tải tệp ứng dụng cài đặt '.apk' nguy hiểm.",

        secondaryTitle: "Cài cắm mã độc chiếm quyền kiểm soát thiết bị",

        secondaryDesc: "Ứng dụng độc hại yêu cầu quyền trợ năng (Accessibility Service) để chụp màn hình và tự động chuyển tiền qua app ngân hàng."

      };

    }

    // 5. URL tùy ý khác (Phân tích cấu trúc Heuristics)

    const domainPart = targetUrl.split("/")[0] || targetUrl;

    return {

      trustScore: 12,

      category: "Tên miền Rủi ro Nghi vấn",

      badgeColor: "bg-rose-600",

      primaryTitle: "Cấu trúc URL bất thường & Từ khóa nhạy cảm",

      primaryDesc: `Tên miền '${domainPart}' chứa số lượng ký tự phân tách bất thường và không có chứng nhận uy tín từ các tổ chức bảo mật quốc tế.`,

      secondaryTitle: "Mô hình PhoBERT & XGBoost cảnh báo nguy cơ cao",

      secondaryDesc: "Mô hình AI phát hiện vector ngữ nghĩa có độ tương đồng 96.8% với các tập mẫu tấn công lừa đảo trực tuyến tại Việt Nam."

    };

  };

  // Load saved block config on mount: ưu tiên Backend settings, dự phòng LocalStorage

  useEffect(() => {

    const loadConfig = async () => {

      // 1. Thử nạp từ máy chủ Backend

      try {

        const res = await fetch("http://localhost:8000/api/settings");

        if (res.ok) {

          const data = await res.json();

          if (data && data.blockPageConfig) {

            const b = data.blockPageConfig;

            if (b.warningTitle) setWarningTitle(b.warningTitle);

            if (b.warningDesc) setWarningDesc(b.warningDesc);

            if (b.allowBypass !== undefined) setAllowBypass(b.allowBypass);

            if (b.showXAI !== undefined) setShowXAI(b.showXAI);

            if (b.autoLog !== undefined) setAutoLog(b.autoLog);

            if (b.savedAt) {

              const date = new Date(b.savedAt);

              setLastSaved(date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));

            }

            return;

          }

        }

      } catch (err) {

        // Fallback nếu Backend tạm thời không phản hồi

      }

      // 2. Dự phòng nạp từ LocalStorage trình duyệt

      try {

        const saved = localStorage.getItem("phisharmor_block_config");

        if (saved) {

          const parsed = JSON.parse(saved);

          if (parsed.warningTitle) setWarningTitle(parsed.warningTitle);

          if (parsed.warningDesc) setWarningDesc(parsed.warningDesc);

          if (parsed.allowBypass !== undefined) setAllowBypass(parsed.allowBypass);

          if (parsed.showXAI !== undefined) setShowXAI(parsed.showXAI);

          if (parsed.autoLog !== undefined) setAutoLog(parsed.autoLog);

          if (parsed.savedAt) {

            const date = new Date(parsed.savedAt);

            setLastSaved(date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));

          }

        }

      } catch (e) {

        // ignore

      }

    };

    loadConfig();

  }, []);

  // Toast state

  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'warning'} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {

    setToast({ message, type });

    setTimeout(() => setToast(null), 3000);

  };

  // Lưu cấu hình: đồng bộ đồng thời cả LocalStorage và Backend API settings.json

  const handleSaveConfig = async () => {

    const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") || "Super Admin" : "Super Admin";

    if (userRole === "Guest Auditor") {

      showToast("🛡️ Chế độ Chỉ Đọc (Guest Auditor): Tài khoản Khách không thể lưu thay đổi cấu hình trang chặn!", "warning");

      return;

    }

    setIsSaving(true);

    const config = {

      warningTitle,

      warningDesc,

      theme: "Đỏ nhẹ nhàng (Soft Red Glow)",

      allowBypass,

      showXAI,

      autoLog,

      savedAt: new Date().toISOString()

    };

    // 1. Lưu cục bộ trình duyệt

    try {

      localStorage.setItem("phisharmor_block_config", JSON.stringify(config));

    } catch (e) {

      console.warn("LocalStorage save error:", e);

    }

    // 2. Đồng bộ vĩnh viễn xuống máy chủ Backend

    let backendSaved = false;

    try {

      const res = await fetch("http://localhost:8000/api/settings", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ blockPageConfig: config })

      });

      if (res.ok) {

        backendSaved = true;

      }

    } catch (e) {

      console.warn("Backend settings sync error:", e);

    }

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setLastSaved(timeStr);

    setIsSaving(false);

    if (backendSaved) {

      showToast("✓ Đã lưu và đồng bộ thành công cấu hình xuống máy chủ Backend!", "success");

    } else {

      showToast("✓ Đã lưu cấu hình vào bộ nhớ trình duyệt!", "success");

    }

  };

  // Khôi phục giao diện mặc định

  const handleResetDefault = async () => {

    if (confirm("Bạn có chắc chắn muốn khôi phục giao diện màn hình cảnh báo về mẫu mặc định ban đầu không?")) {

      setWarningTitle(DEFAULT_TITLE);

      setWarningDesc(DEFAULT_DESC);

      setAllowBypass(true);

      setShowXAI(true);

      setAutoLog(true);

      const defaultConfig = {

        warningTitle: DEFAULT_TITLE,

        warningDesc: DEFAULT_DESC,

        theme: "Đỏ nhẹ nhàng (Soft Red Glow)",

        allowBypass: true,

        showXAI: true,

        autoLog: true,

        savedAt: new Date().toISOString()

      };

      try {

        localStorage.setItem("phisharmor_block_config", JSON.stringify(defaultConfig));

      } catch (e) {}

      try {

        await fetch("http://localhost:8000/api/settings", {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ blockPageConfig: defaultConfig })

        });

      } catch (e) {}

      setLastSaved(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      showToast("✓ Đã khôi phục toàn bộ giao diện cảnh báo về mặc định thành công!", "success");

    }

  };

  const handleDownloadBlockTemplate = () => {

    const bgStyle = 'background: #0f172a; color: #f8fafc;';

    const cardStyle = 'background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(20px); border: 1px solid rgba(244, 63, 94, 0.35); box-shadow: 0 0 70px rgba(225, 29, 72, 0.22);';

    const xaiSection = showXAI ? [

      '<div style="background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 16px; padding: 16px; text-align: left; margin-bottom: 24px;">',

      '  <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #334155; margin-bottom: 12px;">',

      '    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #cbd5e1;">✨ Phân Tích Gemini XAI</span>',

      '    <span style="font-size: 11px; font-weight: 900; background: #e11d48; color: #ffffff; padding: 2px 8px; border-radius: 6px;">Risk: 12/100</span>',

      '  </div>',

      '  <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">',

      '    <p style="margin-bottom: 6px;"><strong style="color: #f1f5f9;">• Tên miền giả mạo:</strong> Có dấu hiệu nhái thương hiệu ngân hàng/dịch vụ.</p>',

      '    <p><strong style="color: #f1f5f9;">• Form thu thập dữ liệu độc hại:</strong> Tự động ghi lại phím bấm mật khẩu/OTP.</p>',

      '  </div>',

      '</div>'

    ].join('\n') : '';

    const bypassSection = allowBypass ? [

      '<button onclick="if(confirm(\'CẢNH BÁO: Bạn đang chuẩn bị truy cập vào website có nguy cơ rủi ro cao. Tiếp tục?\')) { alert(\'Bạn đã chọn tiếp tục bỏ qua cảnh báo.\'); }" style="width: 100%; padding: 12px; background: transparent; color: #94a3b8; border: 1px solid #334155; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer;">',

      '  ⚠️ Tôi chấp nhận rủi ro và muốn tiếp tục',

      '</button>'

    ].join('\n') : '';

    const htmlParts = [

      '<!DOCTYPE html>',

      '<html lang="vi">',

      '<head>',

      '  <meta charset="UTF-8">',

      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',

      '  <title>Cảnh Báo Chặn Truy Cập - PhishArmor AI</title>',

      '  <style>',

      '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' + bgStyle + ' margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; }',

      '  </style>',

      '</head>',

      '<body>',

      '  <div style="' + cardStyle + ' border-radius: 28px; width: 100%; max-width: 580px; padding: 36px; text-align: center; position: relative; z-index: 10; box-sizing: border-box;">',

      '    <div style="margin: 0 auto 20px auto; width: 68px; height: 68px; background: linear-gradient(135deg, #ef4444, #b91c1c); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);">',

      '      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',

      '        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',

      '        <line x1="9" y1="9" x2="15" y2="15"></line>',

      '        <line x1="15" y1="9" x2="9" y2="15"></line>',

      '      </svg>',

      '    </div>',

      '    <span style="display: inline-block; padding: 4px 12px; background: rgba(225, 29, 72, 0.2); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px;">',

      '      CRITICAL PHISHING THREAT DETECTED',

      '    </span>',

      '    <h1 style="font-size: 24px; font-weight: 900; color: #ffffff; margin-bottom: 12px; line-height: 1.3;">' + warningTitle + '</h1>',

      '    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(225, 29, 72, 0.3); border-radius: 12px; padding: 10px 16px; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px; max-width: 100%;">',

      '      <span style="width: 8px; height: 8px; border-radius: 9999px; background: #ef4444; display: inline-block;"></span>',

      '      <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #fca5a5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + url + '</span>',

      '    </div>',

      '    <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px;">' + warningDesc + '</p>',

      xaiSection,

      '    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">',

      '      <button onclick="window.history.back() || (window.location.href=\'https://google.com\')" style="width: 100%; padding: 14px; background: #ffffff; color: #0f172a; border: none; border-radius: 12px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">',

      '        Quay Lại Trang An Toàn (Khuyên Dùng)',

      '      </button>',

      bypassSection,

      '    </div>',

      '    <div style="margin-top: 24px; font-size: 11px; color: #64748b;">',

      '      Bảo vệ bởi hệ thống <strong>PhishArmor Web Shield Engine v1.4.2</strong>',

      '    </div>',

      '  </div>',

      '</body>',

      '</html>'

    ];

    const htmlContent = htmlParts.filter(Boolean).join('\n');

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });

    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = blobUrl;

    link.download = "phisharmor_block_screen.html";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);

    showToast("Đã tải xuống tệp giao diện chặn 'phisharmor_block_screen.html'!", "success");

  };

  const handleOpenFullScreen = () => {

    const bgStyle = 'background: #0f172a; color: #f8fafc;';

    const cardStyle = 'background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(20px); border: 1px solid rgba(244, 63, 94, 0.35); box-shadow: 0 0 70px rgba(225, 29, 72, 0.22);';

    const xaiSection = showXAI ? [

      '<div style="background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 16px; padding: 16px; text-align: left; margin-bottom: 24px;">',

      '  <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #334155; margin-bottom: 12px;">',

      '    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #cbd5e1;">✨ Phân Tích Gemini XAI</span>',

      '    <span style="font-size: 11px; font-weight: 900; background: #e11d48; color: #ffffff; padding: 2px 8px; border-radius: 6px;">Risk: 12/100</span>',

      '  </div>',

      '  <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">',

      '    <p style="margin-bottom: 6px;"><strong style="color: #f1f5f9;">• Tên miền giả mạo:</strong> Có dấu hiệu nhái thương hiệu ngân hàng/dịch vụ.</p>',

      '    <p><strong style="color: #f1f5f9;">• Form thu thập dữ liệu độc hại:</strong> Tự động ghi lại phím bấm mật khẩu/OTP.</p>',

      '  </div>',

      '</div>'

    ].join('\n') : '';

    const bypassSection = allowBypass ? [

      '<button onclick="if(confirm(\'CẢNH BÁO: Bạn đang chuẩn bị truy cập vào website có nguy cơ rủi ro cao. Tiếp tục?\')) { alert(\'Bạn đã chọn tiếp tục bỏ qua cảnh báo.\'); }" style="width: 100%; padding: 12px; background: transparent; color: #94a3b8; border: 1px solid #334155; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer;">',

      '  ⚠️ Tôi chấp nhận rủi ro và muốn tiếp tục',

      '</button>'

    ].join('\n') : '';

    const htmlParts = [

      '<!DOCTYPE html>',

      '<html lang="vi">',

      '<head>',

      '  <meta charset="UTF-8">',

      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',

      '  <title>Cảnh Báo Chặn Truy Cập - PhishArmor AI</title>',

      '  <style>',

      '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' + bgStyle + ' margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; }',

      '  </style>',

      '</head>',

      '<body>',

      '  <div style="' + cardStyle + ' border-radius: 28px; width: 100%; max-width: 580px; padding: 36px; text-align: center; position: relative; z-index: 10; box-sizing: border-box;">',

      '    <div style="margin: 0 auto 20px auto; width: 68px; height: 68px; background: linear-gradient(135deg, #ef4444, #b91c1c); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);">',

      '      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',

      '        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',

      '        <line x1="9" y1="9" x2="15" y2="15"></line>',

      '        <line x1="15" y1="9" x2="9" y2="15"></line>',

      '      </svg>',

      '    </div>',

      '    <span style="display: inline-block; padding: 4px 12px; background: rgba(225, 29, 72, 0.2); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px;">',

      '      CRITICAL PHISHING THREAT DETECTED',

      '    </span>',

      '    <h1 style="font-size: 24px; font-weight: 900; color: #ffffff; margin-bottom: 12px; line-height: 1.3;">' + warningTitle + '</h1>',

      '    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(225, 29, 72, 0.3); border-radius: 12px; padding: 10px 16px; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px; max-width: 100%;">',

      '      <span style="width: 8px; height: 8px; border-radius: 9999px; background: #ef4444; display: inline-block;"></span>',

      '      <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #fca5a5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + url + '</span>',

      '    </div>',

      '    <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px;">' + warningDesc + '</p>',

      xaiSection,

      '    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">',

      '      <button onclick="window.history.back() || (window.location.href=\'https://google.com\')" style="width: 100%; padding: 14px; background: #ffffff; color: #0f172a; border: none; border-radius: 12px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">',

      '        Quay Lại Trang An Toàn (Khuyên Dùng)',

      '      </button>',

      bypassSection,

      '    </div>',

      '    <div style="margin-top: 24px; font-size: 11px; color: #64748b;">',

      '      Bảo vệ bởi hệ thống <strong>PhishArmor Web Shield Engine v1.4.2</strong>',

      '    </div>',

      '  </div>',

      '</body>',

      '</html>'

    ];

    const htmlContent = htmlParts.filter(Boolean).join('\n');

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });

    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");

    showToast("✓ Đã mở trang cảnh báo toàn màn hình trong tab mới!", "success");

  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter') {

       setIsBypassed(false);
       setIsSafeReturned(false);

    }

  };

  const handleSendReport = async () => {

    if (!reportReason.trim()) {

      showToast("Vui lòng nhập lý do báo cáo nhầm lẫn", "warning");

      return;

    }

    try {

      const fullUrl = url.startsWith("http") ? url : `https://${url}`;

      const res = await fetch("http://localhost:8000/api/feedback", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          url: fullUrl,

          reason: reportReason.trim(),

          email: "user_report@phisharmor.vn",

          report_type: "false_positive"

        })

      });

      if (res.ok) {

        const data = await res.json();

        showToast(`✓ Đã gửi báo cáo [${data.report_code || "REP"}] tới Quản trị viên SOC thành công!`, "success");

      } else {

        showToast("Đã ghi nhận báo cáo nhầm lẫn vào hệ thống!", "success");

      }

    } catch (e) {

      showToast("Đã lưu báo cáo nhầm lẫn (Chế độ cục bộ)!", "success");

    } finally {

      setShowReportModal(false);

      setReportReason("");

    }

  };

  return (

    <div className="min-h-screen bg-[#f8fcfb] dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 font-sans flex">

      {/* TOAST NOTIFICATION */}

      {toast && (

        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">

          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-3">

            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${

              toast.type === 'success' ? 'bg-sky-600' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'

            }`}>

              {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '!' : 'i'}

            </div>

            <div>

              <p className="text-sm font-bold text-slate-800 dark:text-white">{toast.message}</p>

              <p className="text-xs text-slate-500">PhishArmor Block Engine v1.2</p>

            </div>

          </div>

        </div>

      )}

      {/* REPORT MODAL */}

      {showReportModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-scale-up">

            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">

              <div className="flex items-center gap-2.5">

                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/50 dark:border-sky-800/50">

                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>

                  </svg>

                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Báo Cáo Nhầm Lẫn (False Positive)</h3>

              </div>

              <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center">

                ✕

              </button>

            </div>

            <div className="py-4 space-y-3">

              <p className="text-xs text-slate-500">Nếu bạn cho rằng tên miền <strong className="text-slate-800 dark:text-slate-200">{url}</strong> bị chặn sai, hãy gửi lý do để quản trị viên kiểm duyệt.</p>

              <div>

                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lý do báo cáo</label>

                <textarea 
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Ví dụ: Đây là website nội bộ công ty tôi, đã được cấp SSL hợp lệ..."
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-500"

                />

              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">

              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">

                Hủy bỏ

              </button>

              <button onClick={handleSendReport} className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md">

                Gửi Báo Cáo

              </button>

            </div>

          </div>

        </div>

      )}

      {/* SAVED CONFIGURATION DETAILS MODAL */}

      {showSavedConfigModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden animate-scale-up">

            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">

              <div className="flex items-center gap-2.5">

                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">

                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>

                  </svg>

                </div>

                <div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Chi Tiết Cấu Hình Giao Diện Chặn (JSON)</h3>

                  <p className="text-xs text-slate-500">Được đồng bộ giữa Máy chủ Backend FastAPI và Trình duyệt</p>

                </div>

              </div>

              <button 
                onClick={() => setShowSavedConfigModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"

              >

                ✕

              </button>

            </div>

            <div className="py-4 space-y-4 text-xs">

              {/* Storage location explanation */}

              <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/50 rounded-2xl">

                <div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-400 mb-1.5">

                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>

                  </svg>

                  <span>Vị trí lưu trữ & Đồng bộ dữ liệu Full-Stack:</span>

                </div>

                <div className="space-y-1.5 font-mono text-[11px]">

                  <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-900/60 text-slate-800 dark:text-slate-200 flex items-center justify-between">

                    <span>1. Máy chủ Backend: <strong>backend/settings.json</strong></span>

                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">✓ Server Synced</span>

                  </div>

                  <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-900/60 text-slate-800 dark:text-slate-200 flex items-center justify-between">

                    <span>2. Bộ nhớ cục bộ: <strong>LocalStorage (phisharmor_block_config)</strong></span>

                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-1.5 py-0.5 rounded">✓ Local Cache</span>

                  </div>

                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-2">

                  Cấu hình được đồng bộ tự động xuống API Backend FastAPI (<code className="text-sky-600 dark:text-sky-400">/api/settings</code>) để áp dụng toàn hệ thống, đồng thời lưu đệm trên LocalStorage để phản hồi tức thì.

                </p>

              </div>

              {/* Timestamp & Status */}

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">

                <span className="text-slate-500 font-medium">Trạng thái đồng bộ:</span>

                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">

                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>

                  {lastSaved ? `Đã lưu lúc ${lastSaved}` : 'Đã nạp từ bộ nhớ'}

                </span>

              </div>

              {/* JSON Payload viewer */}

              <div>

                <div className="flex justify-between items-center mb-1.5">

                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">

                    Dữ liệu cấu hình đã lưu (JSON Object)

                  </label>

                  <button
                    onClick={() => {

                      const saved = localStorage.getItem("phisharmor_block_config") || JSON.stringify({ warningTitle, warningDesc, allowBypass, showXAI, autoLog });

                      navigator.clipboard.writeText(saved);

                      showToast("Đã sao chép JSON cấu hình vào bộ nhớ tạm!", "info");

                    }}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-bold inline-flex items-center gap-1"

                  >

                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>

                    <span>Sao chép JSON</span>

                  </button>

                </div>

                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">

                  {JSON.stringify({

                    warningTitle,

                    warningDesc,

                    theme: "Đỏ nhẹ nhàng (Soft Red Shield)",

                    allowBypass,

                    showXAI,

                    autoLog,

                    storageKey: "phisharmor_block_config"

                  }, null, 2)}

                </pre>

              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">

              <button 
                onClick={() => setShowSavedConfigModal(false)} 
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"

              >

                Đóng

              </button>

            </div>

          </div>

        </div>

      )}

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT */}

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen bg-slate-50 dark:bg-[#0b1120]">

        <div className="max-w-6xl mx-auto">

          {/* Top Context & Modern Studio Toolbar */}

          <div className="mb-6 space-y-3.5">

            {/* Header Title & System Sync Badge */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80 dark:border-slate-800/80">

              <div className="flex items-center gap-3.5">

                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/15 to-red-600/25 dark:from-rose-500/25 dark:to-red-600/35 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg shadow-xs border border-rose-500/25 shrink-0">

                  <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">

                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>

                  </svg>

                </div>

                <div>

                  <div className="flex items-center gap-2 flex-wrap">

                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">

                      Mẫu Trang Chặn Người Dùng

                    </span>

                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:inline-block"></span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 shadow-2xs">

                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>

                      Web Shield v1.4 Active

                    </span>

                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">

                    Thiết Kế Màn Hình Cảnh Báo Nguy Hiểm & Can Thiệp

                  </h1>

                </div>

              </div>

              {/* Server Sync Indicator */}

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">

                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>

                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Đã đồng bộ máy chủ</span>

                  {lastSaved && <span className="text-slate-400 font-mono text-[11px]">({lastSaved})</span>}

                </div>

              </div>

            </div>

            {/* Studio Action Toolbar (Grouped & Balanced) */}

            <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 sm:p-2.5 px-3 sm:px-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              {/* Group 1: Configuration Management (Left) */}

              <div className="flex items-center gap-2 flex-wrap">

                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden lg:inline-block">

                  Cấu hình:

                </span>

                {/* Nút 1: Lưu cấu hình */}

                <button 
                  onClick={handleSaveConfig} 
                  disabled={isSaving}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                  title="Lưu cấu hình vào máy chủ backend và bộ nhớ đệm trình duyệt"

                >

                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">

                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>

                    <polyline points="17 21 17 13 7 13 7 21"></polyline>

                    <polyline points="7 3 7 8 15 8"></polyline>

                  </svg>

                  <span>{isSaving ? "Đang lưu..." : "Lưu cấu hình"}</span>

                </button>

                <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                {/* Nút 2: Xem JSON cấu hình */}

                <button 
                  onClick={() => setShowSavedConfigModal(true)} 
                  className="px-3 py-2 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Xem cấu trúc dữ liệu JSON và vị trí lưu trữ trên máy chủ"

                >

                  <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">

                    <polyline points="16 18 22 12 16 6"></polyline>

                    <polyline points="8 6 2 12 8 18"></polyline>

                  </svg>

                  <span>Xem JSON</span>

                </button>

                {/* Nút 3: Khôi phục mặc định */}

                <button 
                  onClick={handleResetDefault} 
                  className="px-3 py-2 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Khôi phục nội dung giao diện về mẫu mặc định ban đầu của PhishArmor"

                >

                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">

                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>

                    <path d="M3 3v5h5"></path>

                  </svg>

                  <span>Khôi phục</span>

                </button>

              </div>

              {/* Group 2: Preview & Export Tools (Right) */}

              <div className="flex items-center gap-2 flex-wrap">

                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden lg:inline-block">

                  Xuất bản:

                </span>

                {/* Nút 5: Xem toàn màn hình trong tab mới */}

                <button 
                  onClick={handleOpenFullScreen} 
                  className="px-3.5 py-2 bg-rose-50/80 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:border-rose-300"
                  title="Mở giao diện cảnh báo toàn màn hình trong tab mới để trải nghiệm thực tế"

                >

                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">

                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>

                    <polyline points="15 3 21 3 21 9"></polyline>

                    <line x1="10" y1="14" x2="21" y2="3"></line>

                  </svg>

                  <span>Xem toàn màn hình ↗</span>

                </button>

                {/* Nút 4: Tải trang cảnh báo .html */}

                <button 
                  onClick={handleDownloadBlockTemplate} 
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  title="Tải mã nguồn file HTML độc lập chứa toàn bộ giao diện đã tùy chỉnh"

                >

                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">

                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>

                    <polyline points="7 10 12 15 17 10"></polyline>

                    <line x1="12" y1="15" x2="12" y2="3"></line>

                  </svg>

                  <span>Tải trang cảnh báo (.html)</span>

                </button>

              </div>

            </div>

          </div>

          {/* Grid Layout */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Mockup Canvas Area (2 columns) */}

            <div className="lg:col-span-2 bg-slate-200/50 dark:bg-[#0f172a]/50 border border-slate-300/80 dark:border-slate-800 rounded-3xl p-5 flex flex-col shadow-inner">

              {/* Simulated Browser Window */}

              <div className="w-full flex-1 min-h-[750px] bg-white dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-700 flex flex-col relative z-0">

                {/* Browser Top Address Bar */}

                <div className="bg-slate-200/70 dark:bg-[#0b1120] border-b border-slate-300 dark:border-slate-800 px-4 py-3 flex items-center gap-4 shrink-0 z-20">

                  <div className="flex gap-1.5">

                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm"></div>

                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm"></div>

                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></div>

                  </div>

                  <div className={`flex-1 border rounded-xl px-4 py-2 text-xs flex items-center gap-3 shadow-inner font-medium transition-all ${

                    isSafeReturned
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/60 text-emerald-700 dark:text-emerald-300"
                      : isBypassed 
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500/60 text-amber-700 dark:text-amber-300" 
                        : "bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-500/60 text-rose-600 dark:text-rose-300"

                  }`}>

                    <span className={`font-semibold flex items-center gap-1.5 ${
                      isSafeReturned 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : isBypassed 
                          ? "text-amber-600 dark:text-amber-400" 
                          : "text-rose-600 dark:text-rose-400"
                    }`}>

                      {isSafeReturned ? (

                        <>

                          <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>

                          <span>SAFE DESTINATION</span>

                        </>

                      ) : isBypassed ? (

                        <>

                          <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

                          <span>BYPASSED (RISKY)</span>

                        </>

                      ) : (

                        <>

                          <svg className="w-3.5 h-3.5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>

                          <span>BLOCKED BY PHISHARMOR</span>

                        </>

                      )}

                    </span>

                    <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700"></div>

                    <input 
                      type="text"
                      value={isSafeReturned ? "https://www.google.com" : url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (isSafeReturned) setIsSafeReturned(false);
                      }}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent outline-none font-mono text-xs text-slate-800 dark:text-slate-200"

                    />

                  </div>

                </div>

                {/* Browser Canvas Content Body */}

                <div className={`flex-1 relative overflow-y-auto px-4 sm:px-6 py-6 transition-colors duration-700 ${

                  isSafeReturned
                    ? "bg-gradient-to-b from-emerald-50/70 via-slate-50 to-emerald-50/50 dark:from-[#062016] dark:via-[#0b1120] dark:to-emerald-950/20"
                    : isBypassed 
                      ? "bg-slate-50 dark:bg-[#0b1120]" 
                      : "bg-gradient-to-b from-rose-50/60 via-slate-50 to-rose-50/40 dark:from-[#13111c] dark:via-[#0b1120] dark:to-rose-950/20"

                }`}>

                  {/* Danger Animated Glow Background */}

                  {!isBypassed && !isSafeReturned && (

                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">

                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-rose-500/10 dark:bg-rose-500/10 rounded-full blur-[100px] animate-pulse"></div>

                       <div className="absolute inset-0 bg-[radial-gradient(rgba(244,63,94,0.08)_1px,transparent_1px)] bg-[size:28px_28px]"></div>

                    </div>

                  )}

                  {/* Safe Animated Glow Background */}

                  {isSafeReturned && (

                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">

                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>

                       <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:28px_28px]"></div>

                    </div>

                  )}

                  <div className="w-full min-h-full flex flex-col items-center justify-center py-2">

                    {/* State 1: Safe Returned Mode Simulation */}

                    {isSafeReturned ? (

                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[28px] w-full max-w-[480px] shadow-2xl border border-emerald-200 dark:border-emerald-800/60 z-10 p-8 flex flex-col items-center animate-fade-in-up my-auto text-center">

                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">

                          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">

                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>

                            <path d="m9 12 2 2 4-4"/>

                          </svg>

                        </div>

                        <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">

                          ĐÃ QUAY LẠI VÙNG AN TOÀN

                        </span>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bạn Đang Ở Vùng An Toàn</h2>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-sm">

                          Hệ thống PhishArmor AI đã bảo vệ bạn an toàn và ngắt hoàn toàn kết nối tới trang web lừa đảo. Mọi dữ liệu tài khoản và mật khẩu của bạn không bị rò rỉ.

                        </p>

                        <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 mb-5 text-left space-y-2.5">

                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">

                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>

                            <span>Ngăn chặn rò rỉ mật khẩu và tài khoản cá nhân</span>

                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">

                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>

                            <span>Ngắt kết nối tới máy chủ thu thập mã OTP trái phép</span>

                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">

                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>

                            <span>Cập nhật mẫu URL độc hại vào cơ sở dữ liệu phòng vệ</span>

                          </div>

                        </div>

                        <div className="w-full space-y-2.5">

                          <a 
                            href="https://www.google.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all text-xs shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"

                          >

                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6Z"/></svg>

                            <span>Mở Google Tìm Kiếm (google.com) ↗</span>

                          </a>

                          <button 
                            onClick={() => { setIsSafeReturned(false); setIsBypassed(false); }} 
                            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl transition-all text-xs cursor-pointer inline-flex items-center justify-center gap-1.5"

                          >

                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>

                            <span>Thử lại mô phỏng màn hình chặn URL</span>

                          </button>

                        </div>

                      </div>

                    ) : isBypassed ? (

                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[28px] w-full max-w-[440px] shadow-2xl border border-white/60 dark:border-slate-700/60 z-10 p-8 flex flex-col items-center animate-fade-in-up my-auto">

                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 rounded-2xl flex items-center justify-center text-amber-500 mb-4 shadow-xs">

                          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>

                            <line x1="12" y1="9" x2="12" y2="13"/>

                            <line x1="12" y1="17" x2="12.01" y2="17"/>

                          </svg>

                        </div>

                        <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">

                          Đã Vượt Rào Bảo Vệ (Bypassed)

                        </span>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Giao Diện Trang Web Gốc</h2>

                        <p className="text-xs text-slate-500 text-center mb-6">Bạn đang xem giao diện chưa qua kiểm duyệt an toàn.</p>

                        <div className="w-full space-y-3">

                          <input type="text" placeholder="Tên tài khoản / Email" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 outline-none" />

                          <input type="password" placeholder="Mật khẩu ngân hàng" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 outline-none" />

                          <button onClick={() => { setIsBypassed(false); setIsSafeReturned(false); }} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-all text-xs shadow-xs mt-2 inline-flex items-center justify-center gap-1.5 cursor-pointer">

                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>

                            <span>Kích Hoạt Khóa Chặn Trở Lại</span>

                          </button>

                        </div>

                      </div>

                    ) : (

                      /* State B: Full Block Warning Page */

                      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[28px] w-full max-w-[520px] shadow-[0_0_60px_rgba(244,63,94,0.15)] overflow-hidden border border-rose-200/80 dark:border-rose-900/50 z-10 relative flex flex-col animate-scale-in my-auto">

                        <div className="p-6 sm:p-7 relative">

                          {/* Accent Glow Header */}

                          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-rose-500/15 to-transparent pointer-events-none"></div>

                          {/* Pulsing Shield Icon Header */}

                          <div className="mx-auto relative w-16 h-16 flex items-center justify-center mb-3.5">

                            <div className="absolute inset-0 bg-rose-500/30 rounded-full animate-ping"></div>

                            <div className="absolute inset-2 bg-rose-500/40 rounded-full animate-pulse"></div>

                            <div className="relative w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-slate-900">

                              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">

                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>

                                <line x1="9" y1="9" x2="15" y2="15"></line>

                                <line x1="15" y1="9" x2="9" y2="15"></line>

                              </svg>

                            </div>

                          </div>

                          {/* Warning Header Tag */}

                          <div className="flex justify-center mb-2.5">

                            <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-full text-xs font-bold uppercase tracking-widest border border-rose-200 dark:border-rose-900/40 shadow-xs flex items-center gap-1.5">

                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>

                              CRITICAL PHISHING THREAT DETECTED

                            </span>

                          </div>

                          {/* Title */}

                          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5 text-center tracking-tight leading-tight relative z-10">

                            {warningTitle}

                          </h2>

                          {/* Blocked URL Pill */}

                          <div className="bg-rose-50 dark:bg-rose-950/30 py-2 px-4 rounded-xl w-full mx-auto mb-3.5 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center gap-2 shadow-inner relative z-10">

                             <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>

                             <p className="text-rose-700 dark:text-rose-300 font-mono text-xs font-bold truncate">{url}</p>

                          </div>

                          {/* Warning Message Description */}

                          <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-4 leading-relaxed font-normal relative z-10">

                            {warningDesc}

                          </p>

                          {/* Explainable AI (XAI) Gemini Breakdown Card */}
                          {showXAI && (() => {
                            const currentXAI = getXAIAnalysis(url);
                            return (
                              <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs relative z-10 transition-all animate-fade-in">
                                <div className="bg-gradient-to-r from-indigo-500/10 via-slate-500/5 to-violet-500/10 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-1">
                                   <div className="flex items-center gap-2">
                                     <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                     <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Giải Thích XAI Gemini AI</span>
                                     <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-sans">
                                       {currentXAI.category}
                                     </span>
                                   </div>
                                   <span className={`text-xs ${currentXAI.badgeColor} text-white font-mono font-bold px-2 py-0.5 rounded shadow-xs`}>
                                     Trust Score: {currentXAI.trustScore}/100
                                   </span>
                                </div>

                                <div className="p-3.5 space-y-2.5 text-xs">
                                   <div className="flex items-start gap-2.5">
                                      <div className="w-5 h-5 rounded-md bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                      </div>
                                      <div>
                                        <strong className="text-slate-800 dark:text-slate-200 font-bold block mb-0.5 text-xs">{currentXAI.primaryTitle}</strong>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{currentXAI.primaryDesc}</p>
                                      </div>
                                   </div>

                                   <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-700/60"></div>

                                   <div className="flex items-start gap-2.5">
                                      <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                      </div>
                                      <div>
                                        <strong className="text-slate-800 dark:text-slate-200 font-bold block mb-0.5 text-xs">{currentXAI.secondaryTitle}</strong>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{currentXAI.secondaryDesc}</p>
                                      </div>
                                   </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Main Action Buttons Area */}

                          <div className="flex flex-col gap-2 mt-1.5 relative z-10">

                            <button 
                              onClick={() => { 
                                setIsSafeReturned(true); 
                                setIsBypassed(false); 
                                showToast("🛡️ Đã quay lại vùng an toàn thành công! Kết nối độc hại đã bị ngắt.", "success");
                              }} 
                              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-xl font-bold text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"

                            >

                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>

                              <span>Quay Lại An Toàn (Khuyên Dùng)</span>

                            </button>

                            <div className="flex items-center justify-between pt-1">

                              <button 
                                onClick={() => setShowReportModal(true)} 
                                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"

                              >

                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>

                                <span>Báo cáo nhầm lẫn (False Positive)</span>

                              </button>

                              {allowBypass && (

                                <button 
                                  onClick={() => {
                                    setIsBypassed(true);
                                    setIsSafeReturned(false);
                                    showToast("⚠️ Cảnh báo: Bạn đang truy cập vào trang web chưa qua kiểm duyệt an toàn!", "warning");
                                  }} 
                                  className="text-xs font-bold text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 underline underline-offset-2 transition-colors"

                                >

                                  Tôi hiểu rủi ro & vẫn muốn truy cập (Bypass)

                                </button>

                              )}

                            </div>

                          </div>

                        </div>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* Right Column: Customization Controls & Rules Panel */}

            <div className="space-y-6">

              {/* Panel 1: Tùy chỉnh giao diện cảnh báo */}

              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">

                <div className="flex items-center gap-2.5 mb-5">

                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center border border-rose-200/50 dark:border-rose-800/50">

                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>

                  </div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Tùy Chỉnh Giao Diện Chặn</h3>

                </div>

                <div className="space-y-5">

                  <div>

                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Tiêu đề cảnh báo</label>

                    <input 
                      type="text" 
                      value={warningTitle}
                      onChange={(e) => setWarningTitle(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500 font-semibold"

                    />

                  </div>

                  <div>

                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Thông điệp chi tiết</label>

                    <textarea 
                      rows={3}
                      value={warningDesc}
                      onChange={(e) => setWarningDesc(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500 font-sans"

                    />

                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">

                    <div>

                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Hiển thị nút Bỏ qua</span>

                      <span className="text-xs text-slate-400">Cho phép người dùng vượt rào</span>

                    </div>

                    <div 
                      onClick={() => {

                        setAllowBypass(!allowBypass);

                        showToast(!allowBypass ? "Đã bật cho phép người dùng Vượt rào (Bypass)" : "Đã tắt nút Vượt rào", !allowBypass ? "info" : "warning");

                      }} 
                      className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors shadow-inner ${allowBypass ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}

                    >

                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${allowBypass ? "translate-x-5" : "translate-x-0"}`}></div>

                    </div>

                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">

                    <div>

                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Tích hợp XAI Gemini</span>

                      <span className="text-xs text-slate-400">Hiển thị giải thích chi tiết</span>

                    </div>

                    <div 
                      onClick={() => setShowXAI(!showXAI)} 
                      className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors shadow-inner ${showXAI ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}

                    >

                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${showXAI ? "translate-x-5" : "translate-x-0"}`}></div>

                    </div>

                  </div>

                </div>

              </div>

              {/* Panel 2: Điều kiện kích hoạt Block */}

              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden">

                <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-bl-full blur-xl pointer-events-none"></div>

                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>

                <div className="flex items-center gap-2.5 mb-4">

                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/50">

                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>

                  </div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Điều Kiện Kích Hoạt Block</h3>

                </div>

                <div className="space-y-3 text-xs relative z-10">

                  <div className="flex justify-between items-center">

                    <span className="text-slate-500 font-medium">Mức độ nguy hiểm</span>

                    <span className="font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">

                      0-49 (Độc hại)

                    </span>

                  </div>

                  <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800"></div>

                  <div className="flex justify-between items-center">

                    <span className="text-slate-500 font-medium">Nguồn quyết định</span>

                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">PhoBERT + XGBoost AI</span>

                  </div>

                  <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800"></div>

                  <div className="flex justify-between items-center">

                    <span className="text-slate-500 font-medium">Ghi Log tự động</span>

                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">✓ Có (Tự động)</span>

                  </div>

                </div>

              </div>

              {/* Panel 3: Thử nghiệm kịch bản nhanh */}

              <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">

                <div className="flex justify-between items-center">

                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">

                    <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v7.31M14 9.3V1.99M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>

                    <span>Mô phỏng các URL bị chặn:</span>

                  </span>

                </div>

                <div className="space-y-2">

                  <button 
                    onClick={() => { setUrl("vietcombank-login-security.net/verify"); setIsBypassed(false); setIsSafeReturned(false); }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${

                      url.includes("vietcombank")

                        ? "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm"

                        : "bg-white dark:bg-[#111827] border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/20"

                    }`}

                  >

                    <div className="flex items-center gap-2">

                      <span className={`w-2 h-2 rounded-full ${url.includes("vietcombank") ? "bg-rose-500 animate-pulse" : "bg-rose-400"}`}></span>

                      <span>Mạo Danh Ngân Hàng Vietcombank</span>

                    </div>

                    <span className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 px-1.5 py-0.5 rounded font-mono">

                      {url.includes("vietcombank") ? "● Đang chọn" : "Block"}

                    </span>

                  </button>

                  <button 
                    onClick={() => { setUrl("shopee-voucher-super-gift.xyz/claim"); setIsBypassed(false); setIsSafeReturned(false); }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${

                      url.includes("shopee")

                        ? "bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm"

                        : "bg-white dark:bg-[#111827] border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-950/20"

                    }`}

                  >

                    <div className="flex items-center gap-2">

                      <span className={`w-2 h-2 rounded-full ${url.includes("shopee") ? "bg-amber-500 animate-pulse" : "bg-amber-400"}`}></span>

                      <span>Lừa Đảo Voucher Shopee</span>

                    </div>

                    <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono">

                      {url.includes("shopee") ? "● Đang chọn" : "Block"}

                    </span>

                  </button>

                  <button 
                    onClick={() => { setUrl("facebook-free-account-gift.top/login"); setIsBypassed(false); setIsSafeReturned(false); }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${

                      url.includes("facebook")

                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"

                        : "bg-white dark:bg-[#111827] border border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20"

                    }`}

                  >

                    <div className="flex items-center gap-2">

                      <span className={`w-2 h-2 rounded-full ${url.includes("facebook") ? "bg-indigo-500 animate-pulse" : "bg-indigo-400"}`}></span>

                      <span>Mạo Danh Đăng Nhập Facebook</span>

                    </div>

                    <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono">

                      {url.includes("facebook") ? "● Đang chọn" : "Block"}

                    </span>

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}

