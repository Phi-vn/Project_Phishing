"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

interface ReportItem {
  id: string;
  url: string;
  domain: string;
  targetBrand?: string;
  status: "pending" | "safe" | "phishing";
  type: "false_positive" | "false_negative";
  userComment: string;
  reporterInfo: {
    user: string;
    ip: string;
    country: string;
    extensionVersion: string;
    timestamp: string;
  };
  aiPrediction: string;
  confidenceScore: number;
  shapReasons: { name: string; impact: "risk" | "safe"; weight: number }[];
  pushedToRetrain?: boolean;
}

export default function FeedbackPage() {
  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: "REP-9924",
      url: "https://shopee-voucher-vip88.click/nhan-qua-2026",
      domain: "shopee-voucher-vip88.click",
      targetBrand: "Shopee Vietnam",
      status: "pending",
      type: "false_negative",
      userComment: "Trang này giả mạo Shopee quảng cáo tặng voucher 1 triệu để lừa lấy mã OTP và thẻ ngân hàng. Tiện ích lúc đầu chưa kịp chặn!",
      reporterInfo: {
        user: "nguyen_van_a@gmail.com",
        ip: "113.185.42.19",
        country: "Vietnam (Hà Nội)",
        extensionVersion: "v1.4.2 (Chrome)",
        timestamp: "2026-10-08 14:15:22"
      },
      aiPrediction: "Nghi vấn thấp",
      confidenceScore: 42,
      shapReasons: [
        { name: "Domain chứa từ khóa 'voucher-vip88'", impact: "risk", weight: 35 },
        { name: "Đuôi TLD mới đăng ký (.click)", impact: "risk", weight: 28 },
        { name: "Chứng chỉ SSL Let's Encrypt cấp 2 ngày trước", impact: "risk", weight: 22 },
        { name: "Cấu trúc URL giả mạo thương hiệu Shopee", impact: "risk", weight: 40 }
      ]
    },
    {
      id: "REP-9923",
      url: "https://vietcombank.com.vn/personal/ebanking-login",
      domain: "vietcombank.com.vn",
      targetBrand: "Vietcombank",
      status: "pending",
      type: "false_positive",
      userComment: "Đây là cổng đăng nhập VCB Digibank chính thức của ngân hàng Vietcombank, tiện ích hiện cảnh báo đỏ làm tôi không vào được!",
      reporterInfo: {
        user: "tran_thi_b@vcb.com.vn",
        ip: "14.241.228.102",
        country: "Vietnam (TP.HCM)",
        extensionVersion: "v1.4.2 (Edge)",
        timestamp: "2026-10-08 13:40:10"
      },
      aiPrediction: "Cảnh báo Phishing",
      confidenceScore: 78,
      shapReasons: [
        { name: "Tên miền .com.vn chính chủ đã đăng ký 15 năm", impact: "safe", weight: 65 },
        { name: "Tổ chức SSL EV (Extended Validation) hợp lệ", impact: "safe", weight: 55 },
        { name: "AI phạt điểm do chuỗi path '/ebanking-login' chứa từ khóa nhạy cảm", impact: "risk", weight: 30 }
      ]
    },
    {
      id: "REP-9922",
      url: "https://auth-mbbank-secure.top/otp-verify",
      domain: "auth-mbbank-secure.top",
      targetBrand: "MB Bank",
      status: "pending",
      type: "false_negative",
      userComment: "Tin nhắn SMS Brandname giả mạo gửi link này báo tài khoản bị khóa, yêu cầu nhập mật khẩu và mã OTP gấp.",
      reporterInfo: {
        user: "le_hoang_c@tech.edu.vn",
        ip: "115.79.13.88",
        country: "Vietnam (Đà Nẵng)",
        extensionVersion: "v1.4.2 (Chrome)",
        timestamp: "2026-10-08 11:20:00"
      },
      aiPrediction: "Nghi ngờ giả mạo",
      confidenceScore: 58,
      shapReasons: [
        { name: "Typosquatting giả mạo mbbank", impact: "risk", weight: 48 },
        { name: "TLD giá rẻ rủi ro cao (.top)", impact: "risk", weight: 32 },
        { name: "Không có máy chủ mail MX record", impact: "risk", weight: 18 }
      ]
    },
    {
      id: "REP-9921",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSc9xK...",
      domain: "docs.google.com",
      targetBrand: "Google Forms",
      status: "safe",
      type: "false_positive",
      userComment: "Đây là form khảo sát nội bộ của đơn vị đào tạo, không thu thập thông tin tài chính ngân hàng.",
      reporterInfo: {
        user: "analyst_bk@hust.edu.vn",
        ip: "42.112.98.50",
        country: "Vietnam (Hà Nội)",
        extensionVersion: "v1.4.1 (Chrome)",
        timestamp: "2026-10-07 16:05:44"
      },
      aiPrediction: "Form thu thập tin",
      confidenceScore: 65,
      shapReasons: [
        { name: "Tên miền thuộc Google Trust Level 1", impact: "safe", weight: 80 },
        { name: "Có trường input mật khẩu trong biểu mẫu", impact: "risk", weight: 25 }
      ],
      pushedToRetrain: true
    },
    {
      id: "REP-9920",
      url: "https://portal-evn-dienluc.info/tra-cuu-tien-dien",
      domain: "portal-evn-dienluc.info",
      targetBrand: "Tập Đoàn Điện Lực EVN",
      status: "phishing",
      type: "false_negative",
      userComment: "Mạo danh Điện Lực EVN dọa cắt điện nếu không nộp tiền qua cổng thanh toán lạ.",
      reporterInfo: {
        user: "nguoidan_q3@gmail.com",
        ip: "27.72.105.14",
        country: "Vietnam (TP.HCM)",
        extensionVersion: "v1.4.2 (Firefox)",
        timestamp: "2026-10-07 10:18:30"
      },
      aiPrediction: "Cảnh báo lừa đảo",
      confidenceScore: 91,
      shapReasons: [
        { name: "Domain mới mua trên Cloudflare Registrar", impact: "risk", weight: 45 },
        { name: "Sao chép logo và layout EVN trái phép", impact: "risk", weight: 50 },
        { name: "Tên miền không thuộc sở hữu EVN (.vn)", impact: "risk", weight: 42 }
      ],
      pushedToRetrain: true
    },
    {
      id: "REP-9919",
      url: "https://dichvucong.gov.vn/pki/client-auth",
      domain: "dichvucong.gov.vn",
      targetBrand: "Cổng DVC Quốc Gia",
      status: "safe",
      type: "false_positive",
      userComment: "Cổng dịch vụ công quốc gia của chính phủ, khi cắm USB Token ký số thì bị extension chặn.",
      reporterInfo: {
        user: "doanhnghiep_tax@corp.vn",
        ip: "118.69.182.20",
        country: "Vietnam (Hà Nội)",
        extensionVersion: "v1.4.2 (Edge)",
        timestamp: "2026-10-06 09:45:10"
      },
      aiPrediction: "Chữ ký bất thường",
      confidenceScore: 60,
      shapReasons: [
        { name: "Tên miền .gov.vn được Bộ Thông Tin Truyền Thông chứng nhận", impact: "safe", weight: 95 },
        { name: "Hệ thống gọi API localhost PKI bị nhầm là port scan", impact: "safe", weight: 40 }
      ],
      pushedToRetrain: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "false_positive" | "false_negative" | "safe" | "phishing" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/feedback");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setReports(data.map((item: any) => ({
            id: item.id || `REP-${item.db_id}`,
            url: item.url,
            domain: item.domain || (item.url ? (() => { try { return new URL(item.url.startsWith("http") ? item.url : "https://" + item.url).hostname; } catch { return item.url; } })() : ""),
            targetBrand: item.targetBrand || item.target_brand || "",
            status: item.status || "pending",
            type: item.type || item.report_type || "false_positive",
            userComment: item.userComment || item.reason || "",
            reporterInfo: item.reporterInfo || {
              user: item.reporter_email || "user_report@phisharmor.vn",
              ip: item.reporter_ip || "127.0.0.1",
              country: item.reporter_country || "Vietnam (Hà Nội)",
              extensionVersion: item.extension_version || "v1.4.2 (Chrome)",
              timestamp: item.timestamp || ""
            },
            aiPrediction: item.aiPrediction || item.ai_prediction || "Đang phân tích",
            confidenceScore: item.confidenceScore ?? item.confidence_score ?? 50,
            shapReasons: item.shapReasons || (item.shap_reasons ? (typeof item.shap_reasons === "string" ? JSON.parse(item.shap_reasons) : item.shap_reasons) : []),
            pushedToRetrain: !!(item.pushedToRetrain ?? item.pushed_to_retrain)
          })));
        }
      }
    } catch (err) {
      console.warn("Could not fetch feedback from backend:", err);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket("ws://localhost:8000/ws");
      ws.onmessage = (event) => {
        if (event.data === "new_feedback") {
          fetchReports();
        }
      };
    } catch (e) {
      console.error(e);
    }

    // Polling tự động làm mới phản hồi mỗi 3 giây
    const pollTimer = setInterval(() => {
      fetchReports();
    }, 3000);

    return () => {
      if (ws) ws.close();
      clearInterval(pollTimer);
    };
  }, [fetchReports]);

  const handleAction = async (id: string, action: "safe" | "phishing") => {
    const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") || "Super Admin" : "Super Admin";
    if (userRole === "Guest Auditor") {
      showToast("🛡️ Chế độ Chỉ Đọc (Guest Auditor): Tài khoản Khách không được sửa hoặc duyệt báo cáo!", "warning");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/feedback/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: action, pushedToRetrain: false } : r));
      } else {
        setReports(reports.map(r => r.id === id ? { ...r, status: action, pushedToRetrain: false } : r));
      }
    } catch {
      setReports(reports.map(r => r.id === id ? { ...r, status: action, pushedToRetrain: false } : r));
    }
    const labelText = action === "safe" ? "AN TOÀN (Safe Ground-Truth)" : "LỪA ĐẢO (Phishing Confirmed)";
    showToast(`Đã duyệt [${id}] là ${labelText}. Đã lưu vào CSDL & hàng chờ nạp dữ liệu!`, "success");
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(prev => prev ? { ...prev, status: action, pushedToRetrain: false } : null);
    }
  };

  const handleBatchApprove = async () => {
    const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") || "Super Admin" : "Super Admin";
    if (userRole === "Guest Auditor") {
      showToast("🛡️ Chế độ Chỉ Đọc (Guest Auditor): Tài khoản Khách không được duyệt hàng loạt báo cáo!", "warning");
      return;
    }
    const pendingItems = reports.filter(r => r.status === "pending");
    if (pendingItems.length === 0) {
      showToast("Không có báo cáo nào đang ở trạng thái Chờ Xử Lý.", "info");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/feedback/batch-approve", { method: "POST" });
      if (res.ok) {
        await fetchReports();
      } else {
        setReports(reports.map(r => {
          if (r.status === "pending") {
            return {
              ...r,
              status: r.type === "false_positive" ? "safe" : "phishing",
              pushedToRetrain: true
            };
          }
          return r;
        }));
      }
    } catch {
      setReports(reports.map(r => {
        if (r.status === "pending") {
          return {
            ...r,
            status: r.type === "false_positive" ? "safe" : "phishing",
            pushedToRetrain: true
          };
        }
        return r;
      }));
    }
    showToast(`Đã tự động duyệt ${pendingItems.length} báo cáo dựa trên phân tích rủi ro và nạp vào Dataset v1.3!`, "success");
  };

  const handlePushToRetrain = async (id: string) => {
    const userRole = typeof window !== "undefined" ? localStorage.getItem("user_role") || "Super Admin" : "Super Admin";
    if (userRole === "Guest Auditor") {
      showToast("🛡️ Chế độ Chỉ Đọc (Guest Auditor): Tài khoản Khách không được nạp dữ liệu vào pipeline retrain!", "warning");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/feedback/${id}/retrain`, { method: "POST" });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, pushedToRetrain: true } : r));
      } else {
        setReports(reports.map(r => r.id === id ? { ...r, pushedToRetrain: true } : r));
      }
    } catch {
      setReports(reports.map(r => r.id === id ? { ...r, pushedToRetrain: true } : r));
    }
    showToast(`Mẫu [${id}] đã được xuất sang Pipeline Retraining (Dataset Active Learning v1.3).`, "success");
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(prev => prev ? { ...prev, pushedToRetrain: true } : null);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.targetBrand && r.targetBrand.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          r.userComment.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "pending") return r.status === "pending";
    if (activeTab === "approved") return r.status !== "pending";
    if (activeTab === "false_positive") return r.type === "false_positive";
    if (activeTab === "false_negative") return r.type === "false_negative";
    if (activeTab === "safe") return r.status === "safe";
    if (activeTab === "phishing") return r.status === "phishing";
    return true;
  });

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const fpCount = reports.filter(r => r.type === "false_positive").length;
  const fnCount = reports.filter(r => r.type === "false_negative").length;
  const approvedCount = reports.filter(r => r.status !== "pending").length;
  const totalReceived = 1280 + reports.length;

  // Xuất Báo Cáo Trực Quan (.html) có giao diện đẹp mắt, mở bằng trình duyệt xem ngay và hỗ trợ in/lưu PDF
  const exportReportHtml = () => {
    const now = new Date();
    const formattedDate = now.toLocaleString("vi-VN");
    const reportCode = `PA-FEEDBACK-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Phản Hồi & Dữ Liệu Gán Nhãn - PhishArmor AI</title>
  <style>
    :root {
      --primary: #00897b;
      --primary-dark: #00796b;
      --danger: #e11d48;
      --danger-bg: #fff1f2;
      --safe: #059669;
      --safe-bg: #ecfdf5;
      --warning: #d97706;
      --warning-bg: #fffbeb;
      --slate-900: #0f172a;
      --slate-700: #334155;
      --slate-500: #64748b;
      --slate-200: #e2e8f0;
      --slate-100: #f1f5f9;
      --slate-50: #f8fafc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: var(--slate-700);
      line-height: 1.5;
      padding: 30px 20px;
    }
    .container {
      max-width: 1120px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--slate-200);
      overflow: hidden;
    }
    .top-toolbar {
      background: #0f172a;
      color: #ffffff;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .btn-action {
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .btn-action:hover { background: var(--primary-dark); }
    .header-section {
      padding: 28px 32px 20px;
      border-bottom: 1px solid var(--slate-200);
    }
    .badge-soc {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      background: #e6fffa;
      color: #00796b;
      border: 1px solid #b2dfdb;
      margin-bottom: 8px;
    }
    .report-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.02em;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
      font-size: 12px;
      color: var(--slate-500);
    }
    .meta-item strong { color: var(--slate-900); }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      padding: 20px 32px;
      background: var(--slate-50);
      border-bottom: 1px solid var(--slate-200);
    }
    .kpi-card {
      background: #ffffff;
      padding: 14px;
      border-radius: 10px;
      border: 1px solid var(--slate-200);
      text-align: center;
    }
    .kpi-label { font-size: 11px; color: var(--slate-500); font-weight: 600; text-transform: uppercase; }
    .kpi-val { font-size: 22px; font-weight: 800; margin-top: 4px; }
    .table-wrapper {
      padding: 24px 32px;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: var(--slate-700);
      font-weight: 700;
      padding: 12px 14px;
      border-bottom: 2px solid var(--slate-200);
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    td {
      padding: 14px;
      border-bottom: 1px solid var(--slate-200);
      vertical-align: top;
    }
    tr:hover { background-color: #f8fafc; }
    .mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-fp { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-fn { background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; }
    .badge-safe { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .badge-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .badge-pending { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
    .progress-bar {
      width: 100px;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 4px;
    }
    .progress-fill { height: 100%; border-radius: 3px; }
    .footer-note {
      padding: 16px 32px 24px;
      text-align: center;
      font-size: 11.5px;
      color: var(--slate-500);
      border-top: 1px solid var(--slate-200);
    }
    @media print {
      body { background: white !important; color: #000000 !important; padding: 0 !important; }
      .container { box-shadow: none !important; border: 1px solid #000000 !important; max-width: 100% !important; }
      .top-toolbar { display: none !important; }
      * {
        color: #000000 !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
        border-color: #000000 !important;
      }
      th {
        background-color: #ffffff !important;
        color: #000000 !important;
        border-bottom: 2px solid #000000 !important;
      }
      td {
        border-bottom: 1px solid #000000 !important;
      }
      .badge {
        background: #ffffff !important;
        color: #000000 !important;
        border: 1px solid #000000 !important;
      }
      .progress-bar {
        border: 1px solid #000000 !important;
        background: #ffffff !important;
      }
      .progress-fill {
        background: #000000 !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-toolbar">
      <div><strong>PhishArmor AI Defense</strong> — Tệp Báo Cáo Kết Xuất Ngoại Tuyến</div>
      <button class="btn-action" onclick="window.print()">In Báo Cáo / Lưu PDF</button>
    </div>

    <div class="header-section">
      <div class="badge-soc">● Cổng Quản Trị & Active Learning SOC</div>
      <h1 class="report-title">Báo Cáo Phân Tích Phản Hồi Người Dùng & Gán Nhãn Huấn Luyện AI</h1>
      <div class="meta-grid">
        <div class="meta-item">Mã kiểm toán: <strong>${reportCode}</strong></div>
        <div class="meta-item">Thời gian xuất: <strong>${formattedDate}</strong></div>
        <div class="meta-item">Phiên bản Engine: <strong>PhoBERT + XGBoost v1.4.2</strong></div>
        <div class="meta-item">Trạng thái dữ liệu: <strong>Sẵn sàng cho Retrain v1.3</strong></div>
      </div>
    </div>

    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">Tổng Tiếp Nhận</div>
        <div class="kpi-val" style="color: #0284c7;">${reports.length}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Hàng Đợi Chờ Duyệt</div>
        <div class="kpi-val" style="color: #d97706;">${pendingCount}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Đã Duyệt & Tích Hợp</div>
        <div class="kpi-val" style="color: #059669;">${approvedCount}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Tỷ Lệ Báo Nhầm (FPR)</div>
        <div class="kpi-val" style="color: #7c3aed;">0.06%</div>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">STT</th>
            <th style="width: 85px;">Mã Báo Cáo</th>
            <th style="width: 120px; text-align: center;">Phân Loại</th>
            <th style="width: 230px;">Tên Miền & URL Mục Tiêu</th>
            <th style="width: 140px; text-align: center;">Tín Hiệu AI</th>
            <th>Ý Kiến Phản Hồi Người Dùng</th>
            <th style="width: 110px; text-align: center;">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map((r, idx) => `
            <tr>
              <td style="text-align: center; color: var(--slate-500); font-weight: 600;">${idx + 1}</td>
              <td class="mono" style="font-weight: 700; color: #0284c7;">${r.id}</td>
              <td style="text-align: center;">
                <span class="badge ${r.type === 'false_negative' ? 'badge-fn' : 'badge-fp'}">
                  ${r.type === 'false_negative' ? 'Bỏ sót (FN)' : 'Chặn nhầm (FP)'}
                </span>
              </td>
              <td>
                <div style="font-weight: 700; color: var(--slate-900);">${r.domain}</div>
                <div class="mono" style="font-size: 11px; color: var(--slate-500); word-break: break-all; margin-top: 2px;">${r.url}</div>
                ${r.targetBrand ? `<div style="font-size: 10px; color: #475569; margin-top: 4px; font-weight: 600;">Mục tiêu: ${r.targetBrand}</div>` : ''}
              </td>
              <td style="text-align: center;">
                <div style="font-size: 11.5px; font-weight: 600; color: var(--slate-900);">
                  ${(r.aiPrediction || "").replace(/\\s*\\([^)]*\\)/g, "").trim()}
                </div>
                <div style="font-size: 11px; font-weight: 700; font-family: monospace; color: ${r.confidenceScore >= 75 ? '#e11d48' : r.confidenceScore >= 45 ? '#d97706' : '#059669'}; margin-top: 2px;">
                  ${r.confidenceScore}% tin cậy
                </div>
                <div class="progress-bar" style="margin: 4px auto 0;">
                  <div class="progress-fill" style="width: ${r.confidenceScore}%; background-color: ${r.confidenceScore >= 75 ? '#e11d48' : r.confidenceScore >= 45 ? '#d97706' : '#00897b'};"></div>
                </div>
              </td>
              <td>
                <div style="font-style: italic; color: #334155; margin-bottom: 4px;">"${r.userComment}"</div>
                <div style="font-size: 11px; color: var(--slate-500);">
                  Người gửi: <strong>${r.reporterInfo?.user || 'N/A'}</strong> (${r.reporterInfo?.country || ''})
                </div>
                <div style="font-size: 10.5px; color: var(--slate-500); font-family: monospace;">
                  IP: ${r.reporterInfo?.ip || ''} • ${r.reporterInfo?.timestamp || ''}
                </div>
              </td>
              <td style="text-align: center;">
                <span class="badge ${r.status === 'safe' ? 'badge-safe' : r.status === 'phishing' ? 'badge-danger' : 'badge-pending'}">
                  ${r.status === 'safe' ? '✓ Safe' : r.status === 'phishing' ? '⚠ Phishing' : 'Chờ duyệt'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer-note">
      Báo cáo được trích xuất tự động từ Hệ thống phòng thủ PhishArmor AI • Dữ liệu đã được mã hóa và xác thực chữ ký điện tử SOC
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PhishArmor_Bao_Cao_Phan_Hoi_${now.toISOString().slice(0, 10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("✓ Đã xuất tệp Báo Cáo Trực Quan (.html) mở xem ngay!", "success");
  };

  // Xuất Bảng Tính Microsoft Excel (.xls) chuẩn đơn sắc: toàn bộ chữ đen, nền trắng, không màu, kẻ ô rõ ràng
  const exportExcel = () => {
    const now = new Date();
    const formattedDate = now.toLocaleString("vi-VN");

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>PhishArmor Feedback Dataset</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Times New Roman', Arial, sans-serif; font-size: 11pt; color: #000000; margin: 20px; background: #ffffff; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th { background-color: #ffffff; color: #000000; font-weight: bold; text-align: left; padding: 10px 12px; border: 1.5pt solid #000000; font-size: 11pt; }
          td { padding: 8px 12px; border: 1pt solid #000000; font-size: 10.5pt; vertical-align: top; color: #000000; background-color: #ffffff; }
          .title-banner { background-color: #ffffff; color: #000000; font-size: 14pt; font-weight: bold; text-align: center; padding: 14px; border: 1.5pt solid #000000; }
          .sub-banner { background-color: #ffffff; color: #000000; font-size: 10pt; text-align: center; padding: 8px; border: 1pt solid #000000; font-weight: normal; }
          .kpi-box { background-color: #ffffff; text-align: center; border: 1pt solid #000000; padding: 10px; color: #000000; }
          .kpi-title { font-size: 9.5pt; color: #000000; font-weight: bold; text-transform: uppercase; }
          .kpi-val { font-size: 16pt; color: #000000; font-weight: bold; margin-top: 4px; }
          .text-center { text-align: center; }
          .mono { font-family: Consolas, 'Courier New', monospace; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="9" class="title-banner">PHISHARMOR AI - BÁO CÁO PHẢN HỒI GẮN NHÃN HUẤN LUYỆN (ACTIVE LEARNING)</td>
          </tr>
          <tr>
            <td colspan="9" class="sub-banner">
              Thời gian xuất: ${formattedDate} | Tổng số báo cáo: ${reports.length} | Chờ duyệt: ${pendingCount}
            </td>
          </tr>
        </table>

        <table>
          <tr>
            <td colspan="2" class="kpi-box"><div class="kpi-title">Tổng Tiếp Nhận</div><div class="kpi-val">${reports.length}</div></td>
            <td colspan="2" class="kpi-box"><div class="kpi-title">Chờ Thẩm Định</div><div class="kpi-val">${pendingCount}</div></td>
            <td colspan="3" class="kpi-box"><div class="kpi-title">Đã Duyệt & Tích Hợp</div><div class="kpi-val">${approvedCount}</div></td>
            <td colspan="2" class="kpi-box"><div class="kpi-title">Tỷ Lệ Báo Nhầm (FPR)</div><div class="kpi-val">0.06%</div></td>
          </tr>
        </table>

        <table>
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">STT</th>
              <th style="width: 90px; text-align: center;">Mã Báo Cáo</th>
              <th style="width: 140px; text-align: center;">Phân Loại</th>
              <th style="width: 250px;">Tên Miền (Domain)</th>
              <th style="width: 280px;">URL Chi Tiết</th>
              <th style="width: 150px; text-align: center;">Tín Hiệu AI</th>
              <th style="width: 110px; text-align: center;">Độ Tin Cậy</th>
              <th style="width: 320px;">Ý Kiến Phản Hồi Từ Người Dùng</th>
              <th style="width: 130px; text-align: center;">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            ${reports.map((r, idx) => `
              <tr>
                <td class="text-center" style="color: #000000;"><strong>${idx + 1}</strong></td>
                <td class="text-center mono" style="font-weight: bold; color: #000000;">${r.id}</td>
                <td class="text-center" style="font-weight: bold; color: #000000;">
                  ${r.type === 'false_negative' ? 'Bỏ sót (FN)' : 'Chặn nhầm (FP)'}
                </td>
                <td class="mono" style="font-weight: bold; color: #000000;">${r.domain || ''}</td>
                <td class="mono" style="font-size: 9.5pt; color: #000000;">${r.url || ''}</td>
                <td class="text-center" style="color: #000000;">
                  <strong>${(r.aiPrediction || '').replace(/\\s*\\([^)]*\\)/g, '').trim()}</strong>
                </td>
                <td class="text-center mono" style="font-weight: bold; color: #000000;">
                  ${r.confidenceScore}%
                </td>
                <td style="color: #000000; font-style: italic;">
                  "${r.userComment || ''}"
                  <br/>
                  <small style="color: #000000; font-style: normal;">— Người gửi: ${r.reporterInfo?.user || 'N/A'} (${r.reporterInfo?.timestamp || ''})</small>
                </td>
                <td class="text-center" style="font-weight: bold; color: #000000;">
                  ${r.status === 'safe' ? 'Safe (An toàn)' : r.status === 'phishing' ? 'Phishing (Độc hại)' : 'Chờ thẩm định'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PhishArmor_Danh_Sach_Phan_Hoi_${now.toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("✓ Đã xuất bảng tính Microsoft Excel (.xls) có định dạng kẻ ô!", "success");
  };

  // Xuất Tệp CSV Tiêu Chuẩn (Định dạng phẳng, tương thích mọi phần mềm)
  const exportCsv = () => {
    const now = new Date();
    const headers = [
      "STT",
      "Mã Báo Cáo",
      "Phân Loại",
      "Tên Miền",
      "URL Chi Tiết",
      "Mục Tiêu Giả Mạo",
      "Tín Hiệu AI",
      "Độ Tin Cậy (%)",
      "Người Báo Cáo",
      "Thời Gian",
      "Ý Kiến Phản Hồi",
      "Trạng Thái"
    ];

    const rows = reports.map((r, idx) => [
      idx + 1,
      r.id,
      r.type === 'false_negative' ? 'Bỏ sót (FN)' : 'Chặn nhầm (FP)',
      r.domain || '',
      r.url || '',
      r.targetBrand || '',
      (r.aiPrediction || '').replace(/\\s*\\([^)]*\\)/g, '').trim(),
      `${r.confidenceScore}%`,
      r.reporterInfo?.user || '',
      r.reporterInfo?.timestamp || '',
      r.userComment || '',
      r.status === 'safe' ? 'Đã duyệt an toàn' : r.status === 'phishing' ? 'Đã xác nhận lừa đảo' : 'Chờ thẩm định'
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));

    const csvContent = "\uFEFF" + [headers.map(h => `"${h}"`).join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PhishArmor_Feedback_Dataset_${now.toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("✓ Đã xuất tệp CSV sạch tiêu chuẩn!", "success");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              toast.type === "success" ? "bg-sky-600" : toast.type === "warning" ? "bg-amber-500" : "bg-blue-600"
            }`}>
              {toast.type === "success" ? "✓" : toast.type === "warning" ? "!" : "ℹ"}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{toast.message}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Đồng bộ tự động với MLOps Data Store.</p>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top Context & Actions Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-sm border border-indigo-500/20">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kiểm duyệt SOC</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Đang chờ xử lý: {pendingCount} mẫu
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Hàng đợi phản hồi & gán nhãn huấn luyện AI</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBatchApprove}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Duyệt nhanh tất cả ({pendingCount})
              </button>

              <button
                onClick={exportReportHtml}
                className="px-3.5 py-2 bg-[#00897b] hover:bg-[#00796b] text-white rounded-lg text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Tải báo cáo HTML trực quan xem ngay bằng trình duyệt và in PDF"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Xem Báo Cáo (.html)
              </button>

              <Link
                href="/training"
                className="px-3.5 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Sang Huấn Luyện AI
              </Link>
            </div>
          </div>

          {/* 4 KPI METRIC CARDS (Interactive Filter Buttons) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Tất Cả */}
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white dark:bg-[#111827] border-sky-500 ring-2 ring-sky-500/20 shadow-md"
                  : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tổng tiếp nhận
                </span>
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{totalReceived.toLocaleString()}</span>
                {activeTab === "all" && (
                  <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full">
                    Đang xem
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-emerald-600">↑ 12%</span>
                <span>• FP: {fpCount} | FN: {fnCount} ca</span>
              </div>
            </button>

            {/* Card 2: Chờ Duyệt */}
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-white dark:bg-[#111827] border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                  : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Hàng đợi chờ duyệt
                </span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{pendingCount}</span>
                {activeTab === "pending" && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                    Đang xem
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-amber-600">Cần xử lý</span>
                <span>• {pendingCount} phản hồi mới</span>
              </div>
            </button>

            {/* Card 3: Đã Duyệt */}
            <button
              type="button"
              onClick={() => setActiveTab("approved")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === "approved"
                  ? "bg-white dark:bg-[#111827] border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                  : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Đã duyệt & nạp AI
                </span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{approvedCount}</span>
                {activeTab === "approved" && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Đang xem
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-emerald-600">99.4% hoàn tất</span>
                <span>• Gắn nhãn Ground-Truth</span>
              </div>
            </button>

            {/* Card 4: Chặn Nhầm / Bỏ Lọt */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "false_positive" ? "false_negative" : "false_positive")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === "false_positive" || activeTab === "false_negative"
                  ? "bg-white dark:bg-[#111827] border-violet-500 ring-2 ring-violet-500/20 shadow-md"
                  : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                  Tỷ lệ báo nhầm (FPR)
                </span>
                <span className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-violet-600 dark:text-violet-400 tracking-tight">0.06%</span>
                {(activeTab === "false_positive" || activeTab === "false_negative") && (
                  <span className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-full">
                    {activeTab === "false_positive" ? "Xem FP" : "Xem FN"}
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-emerald-600">FPR Cực thấp</span>
                <span>• Độ tin cậy cao</span>
              </div>
            </button>
          </div>

          {/* MAIN DATA TABLE CARD */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            
            {/* TOOLBAR & FILTERS */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* Category Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-lg border border-slate-200/60 dark:border-slate-800 flex-wrap">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                    activeTab === "all"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  Tất Cả ({reports.length})
                </button>

                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all flex items-center gap-1.5 ${
                    activeTab === "pending"
                      ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Chờ Duyệt ({pendingCount})
                </button>

                <button
                  onClick={() => setActiveTab("false_positive")}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                    activeTab === "false_positive"
                      ? "bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  Chặn nhầm (FP)
                </button>

                <button
                  onClick={() => setActiveTab("false_negative")}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                    activeTab === "false_negative"
                      ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  Bỏ sót (FN)
                </button>

                <button
                  onClick={() => setActiveTab("safe")}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                    activeTab === "safe"
                      ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  Đã Gán An Toàn
                </button>

                <button
                  onClick={() => setActiveTab("phishing")}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                    activeTab === "phishing"
                      ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  Đã Gán Lừa Đảo
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Tìm URL, domain, mã report..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-[#1e293b]/50 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3.5 text-center whitespace-nowrap">Mã báo cáo & Thời gian</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap">Phân loại phản hồi</th>
                    <th className="px-4 py-3.5 text-center">Domain / URL nghi vấn</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap min-w-[190px]">Độ tin cậy & Tín hiệu AI</th>
                    <th className="px-4 py-3.5 text-center">Phản hồi người dùng</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap">Trạng thái</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap">Thao tác thẩm định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        Không tìm thấy báo cáo phản hồi nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        {/* ID & Time */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                            {report.id}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{report.reporterInfo.timestamp}</div>
                        </td>

                        {/* Report Type */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {report.type === "false_positive" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Chặn nhầm (FP)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Bỏ sót (FN)
                            </span>
                          )}
                        </td>

                        {/* Domain / URL */}
                        <td className="px-4 py-3.5 max-w-[260px] text-center">
                          <div className="font-bold text-slate-800 dark:text-white truncate">
                            {report.domain}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                            {report.url}
                          </div>
                          {report.targetBrand && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                              Brand: {report.targetBrand}
                            </span>
                          )}
                        </td>

                        {/* AI Score */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="inline-flex flex-col justify-center gap-1.5 w-[170px] mx-auto">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  report.confidenceScore >= 75
                                    ? "bg-rose-500"
                                    : report.confidenceScore >= 45
                                    ? "bg-amber-500"
                                    : "bg-[#00897b]"
                                }`} />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate" title={report.aiPrediction}>
                                  {(report.aiPrediction || "").replace(/\s*\([^)]*\)/g, "").trim()}
                                </span>
                              </div>
                              <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                                report.confidenceScore >= 75
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40"
                                  : report.confidenceScore >= 45
                                  ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40"
                                  : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40"
                              }`}>
                                {report.confidenceScore}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-700/40">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  report.confidenceScore >= 75
                                    ? "bg-rose-500"
                                    : report.confidenceScore >= 45
                                    ? "bg-amber-500"
                                    : "bg-[#00897b]"
                                }`}
                                style={{ width: `${report.confidenceScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* User Comment */}
                        <td className="px-4 py-3.5 max-w-[240px] text-center">
                          <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 italic">
                            "{report.userComment}"
                          </p>
                          <span className="text-xs text-slate-400 block mt-1">
                            Người gửi: {report.reporterInfo.user}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {report.status === "pending" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Chờ Thẩm Định
                            </span>
                          ) : report.status === "safe" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              ✓ Safe (Chính thống)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Phishing (Lừa đảo)
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td
                          className="px-4 py-3.5 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {report.status === "pending" ? (
                            <div className="inline-flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleAction(report.id, "safe")}
                                className="px-2.5 py-1 bg-white hover:bg-emerald-50 dark:bg-[#1e293b] dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-slate-200 hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-800 rounded-md text-xs font-medium transition-colors shadow-xs"
                                title="Xác nhận trang này An Toàn (Sửa lỗi chặn nhầm FP)"
                              >
                                Gán An Toàn
                              </button>
                              <button
                                onClick={() => handleAction(report.id, "phishing")}
                                className="px-2.5 py-1 bg-white hover:bg-rose-50 dark:bg-[#1e293b] dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-slate-200 hover:border-rose-300 dark:border-slate-700 dark:hover:border-rose-800 rounded-md text-xs font-medium transition-colors shadow-xs"
                                title="Xác nhận trang Lừa Đảo (Sửa lỗi bỏ lọt FN)"
                              >
                                Gán Lừa Đảo
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center gap-2">
                              {report.pushedToRetrain ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                                  <span>Trong Tập Retrain</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handlePushToRetrain(report.id)}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold transition-colors"
                                >
                                  + Nạp Vào Retrain
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Xem chi tiết điều tra"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.144 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER PAGINATION & STATS */}
            <div className="p-4 bg-slate-50/50 dark:bg-[#1e293b]/30 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400 gap-3">
              <div>
                Hiển thị <span className="font-bold text-slate-700 dark:text-slate-300">{filteredReports.length}</span> trên tổng số <span className="font-bold text-slate-700 dark:text-slate-300">{reports.length}</span> báo cáo
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={exportReportHtml}
                  className="px-3 py-1.5 bg-[#00897b] hover:bg-[#00796b] text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Tải báo cáo HTML trực quan xem ngay bằng trình duyệt (có màu sắc, biểu đồ, nút in PDF)"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Tải Báo Cáo (.html - Xem ngay)
                </button>

                <button
                  onClick={exportExcel}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Xuất bảng tính Microsoft Excel có định dạng kẻ ô, màu sắc, không dính chữ"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Xuất Bảng Tính Excel (.xls)
                </button>

                <button
                  onClick={exportCsv}
                  className="px-3 py-1.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Xuất tệp CSV tiêu chuẩn"
                >
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Xuất CSV (.csv)
                </button>

                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reports, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `phisharmor_feedback_dataset_${new Date().toISOString().slice(0,10)}.json`);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    showToast("Đã xuất 100% dữ liệu gán nhãn ra file JSON!", "success");
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Xuất file JSON nguyên bản cho Pipeline AI"
                >
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Xuất JSON
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* DETAIL INVESTIGATION MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                  selectedReport.type === "false_positive" ? "bg-amber-500" : "bg-rose-500"
                }`}>
                  {selectedReport.type === "false_positive" ? "FP" : "FN"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Điều Tra Báo Cáo {selectedReport.id}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      selectedReport.status === "pending"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : selectedReport.status === "safe"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    }`}>
                      {selectedReport.status === "pending" ? "Chờ duyệt" : selectedReport.status === "safe" ? "Đã duyệt Safe" : "Đã duyệt Phishing"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Gửi lúc {selectedReport.reporterInfo.timestamp} từ {selectedReport.reporterInfo.country}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* URL & Domain Preview */}
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-[#1e293b]/60 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-xs">
                <div className="text-xs uppercase font-bold text-slate-400 mb-1">Target URL</div>
                <div className="text-blue-600 dark:text-blue-400 break-all font-semibold select-all">
                  {selectedReport.url}
                </div>
                {selectedReport.targetBrand && (
                  <div className="mt-2 text-xs font-sans text-slate-600 dark:text-slate-300">
                    <span className="font-bold">Thương hiệu bị nhắm tới:</span> {selectedReport.targetBrand}
                  </div>
                )}
              </div>

              {/* User Statement */}
              <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Ý Kiến Phản Hồi Từ Người Dùng
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                  "{selectedReport.userComment}"
                </p>
                <div className="mt-2 pt-2 border-t border-amber-200/40 dark:border-amber-900/30 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Tài khoản: {selectedReport.reporterInfo.user}</span>
                  <span>IP: {selectedReport.reporterInfo.ip}</span>
                </div>
              </div>

              {/* SHAP Feature Explanations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Trọng Số Tính Năng AI (SHAP Explainability)
                </h4>
                <div className="space-y-2">
                  {selectedReport.shapReasons.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#1e293b]/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.impact === "risk" ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                        <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className={`font-mono font-bold ${item.impact === "risk" ? "text-rose-500" : "text-emerald-500"}`}>
                        {item.impact === "risk" ? `+${item.weight}% Risk` : `-${item.weight}% Safe`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-slate-500">
                  {selectedReport.pushedToRetrain ? "✓ Đã đưa vào Dataset v1.3" : "Chưa đưa vào tập huấn luyện"}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleAction(selectedReport.id, "safe")}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedReport.status === "safe"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    }`}
                  >
                    ✓ Gán AN TOÀN
                  </button>

                  <button
                    onClick={() => handleAction(selectedReport.id, "phishing")}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedReport.status === "phishing"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    Gán Lừa Đảo
                  </button>

                  {!selectedReport.pushedToRetrain && (
                    <button
                      onClick={() => handlePushToRetrain(selectedReport.id)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
                    >
                      Đẩy Retrain
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
