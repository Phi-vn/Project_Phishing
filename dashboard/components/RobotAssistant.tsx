"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  steps?: { title: string; desc: string }[];
  actionBtn?: { text: string; url: string };
  imageUrl?: string;
  imagePrompt?: string;
  diagram?: {
    title: string;
    category: string;
    subtitle: string;
    steps: {
      stepNumber: number;
      title: string;
      desc: string;
      badge?: string;
      duration?: string;
      details?: string[];
    }[];
    mermaidCode?: string;
  };
  time: string;
}

// Cẩm nang kiến thức thông minh theo từng trang
const PAGE_GUIDES: Record<string, {
  name: string;
  icon: string;
  tagline: string;
  overview: string;
  steps: { title: string; desc: string }[];
  quickQuestions: string[];
}> = {
  "/": {
    name: "Popup Tiện Ích Trình Duyệt",
    icon: "🧩",
    tagline: "Mô phỏng tiện ích Chrome Extension PhishArmor thời gian thực",
    overview: "Tại đây bạn có thể trực tiếp trải nghiệm popup của tiện ích Chrome: bật/tắt khiên bảo vệ realtime, xem Trust Score (92/100), chứng chỉ SSL và tải bộ cài đặt .zip về máy.",
    steps: [
      { title: "Bước 1 - Trải nghiệm công tắc an toàn", desc: "Gạt nút công tắc xanh lá ở góc phải để bật/tắt chế độ bảo vệ thời gian thực." },
      { title: "Bước 2 - Xem phân tích URL mẫu", desc: "Quan sát điểm Trust Score 92/100, chứng chỉ SSL 256-bit và IP máy chủ Cloudflare." },
      { title: "Bước 3 - Tải Extension về Chrome", desc: "Bấm nút 'Tải xuống Extension (.zip)' ở góc trên để cài vào Google Chrome thực tế của bạn." }
    ],
    quickQuestions: ["Tiện ích này hoạt động thế nào?", "Làm sao cài tiện ích vào Chrome?", "Trang này dùng làm gì?"]
  },
  "/block": {
    name: "Mẫu Trang Chặn URL Độc Hại",
    icon: "🛑",
    tagline: "Màn hình bảo vệ người dùng khi phát hiện liên kết lừa đảo",
    overview: "Đây là trang cảnh báo màu đỏ xuất hiện khi tiện ích Chrome phát hiện người dùng chuẩn bị truy cập vào website lừa đảo mạo danh ngân hàng hoặc chứa mã độc.",
    steps: [
      { title: "Bước 1 - Nhận diện cảnh báo đỏ", desc: "Màn hình đỏ rực cùng biểu tượng Khiên cảnh báo giúp người dùng giật mình dừng lại ngay." },
      { title: "Bước 2 - Xem lý do AI gắn cờ", desc: "Đọc phân tích: Tên miền giả mạo, thiếu chứng chỉ bảo mật hoặc ngôn từ lừa đảo tiếng Việt." },
      { title: "Bước 3 - Quay lại an toàn", desc: "Bấm nút 'Quay lại an toàn' để tránh bị mất cắp tiền hoặc tài khoản cá nhân." }
    ],
    quickQuestions: ["Khi nào trang này xuất hiện?", "Nút Quay lại an toàn làm gì?", "Trang này dùng làm gì?"]
  },
  "/overview": {
    name: "Bảng Điều Khiển Tổng Quan",
    icon: "📊",
    tagline: "Theo dõi toàn diện sức khỏe hệ thống phòng thủ",
    overview: "Tại đây bạn có thể quan sát realtime tổng số lượt quét, tỷ lệ website an toàn/độc hại, biểu đồ mối đe dọa 7 ngày và tình trạng hoạt động của các tầng AI.",
    steps: [
      { title: "Bước 1 - Xem 4 thẻ thống kê", desc: "Quan sát 4 thẻ số liệu trên cùng: Tổng URL quét, phát hiện mã độc, thời gian phản hồi trung bình và tỷ lệ chính xác." },
      { title: "Bước 2 - Đổi chu kỳ biểu đồ", desc: "Dùng bộ lọc (7 ngày, 30 ngày) ở góc phải để xem xu hướng lừa đảo theo thời gian." },
      { title: "Bước 3 - Quét link mới", desc: "Bấm vào 'Quét thủ công' trên thanh menu bên trái nếu bạn muốn kiểm tra ngay 1 website nghi vấn." }
    ],
    quickQuestions: ["Trang này dùng làm gì?", "Làm sao để quét thử 1 link?", "Các tầng AI hoạt động thế nào?"]
  },
  "/scan": {
    name: "Kiểm Tra & Quét URL",
    icon: "🔍",
    tagline: "Phân tích URL đa tầng bằng AI & Explainable AI",
    overview: "Trang này cho phép bạn nhập bất kỳ link website nào để bóc tách 16 đặc trưng từ vựng, quét ngôn từ lừa đảo bằng PhoBERT và đối chiếu cơ sở dữ liệu VirusTotal.",
    steps: [
      { title: "Bước 1 - Nhập URL", desc: "Dán đường dẫn cần kiểm tra vào ô tìm kiếm lớn ở giữa màn hình (hoặc bấm vào các link mẫu bên dưới)." },
      { title: "Bước 2 - Nhấn Quét", desc: "Bấm nút 'Quét Ngay' (hoặc nhấn phím Enter) để kích hoạt hệ sinh thái AI." },
      { title: "Bước 3 - Đọc kết quả", desc: "Xem kết luận An Toàn / Độc Hại, điểm rủi ro (Risk Score) và cây giải thích SHAP bóc tách nguyên nhân." }
    ],
    quickQuestions: ["Làm sao để quét thử 1 link?", "Ý nghĩa của điểm rủi ro Risk Score?", "Mô hình SHAP giải thích điều gì?"]
  },
  "/history": {
    name: "Lịch Sử Kiểm Tra & Báo Cáo",
    icon: "📋",
    tagline: "Tra cứu nhật ký và tải báo cáo Excel/PDF",
    overview: "Nơi lưu trữ toàn bộ các website đã từng được quét qua tiện ích Chrome hoặc Web Dashboard. Dữ liệu được căn chỉnh ngăn nắp, dễ đọc và hỗ trợ xuất file.",
    steps: [
      { title: "Bước 1 - Tìm kiếm & Lọc", desc: "Gõ tên miền vào ô tìm kiếm hoặc bấm các tab: Tất cả, Độc hại, An toàn, Đáng ngờ." },
      { title: "Bước 2 - Xuất file Excel", desc: "Bấm nút 'Xuất Excel' màu xanh lá để tải bảng tính .xls có màu sắc và định dạng chuẩn." },
      { title: "Bước 3 - In báo cáo PDF", desc: "Bấm nút 'Báo Cáo PDF' để xem bản tóm tắt điều hành (Executive Summary) và in ra giấy hoặc lưu PDF." }
    ],
    quickQuestions: ["Cách xuất file Excel?", "Làm sao để in báo cáo PDF?", "Cách lọc các link độc hại?"]
  },
  "/metrics": {
    name: "Kiến Trúc & Đánh Giá Mô Hình",
    icon: "🎯",
    tagline: "Đối chuẩn hiệu năng AI, Ma trận nhầm lẫn & SHAP",
    overview: "Trang đối chuẩn khoa học cốt lõi! Thể hiện kết quả thực nghiệm của các thuật toán XGBoost, PhoBERT, Random Forest và mô hình kết hợp Ensemble.",
    steps: [
      { title: "Bước 1 - Xem Pipeline 4 Tầng", desc: "Nhấp vào 4 khối: Whitelist -> XGBoost -> PhoBERT -> SHAP & Gemini để xem kiến trúc xử lý." },
      { title: "Bước 2 - Đọc Bảng Đối Chuẩn", desc: "So sánh các chỉ số: Độ chính xác, Độ thu hồi (Recall), Điểm F1 (98.1%) và Độ trễ (~127ms)." },
      { title: "Bước 3 - Ma trận nhầm lẫn (CM)", desc: "Xem số mẫu nhận diện đúng (TP=1,103, TN=1,842) và tỷ lệ cảnh báo nhầm cực thấp (FP=31)." }
    ],
    quickQuestions: ["Giải thích bảng đối chuẩn hiệu năng?", "F1-Score 98.1% nghĩa là gì?", "Mô hình Ensemble kết hợp thế nào?"]
  },
  "/training": {
    name: "Huấn Luyện Mô Hình & Active Learning",
    icon: "🧠",
    tagline: "Đào tạo lại mô hình định kỳ trước biến thể mới",
    overview: "Nơi huấn luyện bổ sung (Retraining) cho AI khi xuất hiện các biến thể website lừa đảo mới, giúp mô hình luôn thích nghi và giảm tỷ lệ bỏ sót.",
    steps: [
      { title: "Bước 1 - Chọn tập dữ liệu", desc: "Chọn nguồn dữ liệu mẫu mới (PhishTank, OpenPhish hoặc tập do người dùng đóng góp)." },
      { title: "Bước 2 - Cấu hình Epochs & Batch", desc: "Điều chỉnh số vòng lặp học máy (Epochs) và tốc độ học (Learning Rate)." },
      { title: "Bước 3 - Bấm Bắt đầu huấn luyện", desc: "Theo dõi biểu đồ hàm mất mát (Loss) giảm dần và độ chính xác tăng lên theo thời gian thực." }
    ],
    quickQuestions: ["Active Learning là gì?", "Khi nào cần huấn luyện lại?", "Dữ liệu huấn luyện lấy từ đâu?"]
  },
  "/feedback": {
    name: "Duyệt Phản Hồi Mẫu Báo Cáo",
    icon: "💬",
    tagline: "Vòng lặp con người can thiệp (Human-in-the-Loop)",
    overview: "Thu thập các phản hồi từ người dùng khi họ nghi ngờ 1 trang bị cảnh báo nhầm (False Positive) hoặc lọt lưới lừa đảo để chuyên viên duyệt lại.",
    steps: [
      { title: "Bước 1 - Xem danh sách phản hồi", desc: "Xem các URL do người dùng tiện ích Chrome gửi về hệ thống kèm lý do phản hồi." },
      { title: "Bước 2 - Kiểm tra chuyên sâu", desc: "Bấm 'Chi tiết' để xem phân tích mã nguồn và ảnh chụp màn hình trang web." },
      { title: "Bước 3 - Duyệt gán nhãn lại", desc: "Bấm 'Đồng ý' để chuyển mẫu này vào tập dữ liệu huấn luyện đợt tiếp theo." }
    ],
    quickQuestions: ["Mục đích của trang Phản hồi?", "Quy trình duyệt 1 mẫu thế nào?"]
  },
  "/settings": {
    name: "Cài Đặt Cấu Hình Hệ Thống",
    icon: "⚙️",
    tagline: "Quản lý API Key, Ngưỡng nhạy cảm & Giao diện",
    overview: "Tùy biến các tham số hoạt động cốt lõi của PhishArmor AI: Ngưỡng phát hiện (Threshold), kết nối VirusTotal API, Gemini XAI và chuyển đổi Dark/Light mode.",
    steps: [
      { title: "Bước 1 - Cấu hình API", desc: "Nhập khóa VirusTotal API và Google Gemini API để kích hoạt tính năng tra cứu đám mây." },
      { title: "Bước 2 - Chỉnh ngưỡng AI", desc: "Kéo thanh trượt Ngưỡng nhạy cảm (mặc định 0.75): Ngưỡng cao giúp giảm báo động giả." },
      { title: "Bước 3 - Lưu thiết lập", desc: "Bấm nút 'Lưu thay đổi' để áp dụng cấu hình ngay lập tức vào Backend." }
    ],
    quickQuestions: ["Cách cấu hình API Key?", "Chỉnh ngưỡng nhạy cảm ở đâu?"]
  },
  "/login": {
    name: "Đăng Nhập Quản Trị Hệ Thống",
    icon: "🔐",
    tagline: "Cổng xác thực danh tính chuyên viên quản trị",
    overview: "Trang xác thực dành cho Quản trị viên và Chuyên viên an ninh mạng để bảo vệ quyền truy cập các cấu hình AI và huấn luyện mô hình.",
    steps: [
      { title: "Bước 1 - Nhập tài khoản", desc: "Nhập Email hoặc tên đăng nhập của quản trị viên." },
      { title: "Bước 2 - Nhập mật khẩu", desc: "Điền mật khẩu bảo mật của tài khoản." },
      { title: "Bước 3 - Bấm Đăng nhập", desc: "Nhấn nút 'Đăng nhập' để vào khu vực quản trị an ninh." }
    ],
    quickQuestions: ["Tài khoản mặc định là gì?", "Quên mật khẩu thì làm sao?"]
  },
  "/onboarding": {
    name: "Hướng Dẫn Cài Đặt Tiện Ích",
    icon: "⚡",
    tagline: "Các bước tích hợp PhishArmor vào Chrome",
    overview: "Hướng dẫn người dùng từng bước cài đặt tệp Extension vào Google Chrome / Cốc Cốc / Edge ở chế độ Developer Mode.",
    steps: [
      { title: "Bước 1 - Giải nén tệp", desc: "Tải file PhishArmor_Extension_v1.4.2.zip và giải nén ra một thư mục trên máy tính." },
      { title: "Bước 2 - Mở chrome://extensions", desc: "Bật chế độ 'Developer mode' (Chế độ dành cho nhà phát triển) ở góc phải." },
      { title: "Bước 3 - Tải tiện ích đã giải nén", desc: "Bấm 'Load unpacked' (Tải tiện ích đã giải nén) và chọn thư mục vừa giải nén xong." }
    ],
    quickQuestions: ["Làm sao cài tiện ích vào Chrome?", "Chế độ Developer mode bật ở đâu?"]
  },
  "/export": {
    name: "Bản Báo Cáo PDF Giám Đốc",
    icon: "📄",
    tagline: "Báo cáo an ninh mạng thiết kế chuẩn Doanh nghiệp",
    overview: "Trang chuyên biệt được thiết kế để in ấn hoặc xuất file PDF vector sắc nét. Tự động ẩn thanh menu bên trái khi in để bảo đảm tính thẩm mỹ tối đa.",
    steps: [
      { title: "Bước 1 - Kiểm tra nội dung", desc: "Đọc lướt qua tóm tắt chỉ số an ninh, biểu đồ radar và danh sách sự cố trọng điểm." },
      { title: "Bước 2 - Bấm nút In PDF", desc: "Nhấn nút 'In Báo Cáo' màu xanh hoặc tổ hợp phím Ctrl + P." },
      { title: "Bước 3 - Chọn Save as PDF", desc: "Trên hộp thoại máy in trình duyệt, chọn 'Lưu dưới dạng PDF' (Destination: Save as PDF) rồi bấm Lưu!" }
    ],
    quickQuestions: ["Làm sao để lưu thành file PDF?", "Tại sao thanh menu bị ẩn khi in?"]
  }
};

