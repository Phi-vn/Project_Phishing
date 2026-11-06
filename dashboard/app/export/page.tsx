"use client";



import React, { useState, useEffect } from "react";



import Link from "next/link";



import Sidebar from "@/components/Sidebar";







type ReportType = "ciso" | "technical" | "mlops";







interface TemplateContent {



  headerBadge: string;



  reportCode: string;



  title: string;



  subBadgePrefix: string;



  defaultInspector: string;



  defaultOrg: string;



  summary: {



    status: string;



    text: (dateRangeStr: string) => React.ReactNode;



  };



  metrics: {



    label: string;



    val: string;



    sub: string;



  }[];



  breakdown: {



    title: string;



    items: {



      label: string;



      pct: string;



      count: string;



      barWidth: string;



      barClass: string;



    }[];



  };



  threats: {



    title: string;



    columns: [string, string, string];



    rows: {



      col1: string;



      col2: string;



      col3: string;



    }[];



  };



  insights: {



    title: string;



    text: React.ReactNode;



  };



  csvRows: string[][];



}







const TEMPLATES: Record<ReportType, TemplateContent> = {



  ciso: {



    headerBadge: "BÁO CÁO VẬN HÀNH AN TOÀN THÔNG TIN",



    reportCode: "PA-CISO-2026-8812",



    title: "Báo Cáo Tổng Hợp Tình Hình Giám Sát & Phòng Chống Tấn Công Phishing",



    subBadgePrefix: "Bộ Phận An Toàn Thông Tin & Vận Hành SOC",



    defaultInspector: "Nguyễn Văn Phi (Kỹ sư An toàn thông tin)",



    defaultOrg: "Trung Tâm Giám Sát An Ninh Mạng (SOC Team)",



    summary: {



      status: "TRẠNG THÁI HỆ THỐNG: HOẠT ĐỘNG ỔN ĐỊNH • GIÁM SÁT 24/7",



      text: (dateRangeStr: string) => (



        <>



          Trong kỳ giám sát từ <strong>{dateRangeStr}</strong>, hệ thống PhishArmor đã thực hiện theo dõi liên tục các yêu cầu phân tích URL gửi về từ tiện ích mở rộng và cổng kiểm tra trực tiếp. Hệ thống ghi nhận và phân tích tự động tổng cộng <strong>12,840</strong> lượt kiểm tra, trong đó phát hiện và cảnh báo kịp thời <strong>324</strong> liên kết lừa đảo có chủ đích nhắm vào các cổng dịch vụ ngân hàng, ví điện tử và dịch vụ công. Toàn bộ các tên miền nguy hiểm đã được cập nhật vào danh sách ngăn chặn (Blacklist), giúp người dùng phòng tránh nguy cơ lộ lọt mật khẩu tài khoản và mã xác thực OTP.



        </>



      ),



    },



    metrics: [



      { label: "Tổng lượt quét URL", val: "12,840", sub: "Qua Extension & Gateway" },
{ label: "Liên kết độc hại đã chặn", val: "324", sub: "Tỷ lệ phát hiện: 2.52%" },
{ label: "Độ chính xác mô hình (F1)", val: "98.4%", sub: "Kiểm thử thực nghiệm" },
{ label: "Thời gian phản hồi TB", val: "38 ms", sub: "Độ trễ phân tích thời gian thực" },



    ],



    breakdown: {



      title: "III. Phân Bổ Nguy Cơ Theo Khối Nghiệp Vụ Bị Nhắm Tới",



      items: [



        { label: "Ngân hàng & Giao dịch tài chính số (Vietcombank, MB, Techcombank)", pct: "54.2%", count: "1,742 vụ", barWidth: "54.2%", barClass: "bg-slate-900" },



        { label: "Thương mại điện tử & Ví điện tử (Shopee, MoMo, ZaloPay)", pct: "27.6%", count: "887 vụ", barWidth: "27.6%", barClass: "bg-slate-700" },



        { label: "Khối Dịch vụ công & Giả mạo cơ quan chức năng (VNeID, EVN)", pct: "18.2%", count: "585 vụ", barWidth: "18.2%", barClass: "bg-slate-500" },



      ],



    },



    threats: {



      title: "IV. Top Kịch Bản & Tên Miền Tấn Công Nguy Hiểm",



      columns: ["Tên Miền Độc Hại", "Mục Tiêu Giả Mạo", "Mức Rủi Ro"],



      rows: [



        { col1: "yourbnk-secure.net", col2: "Vietcombank Banking", col3: "96%" },



        { col1: "auth-mbbank-otp.top", col2: "MB Bank Portal OTP", col3: "98%" },



        { col1: "portal-evn-dienluc.info", col2: "EVN Hóa Đơn Điện Tử", col3: "94%" },



        { col1: "facebook-gift.top", col2: "Mạng Xã Hội Phishing", col3: "91%" },



        { col1: "shopee-vip88.click", col2: "Lừa Đảo Trúng Thưởng", col3: "88%" },



      ],



    },



    insights: {



      title: "V. Đề Xuất & Biện Pháp Phòng Ngừa Kỹ Thuật",



      text: (



        <>



          "1. Tiếp tục duy trì quy trình kiểm duyệt các mẫu phản hồi (False Positive) để nạp vào tập dữ liệu tái huấn luyện (Active Learning), giúp mô hình cập nhật các biến thể tên miền mới.\n2. Khuyến nghị người dùng luôn bật chế độ bảo vệ thời gian thực trên tiện ích trình duyệt khi thực hiện các giao dịch trực tuyến.\n3. Phối hợp với bộ phận quản trị mạng để đồng bộ danh sách đen (Blacklist) sang DNS nội bộ nhằm ngăn chặn sớm các tên miền rủi ro cao."



        </>



      ),



    },



    csvRows: [



      ["Domain", "Brand_Target", "Risk_Score", "Threat_Category", "Status"],



      ["yourbnk-secure.net", "Vietcombank Banking", "96%", "Tài Chính", "Blocked"],



      ["auth-mbbank-otp.top", "MB Bank Portal OTP", "98%", "Tài Chính", "Blocked"],



      ["portal-evn-dienluc.info", "EVN Hóa Đơn Điện Tử", "94%", "Dịch Vụ Công", "Blocked"],



      ["facebook-gift.top", "Mạng Xã Hội Phishing", "91%", "Mạng Xã Hội", "Blocked"],



      ["shopee-vip88.click", "Lừa Đảo Trúng Thưởng", "88%", "Thương Mại", "Blocked"],



    ],



  },







  technical: {



    headerBadge: "BÁO CÁO KỸ THUẬT SOC",



    reportCode: "PA-SOC-2026-9941",



    title: "Báo Cáo Phân Tích Kỹ Thuật Mã Độc, DNS & Điều Tra Sự Cố (SOC)",



    subBadgePrefix: "Cụm Cảm Biến Cảnh Báo SOC Network Sensor",



    defaultInspector: "Lê Hoàng Nam (Lead SOC Analyst)",



    defaultOrg: "PhishArmor Cyber Defense SOC Operations",



    summary: {



      status: "SOC ALERT LEVEL: MITIGATED • ZERO ESCALATIONS",



      text: (dateRangeStr: string) => (



        <>



          Đội ngũ SOC đã tiến hành phân tích và vô hiệu hóa <strong>1,842</strong> chỉ số xâm nhập (IoC) trong kỳ <strong>{dateRangeStr}</strong>. Các chiến dịch sử dụng kỹ thuật <strong>Fast-Flux DNS</strong> kết hợp mã hóa trang đích bằng <strong>JavaScript Base64 đa tầng</strong>. 100% địa chỉ IP máy chủ C2 đã được tự động đồng bộ xuống Firewall và EDR để cô lập tức thì.



        </>



      ),



    },



    metrics: [



      { label: "Chỉ số IoC cô lập", val: "1,842", sub: "Domain, IP & Hash" },



      { label: "Thời gian xử lý MTTR", val: "1.8 phút", sub: "Tự động phản hồi SOC" },



      { label: "Cảnh báo mức Cao/Đỏ", val: "426", sub: "100% Đã cách ly" },



      { label: "Độ trễ phân giải DNS", val: "14ms", sub: "Cloudflare/Redis Cache" },



    ],



    breakdown: {



      title: "III. Phân Bổ Vector Tấn Công Kỹ Thuật (Technical Attack Vectors)",



      items: [



        { label: "Tên miền mạo danh Typosquatting & Ký tự đồng hình Punycode", pct: "46.5%", count: "856 IoC", barWidth: "46.5%", barClass: "bg-slate-900" },



        { label: "Chuyển hướng mở (Open Redirect) & Subdomain Hijacking", pct: "31.8%", count: "586 IoC", barWidth: "31.8%", barClass: "bg-slate-700" },



        { label: "Lừa đảo qua mã QR độc hại (Quishing) & SVG Obfuscation", pct: "21.7%", count: "400 IoC", barWidth: "21.7%", barClass: "bg-slate-500" },



      ],



    },



    threats: {



      title: "IV. Danh Sách Tên Miền Độc Hại & Địa Chỉ IP C2 (IoC Table)",



      columns: ["Tên Miền IoC", "Địa Chỉ IP C2 / ASN", "Phân Loại Kỹ Thuật"],



      rows: [



        { col1: "auth-mbbank-otp.top", col2: "103.145.2.14 (AS136052)", col3: "Credential Harvester" },



        { col1: "portal-evn-dienluc.info", col2: "45.154.255.88 (AS44050)", col3: "C2 Malware Drop" },



        { col1: "yourbnk-secure.net", col2: "194.26.29.112 (AS48693)", col3: "Reverse Proxy OTP" },



        { col1: "shopee-vip88.click", col2: "185.220.101.5 (Tor Exit)", col3: "Fast-Flux Redirect" },



        { col1: "facebook-gift.top", col2: "91.240.118.42 (AS57523)", col3: "Session Token Stealer" },



      ],



    },



    insights: {



      title: "V. Khuyến Nghị & Biện Pháp Kỹ Thuật SOC",



      text: (



        <>



          "Khuyến cáo chặn triệt để các TLD rủi ro cao (.top, .click, .site) tại DNS Resolver gateway. Cập nhật chữ ký nhận diện SNI đối với các dải IP Bulletproof Hosting đã phát hiện trong bảng IoC, đồng thời kích hoạt chính sách cô lập tự động khi phát hiện chứng chỉ SSL dưới 7 ngày tuổi."



        </>



      ),



    },



    csvRows: [



      ["IoC_Domain", "C2_IP_ASN", "Classification", "Action", "Status"],



      ["auth-mbbank-otp.top", "103.145.2.14 (AS136052)", "Credential Harvester", "Firewall Block", "Mitigated"],



      ["portal-evn-dienluc.info", "45.154.255.88 (AS44050)", "C2 Malware Drop", "Sinkholed", "Mitigated"],



      ["yourbnk-secure.net", "194.26.29.112 (AS48693)", "Reverse Proxy OTP", "EDR Isolated", "Mitigated"],



      ["shopee-vip88.click", "185.220.101.5 (Tor Exit)", "Fast-Flux Redirect", "DNS Gateway Block", "Mitigated"],



      ["facebook-gift.top", "91.240.118.42 (AS57523)", "Session Token Stealer", "Blacklisted", "Mitigated"],



    ],



  },







  mlops: {



    headerBadge: "BÁO CÁO MLOPS (AI AUDIT)",



    reportCode: "PA-MLOPS-2026-4421",



    title: "Báo Cáo Kiểm Toán & Đánh Giá Hiệu Năng Mô Hình AI (MLOps)",



    subBadgePrefix: "PhoBERT Transformer + XGBoost Ensemble",



    defaultInspector: "TS. Trần Minh Khoa (Lead AI / MLOps Engineer)",



    defaultOrg: "PhishArmor AI Research & MLOps Lab",



    summary: {



      status: "MODEL STATUS: PRODUCTION READY • DRIFT INDEX: 0.012",



      text: (dateRangeStr: string) => (



        <>



          Mô hình kết hợp <strong>PhoBERT Transformer + XGBoost</strong> đạt độ chính xác F1-Score vượt trội <strong>98.42%</strong> trên tập kiểm thử độc lập gồm 15,000 mẫu trong kỳ <strong>{dateRangeStr}</strong>. Khả năng phát hiện biến thể lừa đảo ngữ nghĩa và teencode tiếng Việt duy trì độ hội tụ cao. Tốc độ suy luận tối ưu hóa qua <strong>ONNX Runtime</strong> chỉ mất <strong>22.4ms/mẫu</strong> mà không gặp hiện tượng Overfitting.



        </>



      ),



    },



    metrics: [



      { label: "Độ chính xác F1-Score", val: "98.42%", sub: "Kiểm thử độc lập" },



      { label: "Chỉ số AUC - ROC", val: "0.992", sub: "Phân loại cực nhạy" },



      { label: "Thời gian suy luận", val: "22.4ms", sub: "ONNX Runtime GPU" },



      { label: "Tỷ lệ báo động giả (FPR)", val: "0.18%", sub: "Độ tin cậy tối đa" },



    ],



    breakdown: {



      title: "III. Tỷ Trọng Đóng Góp Của Nhóm Đặc Trưng (Feature Importance)",



      items: [



        { label: "Ngữ nghĩa tiếng Việt tự nhiên & Ngữ cảnh (PhoBERT Embeddings)", pct: "48.7%", count: "Trọng số 0.487", barWidth: "48.7%", barClass: "bg-slate-900" },



        { label: "Đặc trưng hình thái ký tự URL & Lexical (Entropy, Subdomains)", pct: "32.5%", count: "Trọng số 0.325", barWidth: "32.5%", barClass: "bg-slate-700" },



        { label: "Đặc trưng kỹ thuật mạng (DNS Record, ASN Reputation, SSL Age)", pct: "18.8%", count: "Trọng số 0.188", barWidth: "18.8%", barClass: "bg-slate-500" },



      ],



    },



    threats: {



      title: "IV. Kết Quả Kiểm Thử Mô Hình Trên Các Mẫu Biến Thể Tinh Vi",



      columns: ["Mẫu URL / Payload Kiểm Thử", "Kỹ Thuật Làm Rối Ngữ Nghĩa", "Xác Suất Dự Đoán (Score)"],



      rows: [



        { col1: "dangnhap-nhanqua-tri-an.cc", col2: "Cố tình sai chính tả & Teencode", col3: "99.1% Phishing" },



        { col1: "hoanthue-thunhap-canhan.com", col2: "Lợi dụng từ khóa hành chính công", col3: "97.8% Phishing" },



        { col1: "portal-vcb.vn?auth=eyJhbG...", col2: "Mã hóa Base64 giấu tham số OTP", col3: "95.4% Phishing" },



        { col1: "vneid-dinhdanh-cap2.top", col2: "Mạo danh ứng dụng Bộ Công An", col3: "99.6% Phishing" },



        { col1: "shopee-khuyenmai-hotdeal.site", col2: "Subdomain giả mạo thương mại", col3: "98.9% Phishing" },



      ],



    },



    insights: {



      title: "V. Nhận Xét & Định Hướng Nâng Cấp Mô Hình AI",



      text: (



        <>



          "Chỉ số dịch chuyển dữ liệu (Data Drift Index) ở mức an toàn 0.012 (dưới ngưỡng cảnh báo 0.05). Khuyến nghị thiết lập chu kỳ tự động tái huấn luyện (Continuous Retraining Pipeline) mỗi 14 ngày với các mẫu URL mới thu thập từ HoneyPot để duy trì độ nhạy trước các thủ đoạn ngôn ngữ mới."



        </>



      ),



    },



    csvRows: [



      ["Test_Payload_URL", "Semantic_Obfuscation_Type", "AI_Prediction_Score", "Ground_Truth", "Result"],



      ["dangnhap-nhanqua-tri-an.cc", "Teencode & Misspelling", "99.1%", "Phishing", "True Positive"],



      ["hoanthue-thunhap-canhan.com", "Administrative Keywords", "97.8%", "Phishing", "True Positive"],



      ["portal-vcb.vn?auth=eyJhbG...", "Base64 Parameter Injection", "95.4%", "Phishing", "True Positive"],



      ["vneid-dinhdanh-cap2.top", "Government Impersonation", "99.6%", "Phishing", "True Positive"],



      ["shopee-khuyenmai-hotdeal.site", "Brand Subdomain Spoofing", "98.9%", "Phishing", "True Positive"],



    ],



  },



};