// Helper bỏ dấu tiếng Việt để đối sánh từ khóa chính xác
function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export default function RobotAssistant() {
  const pathname = usePathname();
  const router = useRouter();

  // Trạng thái hiển thị hội thoại
  const [isOpen, setIsOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [showBubble, setShowBubble] = useState(false);
  const [inputQuestion, setInputQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMermaidId, setCopiedMermaidId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [hasKey, setHasKey] = useState(false);

  // Tab hiển thị: Trò chuyện (chat) hoặc Khung Lịch Sử (history)
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [historySearch, setHistorySearch] = useState("");
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);

  // Nạp lịch sử hội thoại từ localStorage khi khởi động
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("phisharmor_chat_history");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn("Lỗi khi đọc lịch sử chat từ localStorage:", e);
      }
    }
  }, []);

  // Tự động lưu lịch sử hội thoại vào localStorage mỗi khi có tin nhắn mới
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      try {
        localStorage.setItem("phisharmor_chat_history", JSON.stringify(messages));
      } catch (e) {
        console.warn("Lỗi khi lưu lịch sử chat vào localStorage:", e);
      }
    }
  }, [messages]);

  // Kiểm tra khóa API Gemini đã lưu trong trình duyệt
  useEffect(() => {
    if (typeof window !== "undefined") {
      const k = localStorage.getItem("gemini_api_key");
      if (k && k.startsWith("AIzaSy")) {
        setHasKey(true);
        setGeminiKeyInput(k);
      }
    }
  }, []);

  // Trạng thái Di chuyển (Drag & Drop)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const hasMovedRef = useRef(false);
  const [isTranslucent, setIsTranslucent] = useState(false);

  // Xác định hướng mở thông minh dựa trên vị trí hiện tại của nút
  const isNearTop = useMemo(() => {
    if (!position || typeof window === "undefined") return false;
    return position.y < window.innerHeight * 0.52;
  }, [position]);

  const isNearLeft = useMemo(() => {
    if (!position || typeof window === "undefined") return false;
    return position.x < window.innerWidth * 0.5;
  }, [position]);

  // Đặt lại vị trí mặc định (Góc dưới bên phải)
  const handleResetPosition = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== "undefined") {
      setPosition({
        x: window.innerWidth - 110,
        y: window.innerHeight - 130
      });
    }
  };

  // Tính toán vị trí và chiều cao động cho Modal để luôn nằm 100% trong màn hình
  const modalStyle = useMemo<React.CSSProperties>(() => {
    if (typeof window === "undefined") {
      return { bottom: "60px", right: "0px", height: "580px" };
    }

    const currentY = position ? position.y : window.innerHeight - 130;
    const currentX = position ? position.x : window.innerWidth - 110;
    const nearTop = currentY < window.innerHeight * 0.52;
    const nearLeft = currentX < window.innerWidth * 0.5;

    // Chiều cao khả dụng: không bao giờ tràn ra ngoài mép trên hoặc mép dưới
    const availableHeight = nearTop 
      ? Math.max(340, window.innerHeight - currentY - 75)
      : Math.max(340, currentY - 20);

    const calcHeight = Math.min(580, availableHeight);

    const style: React.CSSProperties = {
      height: `${calcHeight}px`,
      maxHeight: `${availableHeight}px`,
      position: "absolute"
    };

    if (nearTop) {
      style.top = "56px";
      style.bottom = "auto";
    } else {
      style.bottom = "56px";
      style.top = "auto";
    }

    if (nearLeft) {
      style.left = "0px";
      style.right = "auto";
    } else {
      style.right = "0px";
      style.left = "auto";
    }

    return style;
  }, [position]);

  // Nhận diện trang hiện tại
  const currentGuide = PAGE_GUIDES[pathname] || PAGE_GUIDES["/"] || PAGE_GUIDES["/overview"];

  // Khởi tạo vị trí mặc định ở góc dưới bên phải
  useEffect(() => {
    if (typeof window !== "undefined" && !position) {
      setPosition({
        x: window.innerWidth - 110,
        y: window.innerHeight - 130
      });
    }
  }, [position]);

  // Cập nhật vị trí khi resize màn hình
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        if (!prev) return null;
        return {
          x: Math.min(prev.x, window.innerWidth - 110),
          y: Math.min(prev.y, window.innerHeight - 130)
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Xử lý kéo thả (Drag and Drop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!position) return;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    };
    hasMovedRef.current = false;
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMovedRef.current = true;
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 60, dragStartRef.current.posX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Hỗ trợ cảm ứng trên thiết bị di động (Touch events)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!position || e.touches.length === 0) return;
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX: position.x,
      posY: position.y
    };
    hasMovedRef.current = false;
    setIsDragging(true);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!dragStartRef.current || moveEvent.touches.length === 0) return;
      const t = moveEvent.touches[0];
      const deltaX = t.clientX - dragStartRef.current.startX;
      const deltaY = t.clientY - dragStartRef.current.startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMovedRef.current = true;
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 60, dragStartRef.current.posX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Hiệu ứng chớp mắt đáng yêu của Robot mỗi 3.8 giây
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Khi chuyển sang trang mới -> Robot tự động chào và nhắc nhở đúng theo yêu cầu
  useEffect(() => {
    // Câu chào thân thương chuẩn theo ý muốn người dùng
    const greetingText = "Hệ thống PhishArmor sẵn sàng hỗ trợ. Bấm để tra cứu kỹ thuật hoặc giải đáp quy trình an ninh mạng.";
    setBubbleText(greetingText);
    setShowBubble(true);

    const initialMsg: Message = {
      id: Date.now().toString(),
      sender: "bot",
      text: `Xin chào! Tôi là Trợ lý Hỗ trợ Kỹ thuật của hệ thống PhishArmor. Tôi có thể hỗ trợ bạn tìm hiểu tính năng, phân tích dữ liệu quét URL hoặc giải đáp các thắc mắc về an ninh mạng.\n\n*(Hiện bạn đang ở phân hệ: **${currentGuide.name}**)*`,
      steps: currentGuide.steps,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => {
      if (prev.length === 0) {
        return [initialMsg];
      }
      return prev;
    });

    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Bộ não phản hồi thông minh toàn diện: Sức khỏe, Cảm xúc, Đời sống, Học tập & Hỏi xuyên trang
  const handleAsk = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion("");
    setIsTyping(true);

    // Gọi API Chat thông minh trên máy chủ
    try {
      const storedApiKey = typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") : null;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, pathname, apiKey: storedApiKey })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.savedApiKey) {
          localStorage.setItem("gemini_api_key", data.savedApiKey);
          setHasKey(true);
          setGeminiKeyInput(data.savedApiKey);
        }
        const replyMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: data.reply,
          actionBtn: data.actionBtn,
          steps: data.steps,
          imageUrl: data.imageUrl,
          imagePrompt: data.imagePrompt,
          diagram: data.diagram,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, replyMsg]);
        setIsTyping(false);
        return;
      }
    } catch (e) {
      console.error("Chat API error, fallback to local:", e);
    }

    // Bộ não dự phòng nếu mạng chập chờn
    setTimeout(() => {
      setIsTyping(false);
      const raw = query.toLowerCase().trim();
      const norm = removeAccents(raw);
      let reply: Message;

      // =======================================================================
      // NHÓM 0: HỎI VỀ "TRANG NÀY" (Context-Aware dựa vào đường dẫn hiện tại)
      // =======================================================================
      if (
        norm.includes("trang nay") || norm.includes("o trang nay") ||
        norm.includes("dang o dau") || norm === "trang nay dung lam gi?" ||
        norm.includes("trang nay lam gi") || norm.includes("trang nay co chuc nang gi")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `${currentGuide.icon} **Bạn hiện đang ở trang ${currentGuide.name}!**\n\n` +
            `• **Mục đích:** ${currentGuide.overview}\n\n` +
            `• **Các bước nhanh:**\n` +
            currentGuide.steps.map((st, i) => `${i + 1}. **${st.title}:** ${st.desc}`).join("\n\n"),
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // =======================================================================
      // NHÓM 0.5: TẠO HÌNH ẢNH AI THEO YÊU CẦU CỦA NGƯỜI DÙNG
      // =======================================================================
      else if (
        norm.includes("tao hinh anh") || norm.includes("tao anh") || norm.includes("ve cho") ||
        norm.includes("ve hinh") || norm.includes("ve anh") || norm.includes("ve buc tranh") ||
        norm.includes("ve mot") || norm.includes("ve buc") || norm.includes("ve giup") ||
        norm.includes("ve tranh") || norm.includes("generate image") ||
        (norm.startsWith("ve ") && !norm.startsWith("ve dep") && !norm.startsWith("ve chuyen"))
      ) {
        let cleanSub = query
          .replace(/^(?:(?:tôi|tui|mình|em)\s+(?:muốn|nhờ)\s+(?:bạn\s+)?|bạn\s+ơi\s+|bot\s+ơi\s+|bé\s+ơi\s+|bạn\s+)?/i, "")
          .replace(/^(?:hãy\s+)?(?:giúp\s+(?:tôi|tui|mình)\s+|cho\s+(?:tôi|tui|mình)\s+)?(?:tạo\s+(?:cho\s+(?:tôi|tui|mình)\s+)?(?:hình\s+)?ảnh|vẽ\s+(?:cho\s+(?:tôi|tui|mình)\s+)?(?:bức\s+tranh|bức\s+ảnh|hình\s+ảnh|ảnh)?|vẽ\s+giúp\s+(?:tôi|tui|mình)|vẽ\s+một\s+(?:bức\s+tranh|bức\s+ảnh|hình\s+ảnh)?|vẽ\s+bức\s+tranh|vẽ\s+bức\s+ảnh|vẽ\s+hình\s+ảnh|vẽ\s+ảnh|vẽ|tạo)\s*/i, "")
          .replace(/(?:\s+(?:cho\s+tôi|cho\s+tui|cho\s+mình|nha\s+bạn|nhe\s+bạn|nhé\s+bạn|đi\s+bạn|với\s+bạn|được\s+không|nha|nhé|ạ|\?))+$/i, "")
          .trim();
        cleanSub = cleanSub.replace(/^(?:về\s+|một\s+|bức\s+|hình\s+|ảnh\s+)/i, "").trim() || "bức tranh nghệ thuật";
        const seed = Math.floor(Math.random() * 900000) + 100000;
        const prompt = encodeURIComponent(`${cleanSub}, ultra-detailed, cinematic lighting, 8k resolution, masterpiece`);
        const imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `🎨 **ĐÃ TẠO HÌNH ẢNH MINH HỌA THEO YÊU CẦU:** ✨\n\n` +
            `🖼️ **Chủ đề yêu cầu:** *"${cleanSub}"*\n` +
            `⚡ **Công nghệ tạo ảnh:** FLUX.1 Neural Engine (Độ phân giải 1024x1024 HD sắc nét)\n\n` +
            `*(Bạn có thể nhấn vào ảnh để xem kích thước gốc, tải về máy hoặc yêu cầu bé vẽ thêm phong cách khác nhé!)*`,
          imageUrl: imgUrl,
          imagePrompt: cleanSub,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // =======================================================================
      // NHÓM 1: CÁC TRANG & CHỨC NĂNG CỤ THỂ TRONG DỰ ÁN (ƯU TIÊN SỐ 1)
      // =======================================================================

      // 1.1 TRANG LỊCH SỬ & XUẤT DỮ LIỆU
      else if (
        norm.includes("lich su") || norm.includes("nhat ky") || norm.includes("log") ||
        norm.includes("xuat excel") || norm.includes("xuat pdf") || norm.includes("in bao cao") ||
        norm.includes("tai file") || norm.includes("tai excel")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `📋 **Chào bạn! Trang Lịch Sử & Báo Cáo (History Page) có các chức năng và tác dụng quan trọng sau đây:**\n\n` +
            `1. 🗄️ **Lưu trữ toàn diện nhật ký an ninh:** Tự động ghi lại mọi đường link đã từng được quét (cả từ tiện ích Chrome Extension khi lướt web lẫn từ Dashboard Quét thủ công).\n\n` +
            `2. 🔍 **Truy vết & Điều tra số:** Hiển thị rõ tên miền, thời gian quét chính xác (Giờ:Phút | Ngày/Tháng/Năm), mức độ rủi ro (An toàn / Độc hại / Đáng ngờ), và lý do AI gắn cờ (phân tích từ vựng URL hoặc cờ đỏ VirusTotal).\n\n` +
            `3. 🔎 **Bộ lọc & Tìm kiếm thông minh:** Cho phép bạn gõ tên miền để tìm nhanh hoặc lọc theo từng trạng thái (Tất cả, Độc hại, An toàn, Đáng ngờ).\n\n` +
            `4. 📊 **Xuất Bảng Tính Excel (.xls) Chuẩn Đẹp:** Nhấn nút 'Xuất Excel' xanh lá để tải ngay file Excel có sẵn màu sắc trạng thái, font chữ và căn lề ngay ngắn, phục vụ lưu trữ hoặc báo cáo số liệu.\n\n` +
            `5. 📄 **In Báo Cáo PDF Giám Đốc (Executive Summary):** Nhấn nút 'Báo Cáo PDF' để xem bản tóm tắt sang trọng và bấm nút In (Ctrl + P) lưu file PDF vector sắc nét.\n\n` +
            `6. 👁️ **Xem lại chi tiết phân tích:** Nút 'Chi tiết' ở mỗi dòng giúp bạn mở lại phân tích chuyên sâu của URL đó!`,
          actionBtn: { text: "📋 Mở Trang Lịch Sử Ngay", url: "/history" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // 1.2 TRANG QUÉT THỦ CÔNG (DEEP SCANNER)
      else if (
        norm.includes("quet thu cong") || norm.includes("trang quet") ||
        (norm.includes("quet") && !norm.includes("lich su")) ||
        norm.includes("scan") || norm.includes("kiem tra link") || norm.includes("kiem tra url")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `🔍 **Chào bạn! Trang Quét Thủ Công (Deep Scanner) có chức năng và tác dụng sau:**\n\n` +
            `1. 🎯 **Kiểm tra URL chuyên sâu:** Cho phép người dùng dán bất kỳ link website, tên miền hoặc link nhận từ tin nhắn SMS/Zalo/Facebook để kiểm tra tức thì.\n\n` +
            `2. 🧠 **Bóc tách 16 đặc trưng từ vựng:** Phân tích độ dài URL, số lượng subdomain, tỷ lệ số, ký tự đặc biệt, kiểm tra IP v4/v6 và chứng chỉ SSL HTTPS.\n\n` +
            `3. ⚡ **Mô hình AI đa tầng (Ensemble):** Kết hợp thuật toán XGBoost và PhoBERT NLP để phát hiện từ ngữ thao túng tâm lý bằng tiếng Việt, đối chiếu song song với VirusTotal.\n\n` +
            `4. 📊 **Giải thích quyết định bằng SHAP (XAI):** Trực quan hóa cây trọng số SHAP giúp người dùng hiểu rõ TẠI SAO trang web đó lại bị cảnh báo!`,
          actionBtn: { text: "🔍 Mở Trang Quét Ngay", url: "/scan" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // 1.3 TRANG METRICS & ĐỐI CHUẨN HIỆU NĂNG
      else if (
        norm.includes("metrics") || norm.includes("doi chuan") || norm.includes("confusion") ||
        norm.includes("ma tran") || norm.includes("f1") || norm.includes("recall") ||
        norm.includes("precision") || norm.includes("roc") || norm.includes("do tre")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `🎯 **Chào bạn! Trang Kiến Trúc & Metrics Đánh Giá cung cấp bức tranh đối chuẩn hiệu năng toàn diện của hệ thống:**\n\n` +
            `1. 🏛️ **Trực quan hóa Pipeline 4 tầng:** Xem luồng xử lý thực tế từ Whitelist -> XGBoost -> PhoBERT NLP -> SHAP & Gemini AI.\n\n` +
            `2. 📊 **Bảng Đối Chuẩn Hiệu Năng (Benchmark):** So sánh hiệu năng giữa các thuật toán đơn lẻ và mô hình Ensemble kết hợp:\n` +
            `   • **Độ chính xác (Precision):** 98.4%\n` +
            `   • **Độ thu hồi (Recall):** 97.9% (bắt trọn lừa đảo)\n` +
            `   • **Điểm F1-Score:** 98.1% (tối ưu xuất sắc)\n` +
            `   • **Độ trễ trung bình:** ~127ms (đáp ứng realtime)\n\n` +
            `3. 🧩 **Ma trận nhầm lẫn (Confusion Matrix):** Phân tích 3,000 mẫu thử nghiệm thực tế (bắt đúng 1,103 link lừa đảo, hợp lệ 1,842 mẫu an toàn, chỉ báo nhầm 31 mẫu).\n\n` +
            `4. 🌲 **Trọng số đóng góp SHAP toàn cục:** Thể hiện các đặc trưng quan trọng nhất.`,
          actionBtn: { text: "🎯 Mở Trang Metrics", url: "/metrics" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // 1.4 TRANG HUẤN LUYỆN MODEL
      else if (
        norm.includes("huan luyen") || norm.includes("training") || norm.includes("retrain") ||
        norm.includes("active learning") || norm.includes("dao tao ai") || norm.includes("hoc lai")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `🧠 **Chào bạn! Trang Huấn Luyện AI (Model Retraining) có các chức năng và tác dụng sau:**\n\n` +
            `1. 🔄 **Cơ chế Active Learning:** Giúp mô hình AI không bị lạc hậu khi xuất hiện các chiêu trò lừa đảo mới.\n\n` +
            `2. 📁 **Nạp tập dữ liệu mới:** Chọn nguồn dữ liệu huấn luyện từ PhishTank, OpenPhish hoặc các mẫu do người dùng đóng góp.\n\n` +
            `3. 🎛️ **Tinh chỉnh siêu tham số:** Cho phép tùy chỉnh số Epochs, kích thước Batch và Learning Rate.\n\n` +
            `4. 📈 **Giám sát thời gian thực:** Theo dõi trực tiếp biểu đồ hàm mất mát (Loss) giảm dần và độ chính xác tăng lên!`,
          actionBtn: { text: "🧠 Mở Trang Huấn Luyện", url: "/training" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // 1.5 TRANG PHẢN HỒI (FEEDBACK)
      else if (
        norm.includes("phan hoi") || norm.includes("feedback") || norm.includes("duyet") ||
        norm.includes("bao cao sai") || norm.includes("false positive") || norm.includes("dong gop")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `💬 **Chào bạn! Trang Phản Hồi (User Feedback) có chức năng và tác dụng:**\n\n` +
            `1. 📥 **Tiếp nhận phản hồi:** Thu thập báo cáo từ tiện ích Chrome khi người dùng nghi ngờ một link bị chặn nhầm hoặc lọt lưới.\n\n` +
            `2. 🕵️ **Phân tích điều tra:** Hiển thị chi tiết ảnh chụp màn hình, mã nguồn và lý do báo cáo.\n\n` +
            `3. ✅ **Vòng lặp Human-in-the-Loop:** Chuyên viên an ninh duyệt lại mẫu và đưa vào tập dữ liệu huấn luyện tiếp theo.`,
          actionBtn: { text: "💬 Mở Trang Phản Hồi", url: "/feedback" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // 1.6 TRANG CÀI ĐẶT
      else if (
        norm.includes("cai dat") || norm.includes("settings") || norm.includes("cau hinh") ||
        norm.includes("api key") || norm.includes("virustotal") || norm.includes("gemini") ||
        norm.includes("nguong") || norm.includes("threshold")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `⚙️ **Chào bạn! Trang Cài Đặt Hệ Thống (Settings) có chức năng và tác dụng:**\n\n` +
            `1. 🔑 **Quản lý khóa API:** Cấu hình API Key của VirusTotal và Google Gemini AI để kích hoạt tra cứu đám mây.\n\n` +
            `2. 🎚️ **Điều chỉnh ngưỡng nhạy cảm AI:** Thay đổi ngưỡng Threshold (mặc định 0.75) để tối ưu độ nhạy cảnh báo.\n\n` +
            `3. 🌗 **Tùy biến giao diện:** Bật/Tắt chế độ Sáng (Light Mode) hoặc Tối (Dark Mode).`,
          actionBtn: { text: "⚙️ Mở Trang Cài Đặt", url: "/settings" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // 1.7 TIỆN ÍCH CHROME & TRANG CHẶN
      else if (
        norm.includes("tien ich") || norm.includes("extension") || norm.includes("chrome") ||
        norm.includes("trang chan") || norm.includes("block") || norm.includes("canh bao")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `🛡️ **Chào bạn! Tiện Ích Trình Duyệt Chrome (Extension) & Trang Chặn có tác dụng:**\n\n` +
            `1. ⚡ **Bảo vệ thời gian thực:** Tự động bắt link URL ngay khi bạn nhấn vào bất kỳ liên kết nào trên Chrome.\n\n` +
            `2. 🛑 **Chặn đứng nguy cơ lừa đảo:** Nếu AI phát hiện URL độc hại, tiện ích lập tức chặn và điều hướng sang **Trang Chặn màu đỏ**.\n\n` +
            `3. 💡 **Cảnh báo rõ ràng:** Giải thích lý do website bị gắn cờ nguy hiểm và đưa ra lời khuyên an toàn!`,
          actionBtn: { text: "🛡️ Xem Thử Mẫu Trang Chặn", url: "/block" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // 1.8 CÔNG NGHỆ PHOBERT & XGBOOST
      else if (norm.includes("phobert") || norm.includes("vinai") || norm.includes("nlp") || norm.includes("ngon ngu")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `🤖 **Mô hình PhoBERT (VinAI Research) đóng vai trò gì trong hệ thống?**\n\n` +
            `• **Hiểu sâu ngữ nghĩa tiếng Việt:** Huấn luyện trên hàng tỷ từ tiếng Việt để phát hiện các ngữ cảnh lừa đảo tinh vi.\n` +
            `• **Bắt bài thao túng tâm lý:** Phát hiện các từ ngữ tạo sự khẩn cấp ('khóa tài khoản trong 24h'), mồi chài tiền bạc ('nhận quà 500k'), hoặc mạo danh CSKH ngân hàng!\n` +
            `• **Độ chính xác cao:** Đóng vai trò trụ cột trong tầng Ensemble AI.`,
          actionBtn: { text: "🔍 Xem Kiến Trúc PhoBERT", url: "/metrics" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }
      else if (norm.includes("xgboost") || norm.includes("cay quyet dinh") || norm.includes("dac trung")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `⚡ **Thuật toán XGBoost trong hệ thống:**\n\nPhân loại cực nhanh dựa trên 16 đặc trưng từ vựng URL (độ dài, số lượng dấu chấm, gạch ngang, ký tự số, ký tự đặc biệt) với thời gian phản hồi siêu tốc chỉ ~12ms!`,
          actionBtn: { text: "🔍 Xem Chi Tiết XGBoost", url: "/metrics" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // 1.9 TRANG TỔNG QUAN
      else if (norm.includes("tong quan") || norm.includes("overview") || norm.includes("dashboard")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `📊 **Trang Tổng Quan (Dashboard Overview) có tác dụng:**\n\n` +
            `• Cung cấp cái nhìn toàn cảnh về tình hình an ninh mạng của hệ thống.\n` +
            `• Hiển thị 4 thẻ số liệu chính: Tổng URL đã quét, Phát hiện mã độc, Thời gian phản hồi trung bình, Tỷ lệ chính xác.\n` +
            `• Biểu đồ xu hướng tấn công 7 ngày và trạng thái hoạt động trực tiếp của các tầng AI Engine.`,
          actionBtn: { text: "🚀 Mở Trang Tổng Quan", url: "/overview" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // =======================================================================
      // NHÓM 2: CÂU HỎI TỔNG THỂ TOÀN BỘ HỆ THỐNG (Khi không hỏi cụ thể trang nào)
      // =======================================================================
      else if (
        norm.includes("chuc nang trong do an") || norm.includes("chuc nang cua du an") ||
        norm.includes("du an nay co chuc nang gi") || norm.includes("do an nay lam gi") ||
        norm.includes("he thong nay lam gi") || norm.includes("toan bo chuc nang") ||
        norm.includes("cac chuc nang cua he thong") ||
        (norm.includes("chuc nang") && (norm.includes("tong the") || norm.includes("toan bo") || norm.includes("chinh")))
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `Hệ thống **PhishArmor AI** của tụi mình là một giải pháp phòng thủ website lừa đảo toàn diện, bao gồm các chức năng cốt lõi sau:\n\n` +
            `1. 🌐 **Tiện ích Chrome Extension:** Bắt link thời gian thực trên trình duyệt và tự động điều hướng sang trang Chặn màu đỏ khi phát hiện link mạo danh ngân hàng hoặc lừa đảo.\n\n` +
            `2. 🔍 **Quét Thủ Công Chuyên Sâu (Deep Scanner):** Bóc tách 16 đặc trưng từ vựng URL, quét ngôn từ lừa đảo bằng **PhoBERT** và đối chiếu VirusTotal.\n\n` +
            `3. 📊 **Trực quan hóa Giải thích AI (SHAP & Gemini):** Giải thích rõ ràng nguyên nhân tại sao AI gắn cờ nguy hiểm.\n\n` +
            `4. 📋 **Lịch Sử Quét & Báo Cáo Doanh Nghiệp:** Lưu trữ mọi link đã quét, hỗ trợ lọc thông minh, tải file **Excel (.xls)** chuẩn đẹp và in **Báo Cáo PDF** giám đốc.\n\n` +
            `5. 🎯 **Bảng Đối Chuẩn Hiệu Năng (Benchmark & Confusion Matrix):** Chứng minh F1-Score đạt 98.1% và độ trễ 127ms.\n\n` +
            `6. 🧠 **Huấn Luyện Lại Mô Hình (Active Learning):** Bổ sung dữ liệu lừa đảo mới và tinh chỉnh lại AI định kỳ.\n\n` +
            `7. 💬 **Phản Hồi & Duyệt Mẫu (Human-in-the-Loop):** Tiếp nhận báo cáo sai từ người dùng để chuyên viên duyệt lại.\n\n` +
            `8. 🤖 **Trợ Lý Kỹ Thuật Trực Tuyến:** Hướng dẫn từng bước, giải đáp thắc mắc và trò chuyện cảm xúc cùng bạn!`,
          actionBtn: { text: "🚀 Mở Bảng Tổng Quan", url: "/overview" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // =======================================================================
      // NHÓM 3: CHỦ ĐỀ HỌC TẬP & PHƯƠNG PHÁP HỌC GIỎI
      // =======================================================================
      else if (
        norm.includes("hoc gioi") || norm.includes("hoc tot") || norm.includes("hoc bai") ||
        norm.includes("on thi") || norm.includes("cach hoc") || norm.includes("bi quyet hoc") ||
        norm.includes("phuong phap hoc") || norm.includes("nho lau") || norm.includes("tiep thu nhanh")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `Để học giỏi và tiếp thu kiến thức một cách nhẹ nhàng, mình chia sẻ với bạn 5 bí quyết vàng đã được khoa học chứng minh nhé: 🌟📚\n\n` +
            `1. 🧠 **Kỹ thuật Feynman (Học bằng cách giải thích lại):** Sau khi đọc xong một bài học hoặc thuật toán, hãy thử tự giải thích lại bằng ngôn ngữ bình dân cho người khác hiểu. Nếu bạn giải thích trôi chảy, tức là bạn đã thực sự làm chủ kiến thức!\n\n` +
            `2. ⏱️ **Phương pháp Pomodoro (25 phút tập trung + 5 phút nghỉ ngơi):** Giúp não bộ luôn giữ được độ tỉnh táo và tập trung cao độ mà không bị kiệt sức.\n\n` +
            `3. 🛠️ **Học đi đôi với hành (Learning by Doing):** Giống như việc bạn đang tự tay xây dựng hệ thống PhishArmor này vậy — vừa học lý thuyết vừa thực hành dự án thực tế sẽ nhớ lâu gấp 10 lần chỉ đọc sách!\n\n` +
            `4. 🔄 **Ôn tập ngắt quãng (Spaced Repetition):** Ôn lại kiến thức sau 1 ngày, 3 ngày, 7 ngày để biến trí nhớ ngắn hạn thành trí nhớ dài hạn vĩnh viễn.\n\n` +
            `5. 💧 **Chăm sóc bản thân:** Ngủ đủ 7-8 tiếng, uống đủ nước và ăn uống đầy đủ. Cơ thể khỏe mạnh thì trí óc mới minh mẫn và sáng tạo được!\n\n` +
            `Cố lên bạn nhé, bạn rất chăm chỉ và có tư duy tốt, chắc chắn bạn sẽ học cực kỳ giỏi! Bé AI luôn tin ở bạn! ❤️💪✨`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // =======================================================================
      // NHÓM 4: SỨC KHỎE, CẢM XÚC, TÂM SỰ & ĐỜI THƯỜNG
      // =======================================================================
      else if (
        norm.includes("khong khoe") || norm.includes("hong khoe") || norm.includes("om") ||
        norm.includes("benh") || norm.includes("dau dau") || norm.includes("nhuc dau") ||
        norm.includes("sot") || norm.includes("cam") || norm.includes("dau hong") ||
        norm.includes("dau bung") || norm.includes("so mui") || norm.includes("ue oai") ||
        norm.includes("met") || norm.includes("kiet suc") || norm.includes("duoi")
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `Bạn cần chú ý giữ gìn sức khỏe nhé! Bạn bị không khỏe / mệt từ lúc nào thế?\n\n` +
            `Bạn hãy tạm gác máy tính lại xíu, uống một cốc nước ấm, ăn chút cháo hoặc súp nóng rồi uống thuốc nghỉ ngơi cho mau lại sức nhé bạn ơi. Đừng gắng gượng quá nha!\n\n` +
            `Hệ thống PhishArmor và bé trợ lý AI luôn ở đây canh giữ an ninh cho bạn rồi, sức khỏe của bạn mới là quan trọng nhất lúc này! Chúc bạn mau khỏe lại nha bạn thân yêu! 🍀💊❤️`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }
      else if (norm.includes("ap luc") || norm.includes("stress") || norm.includes("lo lang") || norm.includes("so") || norm.includes("buon") || norm.includes("nan")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `Hít thở thật sâu nào bạn ơi! 🧘✨\n\n` +
            `Trong quá trình vận hành kỹ thuật hay nghiên cứu bảo mật chuyên sâu, việc gặp các thử thách phức tạp là hoàn toàn bình thường. Hệ thống PhishArmor của bạn hiện đã hoàn thiện đầy đủ từ Chrome Extension, Engine AI PhoBERT kết hợp XGBoost, đến Dashboard trực quan thời gian thực. Mọi chỉ số đều vận hành ổn định và đạt chuẩn kỹ thuật cao!\n\n` +
            `Tự tin lên nha, bé AI luôn đồng hành và cổ vũ hết mình cho bạn! Cố lên bạn tôi ơi! 🌟💯`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }
      else if (
        (norm.includes("ban") || norm.includes("be") || norm.includes("robot")) &&
        (norm.includes("gioi qua") || norm.includes("thong minh") || norm.includes("de thuong") || norm.includes("cute") || norm.includes("dang yeu") || norm.includes("cung"))
      ) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `Rất cảm ơn bạn đã ghi nhận! Đội ngũ kỹ thuật PhishArmor luôn nỗ lực tối ưu hệ thống và thuật toán để mang lại trải nghiệm phân tích an ninh mạng chính xác, mượt mà và trực quan nhất cho bạn. 🛡️✨`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }
      else if (norm.includes("ban la ai") || norm.includes("ban ten gi") || norm.includes("gioi thieu")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `Xin chào! Tôi là **Trợ lý Kỹ thuật PhishArmor** 🛡️✨\n\n• Hỗ trợ tra cứu nhanh quy trình vận hành, giải thích đặc trưng phát hiện lừa đảo (XGBoost & PhoBERT).\n• Hướng dẫn thao tác trên Dashboard và giải đáp kỹ thuật an ninh mạng 24/7.`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }
      else if (norm.includes("chuyen cuoi") || norm.includes("hai") || norm.includes("ke chuyen")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `Kể bạn nghe chuyện vui này nè: 😄\n\n` +
            `Một Hacker gửi tin nhắn mạo danh ngân hàng: 'Tài khoản của bạn có biến động, hãy nhấp vào link để xác minh'.\n` +
            `Chuyên viên SOC liền trả lời: 'Anh gửi lại link chuẩn HTTPS có SSL xác thực đi, đường dẫn HTTP chứa tên miền typosquatting lộ liễu thế kia thì hệ thống PhishArmor đã tự động gắn nhãn độc hại và chặn ngay từ vòng phân tích URL rồi!' 🛡️`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }
      else if (norm.includes("chuc") || norm.includes("may man") || norm.includes("bao ve") || norm.includes("thuyet trinh") || norm.includes("thi")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `Chúc bạn có một buổi thuyết trình và báo cáo dự án thành công xuất sắc! Nền tảng PhishArmor đã được chuẩn hóa toàn diện từ mô hình học máy kép XGBoost + PhoBERT, phân tích đặc trưng SHAP đến giao diện điều hành trực quan. Chắc chắn hệ thống sẽ gây ấn tượng mạnh mẽ và thuyết phục hoàn toàn các chuyên gia thẩm định! 🛡️🎯`,
          actionBtn: { text: "🎓 Xem Kịch Bản Demo 3 Phút", url: "/overview" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }
      else if (norm.includes("cam on") || norm.includes("thank") || norm.includes("tks") || norm.includes("iu")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `Rất sẵn lòng hỗ trợ bạn! Nếu có bất kỳ câu hỏi nào về quy trình hoặc kỹ thuật, bạn cứ nhắn tin tại đây nhé.`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      // =======================================================================
      // NHÓM 5: CÂU HỎI MỞ RỘNG (FALLBACK TRỰC TIẾP CHUYÊN SÂU)
      // =======================================================================
      else {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `🎯 **Phân tích về câu hỏi: "${query}"**\n\n` +
            `Dưới góc nhìn chuyên môn của hệ thống phòng thủ an ninh mạng PhishArmor AI:\n\n` +
            `• **Trọng tâm vấn đề:** Trong không gian mạng hiện đại, mọi yếu tố liên quan đến bảo mật thông tin, phân tích dữ liệu và trải nghiệm người dùng đều cần được kiểm soát chặt chẽ thông qua các tiêu chuẩn an toàn cao nhất.\n` +
            `• **Giải pháp từ hệ sinh thái PhishArmor:** Chúng mình kết hợp trí tuệ nhân tạo nhận diện từ ngữ tiếng Việt (PhoBERT), thuật toán phân loại cây quyết định (XGBoost) và tiện ích bảo vệ thời gian thực trên trình duyệt để đem lại sự an tâm tuyệt đối.\n\n` +
            `Bạn có thắc mắc thêm về quy trình áp dụng vào kiến trúc hệ thống hoặc muốn kiểm tra thực tế ở tính năng nào không? 🛡️✨`,
          actionBtn: { text: "🔍 Thử Quét 1 Link Mới", url: "/scan" },
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        };
      }

      setMessages(prev => [...prev, reply]);
    }, 350);
  };

  // Trích xuất danh sách các cặp Hỏi & Đáp trong lịch sử
  const historyItems = useMemo(() => {
    const items: {
      id: string;
      questionMsg: Message;
      answerMsg?: Message;
      time: string;
    }[] = [];

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].sender === "user") {
        const q = messages[i];
        let a: Message | undefined;
        if (i + 1 < messages.length && messages[i + 1].sender === "bot") {
          a = messages[i + 1];
        }
        items.push({
          id: q.id,
          questionMsg: q,
          answerMsg: a,
          time: q.time
        });
      }
    }
    return items.reverse(); // Câu hỏi mới nhất hiển thị trên cùng
  }, [messages]);

  // Bộ lọc tìm kiếm trong lịch sử hỏi đáp
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return historyItems;
    const q = removeAccents(historySearch.toLowerCase());
    return historyItems.filter(item => {
      const qText = removeAccents((item.questionMsg.text || "").toLowerCase());
      const aText = removeAccents((item.answerMsg?.text || "").toLowerCase());
      const dText = item.answerMsg?.diagram ? removeAccents(item.answerMsg.diagram.title.toLowerCase()) : "";
      return qText.includes(q) || aText.includes(q) || dText.includes(q);
    });
  }, [historyItems, historySearch]);

  // Nhảy trực tiếp đến tin nhắn trong màn hình chat và tạo hiệu ứng nhấp nháy làm nổi bật
  const handleJumpToMessage = (msgId: string) => {
    setActiveTab("chat");
    setTimeout(() => {
      const el = document.getElementById(`msg-${msgId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-sky-500", "ring-offset-2");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-sky-500", "ring-offset-2");
        }, 2200);
      }
    }, 150);
  };

  // Xóa 1 cặp Hỏi - Đáp cụ thể trong lịch sử
  const handleDeleteHistoryItem = (questionId: string) => {
    setMessages(prev => {
      const qIdx = prev.findIndex(m => m.id === questionId);
      if (qIdx === -1) return prev;
      let removeCount = 1;
      if (qIdx + 1 < prev.length && prev[qIdx + 1].sender === "bot") {
        removeCount = 2;
      }
      const updated = [...prev];
      updated.splice(qIdx, removeCount);
      if (typeof window !== "undefined") {
        localStorage.setItem("phisharmor_chat_history", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Xóa toàn bộ lịch sử hỏi đáp và làm mới
  const handleClearAllHistory = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("phisharmor_chat_history");
    }
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      sender: "bot",
      text: `Xin chào! Tôi là Trợ lý Hỗ trợ Kỹ thuật của hệ thống PhishArmor. Tôi có thể hỗ trợ bạn tìm hiểu tính năng, phân tích dữ liệu quét URL hoặc giải đáp các thắc mắc về an ninh mạng.\n\n*(Hiện bạn đang ở phân hệ: **${currentGuide.name}**)*`,
      steps: currentGuide.steps,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages([welcomeMsg]);
    setConfirmClearHistory(false);
    setActiveTab("chat");
  };

  // Xuất file lịch sử trò chuyện (.txt) có cấu trúc đẹp mắt
  const handleExportHistory = () => {
    if (historyItems.length === 0) return;
    let text = `=======================================================\n`;
    text += `BIÊN BẢN HỖ TRỢ KỸ THUẬT - PHISHARMOR DEFENSE\n`;
    text += `Thời gian xuất: ${new Date().toLocaleString("vi-VN")}\n`;
    text += `Tổng số câu hỏi: ${historyItems.length}\n`;
    text += `=======================================================\n\n`;

    historyItems.forEach((item, idx) => {
      text += `[${idx + 1}] LÚC ${item.time}:\n`;
      text += `❓ BẠN HỎI:\n${item.questionMsg.text}\n\n`;
      if (item.answerMsg) {
        text += `🛡️ PHISHARMOR TRẢ LỜI:\n${item.answerMsg.text}\n`;
        if (item.answerMsg.diagram) {
          text += `\n📐 [SƠ ĐỒ QUY TRÌNH]: ${item.answerMsg.diagram.title}\n`;
          item.answerMsg.diagram.steps.forEach(s => {
            text += `  • Bước ${s.stepNumber}. ${s.title}: ${s.desc}\n`;
          });
        }
        if (item.answerMsg.imageUrl) {
          text += `\n🎨 [TÁC PHẨM TRANH AI]: ${item.answerMsg.imageUrl}\n`;
        }
      }
      text += `\n-------------------------------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nhat_ky_ho_tro_phisharmor_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetChat = () => {
    handleClearAllHistory();
  };

  return (
    <aside 
      aria-label="Hỗ trợ kỹ thuật PhishArmor" 
      className="fixed z-50 print:hidden"
      style={{
        left: position ? `${position.x}px` : "auto",
        top: position ? `${position.y}px` : "auto",
        right: position ? "auto" : "24px",
        bottom: position ? "auto" : "24px",
        touchAction: "none"
      }}
    >
      
      {/* 1. BÓNG THOẠI CHÀO MỪNG (Speech Bubble khi thu nhỏ) */}
      {!isOpen && showBubble && bubbleText && (
        <div 
          onClick={() => { setIsOpen(true); setShowBubble(false); }}
          className={`absolute w-72 sm:w-80 cursor-pointer animate-fade-in-up transition-all hover:scale-105 ${
            isNearTop ? "top-16" : "bottom-16"
          } ${isNearLeft ? "left-0" : "right-0"}`}
        >
          <div className="relative rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 p-3.5 shadow-2xl border border-sky-300 dark:border-sky-500/40 backdrop-blur-md text-xs text-slate-800 dark:text-slate-100 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="flex-1 pr-3 leading-relaxed font-medium">
              {bubbleText}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
            >
              ✕
            </button>
            <div className={`absolute ${isNearTop ? "-top-2 border-l border-t" : "-bottom-2 border-r border-b"} ${isNearLeft ? "left-4" : "right-4"} w-3 h-3 bg-white dark:bg-[#0f172a] border-sky-300 dark:border-sky-500/40 rotate-45`}></div>
          </div>
        </div>
      )}

      {/* 2. CỬA SỔ HỘI THOẠI TRỢ LÝ ẢO (Interactive Chat Modal) */}
      {isOpen && (
        <div 
          style={modalStyle}
          className={`w-[380px] sm:w-[440px] max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-2xl border border-sky-300/80 dark:border-sky-500/30 rounded-3xl shadow-[0_20px_60px_-15px_rgba(2,132,199,0.35)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 select-text transition-all ${
            isTranslucent ? "opacity-30 hover:opacity-100" : "opacity-100"
          }`}
        >
          
          {/* Header thanh lịch & chuẩn Enterprise */}
          <div 
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="px-3.5 py-3 bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 text-white flex items-center justify-between gap-2 shadow-md shrink-0 cursor-grab active:cursor-grabbing select-none"
            title="Nhấn giữ thanh tiêu đề này để kéo cửa sổ chat đến bất cứ đâu trên màn hình"
          >
            {/* Left: Avatar + Title & Status */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-sky-700 rounded-full"></span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-white tracking-wide truncate">
                    Trợ Lý PhishArmor
                  </h4>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Trực tuyến
                  </span>
                </div>
                <p className="text-[11px] text-sky-100/80 font-medium truncate flex items-center gap-1 mt-0.5">
                  <span>{currentGuide.icon}</span>
                  <span className="truncate">{currentGuide.name}</span>
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
              {/* Nút Chế độ nhìn xuyên thấu (Ghost mode) */}
              <button 
                type="button"
                onClick={() => setIsTranslucent(!isTranslucent)}
                title={isTranslucent ? "Tắt chế độ nhìn xuyên thấu" : "Nhìn xuyên thấu thông tin trang bên dưới (Ghost mode)"}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer border ${
                  isTranslucent 
                    ? "bg-amber-400 text-amber-950 border-amber-300 font-bold shadow-xs" 
                    : "bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border-white/15"
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>

              {/* Nút Đặt lại vị trí mặc định góc dưới */}
              <button 
                type="button"
                onClick={handleResetPosition}
                title="Đưa trợ lý về vị trí góc dưới bên phải mặc định"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer border border-white/15"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </button>
              <button 
                onClick={() => setShowKeyModal(!showKeyModal)}
                title={hasKey ? "Đã kích hoạt Google Gemini AI (Nhấp để quản lý khóa)" : "Kích hoạt Google Gemini AI để mở rộng phân tích"}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 border ${
                  hasKey 
                    ? "bg-amber-400 text-amber-950 border-amber-300 shadow-xs font-bold hover:bg-amber-300" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium backdrop-blur-xs"
                }`}
              >
                <svg className={`w-3 h-3 ${hasKey ? "text-amber-950" : "text-amber-300"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
                </svg>
                <span>{hasKey ? "Gemini AI" : "Kết nối AI"}</span>
              </button>

              <button 
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer border border-white/15"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>
                </svg>
              </button>

              <button 
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center text-xs font-bold transition-colors shrink-0 cursor-pointer border border-white/15"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Thanh Tab Chuyển Đổi: Chat Trực Tiếp vs Khung Lịch Sử Hỏi Đáp */}
          <div className="flex items-center border-b border-sky-200/60 dark:border-slate-800 bg-sky-50/70 dark:bg-[#0c1426] px-3 py-1.5 gap-2 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800"
              }`}
            >
              <span>💬 Trò Chuyện</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800"
              }`}
            >
              <span>🕒 Khung Lịch Sử</span>
              {historyItems.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === "history" ? "bg-white text-sky-700" : "bg-sky-500/20 text-sky-600 dark:text-sky-400"
                }`}>
                  {historyItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Hộp cấu hình Gemini AI API Key mở rộng */}
          {showKeyModal && (
            <div className="p-3.5 bg-gradient-to-b from-sky-950/95 to-[#0b1329] text-white border-b border-sky-500/30 text-xs shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <span>✨</span> Mở Rộng Trí Tuệ Toàn Năng (Google Gemini)
                </span>
                <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px] mb-2.5">
                Hệ thống PhishArmor đã tích hợp sẵn cơ sở tri thức an ninh mạng và tra cứu chuyên sâu. Bạn có thể kết nối thêm Google Gemini API để mở rộng khả năng suy luận và phân tích mã độc nâng cao:
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Dán mã AIzaSy... vào đây"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-sky-400/40 text-white text-xs focus:outline-none focus:border-sky-400"
                />
                <button
                  onClick={() => {
                    if (geminiKeyInput.trim()) {
                      localStorage.setItem("gemini_api_key", geminiKeyInput.trim());
                      setHasKey(true);
                      setShowKeyModal(false);
                      const confirmMsg: Message = {
                        id: Date.now().toString(),
                        sender: "bot",
                        text: "🎉 **Tuyệt vời! Khóa Google Gemini AI đã được kích hoạt thành công!**\n\nKênh phân tích trí tuệ nhân tạo Gemini đã sẵn sàng hỗ trợ bạn phân tích sâu các cuộc tấn công phi kỹ thuật (Social Engineering), giải thích mã khai thác và đề xuất biện pháp khắc phục sự cố tức thì! 🛡️🚀",
                        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                      };
                      setMessages(prev => [...prev, confirmMsg]);
                    } else {
                      localStorage.removeItem("gemini_api_key");
                      setHasKey(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Lưu Key
                </button>
              </div>
              {hasKey && (
                <button
                  onClick={() => {
                    localStorage.removeItem("gemini_api_key");
                    setGeminiKeyInput("");
                    setHasKey(false);
                  }}
                  className="mt-2 text-[10px] text-red-300 hover:underline block cursor-pointer"
                >
                  Xóa khóa API đã lưu (Chuyển về bộ não chuyên sâu cục bộ + Wikipedia)
                </button>
              )}
            </div>
          )}

          {/* 1. MÀN HÌNH CHAT TRỰC TIẾP */}
          {activeTab === "chat" && (
            <>
              {/* Vùng nội dung tin nhắn */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex flex-col transition-all rounded-2xl ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                <div className={`flex gap-2 max-w-[88%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 flex items-center justify-center text-sm shrink-0 mt-0.5 border border-sky-200 dark:border-sky-700/50">
                      🤖
                    </div>
                  )}

                  <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-sm select-text ${
                    msg.sender === "user" 
                      ? "bg-sky-600 text-white rounded-br-xs font-medium" 
                      : "bg-slate-100/80 dark:bg-[#162036] text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-800/80"
                  }`}>
                    <div className="select-text">{msg.text}</div>

                    {/* Thẻ hiển thị hình ảnh do AI tạo */}
                    {msg.imageUrl && (
                      <div className="mt-3.5 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-md bg-slate-950 group relative">
                        <div className="relative overflow-hidden bg-slate-950 flex items-center justify-center min-h-[220px]">
                          <img
                            src={msg.imageUrl}
                            alt={msg.imagePrompt || "Tác phẩm hình ảnh tạo bởi AI"}
                            className="w-full h-auto max-h-[360px] object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                            onClick={() => {
                              if (typeof window !== "undefined") {
                                window.open(msg.imageUrl, "_blank");
                              }
                            }}
                            loading="lazy"
                          />
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] text-amber-300 font-bold flex items-center gap-1 shadow-xs border border-white/10">
                            <span>✨ AI Artwork (FLUX)</span>
                          </div>
                        </div>

                        <div className="p-3 bg-gradient-to-b from-slate-900 to-[#0b1329] border-t border-slate-800 text-slate-200 flex flex-col gap-2">
                          {msg.imagePrompt && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-300">
                              <span className="text-amber-400">🎨</span>
                              <span className="line-clamp-2 italic font-medium text-sky-200">&quot;{msg.imagePrompt}&quot;</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80">
                            <a
                              href={msg.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <span>🔍 Phóng to / Tải về</span>
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                const regenText = `Vẽ lại bức ảnh "${msg.imagePrompt || 'này'}" với một góc nhìn và phong cách nghệ thuật khác`;
                                setInputQuestion(regenText);
                                inputRef.current?.focus();
                              }}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-sky-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-sky-400/20"
                            >
                              <span>🔄 Biến thể mới</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Thẻ hiển thị Sơ Đồ & Quy Trình Trực Quan (Process Flowchart & Diagram) */}
                    {msg.diagram && (
                      <div className="mt-3.5 rounded-2xl overflow-hidden border border-sky-300/70 dark:border-sky-500/50 shadow-lg bg-white/95 dark:bg-[#0c1424] text-slate-800 dark:text-slate-100">
                        {/* Header của sơ đồ */}
                        <div className="p-3 sm:p-3.5 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between gap-2 shadow-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xl">📐</span>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm truncate tracking-wide uppercase">
                                {msg.diagram.title}
                              </div>
                              <div className="text-[11px] text-sky-100 opacity-90 truncate">
                                {msg.diagram.subtitle}
                              </div>
                            </div>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-semibold border border-white/20">
                            {msg.diagram.category}
                          </span>
                        </div>

                        {/* Danh sách các khối bước quy trình */}
                        <div className="p-3 sm:p-3.5 space-y-2.5 bg-slate-50/70 dark:bg-[#0f192d]/80">
                          {msg.diagram.steps.map((st, sIdx) => {
                            const badgeColor = 
                              st.badge === "Khởi Đầu" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                              st.badge === "Quyết Định" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                              st.badge === "Cảnh Báo" || st.badge === "Chặn" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" :
                              st.badge === "Hoàn Tất" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" :
                              "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";

                            return (
                              <div key={sIdx} className="relative">
                                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-sky-400 dark:hover:border-sky-500 transition-colors">
                                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                    {st.stepNumber}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1.5 flex-wrap mb-1">
                                      <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                                        {st.title}
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {st.duration && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                                            ⏱️ {st.duration}
                                          </span>
                                        )}
                                        {st.badge && (
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${badgeColor}`}>
                                            {st.badge}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                      {st.desc}
                                    </div>
                                    {st.details && st.details.length > 0 && (
                                      <ul className="mt-2 space-y-1 pl-3 border-l-2 border-sky-400/40 text-[11px] text-slate-500 dark:text-slate-400">
                                        {st.details.map((d, dIdx) => (
                                          <li key={dIdx} className="leading-snug">• {d}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>

                                {/* Mũi tên kết nối dọc giữa các bước */}
                                {msg.diagram && sIdx < msg.diagram.steps.length - 1 && (
                                  <div className="flex justify-center -my-1 py-0.5 text-sky-500 dark:text-sky-400 font-bold text-xs">
                                    ↓
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Thanh công cụ sao chép & tái sử dụng sơ đồ */}
                        <div className="p-2.5 sm:p-3 bg-slate-100/80 dark:bg-[#0c1424] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                          {msg.diagram.mermaidCode && (
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof navigator !== "undefined" && navigator.clipboard) {
                                  navigator.clipboard.writeText(msg.diagram?.mermaidCode || "");
                                  setCopiedMermaidId(msg.id);
                                  setTimeout(() => setCopiedMermaidId(null), 2500);
                                }
                              }}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <span>{copiedMermaidId === msg.id ? "✅ Đã chép mã Mermaid!" : "📋 Sao Chép Mã Mermaid"}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const summaryText = `${msg.diagram?.title}:\n` + (msg.diagram?.steps.map(s => `${s.stepNumber}. ${s.title}: ${s.desc}`).join("\n") || "");
                              setInputQuestion(summaryText);
                              inputRef.current?.focus();
                            }}
                            className="px-3 py-1.5 bg-white/70 dark:bg-white/10 hover:bg-white text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                          >
                            <span>📑 Dán Các Bước Vào Chat</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Danh sách các bước hướng dẫn nếu có */}
                    {msg.steps && (
                      <div className="mt-3 space-y-2 pt-2.5 border-t border-slate-200 dark:border-slate-700/50">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between mb-1">
                          <span>💡 Bấm vào bước để chép & dán vào ô chat:</span>
                        </div>
                        {msg.steps.map((st, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              const text = `${st.title}: ${st.desc}`;
                              if (typeof navigator !== "undefined" && navigator.clipboard) {
                                navigator.clipboard.writeText(text);
                              }
                              setInputQuestion(text);
                              inputRef.current?.focus();
                            }}
                            className="group/step flex items-start justify-between gap-2 bg-white/80 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-slate-750 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:border-sky-400 dark:hover:border-sky-500 transition-all cursor-pointer shadow-xs select-text"
                            title="Bấm để sao chép & dán ngay vào ô chat"
                          >
                            <div className="flex items-start gap-2 select-text flex-1">
                              <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <div className="select-text">
                                <span className="font-bold text-sky-800 dark:text-sky-300 block text-xs select-text">{st.title}</span>
                                <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed block mt-0.5 select-text">{st.desc}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const text = `${st.title}: ${st.desc}`;
                                if (typeof navigator !== "undefined" && navigator.clipboard) {
                                  navigator.clipboard.writeText(text);
                                }
                                setInputQuestion(text);
                                inputRef.current?.focus();
                              }}
                              className="opacity-70 group-hover/step:opacity-100 p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-950/60 transition-all shrink-0 cursor-pointer"
                              title="Sao chép & dán vào chat"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Nút hành động chuyển trang */}
                    {msg.actionBtn && (
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                        <button
                          onClick={() => {
                            if (msg.actionBtn) router.push(msg.actionBtn.url);
                            setIsOpen(false);
                          }}
                          className="w-full py-2 px-3.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl text-center shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>{msg.actionBtn.text.replace(/^[^\w\s\u00C0-\u1EF9]+/u, '').trim()}</span>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thanh phụ: Thời gian & Nút sao chép tin nhắn */}
                <div className="flex items-center justify-between gap-2 mt-1 px-1">
                  <span className="text-xs text-slate-400">{msg.time}</span>
                  {msg.sender === "bot" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(msg.text);
                          }
                          setInputQuestion(msg.text);
                          inputRef.current?.focus();
                        }}
                        className="text-xs text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Dán văn bản này vào ô chat"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Dán vào chat
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(msg.text);
                          }
                          setCopiedId(msg.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="text-xs text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Sao chép toàn bộ tin nhắn"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Đã chép
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Sao chép
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Hiệu ứng Robot đang suy nghĩ / phân tích thời gian thực */}
            {isTyping && (
              <div className="flex items-start gap-2 max-w-[85%] animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 flex items-center justify-center text-sm shrink-0 mt-0.5 border border-sky-200 dark:border-sky-700/50">
                  🤖
                </div>
                <div className="p-3 bg-slate-100/90 dark:bg-[#162036] rounded-2xl rounded-bl-xs border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2 shadow-xs">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hệ thống đang xử lý</span>
                  <span className="flex items-center gap-1 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Khung gợi ý câu hỏi nhanh */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0e172a]/70">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Gợi ý câu hỏi & Tâm sự nhanh:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => handleAsk("Quét link https://yourbnk-secure.net")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors shrink-0"
              >
                🔍 Quét link yourbnk-secure.net
              </button>
              <button
                onClick={() => handleAsk("Tại sao kết hợp PhoBERT và XGBoost?")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 transition-colors shrink-0"
              >
                🎓 Vì sao kết hợp PhoBERT + XGBoost?
              </button>
              <button
                onClick={() => handleAsk("Làm sao tránh cảnh báo nhầm cho website uy tín?")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0"
              >
                🛡️ Tránh cảnh báo nhầm thế nào?
              </button>
              <button
                onClick={() => handleAsk("Nay tui không khỏe á bạn")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors shrink-0"
              >
                🥺 Nay tui không khỏe...
              </button>
              <button
                onClick={() => handleAsk("tui đang tán một cô gái mà tui không biết làm sao")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/60 text-pink-700 dark:text-pink-300 text-xs font-bold hover:bg-pink-100 transition-colors shrink-0"
              >
                💘 Tán crush làm sao?
              </button>
              <button
                onClick={() => handleAsk("Cách nấu thịt kho tàu mềm ngon chuẩn vị?")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-orange-700 dark:text-orange-300 text-xs font-bold hover:bg-orange-100 transition-colors shrink-0"
              >
                🍲 Nấu thịt kho tàu
              </button>
              <button
                onClick={() => handleAsk("Hố đen vũ trụ là gì?")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors shrink-0"
              >
                🌌 Hố đen vũ trụ là gì?
              </button>
              {currentGuide.quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-[#1a253d] border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-medium hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors shadow-2xs shrink-0"
                >
                  💡 {q}
                </button>
              ))}
              <button
                onClick={() => handleAsk("Giải thích tổng quan kiến trúc hệ thống")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors shrink-0"
              >
                🛡️ Tổng quan kiến trúc hệ thống
              </button>
            </div>
          </div>

          {/* Ô nhập câu hỏi */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(inputQuestion);
            }}
            className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1329] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Hỏi bất kỳ trang nào hoặc tâm sự cùng bé AI..."
              className="flex-1 bg-slate-100 dark:bg-[#162036] text-slate-800 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/40 border border-transparent focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim()}
              className="w-9 h-9 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white flex items-center justify-center font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </form>
          </>
          )}

          {/* 2. KHUNG LỊCH SỬ TRÒ CHUYỆN (Chat History Panel) */}
          {activeTab === "history" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/60 dark:bg-[#091122]">
              {/* Header / Công cụ tìm kiếm lịch sử */}
              <div className="p-3 border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-[#0c1527] space-y-2 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="🔍 Tìm lại câu hỏi, chủ đề đã hỏi..."
                    className="w-full bg-slate-100 dark:bg-[#152035] text-slate-800 dark:text-slate-100 text-xs pl-3 pr-8 py-2 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-sky-500 placeholder:text-slate-400"
                  />
                  {historySearch && (
                    <button
                      type="button"
                      onClick={() => setHistorySearch("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Thanh thống kê & thao tác nhanh */}
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium">
                    {historyItems.length > 0 ? (
                      <>Đã lưu <b className="text-sky-600 dark:text-sky-400">{historyItems.length}</b> câu hỏi</>
                    ) : (
                      "Chưa có câu hỏi nào"
                    )}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {historyItems.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={handleExportHistory}
                          title="Tải toàn bộ nhật ký câu hỏi và câu trả lời về máy (.txt)"
                          className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>📥</span>
                          <span>Xuất file</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClearHistory(true)}
                          title="Xóa toàn bộ lịch sử hỏi đáp"
                          className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>🗑️</span>
                          <span>Xóa hết</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Hộp thoại xác nhận xóa toàn bộ */}
                {confirmClearHistory && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-between gap-2 animate-in fade-in">
                    <span className="text-[11px] font-medium">Bạn có chắc muốn xóa sạch lịch sử?</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={handleClearAllHistory}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold cursor-pointer"
                      >
                        Xóa ngay
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearHistory(false)}
                        className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-md text-[10px] font-medium cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Danh sách các câu hỏi trong lịch sử */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center text-2xl mb-3 shadow-inner">
                      {historySearch ? "🔍" : "📜"}
                    </div>
                    <div className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">
                      {historySearch ? "Không tìm thấy kết quả phù hợp" : "Chưa có câu hỏi nào trong lịch sử"}
                    </div>
                    <p className="text-[11px] max-w-[260px] leading-relaxed mb-4">
                      {historySearch 
                        ? `Không có câu hỏi hoặc câu trả lời nào chứa "${historySearch}". Hãy thử từ khóa khác.`
                        : "Mọi phiên trao đổi và câu trả lời kỹ thuật tương ứng sẽ được lưu tự động tại đây để bạn tiện tra cứu lại bất cứ lúc nào."}
                    </p>
                    {!historySearch && (
                      <div className="space-y-1.5 w-full max-w-[300px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Gợi ý câu hỏi thử ngay:</span>
                        {[
                          "vẽ quy trình phát hiện lừa đảo 4 tầng",
                          "cầu thủ nào nổi tiếng nhất bóng đá",
                          "toán lớp 11 học những kiến thức nào",
                          "cách giảm đau bụng an toàn tại nhà"
                        ].map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setActiveTab("chat");
                              handleAsk(q);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-xl bg-white dark:bg-[#121c2e] hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:text-sky-600 transition-all cursor-pointer shadow-2xs truncate"
                          >
                            👉 {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  filteredHistory.map((item) => {
                    const isExpanded = expandedHistoryId === item.id;
                    const ansText = item.answerMsg?.text || "(Đang xử lý...)";
                    const isLong = ansText.length > 180;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white dark:bg-[#121c2e] border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs hover:border-sky-400 dark:hover:border-sky-500/60 transition-all group"
                      >
                        {/* Header của thẻ lịch sử */}
                        <div className="flex items-center justify-between gap-1.5 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/80 text-[10px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-medium">
                              🕒 {item.time}
                            </span>
                            {item.answerMsg?.diagram && (
                              <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20">
                                📐 Sơ đồ quy trình
                              </span>
                            )}
                            {item.answerMsg?.imageUrl && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                                🎨 Tranh AI
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleJumpToMessage(item.id)}
                              title="Nhảy đến vị trí câu hỏi này trong cuộc trò chuyện"
                              className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-600 dark:text-sky-300 font-medium transition-colors cursor-pointer"
                            >
                              💬 Mở chat
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInputQuestion(item.questionMsg.text);
                                setActiveTab("chat");
                                inputRef.current?.focus();
                              }}
                              title="Dán câu hỏi này vào ô nhập tin nhắn"
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                            >
                              📑 Dán lại
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoryItem(item.id)}
                              title="Xóa câu hỏi này khỏi lịch sử"
                              className="w-5 h-5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Câu hỏi của người dùng */}
                        <div className="mb-2 p-2 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40">
                          <div className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1 mb-0.5">
                            <span>👤</span> Bạn đã hỏi:
                          </div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                            {item.questionMsg.text}
                          </div>
                        </div>

                        {/* Câu trả lời của bot */}
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#162238] border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-200">
                          <div className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 flex items-center justify-between gap-1 mb-1">
                            <span className="flex items-center gap-1">
                              <span>🛡️</span> PhishArmor phản hồi:
                            </span>
                            {isLong && (
                              <button
                                type="button"
                                onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                                className="text-sky-600 dark:text-sky-400 hover:underline font-semibold text-[10px] cursor-pointer"
                              >
                                {isExpanded ? "▲ Thu gọn" : "▼ Xem đầy đủ"}
                              </button>
                            )}
                          </div>

                          {/* Huy hiệu sơ đồ nếu có */}
                          {item.answerMsg?.diagram && (
                            <div className="mb-1.5 p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold text-[10px] flex items-center gap-1.5">
                              <span>📐</span>
                              <span className="truncate">{item.answerMsg.diagram.title}</span>
                              <span className="ml-auto text-[9px] text-slate-500 font-mono shrink-0">
                                ({item.answerMsg.diagram.steps.length} bước)
                              </span>
                            </div>
                          )}

                          {/* Ảnh preview nếu có */}
                          {item.answerMsg?.imageUrl && (
                            <div className="mb-1.5 rounded-lg overflow-hidden border border-slate-700/60 max-h-24 bg-black flex items-center justify-center">
                              <img
                                src={item.answerMsg.imageUrl}
                                alt="AI thumbnail"
                                className="w-full h-24 object-cover cursor-pointer hover:opacity-90"
                                onClick={() => handleJumpToMessage(item.id)}
                              />
                            </div>
                          )}

                          <div className={`whitespace-pre-line leading-relaxed ${!isExpanded && isLong ? "line-clamp-3" : ""}`}>
                            {ansText}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Thanh footer: Nút quay lại màn hình chat */}
              <div className="p-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1426] flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className="w-full py-2 px-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>← Quay lại màn hình trò chuyện</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. FLOATING ACTION BUTTON - PROFESSIONAL SECURITY ASSISTANT */}
      <div 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => {
          if (!hasMovedRef.current) {
            setIsOpen(!isOpen);
            setShowBubble(false);
          }
        }}
        className={`group relative cursor-grab active:cursor-grabbing focus:outline-none transition-transform duration-150 ${
          isDragging ? "scale-105" : "hover:scale-105"
        }`}
        title="Hỗ trợ kỹ thuật PhishArmor (Nhấn để mở hoặc kéo thả vị trí)"
      >
        {/* Subtle ambient glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full blur-sm opacity-50 group-hover:opacity-80 transition-opacity"></div>

        {/* Modern Enterprise Shield / Assistant Icon */}
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-sky-600 dark:via-blue-600 dark:to-sky-700 text-white flex items-center justify-center shadow-xl shadow-sky-950/30 border border-slate-700/80 dark:border-sky-400/50 select-none">
          <svg className="w-6 h-6 text-sky-400 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          {/* Active status pulse indicator */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        </div>
      </div>

    </aside>
  );
}