export default function ExportPage() {



  const [reportType, setReportType] = useState<ReportType>("ciso");



  const [timeRange, setTimeRange] = useState("7_days");



  const [reportId, setReportId] = useState(TEMPLATES.ciso.reportCode);



  const [currentDate, setCurrentDate] = useState("08/10/2026 - 21:45");



  const [dateRangeStr, setDateRangeStr] = useState("01/10/2026 - 08/10/2026");



  



  // Section customization toggles



  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);



  const [includeKpiMetrics, setIncludeKpiMetrics] = useState(true);



  const [includeThreatBreakdown, setIncludeThreatBreakdown] = useState(true);



  const [includeTopThreatsTable, setIncludeTopThreatsTable] = useState(true);



  const [includeGeminiInsights, setIncludeGeminiInsights] = useState(true);



  const [includeDigitalSignature, setIncludeDigitalSignature] = useState(true);







  // Inspector details



  const [inspectorName, setInspectorName] = useState(TEMPLATES.ciso.defaultInspector);



  const [organization, setOrganization] = useState(TEMPLATES.ciso.defaultOrg);







  // Editable Mode: allows the user to click anywhere on the report document and type / edit



  const [isEditable, setIsEditable] = useState(true);



  const [docVersionKey, setDocVersionKey] = useState(1);







  const [isExporting, setIsExporting] = useState(false);



  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);







  const activeTemplate = TEMPLATES[reportType] || TEMPLATES.ciso;







  useEffect(() => {



    const now = new Date();



    const today = now.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });



    const time = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });



    



    let daysAgo = 7;



    if (timeRange === "24_hours") daysAgo = 1;



    if (timeRange === "30_days") daysAgo = 30;



    if (timeRange === "90_days") daysAgo = 90;







    const startDate = new Date(now);



    startDate.setDate(startDate.getDate() - daysAgo);



    const startStr = startDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });







    setCurrentDate(`${today} - ${time}`);



    setDateRangeStr(`${startStr} - ${today}`);



  }, [timeRange]);







  const handleSelectTemplate = (type: ReportType) => {



    setReportType(type);



    const tmpl = TEMPLATES[type];



    setReportId(tmpl.reportCode);



    setInspectorName(tmpl.defaultInspector);



    setOrganization(tmpl.defaultOrg);



    setDocVersionKey((prev) => prev + 1); // Reset contentEditable DOM back to selected template defaults



    const titles = {



      ciso: "Mẫu Báo Cáo Điều Hành (CISO)",



      technical: "Mẫu Báo Cáo Kỹ Thuật (SOC)",



      mlops: "Mẫu Kiểm Toán Mô Hình AI (MLOps)",



    };



    showToast(`Đã chuyển sang ${titles[type]} (Đã nạp lại nội dung mặc định)`, "info");



  };







  const handleResetToTemplate = () => {



    const tmpl = TEMPLATES[reportType];



    setReportId(tmpl.reportCode);



    setInspectorName(tmpl.defaultInspector);



    setOrganization(tmpl.defaultOrg);



    setDocVersionKey((prev) => prev + 1);



    showToast("Đã khôi phục toàn bộ văn bản về mẫu mặc định!", "success");



  };







  const showToast = (message: string, type: "success" | "info" | "warning" = "info") => {



    setToast({ message, type });



    setTimeout(() => setToast(null), 3500);



  };







  useEffect(() => {



    const handleBeforePrint = () => {



      const mainEl = document.querySelector("main");



      if (mainEl) mainEl.scrollTop = 0;



      window.scrollTo(0, 0);



    };







    window.addEventListener("beforeprint", handleBeforePrint);



    return () => window.removeEventListener("beforeprint", handleBeforePrint);



  }, []);







  const handleDownloadPdf = () => {



    // Unfocus any currently focused contentEditable element so focus rings aren't captured



    if (typeof document !== "undefined" && document.activeElement && "blur" in document.activeElement) {



      (document.activeElement as HTMLElement).blur();



    }







    const mainEl = document.querySelector("main");



    if (mainEl) mainEl.scrollTop = 0;



    window.scrollTo(0, 0);







    setIsExporting(true);



    showToast("Đang mở bản in PDF vector A4 sắc nét (Hãy chọn 'Lưu dưới dạng PDF' để có file chuẩn đẹp không dính chữ)!", "info");



    setTimeout(() => {



      setIsExporting(false);



      window.print();



    }, 250);



  };







  const handlePrintPdf = () => {



    if (typeof document !== "undefined" && document.activeElement && "blur" in document.activeElement) {



      (document.activeElement as HTMLElement).blur();



    }







    const mainEl = document.querySelector("main");



    if (mainEl) mainEl.scrollTop = 0;



    window.scrollTo(0, 0);







    setIsExporting(true);



    showToast("Đang mở trang in báo cáo chuẩn A4 vector...", "info");



    setTimeout(() => {



      setIsExporting(false);



      window.print();



    }, 250);



  };







  // Xuất Bảng Tính Microsoft Excel (.xls) chuẩn đơn sắc: toàn bộ chữ đen, nền trắng, không màu, kẻ ô rõ ràng



  const handleExportExcel = () => {



    const tmpl = activeTemplate;



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



                <x:Name>${reportType.toUpperCase()} Audit Report</x:Name>



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



          th { background-color: #ffffff; color: #000000; font-weight: bold; text-align: left; padding: 10px 14px; border: 1.5pt solid #000000; font-size: 11pt; }



          td { padding: 8px 12px; border: 1pt solid #000000; font-size: 10.5pt; vertical-align: middle; color: #000000; background-color: #ffffff; }



          .title-banner { background-color: #ffffff; color: #000000; font-size: 14pt; font-weight: bold; text-align: center; padding: 14px; border: 1.5pt solid #000000; }



          .sub-banner { background-color: #ffffff; color: #000000; font-size: 10pt; text-align: center; padding: 8px; border: 1pt solid #000000; font-weight: normal; }



          .meta-label { background-color: #ffffff; font-weight: bold; color: #000000; width: 180px; }



          .meta-value { color: #000000; }



          .kpi-box { background-color: #ffffff; text-align: center; border: 1pt solid #000000; padding: 10px; color: #000000; }



          .kpi-title { font-size: 9.5pt; color: #000000; font-weight: bold; text-transform: uppercase; }



          .kpi-val { font-size: 16pt; color: #000000; font-weight: bold; margin-top: 4px; }



          .text-center { text-align: center; }



          .text-right { text-align: right; }



          .mono { font-family: Consolas, 'Courier New', monospace; }



        </style>



      </head>



      <body>



        <!-- 1. TIÊU ĐỀ BÁO CÁO -->



        <table>



          <tr>



            <td colspan="6" class="title-banner">PHISHARMOR AI DEFENSE - BÁO CÁO AN NINH & GIÁM ĐỊNH MÔ HÌNH AI</td>



          </tr>



          <tr>



            <td colspan="6" class="sub-banner">



              ${tmpl.title} | Kỳ thẩm định: ${dateRangeStr}



            </td>



          </tr>



        </table>







        <!-- 2. THÔNG TIN HÀNH CHÍNH & PHÊ DUYỆT -->



        <table>



          <tr>



            <td class="meta-label">Mã số hồ sơ:</td>



            <td class="meta-value mono"><strong>${reportId}</strong></td>



            <td class="meta-label">Thời gian xuất:</td>



            <td class="meta-value">${formattedDate}</td>



            <td class="meta-label">Tiêu chuẩn Audit:</td>



            <td class="meta-value">SOC2 / ISO 27001</td>



          </tr>



          <tr>



            <td class="meta-label">Chuyên viên phụ trách:</td>



            <td class="meta-value" colspan="2"><strong>${inspectorName}</strong></td>



            <td class="meta-label">Cơ quan / Đơn vị:</td>



            <td class="meta-value" colspan="2"><strong>${organization}</strong></td>



          </tr>



        </table>







        <!-- 3. TÓM TẮT 4 CHỈ SỐ KPI CHÍNH -->



        <table>



          <tr>



            <th colspan="6" style="background-color: #ffffff; color: #000000; border: 1.5pt solid #000000;">CHỈ SỐ AN NINH & HIỆU NĂNG TRỌNG YẾU</th>



          </tr>



          <tr>



            ${tmpl.metrics.map(m => `



              <td colspan="${Math.floor(6 / tmpl.metrics.length)}" class="kpi-box">



                <div class="kpi-title">${m.label}</div>



                <div class="kpi-val">${m.val}</div>



                <div style="font-size: 9.5pt; color: #000000; margin-top: 3px;">${m.sub}</div>



              </td>



            `).join("")}



          </tr>



        </table>







        <!-- 4. BẢNG DỮ LIỆU CHI TIẾT CÁC MỐI ĐE DỌA (CỘT RỘNG RÃI, CÓ BORDER, CHỮ ĐEN DỄ ĐỌC 100%) -->



        <table>



          <thead>



            <tr>



              <th style="width: 50px; text-align: center;">STT</th>



              <th style="width: 320px;">${tmpl.threats.columns[0]}</th>



              <th style="width: 260px;">${tmpl.threats.columns[1]}</th>



              <th style="width: 140px; text-align: center;">${tmpl.threats.columns[2]}</th>



              <th style="width: 170px; text-align: center;">Trạng Thái Xử Lý</th>



              <th style="width: 220px;">Ghi Chú Phân Tích AI</th>



            </tr>



          </thead>



          <tbody>



            ${tmpl.threats.rows.map((r, idx) => `



              <tr>



                <td class="text-center" style="color: #000000;"><strong>${idx + 1}</strong></td>



                <td class="mono" style="color: #000000;"><strong>${r.col1}</strong></td>



                <td style="color: #000000;">${r.col2}</td>



                <td class="text-center mono" style="font-weight: bold; color: #000000; font-size: 11pt;">${r.col3}</td>



                <td class="text-center" style="font-weight: bold; color: #000000;">



                  ĐÃ CHẶN (BLOCKED)



                </td>



                <td style="color: #000000; font-size: 10pt;">Đối chiếu khớp quy tắc AI & Blacklist</td>



              </tr>



            `).join("")}



          </tbody>



        </table>







        <!-- 5. KẾT LUẬN & CHỮ KÝ SỐ -->



        <table>



          <tr>



            <td colspan="6" style="background-color: #ffffff; padding: 14px; border: 1pt solid #000000; line-height: 1.6; color: #000000;">



              <strong>KẾT LUẬN & ĐÁNH GIÁ CỦA CHUYÊN VIÊN:</strong><br/>



              Hệ thống PhishArmor đã thực hiện kiểm tra đa tầng (Heuristic, XGBoost, PhoBERT NLP và VirusTotal). Mọi chỉ số an ninh đều đáp ứng ngưỡng an toàn doanh nghiệp. Tệp báo cáo được ký số điện tử tự động và có giá trị lưu trữ nội bộ.



            </td>



          </tr>



          <tr>



            <td colspan="3" style="border: none; padding-top: 24px; color: #000000;">



              <strong>CƠ QUAN PHÊ DUYỆT BAN HÀNH</strong><br/>



              <span style="font-size: 10pt; color: #000000;">${organization}</span><br/><br/>



              <em>(Đã ký điện tử xác thực)</em>



            </td>



            <td colspan="3" style="border: none; padding-top: 24px; text-align: right; color: #000000;">



              <strong>CHUYÊN VIÊN KÝ DUYỆT</strong><br/>



              <span style="font-size: 10pt; color: #000000;">${inspectorName}</span><br/><br/>



              <strong style="color: #000000; font-size: 11pt;">SOC-VERIFIED-CERTIFIED ✓</strong>



            </td>



          </tr>



        </table>



      </body>



      </html>



    `;







    const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8" });



    const url = URL.createObjectURL(blob);



    const link = document.createElement("a");



    link.href = url;



    link.setAttribute("download", `PhishArmor_Bao_Cao_${reportType.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.xls`);



    document.body.appendChild(link);



    link.click();



    document.body.removeChild(link);



    URL.revokeObjectURL(url);



    showToast("✓ Đã xuất bảng tính Excel (.xls) chuẩn đơn sắc (toàn bộ chữ đen, không màu, kẻ ô rõ ràng)!", "success");



  };







  // Lưu Báo Cáo HTML Độc Lập



  const handleExportHtml = () => {



    const docElement = document.getElementById("report-document");



    if (!docElement) return;







    const htmlDoc = `<!DOCTYPE html>



<html lang="vi">



<head>



  <meta charset="UTF-8">



  <title>Báo Cáo An Ninh - PhishArmor Enterprise</title>



  <script src="https://cdn.tailwindcss.com"></script>



  <style>



    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #000000; padding: 24px; line-height: 1.6; }



    .toolbar { max-width: 820px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; }



    .btn-print { background: #000000; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }



    .card { max-width: 820px; margin: 0 auto; background: white; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }



    @media print {



      .toolbar { display: none !important; }



      body { padding: 0 !important; background: white !important; color: #000000 !important; }



      .card { box-shadow: none !important; border: none !important; padding: 0 !important; }



      * {



        color: #000000 !important;



        background-color: transparent !important;



        border-color: #000000 !important;



        box-shadow: none !important;



        text-shadow: none !important;



      }



    }



  </style>



</head>



<body>



  <div class="toolbar">



    <strong>PhishArmor Enterprise Security Report</strong>



    <button class="btn-print" onclick="window.print()">In Báo Cáo / Lưu PDF</button>



  </div>



  <div class="card">



    ${docElement.innerHTML}



  </div>



</body>



</html>`;







    const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });



    const url = URL.createObjectURL(blob);



    const link = document.createElement("a");



    link.href = url;



    link.setAttribute("download", `PhishArmor_Bao_Cao_${reportType.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.html`);



    document.body.appendChild(link);



    link.click();



    document.body.removeChild(link);



    URL.revokeObjectURL(url);



    showToast("✓ Đã tải tệp Báo cáo HTML độc lập, mở ra đọc to rõ bất cứ lúc nào!", "success");



  };







  // Shared inline class for editable elements



  const editableClass = isEditable



    ? "cursor-text hover:bg-slate-100/70 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none rounded transition-colors duration-150 px-1 -mx-1"



    : "";







  return (



    <div className="flex h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans overflow-hidden">



      



      {/* PRINT CSS STYLES */}



      <style dangerouslySetInnerHTML={{ __html: `



        @media print {



          @page {



            size: A4 portrait;



            margin: 6mm 8mm;



          }







          html, body {



            width: 100% !important;



            height: auto !important;



            min-height: 100% !important;



            overflow: visible !important;



            background: #ffffff !important;



            color: #000000 !important;



            margin: 0 !important;



            padding: 0 !important;



            -webkit-print-color-adjust: exact !important;



            print-color-adjust: exact !important;



          }







          * {



            -webkit-print-color-adjust: exact !important;



            print-color-adjust: exact !important;



            box-sizing: border-box !important;



          }







          /* Pure black text for entire report document in print (no colors, only black text) */



          #report-document,



          #report-document * {



            color: #000000 !important;



            -webkit-text-fill-color: #000000 !important;



          }







          /* Remove all colored badge backgrounds in print */



          #report-document .threat-badge,



          #report-document [class*="badge"],



          #report-document [class*="pill"] {



            background-color: transparent !important;



            background: transparent !important;



            border: 1px solid #000000 !important;



            box-shadow: none !important;



            color: #000000 !important;



            -webkit-text-fill-color: #000000 !important;



          }



          #report-document .bg-rose-50,



          #report-document .bg-amber-50,



          #report-document .bg-emerald-50,



          #report-document .bg-sky-50,



          #report-document .bg-slate-50,



          #report-document .bg-slate-100 {



            background-color: transparent !important;



            background: transparent !important;



          }







          /* Progress bars in print: solid black */



          #report-document .bg-slate-900,



          #report-document .bg-slate-700,



          #report-document .bg-slate-500 {



            background-color: #000000 !important;



            background: #000000 !important;



          }







          /* Unclip containers and remove flex/grid restrictions */



          body > div {



            display: block !important;



            height: auto !important;



            min-height: 0 !important;



            overflow: visible !important;



          }







          main {



            padding: 0 !important;



            margin: 0 !important;



            width: 100% !important;



            height: auto !important;



            overflow: visible !important;



            display: block !important;



          }







          /* Flatten grid so document takes 100% width of the print page */



          .grid, .lg\:grid-cols-12, .lg\:col-span-8 {



            display: block !important;



            width: 100% !important;



            max-width: 100% !important;



            margin: 0 !important;



            padding: 0 !important;



          }







          /* Clean up the printable document container */



          #report-document {



            box-shadow: none !important;



            border: none !important;



            width: 100% !important;



            max-width: 100% !important;



            margin: 0 auto !important;



            padding: 0 !important;



            background: #ffffff !important;



            overflow: visible !important;



            break-inside: auto !important;



            page-break-inside: auto !important;



          }







          /* Ensure logo shield icon is ALWAYS crisp white in print */



          #report-document .bg-slate-900 {



            background-color: #0f172a !important;



            color: #ffffff !important;



            -webkit-print-color-adjust: exact !important;



            print-color-adjust: exact !important;



          }



          #report-document .bg-slate-900 svg,



          #report-document .bg-slate-900 svg path {



            stroke: #ffffff !important;



            color: #ffffff !important;



            -webkit-print-color-adjust: exact !important;



            print-color-adjust: exact !important;



          }







          /* Compact internal spacing so the full report fits nicely on 1 single A4 page */



          #report-document .p-7,



          #report-document .sm\:p-8 {



            padding: 10px 14px !important;



          }







          #report-document .mb-5 {



            margin-bottom: 8px !important;



          }







          #report-document .mb-4 {



            margin-bottom: 6px !important;



          }







          #report-document .pb-3 {



            padding-bottom: 4px !important;



          }







          #report-document .gap-4 {



            gap: 8px !important;



          }







          #report-document .py-2\.5 {



            padding-top: 4px !important;



            padding-bottom: 4px !important;



          }







          #report-document .mt-auto {



            margin-top: 8px !important;



            padding-top: 6px !important;



          }







          /* Prevent undesirable page breaks inside critical sections */



          #report-document table,



          #report-document tr,



          #report-document .rounded-xl {



            break-inside: avoid !important;



            page-break-inside: avoid !important;



          }







          /* ABSOLUTELY HIDE sidebar, controls, buttons, navigation */



          .no-print,



          .print-hide,



          aside,



          nav,



          header,



          footer {



            display: none !important;



          }



        }



      `}} />







      {/* TOAST NOTIFICATION */}



      {toast && (



        <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up no-print print:hidden">



          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-3.5 flex items-center gap-3">



            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${



              toast.type === "success" ? "bg-sky-600" : toast.type === "warning" ? "bg-amber-500" : "bg-blue-600"



            }`}>



              {toast.type === "success" ? "✓" : "i"}



            </div>



            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{toast.message}</div>



          </div>



        </div>



      )}







      {/* LEFT GLOBAL NAVIGATION SIDEBAR */}



      <Sidebar />







      {/* MAIN EXPORT WORKSPACE */}



      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">



        



        {/* TOP BAR / BREADCRUMBS & ACTIONS */}



        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800/80 no-print print:hidden">



          <div className="flex items-center gap-3">



            <div className="w-9 h-9 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-semibold text-base shadow-xs border border-sky-500/20">



              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>



            </div>



            <div>



              <div className="flex items-center gap-2">



                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trung tâm xuất báo cáo</span>



                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>



                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">



                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>



                  Định dạng chuẩn SOC / CISO



                </span>



              </div>



              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Báo cáo giám định rủi ro & chữ ký điện tử</h1>



            </div>



          </div>







          <div className="flex items-center gap-2.5 flex-wrap">



            <button



              onClick={handleExportExcel}



              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"



              title="Xuất bảng tính Excel (.xls) có đầy đủ cột, màu sắc phân biệt, chữ to rõ không dính nhau"



            >



              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">



                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />



              </svg>



              Xuất File Excel (.xls)



            </button>







            <button



              onClick={handleExportHtml}



              className="px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"



              title="Tải tệp Báo cáo HTML độc lập mở xem to rõ trên mọi máy tính"



            >



              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">



                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />



              </svg>



              Lưu Báo Cáo HTML



            </button>







            <button



              onClick={handleDownloadPdf}



              disabled={isExporting}



              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-2 disabled:opacity-70 cursor-pointer"



              title="Mở trang in và lưu PDF vector A4 chuẩn sắc nét không bị dính chữ"



            >



              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">



                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />



              </svg>



              {isExporting ? "Đang mở bản in..." : "In / Tải Xuống PDF (A4)"}



            </button>



          </div>



        </div>







        {/* WORKSPACE LAYOUT: CONFIG PANEL (LEFT) + LIVE DOCUMENT PREVIEW (RIGHT) */}



        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">



          



          {/* LEFT: REPORT CONFIGURATION CONTROLS (Hidden in Print) */}



          <div className="lg:col-span-4 space-y-4 no-print print:hidden">



            



            {/* Template Selector Card */}



            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">



              <div className="flex items-center justify-between">



                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">



                  Mẫu Báo Cáo



                </h3>



                <span className="text-xs text-slate-400">Chọn định dạng</span>



              </div>



              



              <div className="grid grid-cols-1 gap-2">



                <button



                  type="button"



                  onClick={() => handleSelectTemplate("ciso")}



                  className={`p-3 rounded-lg border text-left transition-all ${



                    reportType === "ciso"



                      ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 text-slate-900 dark:text-white ring-1 ring-sky-500"



                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"



                  }`}



                >



                  <div className="font-medium text-xs flex items-center justify-between">



                    <span>Báo Cáo Điều Hành (CISO)</span>



                    {reportType === "ciso" && <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">Đang chọn</span>}



                  </div>



                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tổng quan rủi ro & chỉ số lãnh đạo.</div>



                </button>







                <button



                  type="button"



                  onClick={() => handleSelectTemplate("technical")}



                  className={`p-3 rounded-lg border text-left transition-all ${



                    reportType === "technical"



                      ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 text-slate-900 dark:text-white ring-1 ring-sky-500"



                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"



                  }`}



                >



                  <div className="font-medium text-xs flex items-center justify-between">



                    <span>Báo Cáo Kỹ Thuật (SOC)</span>



                    {reportType === "technical" && <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">Đang chọn</span>}



                  </div>



                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chi tiết mã độc, DNS & chỉ số IOC.</div>



                </button>







                <button



                  type="button"



                  onClick={() => handleSelectTemplate("mlops")}



                  className={`p-3 rounded-lg border text-left transition-all ${



                    reportType === "mlops"



                      ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 text-slate-900 dark:text-white ring-1 ring-sky-500"



                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"



                  }`}



                >



                  <div className="font-medium text-xs flex items-center justify-between">



                    <span>Báo Cáo Mô Hình AI (MLOps)</span>



                    {reportType === "mlops" && <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">Đang chọn</span>}



                  </div>



                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hiệu năng F1-Score & PhoBERT.</div>



                </button>



              </div>







              {/* Time Range Selector */}



              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">



                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Kỳ Thời Gian Báo Cáo</label>



                <select



                  value={timeRange}



                  onChange={(e) => setTimeRange(e.target.value)}



                  className="w-full p-2 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"



                >



                  <option value="24_hours">24 Giờ Qua (Incident Flash Report)</option>



                  <option value="7_days">7 Ngày Qua (Weekly Defense Summary)</option>



                  <option value="30_days">30 Ngày Qua (Monthly CISO Briefing)</option>



                  <option value="90_days">Quý Này (Quarterly Threat Review)</option>



                </select>



              </div>



            </div>







            {/* Direct Editing Control Card */}



            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">



              <div className="flex items-center justify-between">



                <div>



                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">



                    Soạn thảo trực tiếp trên văn bản



                  </h3>



                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">



                    Cho phép chọn và gõ sửa trực tiếp trên trang A4



                  </p>



                </div>



                <button



                  type="button"



                  onClick={() => setIsEditable(!isEditable)}



                  className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${



                    isEditable



                      ? "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300"



                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"



                  }`}



                >



                  {isEditable ? "Đang bật" : "Đang tắt"}



                </button>



              </div>



              <button



                type="button"



                onClick={handleResetToTemplate}



                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"



              >



                Khôi phục văn bản mẫu



              </button>



            </div>







            {/* Inspector Sign-off Details */}



            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">



              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">



                Chuyên Viên Ký Duyệt



              </h3>



              <div>



                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Họ Tên & Chức Danh</label>



                <input



                  type="text"



                  value={inspectorName}



                  onChange={(e) => setInspectorName(e.target.value)}



                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-normal outline-none focus:border-sky-500"



                />



              </div>



              <div>



                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Cơ Quan / Đơn Vị Ban Hành</label>



                <input



                  type="text"



                  value={organization}



                  onChange={(e) => setOrganization(e.target.value)}



                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-normal outline-none focus:border-sky-500"



                />



              </div>



            </div>







            {/* Quick PDF Export CTA Card */}



            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">



              <div className="flex items-center justify-between">



                <span className="text-xs font-semibold text-slate-900 dark:text-white">Xuất bản tài liệu</span>



                <span className="text-xs font-mono text-slate-400">Khổ A4 chuẩn</span>



              </div>



              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">



                Tệp PDF bao gồm đầy đủ dữ liệu giám định, phân tích giải thích AI và nội dung văn bản đã hiệu chỉnh.



              </p>



              <button



                type="button"



                onClick={handleDownloadPdf}



                disabled={isExporting}



                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer shadow-xs"



              >



                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">



                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />



                </svg>



                {isExporting ? "Đang mở trang in..." : "In / Tải Xuống PDF (A4)"}



              </button>



            </div>







          </div>







          {/* RIGHT: REAL-TIME DOCUMENT PREVIEW (PRINTABLE A4 DOCUMENT) */}



          <div className="lg:col-span-8 flex flex-col items-center">



            



            {/* Live Document Control Toolbar */}



            <div className="w-full max-w-[800px] mb-3 flex items-center justify-between flex-wrap gap-2 px-1 text-xs no-print print:hidden">



              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">



                <span className="font-semibold text-slate-700 dark:text-slate-300">Bản xem trước A4</span>



                <span className="text-slate-300 dark:text-slate-700">•</span>



                <span>



                  {isEditable ? "Nhấn vào văn bản để chỉnh sửa trực tiếp" : "Chế độ chỉ đọc"}



                </span>



              </div>



              <button



                type="button"



                onClick={handleResetToTemplate}



                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-xs flex items-center gap-1.5 transition-colors"



                title="Trả lại nội dung nguyên bản của mẫu hiện tại"



              >



                Khôi phục mẫu gốc



              </button>



            </div>







            {/* The Document Container (Styled to simulate pristine A4 sheet) */}



            <div



              key={docVersionKey}



              id="report-document"



              className="bg-white text-slate-900 rounded-xl shadow-lg w-full max-w-[800px] flex flex-col relative overflow-hidden border border-slate-200 dark:border-slate-800 transition-all"



            >



              {/* Sleek Top Header Bar */}



              <div className="w-full h-1 bg-slate-900"></div>



              



              {/* Document Content */}



              <div className="p-7 sm:p-8 flex-1 flex flex-col relative">



                



                {/* Watermark Logo */}



                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none z-0 print:hidden">



                  <svg className="w-[450px] h-[450px]" viewBox="0 0 24 24" fill="currentColor">



                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>



                  </svg>



                </div>







                {/* Document Header */}



                <div className="flex justify-between items-end border-b-2 border-slate-900 pb-3 mb-4 relative z-10">



                  <div className="flex items-center gap-3">



                    <div



                      className="logo-box w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"



                      style={{ backgroundColor: "#0f172a", color: "#ffffff" }}



                    >



                      <svg



                        className="w-6 h-6"



                        fill="none"



                        stroke="#ffffff"



                        strokeWidth="2.2"



                        viewBox="0 0 24 24"



                        style={{ stroke: "#ffffff", color: "#ffffff" }}



                      >



                        <path



                          strokeLinecap="round"



                          strokeLinejoin="round"



                          strokeWidth="2.2"



                          stroke="#ffffff"



                          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"



                        />



                        <path



                          strokeLinecap="round"



                          strokeLinejoin="round"



                          strokeWidth="2.2"



                          stroke="#ffffff"



                          d="M9 12l2 2 4-4"



                        />



                      </svg>



                    </div>



                    <div>



                      <h1



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={`font-black text-xl text-slate-900 tracking-normal uppercase ${editableClass}`}



                      >



                        PHISHARMOR AI DEFENSE



                      </h1>



                      <p



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={`text-xs text-slate-600 font-bold tracking-wider uppercase mt-0.5 ${editableClass}`}



                      >



                        HỆ THỐNG GIÁM SÁT & PHÒNG CHỐNG WEBSITE LỪA ĐẢO



                      </p>



                    </div>



                  </div>



                  <div className="text-right">



                    <div



                      contentEditable={isEditable}



                      suppressContentEditableWarning



                      className={`text-sm font-black text-slate-900 tracking-wide uppercase ${editableClass}`}



                    >



                      {activeTemplate.headerBadge}



                    </div>



                    <div className="text-xs text-slate-600 font-mono font-bold mt-1">



                      MÃ BÁO CÁO:{" "}



                      <span



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={editableClass}



                      >



                        {reportId}



                      </span>



                    </div>



                    <div



                      contentEditable={isEditable}



                      suppressContentEditableWarning



                      className={`text-xs text-slate-500 font-mono mt-0.5 ${editableClass}`}



                    >



                      {currentDate}



                    </div>



                  </div>



                </div>







                {/* Main Title Banner */}



                <div className="text-center mb-5 relative z-10">



                  <h2



                    contentEditable={isEditable}



                    suppressContentEditableWarning



                    className={`text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-snug tracking-normal ${editableClass}`}



                  >



                    {activeTemplate.title}



                  </h2>



                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-slate-300 rounded-full text-xs font-bold text-slate-800 shadow-2xs">



                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>



                    <span



                      contentEditable={isEditable}



                      suppressContentEditableWarning



                      className={editableClass}



                    >



                      Kỳ Thẩm Định: {dateRangeStr} • {activeTemplate.subBadgePrefix}



                    </span>



                  </div>



                </div>







                {/* SECTION 1: EXECUTIVE SUMMARY */}



                {includeExecutiveSummary && (



                  <div className="mb-5 relative z-10">



                    <div className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 flex items-center justify-between">



                      <span



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={editableClass}



                      >



                        I. Đánh Giá Tổng Quan (Executive Summary)



                      </span>



                      <span



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={`text-xs font-bold text-slate-500 ${editableClass}`}



                      >



                        {activeTemplate.summary.status}



                      </span>



                    </div>



                    <p



                      contentEditable={isEditable}



                      suppressContentEditableWarning



                      className={`text-[13px] text-slate-800 leading-relaxed text-justify tracking-normal ${editableClass}`}



                    >



                      {activeTemplate.summary.text(dateRangeStr)}



                    </p>



                  </div>



                )}







                {/* SECTION 2: KEY METRICS */}



                {includeKpiMetrics && (



                  <div className="mb-5 relative z-10">



                    <div className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 border-b border-slate-300 pb-1 flex items-center justify-between">



                      <span



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={editableClass}



                      >



                        II. Chỉ Số Hoạt Động Trọng Yếu (Key Defense Metrics)



                      </span>



                      <span className="text-xs text-slate-400 italic print:hidden">Bấm vào ô để sửa số</span>



                    </div>



                    <div className="grid grid-cols-4 gap-3 font-sans">



                      {activeTemplate.metrics.map((m, idx) => (



                        <div key={idx} className="bg-white border border-slate-300 p-3 rounded-xl text-center shadow-2xs">



                          <div



                            contentEditable={isEditable}



                            suppressContentEditableWarning



                            className={`text-xs font-bold text-slate-600 uppercase tracking-wider mb-0.5 ${editableClass}`}



                          >



                            {m.label}



                          </div>



                          <div



                            contentEditable={isEditable}



                            suppressContentEditableWarning



                            className={`text-xl font-black text-slate-900 ${editableClass}`}



                          >



                            {m.val}



                          </div>



                          <div



                            contentEditable={isEditable}



                            suppressContentEditableWarning



                            className={`text-xs text-slate-500 font-medium mt-0.5 ${editableClass}`}



                          >



                            {m.sub}



                          </div>



                        </div>



                      ))}



                    </div>



                  </div>



                )}







                {/* SECTION 3: THREAT BREAKDOWN BARS */}



                {includeThreatBreakdown && (



                  <div className="mb-5 relative z-10">



                    <div



                      contentEditable={isEditable}



                      suppressContentEditableWarning



                      className={`text-xs font-black text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 ${editableClass}`}



                    >



                      {activeTemplate.breakdown.title}



                    </div>



                    <div className="space-y-2 text-xs">



                      {activeTemplate.breakdown.items.map((item, idx) => (



                        <div key={idx}>



                          <div className="flex justify-between font-bold text-slate-800 mb-1 text-xs">



                            <span



                              contentEditable={isEditable}



                              suppressContentEditableWarning



                              className={editableClass}



                            >



                              {item.label}



                            </span>



                            <span



                              contentEditable={isEditable}



                              suppressContentEditableWarning



                              className={`text-slate-900 font-mono font-bold ${editableClass}`}



                            >



                              {item.pct} ({item.count})



                            </span>



                          </div>



                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">



                            <div className={`${item.barClass} h-full`} style={{ width: item.barWidth }}></div>



                          </div>



                        </div>



                      ))}



                    </div>



                  </div>



                )}







                {/* SECTION 4: TOP THREATS TABLE (FULL WIDTH & BEAUTIFULLY SPACED) */}



                {includeTopThreatsTable && (



                  <div className="mb-5 relative z-10">



                    <div



                      contentEditable={isEditable}



                      suppressContentEditableWarning



                      className={`text-xs font-black text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 ${editableClass}`}



                    >



                      {activeTemplate.threats.title}



                    </div>



                    <div className="border border-slate-300 rounded-xl overflow-hidden text-xs shadow-2xs bg-white">



                      <table className="w-full text-left table-fixed">



                        <thead>



                          <tr className="bg-slate-100 text-xs font-bold text-slate-800 uppercase border-b border-slate-300">



                            <th



                              contentEditable={isEditable}



                              suppressContentEditableWarning



                              className={`py-2.5 px-3.5 w-[38%] ${editableClass}`}



                            >



                              {activeTemplate.threats.columns[0]}



                            </th>



                            <th



                              contentEditable={isEditable}



                              suppressContentEditableWarning



                              className={`py-2.5 px-3.5 w-[42%] ${editableClass}`}



                            >



                              {activeTemplate.threats.columns[1]}



                            </th>



                            <th



                              contentEditable={isEditable}



                              suppressContentEditableWarning



                              className={`py-2.5 px-3.5 w-[20%] text-center ${editableClass}`}



                            >



                              {activeTemplate.threats.columns[2]}



                            </th>



                          </tr>



                        </thead>



                        <tbody className="divide-y divide-slate-200 font-sans">



                          {activeTemplate.threats.rows.map((item, idx) => (



                            <tr key={idx} className={idx % 2 === 0 ? "bg-white hover:bg-slate-50/50" : "bg-slate-50/60 hover:bg-slate-100/50"}>



                              <td



                                contentEditable={isEditable}



                                suppressContentEditableWarning



                                className={`py-2.5 px-3.5 font-mono font-bold text-slate-900 text-xs truncate ${editableClass}`}

                                title={item.col1}



                              >



                                {item.col1}



                              </td>



                              <td



                                contentEditable={isEditable}



                                suppressContentEditableWarning



                                className={`py-2.5 px-3.5 text-slate-700 text-xs leading-normal ${editableClass}`}



                              >



                                {item.col2}



                              </td>



                              <td className="py-2.5 px-3.5 text-center align-middle">



                                <span



                                  contentEditable={isEditable}



                                  suppressContentEditableWarning



                                  className={`inline-block font-mono font-bold px-2.5 py-0.5 rounded text-xs text-black bg-slate-100 border border-slate-300 ${editableClass}`}



                                >



                                  {item.col3}



                                </span>



                              </td>



                            </tr>



                          ))}



                        </tbody>



                      </table>



                    </div>



                  </div>



                )}







                {/* SECTION 5: GEMINI XAI INSIGHTS & AUDIT (FULL WIDTH EXECUTIVE MEMO) */}



                {includeGeminiInsights && (



                  <div className="mb-5 relative z-10">



                    <div



                      contentEditable={isEditable}



                      suppressContentEditableWarning



                      className={`text-xs font-black text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-300 pb-1 flex items-center justify-between ${editableClass}`}



                    >



                      <span>{activeTemplate.insights.title}</span>



                      <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full uppercase tracking-normal">

                        Gemini 1.5 Pro XAI

                      </span>



                    </div>



                    <div



                      contentEditable={isEditable}



                      suppressContentEditableWarning



                      className={`bg-slate-50/70 border-l-4 border-l-sky-500 border border-slate-300 p-3.5 rounded-r-xl text-xs text-slate-800 leading-relaxed shadow-2xs ${editableClass}`}



                    >



                      {activeTemplate.insights.text}



                    </div>



                  </div>



                )}







                {/* SECTION 5: SIGNATURE & SEAL */}



                {includeDigitalSignature && (



                  <div className="mt-auto pt-3 border-t-2 border-slate-300 relative z-10 flex justify-between items-end text-xs">



                    <div>



                      <div className="flex items-center gap-2 mb-1.5">



                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-800 flex items-center justify-center text-slate-900 font-bold text-xs">



                          ✓



                        </div>



                        <span



                          contentEditable={isEditable}



                          suppressContentEditableWarning



                          className={`font-black text-slate-900 uppercase tracking-wider text-xs ${editableClass}`}



                        >



                          XÁC THỰC BẢO MẬT & KÝ DUYỆT ĐIỆN TỬ



                        </span>



                      </div>



                      <div



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={`text-slate-900 font-bold ${editableClass}`}



                      >



                        {inspectorName}



                      </div>



                      <div



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={`text-slate-600 text-xs ${editableClass}`}



                      >



                        {organization}



                      </div>



                      <div



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={`text-slate-500 font-mono text-xs mt-1 ${editableClass}`}



                      >



                        SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069



                      </div>



                    </div>







                    <div className="text-right">



                      {/* Certified Stamp Badge */}



                      <div className="inline-block border-2 border-slate-900 rounded-lg p-2 text-center text-slate-900 transform -rotate-2 mb-2 bg-white">



                        <div



                          contentEditable={isEditable}



                          suppressContentEditableWarning



                          className={`text-xs font-black uppercase tracking-wider ${editableClass}`}



                        >



                          PHISHARMOR CERTIFIED



                        </div>



                        <div



                          contentEditable={isEditable}



                          suppressContentEditableWarning



                          className={`text-xs font-black ${editableClass}`}



                        >



                          SOC AUDIT PASSED



                        </div>



                        <div



                          contentEditable={isEditable}



                          suppressContentEditableWarning



                          className={`text-xs font-mono text-slate-600 ${editableClass}`}



                        >



                          {currentDate.slice(0, 10)}



                        </div>



                      </div>



                      <div



                        contentEditable={isEditable}



                        suppressContentEditableWarning



                        className={`text-xs text-slate-500 font-mono ${editableClass}`}



                      >



                        Bản quyền thuộc PhishArmor AI Enterprise



                      </div>



                    </div>



                  </div>



                )}







              </div>



            </div>







          </div>







        </div>







      </main>







    </div>



  );



}



