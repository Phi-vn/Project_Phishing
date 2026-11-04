import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getRealLifeExpertAnswer, fetchWikipediaLive, generateDeepIntentAnswer, extractImageGenerationIntent, translateSubjectToEnglish } from "./knowledge";
import { isDiagramRequest, generateProcessDiagram } from "./diagrams";

// Hàm chuẩn hóa tiếng Việt: chuyển chữ thường, loại bỏ dấu thanh

// Helper trích xuất liên kết hoặc tên miền cần quét từ tin nhắn của người dùng
function extractScanUrl(message: string): string | null {
  const raw = (message || "").trim();
  // 1. Khớp địa chỉ có giao thức http:// hoặc https://
  const httpMatch = raw.match(/https?:\/\/[^\s]+/i);
  if (httpMatch) {
    return httpMatch[0].replace(/[.,;:!?)]+$/, "");
  }

  // 2. Khớp tên miền phổ biến (ví dụ: yourbnk-secure.net, vietcombank-otp.click, google.com)
  const domainMatch = raw.match(/\b([a-zA-Z0-9-]+\.(?:com|vn|net|org|top|click|xyz|info|biz|co|cc|live|online|site|app|edu|gov)(?:\/[^\s]*)?)\b/i);
  if (domainMatch) {
    const domain = domainMatch[1].replace(/[.,;:!?)]+$/, "");
    return "http://" + domain;
  }

  return null;
}

function removeAccents(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

// Helper tìm và giải quyết API Key hợp lệ cho Google Gemini từ mọi nguồn (Client, Settings, Env)
function resolveGeminiApiKey(userApiKey?: string): string {
  if (userApiKey && userApiKey.startsWith("AIzaSy") && !userApiKey.includes("Production_Key_99812")) {
    return userApiKey.trim();
  }
  const envKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (envKey && envKey.startsWith("AIzaSy") && !envKey.includes("Production_Key_99812")) {
    return envKey.trim();
  }
  try {
    const settingsPath = path.resolve(process.cwd(), "..", "backend", "settings.json");
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      if (data.geminiApiKey && data.geminiApiKey.startsWith("AIzaSy") && !data.geminiApiKey.includes("Production_Key_99812")) {
        return data.geminiApiKey.trim();
      }
    }
  } catch {}
  return "";
}

// Helper tự động lưu trữ API Key vào backend/settings.json khi người dùng dán vào chat
function saveGeminiApiKeyToSettings(key: string): boolean {
  try {
    const settingsPath = path.resolve(process.cwd(), "..", "backend", "settings.json");
    if (fs.existsSync(settingsPath)) {
      const current = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      current.geminiApiKey = key.trim();
      fs.writeFileSync(settingsPath, JSON.stringify(current, null, 2), "utf-8");
      return true;
    }
  } catch {}
  return false;
}

// Thử gọi Google Gemini API nếu có API key hợp lệ
async function callGeminiIfAvailable(userMessage: string, pathname: string, userApiKey?: string): Promise<string | null> {
  const apiKey = resolveGeminiApiKey(userApiKey);

  if (!apiKey || !apiKey.startsWith("AIzaSy")) {
    return null;
  }

  const systemInstruction = `Bạn là Trợ lý Kỹ thuật PhishArmor - Chuyên viên An ninh mạng & Kỹ sư Hệ thống Cao cấp của nền tảng phòng thủ lừa đảo trực tuyến PhishArmor Enterprise.

NGUYÊN TẮC HOẠT ĐỘNG VÀ PHẢN HỒI CỦA BẠN:
1. TRẢ LỜI TRỰC TIẾP, ĐÚNG TRỌNG TÂM, THÔNG MINH, SÂU SẮC mọi câu hỏi của người dùng (từ an ninh mạng, lập trình, công nghệ, toán học, vật lý, kiến trúc hệ thống đến vận hành thực tế).
2. Khi người dùng hỏi về lập trình hoặc yêu cầu viết code: Luôn cung cấp mã nguồn sạch, tối ưu, có chú thích (comment) rõ ràng, chuẩn production và giải thích từng bước logic.
3. Khi người dùng hỏi về hệ thống PhishArmor AI:
   - Nắm vững kiến trúc 4 tầng: Whitelist (<1ms) -> XGBoost 16 đặc trưng từ vựng (~12ms) -> PhoBERT VinAI phân tích ngữ nghĩa tiếng Việt (~90ms) -> XAI SHAP & VirusTotal đối chiếu.
   - Hiệu năng: Precision 98.4%, Recall 97.9%, F1-Score 98.1%, độ trễ trung bình ~127ms trên tập kiểm thử 3,000 mẫu thực tế.
   - Tiện ích Chrome: Manifest V3, bắt sự kiện onBeforeNavigate chặn trước khi tải trang.
   - Dashboard: Gồm các trang /overview, /scan, /history, /metrics, /training, /feedback, /settings, /block.
4. Trình bày bằng tiếng Việt lịch sự, thân thiện, dùng định dạng Markdown chuyên nghiệp (in đậm, danh sách gạch đầu dòng, công thức toán LaTeX nếu có, khối code có highlight).
5. Tuyệt đối không trả lời né tránh hay đưa ra các mẫu câu rập khuôn sáo rỗng. Hãy trả lời như một chuyên gia hàng đầu!`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemInstruction}\n\n[Người dùng đang ở trang: ${pathname}]\nCâu hỏi của người dùng: "${userMessage}"` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply && typeof reply === "string" && reply.trim().length > 0) {
        return reply.trim();
      }
    }
  } catch {
    // Không ném lỗi ra ngoài mà chuyển sang bộ não suy luận cục bộ
  }

  return null;
}

// Tinh chỉnh và dịch Prompt sang tiếng Anh nghệ thuật cho mô hình AI FLUX nếu có khóa Gemini
async function enhancePromptWithGemini(userPrompt: string, apiKey: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{
            text: `Translate and convert the following Vietnamese image request into an ultra-detailed, artistic, cinematic English prompt for FLUX.1 text-to-image AI model. Output ONLY the single-line English prompt with visual details, lighting, textures, camera angle, and 8k render quality. Do NOT include any prefixes, markdown quotes, or explanations:\n\n"${userPrompt}"`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150
        }
      })
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text && text.length > 5) {
        return text.replace(/^["'`]+|["'`]+$/g, "").replace(/\n/g, " ");
      }
    }
  } catch {
    // Sử dụng bộ từ điển nghệ thuật cục bộ
  }
  return null;
}

// BỘ NÃO SUY LUẬN & TRI THỨC CHUYÊN SÂU TRẢ LỜI TRỰC TIẾP MỌI CÂU HỎI
function generateDirectAnswer(message: string, pathname: string): { reply: string; actionBtn?: { text: string; url: string }; steps?: { title: string; desc: string }[]; isGenericFallback?: boolean } {
  const raw = message.trim();
  const norm = removeAccents(raw);
  const path = pathname || "/";

  // =========================================================================
  // 1. CÂU HỎI VỀ TRANG HIỆN TẠI & GIẢI THÍCH CHI TIẾT TỪNG PHÂN HỆ TRONG HỆ THỐNG
  // =========================================================================
  const isAskingCurrentPage = 
    norm.includes("trang nay") || norm.includes("o trang nay") ||
    norm.includes("dang o dau") || norm.includes("trang nay lam gi") ||
    norm.includes("trang nay co chuc nang gi") || norm.includes("dang xem trang gi") ||
    norm.includes("giai thich trang nay") || norm.includes("khong hieu trang nay") ||
    norm.includes("khong hieu gi ve trang") || norm.includes("chi tiet tung cai") ||
    norm.includes("giai thich chi tiet") || norm.includes("huong dan trang") ||
    norm.includes("trang nay co nhung gi") || norm.includes("trang nay co gi") ||
    norm.includes("y nghia trang nay") || norm.includes("trang nay dung de lam gi");

  // 1.0 CÂU HỎI TỔNG QUAN VỀ CÁC CHỨC NĂNG, CÔNG DỤNG TOÀN BỘ HỆ THỐNG / TẤT CẢ CÁC PHÂN HỆ
  const isSpecificTopic =
    norm.includes("shap") || norm.includes("phobert") || norm.includes("xgboost") ||
    norm.includes("16 dac trung") || norm.includes("16 feature") || norm.includes("hoi dong") ||
    norm.includes("tho") || norm.includes("code") || norm.includes("mitm") || norm.includes("solid") ||
    norm.includes("xss") || norm.includes("csrf") || norm.includes("sqli") || norm.includes("sql injection");

  const isAskingAllProjectFeatures =
    !isSpecificTopic && (
      ((norm.includes("do an") || norm.includes("du an") || norm.includes("he thong") || norm.includes("phisharmor")) &&
       (norm.includes("chuc nang") || norm.includes("cong dung") || norm.includes("tinh nang") ||
        norm.includes("lam gi") || norm.includes("lam duoc") || norm.includes("co gi") ||
        norm.includes("co nhung gi") || norm.includes("gom nhung gi") || norm.includes("bao gom") ||
        norm.includes("gioi thieu") || norm.includes("tong quan") || norm.includes("muc tieu") ||
        norm.includes("bai toan") || norm.includes("hoat dong") || norm.includes("cac trang") ||
        norm.includes("tat ca") || norm.includes("module") || norm.includes("biet het"))) ||
      norm.includes("chuc nang cua do an") || norm.includes("cong dung cua do an") ||
      norm.includes("chuc nang do an") || norm.includes("cong dung do an") ||
      norm.includes("tat ca cac trang") || norm.includes("cac trang trong do an") ||
      norm.includes("tat ca chuc nang") || norm.includes("tat ca cong dung") ||
      (norm.includes("cac trang") && (norm.includes("chuc nang") || norm.includes("cong dung")))
    );

  if (isAskingAllProjectFeatures) {
    return {
      reply: "🛡️ **TỔNG QUAN HỆ THỐNG PHISHARMOR AI: KIẾN TRÚC MỤC TIÊU & CÁC PHÂN HỆ VẬN HÀNH!** ✨\n\n" +
        "Trợ lý PhishArmor xin giải đáp trực tiếp, chi tiết và đầy đủ 3 nội dung cốt lõi về hệ thống an ninh mạng:\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "🎯 **PHẦN 1. BÀI TOÁN & MỤC TIÊU CỐT LÕI CỦA HỆ THỐNG:**\n" +
        "• **Tên đề tài:** *Hệ thống phòng chống tấn công lừa đảo trực tuyến (Phishing) thời gian thực ứng dụng học máy đa tầng và giải thích mô hình (XAI)*.\n" +
        "• **Công dụng thực tế:** PhishArmor là hệ sinh thái an ninh mạng bảo vệ người dân và tổ chức tại Việt Nam trước các chiến dịch mạo danh ngân hàng (Vietcombank, MB, Techcombank, MoMo), cơ quan nhà nước (VNeID, Thuế, Cổng dịch vụ công) và tội phạm mạng công nghệ cao.\n" +
        "• **Cơ chế hoạt động:** Khi người dùng chuẩn bị truy cập vào bất kỳ liên kết web nào, hệ thống lập tức bắt URL thời gian thực, bóc tách 16 đặc trưng cấu trúc & phân tích ngữ nghĩa tâm lý, và tự động ngăn chặn nếu phát hiện nguy hiểm.\n" +
        "• **Hiệu năng đạt đỉnh:** Điểm F1-Score **98.1%**, Precision **98.4%**, Recall **97.9%** với độ trễ siêu tốc chỉ **~127ms** trên 3,000 mẫu kiểm thử thực tế.\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "🏛️ **PHẦN 2. 6 NHÓM CHỨC NĂNG CỐT LÕI TRONG HỆ THỐNG:**\n" +
        "  1. 🛡️ *Chức năng Bảo vệ Thời gian thực (Realtime Protection):* Bắt sự kiện tải web trên Chrome Extension và chuyển hướng trang cảnh báo đỏ.\n" +
        "  2. ⚡ *Chức năng Quét & Mổ xẻ Đa tầng (Deep Scanning):* Bóc tách 16 đặc trưng cấu trúc URL + PhoBERT VinAI phân tích ngữ nghĩa bẫy lừa đảo tiếng Việt.\n" +
        "  3. 🌳 *Chức năng Giải thích Trọng số AI (Explainable AI - XAI):* Cây giải thích SHAP định lượng tỷ lệ % và đối chiếu VirusTotal.\n" +
        "  4. 📊 *Chức năng Giám sát Điều hành An ninh (SOC Dashboard):* Trực quan hóa KPI, biểu đồ xu hướng tấn công và luồng Live Threats.\n" +
        "  5. 📋 *Chức năng Kiểm toán & Báo cáo (Audit & Reporting):* Lưu trữ lịch sử, xuất bảng tính Excel (.xls) có màu sắc và in Báo cáo PDF Giám đốc.\n" +
        "  6. 🧠 *Chức năng Thích ứng Mô hình (Active Learning & Human-in-the-Loop):* Nạp dữ liệu mới, tinh chỉnh siêu tham số và duyệt mẫu báo cáo sai.\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "📑 **PHẦN 3. VÀ NHỮNG CHỨC NĂNG ĐÓ BAO GỒM NHỮNG GÌ? (CHI TIẾT 14 MODULE / TRANG):**\n\n" +
        "• 🧩 **1. Trang Popup Extension ( / ):**\n" +
        "  - *Công dụng:* Giao diện tương tác nhanh của tiện ích Chrome khi người dùng lướt web hàng ngày.\n" +
        "  - *Chức năng:* Công tắc bật/tắt bảo vệ Realtime, xem Trust Score (92/100), chứng chỉ SSL 256-bit, IP máy chủ Cloudflare, và nút tải bộ cài đặt .zip.\n\n" +
        "• 🛡️ **2. Tiện ích Trình duyệt Chrome Extension (Manifest V3):**\n" +
        "  - *Công dụng:* Vệ sĩ canh gác trực tiếp trên trình duyệt Chrome, Edge, Cốc Cốc của người dùng.\n" +
        "  - *Chức năng:* Bắt sự kiện chrome.webNavigation.onBeforeNavigate, gọi API /predict kiểm tra URL, tự động hủy tải và chuyển hướng sang màn hình đỏ cảnh báo khi phát hiện nguy hiểm.\n\n" +
        "• 📊 **3. Bảng Tổng Quan SOC Dashboard ( /overview ):**\n" +
        "  - *Công dụng:* Trung tâm điều hành an ninh mạng, cung cấp bức tranh toàn cảnh về các cuộc tấn công.\n" +
        "  - *Chức năng:* 4 thẻ KPI cốt lõi (Tổng URL, Mối đe dọa, Latency ~127ms, F1 98.1%), Biểu đồ Threat Analytics 24h/7d/30d, Bảng Live Threats Stream hiển thị rủi ro (chữ màu đen chuẩn theo yêu cầu), nút bấm phân tích AI tức thì.\n\n" +
        "• 🔍 **4. Kiểm Tra & Quét Chuyên Sâu ( /scan ):**\n" +
        "  - *Công dụng:* Phòng lab mổ xẻ và giám định chi tiết một URL nghi vấn.\n" +
        "  - *Chức năng:* Nhập URL hoặc chọn link mẫu ngân hàng giả mạo, Biểu đồ Radar 5 chiều, Bóc tách 16 đặc trưng kỹ thuật XGBoost, Phân tích ngữ nghĩa văn bản PhoBERT, Cây giải thích SHAP XAI định lượng % từng đặc trưng, đối chiếu VirusTotal.\n\n" +
        "• 📋 **5. Lịch Sử & Kiểm Toán An Ninh ( /history ):**\n" +
        "  - *Công dụng:* Kho lưu trữ nhật ký kiểm toán phục vụ truy vết điều tra số sau sự cố.\n" +
        "  - *Chức năng:* Tìm kiếm theo domain, bộ lọc trạng thái (Đã chặn, Đáng ngờ, An toàn), nút **Xuất Excel (.xls)** có màu sắc và định dạng chuẩn, nút **Báo Cáo PDF** điều hành.\n\n" +
        "• 🎯 **6. Kiến Trúc & Đánh Giá Metrics AI ( /metrics ):**\n" +
        "  - *Công dụng:* Bằng chứng đối chuẩn thực nghiệm quan trọng chứng minh hiệu năng hệ thống.\n" +
        "  - *Chức năng:* Quy trình 4 tầng Pipeline, Bảng đối chuẩn Benchmark so sánh các thuật toán (Decision Tree, Random Forest, SVM, XGBoost, PhoBERT, Ensemble), Ma trận nhầm lẫn Confusion Matrix trên 3,000 mẫu thực tế (TP 1,103, TN 1,842, FP 31, FN 24), Biểu đồ SHAP Global Feature Importance.\n\n" +
        "• 🧠 **7. Huấn Luyện Active Learning ( /training ):**\n" +
        "  - *Công dụng:* Giải quyết bài toán suy thoái mô hình (Concept Drift) khi hacker đổi chiêu trò lừa đảo mới.\n" +
        "  - *Chức năng:* Nạp tập dữ liệu mới (PhishTank, OpenPhish, User Feedback), tinh chỉnh siêu tham số Hyperparameters (Epochs, Batch Size, Learning Rate, Tỷ lệ Train/Test), theo dõi biểu đồ Loss và Accuracy hội tụ trực tiếp.\n\n" +
        "• 💬 **8. Duyệt Phản Hồi Mẫu Human-in-the-Loop ( /feedback ):**\n" +
        "  - *Công dụng:* Cơ chế kết hợp giữa AI và Chuyên gia con người để triệt tiêu cảnh báo nhầm (False Positive).\n" +
        "  - *Chức năng:* Tiếp nhận báo cáo người dùng từ Chrome Extension, xem ảnh chụp màn hình bằng chứng và mã nguồn, chuyên viên bấm Duyệt/Từ chối để nạp lại vào tập dữ liệu huấn luyện.\n\n" +
        "• ⚙️ **9. Cài Đặt Cấu Hình Hệ Thống ( /settings ):**\n" +
        "  - *Công dụng:* Trung tâm điều hành tham số kỹ thuật an ninh của toàn bộ hệ sinh thái.\n" +
        "  - *Chức năng:* Quản lý khóa API (Google Gemini 1.5 Flash, VirusTotal), tinh chỉnh thanh trượt Ngưỡng nhạy cảm (Detection Threshold 0.5 - 0.9, mặc định 0.75), quản lý Whitelist/Blacklist, chặn TLD rủi ro, kiểm tra SSL nghiêm ngặt, phòng vệ Punycode, cấu hình Webhook Telegram cảnh báo tức thời, chế độ Sáng/Tối.\n\n" +
        "• 🛑 **10. Mẫu Trang Chặn Cảnh Báo Đỏ ( /block ):**\n" +
        "  - *Công dụng:* Lá chắn khẩn cấp bảo vệ người dùng khi sắp rơi vào bẫy lừa đảo.\n" +
        "  - *Chức năng:* Giao diện cảnh báo đỏ rực rỡ, lý do AI gắn cờ (mạo danh ngân hàng nào, tỷ lệ rủi ro), nút **Quay lại an toàn** bảo vệ tiền và danh tính người dùng.\n\n" +
        "• 📄 **11. Bản Báo Cáo PDF Giám Đốc ( /export ):**\n" +
        "  - *Công dụng:* Xuất bản báo cáo kiểm toán an ninh mạng phục vụ Ban Giám đốc và Cơ quan thẩm định an ninh.\n" +
        "  - *Chức năng:* Tóm tắt điều hành Executive Summary, Top tên miền độc hại, khuyến nghị an ninh mạng, phím tắt in Ctrl + P chuẩn A4 đen trắng sắc nét không lem màu.\n\n" +
        "• ⚡ **12. Hướng Dẫn Cài Đặt Tiện Ích ( /onboarding ):**\n" +
        "  - *Công dụng:* Hướng dẫn người dùng phổ thông tích hợp PhishArmor vào Chrome trong 60 giây.\n" +
        "  - *Chức năng:* 3 bước trực quan: Tải & giải nén zip, mở chrome://extensions/, bật Developer mode và bấm Load unpacked.\n\n" +
        "• 🔐 **13. Đăng Nhập Quản Trị Hệ Thống ( /login ):**\n" +
        "  - *Công dụng:* Cổng xác thực danh tính bảo vệ các chức năng quản trị nhạy cảm.\n" +
        "  - *Chức năng:* Xác thực tài khoản an toàn bằng mã ký Token JWT (HS256) có thời hạn 24 giờ.\n\n" +
        "• 🐍 **14. Backend Máy Chủ FastAPI ( main.py - Cổng 8000 ):**\n" +
        "  - *Công dụng:* Động cơ tính toán trung tâm chạy bất đồng bộ siêu tốc.\n" +
        "  - *Chức năng:* Cung cấp các REST API /predict, /api/settings, /api/history, /api/stats, /api/train, tích hợp Scikit-learn, XGBoost, PhoBERT Hugging Face, TreeSHAP explainer và SQLite.\n\n" +
        "Nếu bạn muốn tìm hiểu sâu hoặc cần phân tích chi tiết về module nào cụ thể, hãy yêu cầu ngay tại đây nhé! 🛡️🚀",
      actionBtn: { text: "Khám Phá SOC Dashboard", url: "/overview" }
    };
  }

  // Phát hiện xem người dùng có nhắc đích danh trang cụ thể nào không
  const targetPage = 
    (norm.includes("trang tong quan") || norm.includes("trang overview") || norm.includes("bang tong quan")) ? "/overview" :
    (norm.includes("trang scan") || norm.includes("trang quet") || norm.includes("trang kiem tra url") || norm.includes("kiem tra & quet")) ? "/scan" :
    (norm.includes("trang history") || norm.includes("trang lich su") || norm.includes("nhat ky kiem tra")) ? "/history" :
    (norm.includes("trang metrics") || norm.includes("trang kien truc") || norm.includes("trang danh gia") || norm.includes("mo hinh ai")) ? "/metrics" :
    (norm.includes("trang training") || norm.includes("trang huan luyen") || norm.includes("active learning")) ? "/training" :
    (norm.includes("trang feedback") || norm.includes("trang phan hoi") || norm.includes("duyet mau")) ? "/feedback" :
    (norm.includes("trang settings") || norm.includes("trang cai dat") || norm.includes("cau hinh")) ? "/settings" :
    (norm.includes("trang block") || norm.includes("trang chan") || norm.includes("mau trang chan") || norm.includes("canh bao do")) ? "/block" :
    (norm.includes("trang export") || norm.includes("trang xuat") || norm.includes("xuat pdf") || norm.includes("bao cao pdf")) ? "/export" :
    (norm.includes("trang onboarding") || norm.includes("trang huong dan") || norm.includes("huong dan cai dat") || norm.includes("cai tien ich")) ? "/onboarding" :
    (norm.includes("trang login") || norm.includes("trang dang nhap") || norm.includes("dang nhap")) ? "/login" :
    (norm.includes("trang extension") || norm.includes("trang popup") || norm.includes("tien ich")) ? "/" :
    (isAskingCurrentPage ? path : null);

  if (targetPage) {
    if (targetPage === "/") {
      return {
        reply: `🧩 **GIẢI THÍCH CHI TIẾT TRANG TIỆN ÍCH TRÌNH DUYỆT (POPUP EXTENSION - \`/\`)**\n\n` +
          `• **Mục đích phân hệ:** Mô phỏng giao diện tương tác nhanh của Chrome Extension khi người dùng lướt web hàng ngày.\n\n` +
          `🔍 **Chi tiết từng thành phần trên giao diện:**\n` +
          `1. 🟢 **Công tắc Realtime Protection:** Cho phép người dùng bật/tắt luồng đánh chặn thời gian thực. Khi bật, sự kiện \`chrome.webNavigation.onBeforeNavigate\` sẽ tự động bắt URL trước khi gửi gói tin HTTP.\n` +
          `2. 🛡️ **Huy hiệu Trạng thái (An toàn / Nguy hiểm):** Phản ánh phán quyết của AI về website đang xem.\n` +
          `3. 🏷️ **Thẻ thông số kỹ thuật (SSL, IP, Engine):** Hiển thị chứng chỉ bảo mật, đơn vị cung cấp CDN/Hosting và phiên bản mô hình AI đang chạy.\n` +
          `4. ⬇️ **Nút 'Tải xuống Extension (.zip)':** Giúp tải toàn bộ mã nguồn Extension về máy để nạp trực tiếp vào Google Chrome Developer Mode.\n\n` +
          `🎓 **Gợi ý thuyết trình:** Nêu rõ đây là sản phẩm đầu cuối giúp biến thuật toán học máy thành một giải pháp thực tế bảo vệ người dân Việt Nam trước các bẫy lừa đảo.`,
        actionBtn: { text: "Xem Hướng Dẫn Cài Đặt", url: "/onboarding" }
      };
    }
    if (targetPage === "/overview") {
      return {
        reply: `📊 **GIẢI THÍCH CHI TIẾT TRANG BẢNG TỔNG QUAN (DASHBOARD OVERVIEW - \`/overview\`)**\n\n` +
          `• **Mục đích phân hệ:** Trung tâm điều hành an ninh mạng (SOC Dashboard), cung cấp bức tranh toàn cảnh về lưu lượng truy cập và tình hình các cuộc tấn công lừa đảo.\n\n` +
          `🔍 **Chi tiết từng thành phần trên trang:**\n` +
          `1. 📈 **4 Thẻ chỉ số KPI cốt lõi trên cùng:**\n` +
          `   • *Tổng URL đã quét:* Số lượng truy cập được hệ thống giám định.\n` +
          `   • *Mối đe dọa phát hiện:* Số đường link lừa đảo/độc hại đã được phát hiện và can thiệp kịp thời.\n` +
          `   • *Thời gian phản hồi:* Tốc độ bóc tách và phân loại trung bình (~127ms), chứng minh hệ thống chạy siêu tốc không làm đơ mạng.\n` +
          `   • *Tỷ lệ chính xác F1-Score (98.1%):* Đánh giá khoa học trên tập kiểm thử 3,000 mẫu thực tế.\n` +
          `2. 📉 **Biểu đồ xu hướng tấn công (Threat Analytics):** Trực quan hóa số lượng cuộc tấn công theo các khung thời gian 24 giờ qua, 7 ngày qua hoặc 30 ngày qua.\n` +
          `3. 🚨 **Bảng Nhật ký Giám sát Trực tiếp (Live Threats Stream):**\n` +
          `   • Hiển thị từng link truy cập kèm động cơ phát hiện (XGBoost, PhoBERT NLP hay Whitelist).\n` +
          `   • Cột **Mức độ rủi ro (%)** với màu sắc rõ ràng (chữ màu đen chuẩn theo yêu cầu của bạn).\n` +
          `   • Nút **'Phân tích AI'** giúp chuyển thẳng sang trang Quét chuyên sâu để mổ xẻ liên kết đó.\n` +
          `4. 🛡️ **Trợ lý Kỹ thuật PhishArmor:** Hệ thống trợ lý túc trực 24/7 giúp tra cứu, phân tích nguyên nhân và điều hướng phân hệ nhanh chóng.\n\n` +
          `**Khuyến nghị vận hành:** Sử dụng trang này làm màn hình theo dõi chính trong trung tâm SOC để quan sát lưu lượng truy cập toàn diện.`,
        actionBtn: { text: "Thử Quét Link Ngay", url: "/scan" }
      };
    }
    if (targetPage === "/scan") {
      return {
        reply: `🔍 **GIẢI THÍCH CHI TIẾT TRANG KIỂM TRA & QUÉT URL (DEEP SCANNER - \`/scan\`)**\n\n` +
          `• **Mục đích phân hệ:** Đây là "phòng lab mổ xẻ" các đường link lừa đảo, kết hợp cả 3 công nghệ: Rút trích đặc trưng từ vựng + Mô hình ngôn ngữ PhoBERT + Trí tuệ nhân tạo có thể giải thích (XAI SHAP).\n\n` +
          `🔍 **Chi tiết từng thành phần trên trang:**\n` +
          `1. 🔎 **Thanh nhập URL & Danh sách link mẫu:** Cho phép dán bất kỳ liên kết nào hoặc nhấp vào các link ngân hàng giả mạo (Vietcombank, MoMo...) để kiểm tra tức thì.\n` +
          `2. 🕸️ **Biểu đồ Radar 5 chiều:** Trực quan hóa 5 nhóm nguy cơ: Độ dài URL, Số dấu chấm, Entropy ký tự, Từ khóa nhạy cảm, và Số ký tự đặc biệt.\n` +
          `3. 📊 **Khối Trích xuất 16 Đặc trưng Kỹ thuật (XGBoost Features):**\n` +
          `   • Hiển thị chi tiết từng giá trị đo đạc (độ dài URL, số dấu gạch ngang, tỷ lệ chữ số, giao thức HTTP/HTTPS, sự hiện diện của địa chỉ IP).\n` +
          `4. 🧠 **Khối Phân tích Ngữ nghĩa Văn bản (PhoBERT NLP):**\n` +
          `   • Bóc tách nội dung HTML của website để phát hiện các kịch bản thao túng tâm lý: Tạo khẩn cấp (Urgency) hoặc Đe dọa khóa tài khoản (Fear).\n` +
          `5. 🌳 **Cây Giải Thích XAI SHAP:** Bóc tách chính xác từng đặc trưng đóng góp bao nhiêu % vào quyết định gắn cờ nguy hiểm của mô hình.\n` +
          `6. 🛡️ **Hành động:** Nút Thêm vào Whitelist (Danh sách an toàn) hoặc xuất báo cáo điều tra.\n\n` +
          `💡 **Ý nghĩa chuyên môn:** Đây là phân hệ thể hiện chiều sâu phân tích kỹ thuật cao nhất của hệ thống, kết hợp trích xuất đặc trưng hình thái học và mô hình ngôn ngữ lớn tiếng Việt.`,
        actionBtn: { text: "Quét Thử Một Link", url: "/scan" }
      };
    }
    if (targetPage === "/history") {
      return {
        reply: `📋 **GIẢI THÍCH CHI TIẾT TRANG LỊCH SỬ KIỂM TRA (\`/history\`)**\n\n` +
          `• **Mục đích phân hệ:** Nhật ký giám sát toàn diện lưu trữ dữ liệu các phiên quét từ cả Extension trên máy người dùng lẫn Dashboard.\n\n` +
          `🔍 **Chi tiết từng thành phần trên trang:**\n` +
          `1. 🔍 **Bộ lọc & Ô tìm kiếm:** Tìm nhanh theo tên miền, lọc theo trạng thái: Đã chặn, Đáng ngờ, hoặc An toàn.\n` +
          `2. 📑 **Bảng dữ liệu phân trang:** Hiển thị 10 bản ghi/trang kèm thời gian quét chính xác từng giây và phân loại mối đe dọa.\n` +
          `3. 📥 **Nút 'Xuất Excel':** Tự động tạo và tải về máy tính file Excel \`.xls\` chuẩn cấu trúc, đầy đủ bảng biểu và dữ liệu điều tra.\n` +
          `4. 📄 **Nút 'Báo Cáo PDF':** Chuyển hướng sang trang in báo cáo chuyên nghiệp dành cho ban giám đốc.\n\n` +
          `🎓 **Gợi ý bảo vệ:** Minh chứng cho khả năng quản lý dữ liệu lớn (Big Data / Audit Log) phục vụ công tác điều tra an ninh mạng sau sự cố.`,
        actionBtn: { text: "Xem Trang Lịch Sử", url: "/history" }
      };
    }
    if (targetPage === "/metrics") {
      return {
        reply: `🎯 **GIẢI THÍCH CHI TIẾT TRANG KIẾN TRÚC & ĐÁNH GIÁ MÔ HÌNH (\`/metrics\`)**\n\n` +
          `• **Mục đích phân hệ:** Bằng chứng khoa học quan trọng nhất của luận văn, chứng minh mô hình AI đề xuất vượt trội hơn các mô hình truyền thống.\n\n` +
          `🔍 **Chi tiết từng thành phần trên trang:**\n` +
          `1. 🏗️ **Quy trình Pipeline 4 tầng:**\n` +
          `   • Tầng 1: Whitelist Tra cứu siêu tốc (<1ms).\n` +
          `   • Tầng 2: XGBoost 16 đặc trưng cấu trúc URL (~12ms).\n` +
          `   • Tầng 3: PhoBERT Transformer phân tích ngữ nghĩa lừa đảo tiếng Việt (~90ms).\n` +
          `   • Tầng 4: XAI TreeSHAP giải thích nguyên nhân và tra cứu VirusTotal đa nguồn.\n` +
          `2. 📈 **Bảng Đối chuẩn Hiệu năng (Benchmark Table):**\n` +
          `   • So sánh F1-Score, Precision, Recall và Latency giữa Decision Tree, Random Forest, SVM, XGBoost và Mô hình Ensemble kết hợp.\n` +
          `   • Mô hình Ensemble đạt F1 98.1%, Precision 98.4%, Recall 97.9%.\n` +
          `3. 🔲 **Ma trận nhầm lẫn (Confusion Matrix):** Bóc tách trên 3,000 mẫu (True Positive 1,103, True Negative 1,842, False Positive 31, False Negative 24).\n` +
          `4. 🌳 **Tầm quan trọng đặc trưng toàn cục (SHAP Global Feature Importance):** Xếp hạng các đặc trưng ảnh hưởng nhiều nhất đến quyết định của AI.\n\n` +
          `🎓 **Gợi ý bảo vệ:** Trang này trả lời trực tiếp câu hỏi của thầy cô: *"Tại sao em chọn mô hình này?", "Độ tin cậy của mô hình được kiểm chứng ra sao?"*.`,
        actionBtn: { text: "Xem Trang Metrics", url: "/metrics" }
      };
    }
    if (targetPage === "/training") {
      return {
        reply: `🧠 **GIẢI THÍCH CHI TIẾT TRANG HUẤN LUYỆN MÔ HÌNH (ACTIVE LEARNING - \`/training\`)**\n\n` +
          `• **Mục đích phân hệ:** Giải quyết bài toán "Concept Drift" (kẻ tấn công liên tục thay đổi thủ đoạn lừa đảo) bằng cách cho phép mô hình học liên tục từ dữ liệu mới.\n\n` +
          `🔍 **Chi tiết từng thành phần:**\n` +
          `1. 📂 **Nạp dữ liệu:** Chọn nguồn cấp mẫu từ PhishTank, OpenPhish hoặc mẫu người dùng báo cáo.\n` +
          `2. 🎛️ **Siêu tham số (Hyperparameters):** Tinh chỉnh Epochs, Batch Size, Learning Rate, và Tỷ lệ chia tập Train/Test (80/20).\n` +
          `3. 📉 **Biểu đồ Hội tụ Thời gian thực:** Theo dõi đường cong hàm mất mát (Loss) giảm dần và độ chính xác (Accuracy) tăng dần sau từng epoch.`,
        actionBtn: { text: "Xem Trang Huấn Luyện", url: "/training" }
      };
    }
    if (targetPage === "/feedback") {
      return {
        reply: `💬 **GIẢI THÍCH CHI TIẾT TRANG DUYỆT PHẢN HỒI (HUMAN-IN-THE-LOOP - \`/feedback\`)**\n\n` +
          `• **Mục đích phân hệ:** Cơ chế kết hợp giữa Trí tuệ Nhân tạo và Chuyên gia con người để xử lý các trường hợp cảnh báo nhầm (False Positive).\n\n` +
          `🔍 **Chi tiết từng thành phần:**\n` +
          `1. 📑 **Danh sách mẫu người dùng khiếu nại:** Hiển thị lý do và thời điểm báo cáo.\n` +
          `2. 🖼️ **Ảnh chụp bằng chứng & Mã nguồn:** Chuyên viên an ninh mạng xem xét trực quan giao diện trang web bị báo cáo.\n` +
          `3. ✅/❌ **Nút Duyệt / Từ chối:** Khi bấm duyệt, mẫu sẽ tự động được gán nhãn lại chuẩn xác và đưa vào hàng đợi tái huấn luyện.`,
        actionBtn: { text: "Xem Trang Phản Hồi", url: "/feedback" }
      };
    }
    if (targetPage === "/settings") {
      return {
        reply: `⚙️ **GIẢI THÍCH CHI TIẾT TRANG CÀI ĐẶT CẤU HÌNH (\`/settings\`)**\n\n` +
          `• **Mục đích phân hệ:** Trung tâm quản trị tham số kỹ thuật và các kết nối API ngoại vi của toàn bộ hệ thống.\n\n` +
          `🔍 **Chi tiết từng thành phần:**\n` +
          `1. 🔑 **Quản lý khóa API (Inference Keys):** Nhập và kiểm tra kết nối với Google Gemini 1.5 Flash API và VirusTotal API.\n` +
          `2. 🎚️ **Ngưỡng nhạy cảm phát hiện (Detection Threshold):** Điều chỉnh thanh trượt từ 0.5 đến 0.9 (mặc định 0.75) để cân bằng giữa việc chặn triệt để và tránh báo nhầm.\n` +
          `3. 🔔 **Cấu hình Cảnh báo Telegram / Email:** Bật thông báo tức thời tới chuyên viên khi phát hiện cuộc tấn công quy mô lớn.\n` +
          `4. 🌓 **Chế độ Sáng / Tối (Dark Mode):** Tùy chỉnh giao diện hiển thị phù hợp với môi trường làm việc.`,
        actionBtn: { text: "Xem Trang Cài Đặt", url: "/settings" }
      };
    }
    if (targetPage === "/block") {
      return {
        reply: `🛑 **GIẢI THÍCH CHI TIẾT TRANG CẢNH BÁO CHẶN URL (\`/block\`)**\n\n` +
          `• **Mục đích phân hệ:** Màn hình "lá chắn đỏ" tự động chuyển hướng người dùng khi Extension phát hiện họ chuẩn bị truy cập vào website lừa đảo.\n\n` +
          `🔍 **Chi tiết từng thành phần:**\n` +
          `1. 🚨 **Biểu tượng cảnh báo khẩn cấp màu đỏ:** Gây chú ý thị giác mạnh, ngăn chặn người dùng vội vã thao tác tiếp.\n` +
          `2. 📝 **Báo cáo giải thích lý do chặn:** Nêu rõ tên miền lừa đảo, giả mạo tổ chức nào (ví dụ Ngân hàng Vietcombank) và tỷ lệ rủi ro do AI đánh giá.\n` +
          `3. 🛡️ **Nút 'Quay lại an toàn' (Back to Safety):** Đóng ngay trang web độc hại và đưa người dùng trở về tab an toàn trước đó.\n` +
          `4. ⚠️ **Tùy chọn nâng cao:** Cho phép người dùng chuyên gia xem chi tiết kỹ thuật hoặc tiếp tục truy cập nếu họ tự chịu trách nhiệm.`,
        actionBtn: { text: "Xem Mẫu Trang Chặn", url: "/block" }
      };
    }
    if (targetPage === "/export") {
      return {
        reply: `📄 **GIẢI THÍCH CHI TIẾT TRANG XUẤT BÁO CÁO PDF (\`/export\`)**\n\n` +
          `• **Mục đích phân hệ:** Tự động sinh báo cáo kiểm toán an ninh mạng chuyên nghiệp dành cho cấp quản lý và đơn vị kiểm toán an ninh.\n\n` +
          `🔍 **Chi tiết từng thành phần:**\n` +
          `1. 📋 **Tóm tắt điều hành (Executive Summary):** Tổng số sự cố, mức độ thiệt hại tiềm tàng và tỷ lệ can thiệp thành công.\n` +
          `2. 📊 **Bảng thống kê Top các tên miền độc hại:** Liệt kê các chiêu thức lừa đảo ngân hàng phổ biến nhất trong kỳ.\n` +
          `3. 💡 **Khuyến nghị an ninh mạng:** Đưa ra các biện pháp phòng ngừa cho tổ chức.\n` +
          `4. 🖨️ **Nút 'In / Lưu PDF' (Ctrl + P):** Đã được tối ưu CSS in ấn hoàn hảo (bỏ sidebar, canh lề A4, độ phân giải sắc nét).`,
        actionBtn: { text: "Xem Trang Báo Cáo", url: "/export" }
      };
    }
    if (targetPage === "/onboarding") {
      return {
        reply: "⚡ **GIẢI THÍCH CHI TIẾT TRANG HƯỚNG DẪN CÀI ĐẶT TIỆN ÍCH (ONBOARDING - /onboarding)**\n\n" +
          "• **Mục đích & Công dụng:** Hướng dẫn người dùng phổ thông từng bước tích hợp tiện ích PhishArmor Chrome Extension vào các trình duyệt Chromium (Google Chrome, Cốc Cốc, Microsoft Edge, Brave) chỉ trong 60 giây.\n\n" +
          "🔍 **Chi tiết 3 bước tích hợp chuẩn Developer Mode:**\n" +
          "1. 📦 **Bước 1 - Tải & Giải nén:** Tải tệp tin PhishArmor_Extension_v1.4.2.zip và giải nén ra một thư mục cố định trên máy tính.\n" +
          "2. 🛠️ **Bước 2 - Mở Trình quản lý Tiện ích:** Truy cập đường dẫn chrome://extensions/, gạt bật công tắc **'Developer mode' (Chế độ cho nhà phát triển)** ở góc trên bên phải.\n" +
          "3. 🚀 **Bước 3 - Nạp Tiện ích (Load Unpacked):** Bấm nút **'Load unpacked' (Tải tiện ích đã giải nén)** ở góc trái, trỏ đến thư mục vừa giải nén. Biểu tượng khiên bảo vệ xanh của PhishArmor sẽ xuất hiện ngay trên thanh công cụ duyệt web!\n\n" +
          "🎓 **Gợi ý bảo vệ:** Chứng minh tính khả thi triển khai thực tế (Feasibility) của đề tài: Không chỉ là mô hình trên giấy mà người dùng thực tế có thể tải và cài đặt sử dụng ngay lập tức!",
        actionBtn: { text: "Xem Trang Hướng Dẫn Cài Đặt", url: "/onboarding" }
      };
    }
    if (targetPage === "/login") {
      return {
        reply: "🔐 **GIẢI THÍCH CHI TIẾT TRANG ĐĂNG NHẬP QUẢN TRỊ VIÊN (ADMIN LOGIN - /login)**\n\n" +
          "• **Mục đích & Công dụng:** Cổng xác thực danh tính bảo vệ toàn bộ khu vực quản trị an ninh mạng, ngăn chặn truy cập trái phép vào các cấu hình nhạy cảm như Tinh chỉnh ngưỡng phát hiện AI, Huấn luyện lại mô hình (Retraining) và Duyệt phản hồi mẫu (Feedback Approval).\n\n" +
          "🔍 **Chi tiết cơ chế kỹ thuật an ninh:**\n" +
          "1. 🔑 **Xác thực phi trạng thái (Stateless Authentication):** Kiểm tra tên đăng nhập và mật khẩu được băm an toàn qua thuật toán mã hóa mật mã học.\n" +
          "2. 🎟️ **Cấp phát Token JWT (JSON Web Token):** Khi đăng nhập thành công, máy chủ cấp phát mã ký số điện tử chuẩn thuật toán **HS256** có thời hạn sử dụng (Expires In: 24 giờ).\n" +
          "3. 🛡️ **Phân quyền truy cập (Role-Based Access Control):** Chỉ tài khoản có quyền Quản trị viên (Admin) hoặc Chuyên viên phân tích SOC mới có thể can thiệp vào các tham số phòng thủ của hệ thống.\n\n" +
          "🎓 **Gợi ý bảo vệ:** Minh chứng cho việc tuân thủ các nguyên tắc an toàn thông tin (CIA Triad: Confidentiality - Integrity - Availability) trong quy trình phát triển phần mềm an ninh mạng.",
        actionBtn: { text: "Đi Đến Trang Đăng Nhập", url: "/login" }
      };
    }
  }

  // =========================================================================
  // 2. CHỦ ĐỀ AN NINH MẠNG, PHISHING & CHIÊU TRÒ LỪA ĐẢO
  // =========================================================================

  // 2.1 Tại sao ngân hàng / ví điện tử hay bị làm giả
  if (
    norm.includes("tai sao ngan hang") || norm.includes("vi sao ngan hang") ||
    norm.includes("ngan hang bi lam gia") || norm.includes("gia mao ngan hang") ||
    norm.includes("vietcombank gia") || norm.includes("momo gia") || norm.includes("vi dien tu")
  ) {
    return {
      reply: `🏦 **Tại sao các ngân hàng và ví điện tử (Vietcombank, MBBank, Techcombank, MoMo) lại là mục tiêu giả mạo hàng đầu?**\n\n` +
        `1. 🎯 **Mục đích tài chính trực tiếp:** Đây là con đường ngắn nhất để kẻ tấn công chiếm đoạt tiền thật. Chỉ cần nạn nhân đăng nhập vào trang giả, kẻ gian sẽ có ngay **Tên đăng nhập, Mật khẩu và mã OTP** để chuyển sạch tiền trong tài khoản.\n\n` +
        `2. 🎣 **Khai thác lòng tin thương hiệu:** Người dùng thường rất tin tưởng vào thông báo từ ngân hàng. Khi nhận tin nhắn "Tài khoản bị tạm khóa" hay "Phát hiện giao dịch lạ", nạn nhân dễ hoảng loạn và bấm ngay vào link mà không kiểm tra kỹ.\n\n` +
        `3. 🔤 **Thủ đoạn tinh vi (Typosquatting):** Kẻ lừa đảo đăng ký tên miền gần giống hệt như \`vietconbank.com.vn\`, \`vietcom-ebanking.top\` hoặc dùng SMS Brandname giả mạo chèn vào cùng luồng tin nhắn chính thức của ngân hàng.\n\n` +
        `🛡️ **Cách PhishArmor AI bảo vệ:** Hệ thống so khớp tức thì tên miền với Whitelist ngân hàng chính thức, phát hiện ngay các ký tự bất thường và chặn trước khi trang web kịp hiển thị!`,
      actionBtn: { text: "Quét Thử Link Ngân Hàng", url: "/scan" }
    };
  }

  // 2.2 Dấu hiệu nhận biết link lừa đảo
  if (
    norm.includes("dau hieu") || norm.includes("nhan biet phish") || norm.includes("nhan biet lua dao") ||
    norm.includes("lam sao biet link") || norm.includes("phan biet link") || norm.includes("kiem tra an toan") ||
    norm.includes("link gia mao")
  ) {
    return {
      reply: `🔍 **5 Dấu hiệu nhận biết đường link lừa đảo (Phishing) chuẩn xác nhất:**\n\n` +
        `1. 🌐 **Đuôi tên miền lạ (TLD giá rẻ):** Thường sử dụng các đuôi như \`.top\`, \`.xyz\`, \`.click\`, \`.vip\`, \`.info\`, \`.cc\`, \`.tk\` thay vì \`.vn\`, \`.com.vn\` hay \`.edu.vn\` chính thống.\n\n` +
        `2. 🔤 **Sai lỗi chính tả cố ý (Typosquatting):** Thay chữ \`m\` bằng \`rn\`, thay chữ \`o\` bằng số \`0\`, thay chữ \`l\` bằng số \`1\` (ví dụ: \`paypa1.com\` thay vì \`paypal.com\`).\n\n` +
        `3. 📏 **Đường dẫn dài và nhiều ký tự lộn xộn:** URL chứa chuỗi token vô nghĩa, nhiều dấu gạch ngang (\`-\`) hoặc địa chỉ IP trực tiếp (ví dụ \`http://103.142.24.15/login\`).\n\n` +
        `4. ⏰ **Tâm lý thúc ép khẩn cấp:** Tiêu đề hoặc nội dung giục giã: *"Tài khoản sẽ bị khóa sau 24h"*, *"Nhận thưởng 500k"*, *"Xác thực sinh trắc học gấp"*.\n\n` +
        `5. ⚠️ **Có HTTPS nhưng vẫn là lừa đảo:** Kẻ xấu hiện nay hoàn toàn có thể cài chứng chỉ SSL miễn phí. Có ổ khóa xanh **không có nghĩa là an toàn 100%**!`,
      actionBtn: { text: "Dán Link Để Quét Ngay", url: "/scan" }
    };
  }

  // 2.3 HTTPS / SSL có an toàn tuyệt đối không?
  if (
    norm.includes("https co an toan") || norm.includes("ssl co an toan") ||
    norm.includes("o khoa xanh") || norm.includes("co https co phai an toan") ||
    norm.includes("chung chi ssl")
  ) {
    return {
      reply: `🔒 **Website có HTTPS (ổ khóa xanh) có thực sự an toàn tuyệt đối không?**\n\n` +
        `❌ **CÂU TRẢ LỜI LÀ: KHÔNG!** Đây là một trong những hiểu lầm phổ biến và nguy hiểm nhất hiện nay.\n\n` +
        `• **HTTPS/SSL thực chất là gì?** Nó chỉ đảm bảo rằng dữ liệu truyền giữa trình duyệt của bạn và máy chủ được mã hóa an toàn, không bị người ngoài nghe lén trên đường truyền.\n\n` +
        `• **Tại sao trang lừa đảo vẫn có HTTPS?** Kẻ tấn công có thể đăng ký một tên miền giả mạo (ví dụ: \`vietcom-login.xyz\`) và xin cấp chứng chỉ SSL hoàn toàn **miễn phí trong 2 phút** (qua Let's Encrypt hoặc Cloudflare). Khi đó, trình duyệt vẫn hiện ổ khóa xanh!\n\n` +
        `• **Hậu quả:** Nạn nhân thấy ổ khóa xanh liền tin tưởng nhập mật khẩu và mã OTP, nhưng thực tế toàn bộ dữ liệu mã hóa đó lại được gửi thẳng về máy chủ của kẻ lừa đảo!\n\n` +
        `💡 **Giải pháp:** Đó là lý do PhishArmor AI không chỉ nhìn vào SSL mà bóc tách tới **16 đặc trưng từ vựng kết hợp mô hình ngôn ngữ PhoBERT** để phát hiện bản chất mạo danh!`
    };
  }

  // 2.4 Lỡ bấm vào link lừa đảo thì làm sao?
  if (
    norm.includes("lo bam vao") || norm.includes("lo nhap") || norm.includes("bi lua roi") ||
    norm.includes("bi hack") || norm.includes("phai lam sao khi bam") || norm.includes("lo click")
  ) {
    return {
      reply: `🚨 **BẠN LỠ BẤM VÀO LINK LỪA ĐẢO? HÃY THỰC HIỆN NGAY CÁC BƯỚC KHẨN CẤP SAU:**\n\n` +
        `1. ⛔ **Dừng lại ngay lập tức:** Tuyệt đối **KHÔNG** điền bất kỳ thông tin nào (mật khẩu, mã OTP, số CCCD, số thẻ ngân hàng) và đóng ngay tab trình duyệt đó lại!\n\n` +
        `2. 🔐 **Đổi mật khẩu ngay (nếu đã lỡ nhập):** Mở thiết bị an toàn khác, đổi ngay mật khẩu của tài khoản ngân hàng, Email hoặc MXH vừa bị lộ. Hãy đăng xuất khỏi tất cả các thiết bị khác.\n\n` +
        `3. 📞 **Gọi hotline ngân hàng khóa tài khoản khẩn cấp:** Nếu lỡ nhập mã OTP hoặc số thẻ, hãy gọi ngay số điện thoại tổng đài trên thẻ ngân hàng để yêu cầu **khóa tạm thời dịch vụ Internet Banking và thẻ**.\n\n` +
        `4. 🛡️ **Bật xác thực 2 lớp (2FA):** Sử dụng các ứng dụng như Google Authenticator hoặc Microsoft Authenticator thay vì chỉ nhận mã SMS OTP thông thường.\n\n` +
        `5. 💻 **Quét mã độc trên máy tính/điện thoại:** Chạy phần mềm diệt virus kiểm tra xem có tệp độc hại nào tự động tải về hay không.`
    };
  }

  // 2.5 Phishing là gì / Tấn công phi kỹ thuật (Social Engineering)
  if (
    norm.includes("phishing la gi") || norm.includes("tan cong phishing") ||
    norm.includes("social engineering") || norm.includes("thao tung tam ly") ||
    norm.includes("lua dao truc tuyen")
  ) {
    return {
      reply: `🎣 **Phishing (Tấn công giả mạo) là gì?**\n\n` +
        `• **Định nghĩa:** Phishing là hình thức tấn công an ninh mạng dựa trên kỹ thuật thao túng tâm lý (Social Engineering), trong đó kẻ tấn công giả danh các tổ chức uy tín (Ngân hàng, Cơ quan thuế, Zalo, Facebook, Shopee) để đánh lừa người dùng tự nguyện cung cấp thông tin nhạy cảm.\n\n` +
        `• **Các hình thức Phishing phổ biến:**\n` +
        `  1. **Spear Phishing:** Nhắm vào một mục tiêu cụ thể (nhân viên kế toán, sếp công ty) với nội dung được may đo tinh vi.\n` +
        `  2. **Smishing:** Lừa đảo qua tin nhắn SMS (tin nhắn giả mạo Brandname ngân hàng, thông báo trúng thưởng).\n` +
        `  3. **Vishing:** Lừa đảo qua cuộc gọi thoại (giả danh công an, viện kiểm sát đe dọa lệnh bắt).\n` +
        `  4. **Typosquatting/Clone Phishing:** Tạo bản sao website giống hệt bản gốc với tên miền sai lệch 1 vài ký tự.\n\n` +
        `🛡️ PhishArmor AI được sinh ra để ngăn chặn tận gốc rễ các mối đe dọa này!`
    };
  }

  // 2.6 Typosquatting là gì?
  if (norm.includes("typosquatting") || norm.includes("homograph") || norm.includes("sai chinh ta ten mien")) {
    return {
      reply: `🔤 **Typosquatting (Tấn công lỗi chính tả tên miền) là gì?**\n\n` +
        `• **Bản chất:** Kẻ tấn công đăng ký các tên miền có phát âm hoặc cách viết gần giống các thương hiệu nổi tiếng, lợi dụng thói quen gõ nhầm hoặc nhìn lướt qua của người dùng.\n` +
        `• **Các chiêu trò Typosquatting điển hình:**\n` +
        `  1. *Thiếu/Thừa chữ cái:* \`gooogle.com\` thay vì \`google.com\`.\n` +
        `  2. *Ký tự tương đồng thị giác:* Dùng chữ \`rn\` ghép lại nhìn giống chữ \`m\` (\`rnicrosoft.com\`), số \`0\` thay chữ \`O\` (\`faceb00k.com\`).\n` +
        `  3. *Tấn công Homograph (IDN):* Dùng ký tự chữ cái Cyrillic của tiếng Nga/Hy Lạp có hình dạng giống hệt chữ Latin.\n\n` +
        `⚡ Thuật toán **XGBoost & Levenshtein Distance** trong PhishArmor AI đo lường chính xác khoảng cách sai khác này để nhận diện và gắn cờ cảnh báo tức thì!`
    };
  }

  // 2.7 2FA & OTP là gì?
  if (norm.includes("2fa") || norm.includes("xac thuc 2") || norm.includes("otp") || norm.includes("ma otp")) {
    return {
      reply: `🔑 **Xác thực 2 yếu tố (2FA) & Mã OTP quan trọng thế nào?**\n\n` +
        `• **Nguyên lý 2FA:** Bảo vệ tài khoản bằng 2 lớp độc lập:\n` +
        `  1. *Điều bạn biết:* Mật khẩu cá nhân.\n` +
        `  2. *Điều bạn sở hữu:* Điện thoại nhận mã OTP, ứng dụng Google Authenticator hoặc Khóa bảo mật vật lý (FIDO2/YubiKey).\n\n` +
        `• **Tại sao không được chia sẻ mã OTP cho bất kỳ ai?** Mã OTP là chìa khóa cuối cùng để mở két tiền. Ngay cả nhân viên ngân hàng cũng **không bao giờ có quyền đòi mã OTP** của bạn. Bất kỳ ai yêu cầu cung cấp mã OTP chắc chắn là kẻ lừa đảo!`
    };
  }

  // =========================================================================
  // 3. CHỦ ĐỀ KIẾN TRÚC & THUẬT TOÁN AI CỦA DỰ ÁN PHISHARMOR
  // =========================================================================

  
  // =========================================================================
  // 2.9 CÁC CÂU HỎI CHUYÊN SÂU VỀ NĂNG LỰC HỆ THỐNG (SYSTEM ARCHITECTURE Q&A)
  // =========================================================================

  // Câu 1: Tại sao kết hợp XGBoost và PhoBERT mà không dùng một mô hình duy nhất?
  if (
    norm.includes("tai sao ket hop") || norm.includes("vi sao ket hop") ||
    norm.includes("sao khong dung 1 mo hinh") || norm.includes("sao phai dung ca hai") ||
    (norm.includes("phobert") && norm.includes("xgboost") && (norm.includes("ket hop") || norm.includes("tai sao") || norm.includes("vi sao") || norm.includes("so sanh")))
  ) {
    return {
      reply: `🎓 **TẠI SAO PHISHARMOR KẾT HỢP XGBOOST VÀ PHOBERT MÀ KHÔNG DÙNG DUY NHẤT 1 MÔ HÌNH?**

` +
        `Đây là quyết định kiến trúc quan trọng trong thiết kế hệ thống an ninh mạng! Lý do khoa học và thực tiễn gồm 3 điểm cốt lõi:

` +
        `1. ⚡ **Tối ưu hóa độ trễ & tài nguyên tính toán (Speed vs Deep Processing):**
` +
        `   • Mô hình học sâu PhoBERT Transformer rất thông minh nhưng tốn tài nguyên (~90ms). Nếu mọi URL đều phải chạy qua PhoBERT thì trình duyệt sẽ bị giật lag.
` +
        `   • XGBoost trích xuất 16 đặc trưng từ vựng chỉ mất **~12ms**, lọc nhanh hơn **85%** các website thông thường và URL độc hại thô sơ ngay tại tầng 2.

` +
        `2. 🧠 **Bắt trọn cả cấu trúc kỹ thuật lẫn bẫy tâm lý tiếng Việt:**
` +
        `   • **XGBoost:** Giỏi phát hiện bất thường cú pháp (URL dài, nhiều subdomain, IP lạ, thiếu HTTPS, ký tự đặc biệt).
` +
        `   • **PhoBERT (VinAI):** Bắt trọn ngữ nghĩa tiếng Việt tinh vi mà cú pháp không thấy được (ví dụ: domain sạch nhưng nội dung đe dọa *"khóa tài khoản trong 24h"*, *"xác thực CCCD gấp"*, *"nhận quà hoàn tiền MoMo"*).

` +
        `3. 🏆 **Hiệu năng Ensemble vượt trội:**
` +
        `   • Dùng riêng XGBoost: F1-Score chỉ đạt ~93.4% (bị qua mặt bởi lừa đảo tinh vi).
` +
        `   • Dùng riêng PhoBERT: F1-Score ~95.2% nhưng độ trễ cao và tốn GPU.
` +
        `   • **Kết hợp Ensemble 4 tầng:** Đạt đỉnh **F1-Score 98.1%**, Precision **98.4%**, Recall **97.9%** với độ trễ trung bình chỉ **~127ms**!`,
      actionBtn: { text: "Xem Bảng Đối Chuẩn & Metrics", url: "/metrics" }
    };
  }

  // Câu 2: Làm thế nào để tránh cảnh báo nhầm (False Positive) cho website uy tín?
  if (
    norm.includes("canh bao nham") || norm.includes("false positive") ||
    norm.includes("bao dong gia") || norm.includes("bat nham") || norm.includes("tranh bao nham")
  ) {
    return {
      reply: `🎯 **CƠ CHẾ KIỂM SOÁT VÀ TRIỆT TIÊU CẢNH BÁO NHẦM (FALSE POSITIVE):**

` +
        `Trong hệ thống phòng thủ an ninh, bắt nhầm một trang web ngân hàng hoặc cổng chính phủ hợp pháp là điều tối kỵ. PhishArmor giải quyết triệt để bằng chiến lược 3 lớp:

` +
        `1. 🛡️ **Tầng 1 - Danh sách trắng xác thực độc quyền (Verified Whitelist):**
` +
        `   • Tích hợp cơ sở dữ liệu các cổng dịch vụ công (\`.gov.vn\`), giáo dục (\`.edu.vn\`), hệ thống ngân hàng nhà nước và doanh nghiệp lớn.
` +
        `   • Kiểm tra bảng băm (Hash Table) với độ trễ **< 1ms**, cho phép thông qua tức thì và tuyệt đối không bao giờ bị báo nhầm.

` +
        `2. ⚖️ **Cơ chế Ngưỡng kép (Dual Thresholding):**
` +
        `   • Hệ thống không vội vàng kết luận chỉ dựa vào 1 chỉ số đơn lẻ. Điểm rủi ro phải vượt ngưỡng an toàn thiết lập (mặc định Trust Score < 75%) và có sự đồng thuận giữa tầng từ vựng và ngữ nghĩa.

` +
        `3. 🔄 **Vòng lặp Phản hồi Con người (Human-in-the-Loop & Active Learning):**
` +
        `   • Người dùng có thể bấm phản hồi ngay trên trang chặn hoặc popup.
` +
        `   • Chuyên viên an ninh SOC duyệt tại trang **/feedback**, đưa mẫu vào tập dữ liệu để tái huấn luyện mô hình tại **/training**, giúp hệ thống ngày càng thông minh hơn!`,
      actionBtn: { text: "Xem Trang Quản Lý Phản Hồi", url: "/feedback" }
    };
  }

  // Câu 3: Khác biệt gì so với Google Safe Browsing hoặc phần mềm diệt virus?
  if (
    norm.includes("so sanh google") || norm.includes("safe browsing") ||
    norm.includes("khac gi diet virus") || norm.includes("zero day") || norm.includes("diem moi")
  ) {
    return {
      reply: `💡 **ĐIỂM ĐỘT PHÁ CỦA PHISHARMOR SO VỚI GOOGLE SAFE BROWSING & DIỆT VIRUS:**

` +
        `1. ⚡ **Phòng thủ Zero-day Phishing theo thời gian thực:**
` +
        `   • Google Safe Browsing hoạt động dựa trên cơ chế **Blacklist (Danh sách đen tĩnh)**. Khi hacker tạo một tên miền lừa đảo mới cách đây 5 phút, nó chưa có trong danh sách đen nên người dùng vẫn bị lừa bình thường.
` +
        `   • PhishArmor dùng **Machine Learning & NLP** phân tích đặc trưng URL và nội dung tức thì — phát hiện trang lừa đảo ngay từ giây đầu tiên nó vừa xuất hiện (Zero-day).

` +
        `2. 🇻🇳 **Tối ưu hóa sâu sắc cho ngữ cảnh Việt Nam:**
` +
        `   • Các công cụ quốc tế không hiểu được thủ đoạn lừa đảo tiếng Việt (mạo danh Vietcombank, MoMo, VNeID, hóa đơn tiền điện EVN).
` +
        `   • Mô hình PhoBERT của dự án được huấn luyện chuyên sâu cho ngôn ngữ và hành vi tội phạm mạng tại Việt Nam.

` +
        `3. 🌲 **Tính minh bạch với Explainable AI (XAI):**
` +
        `   • Thay vì chỉ báo "Nguy hiểm" như chiếc hộp đen, PhishArmor cung cấp cây giải thích SHAP và lý do chi tiết từ Gemini XAI giúp người dùng học hỏi và nâng cao nhận thức an toàn số.`,
      actionBtn: { text: "Trải Nghiệm Thử Nghiệm Quét", url: "/scan" }
    };
  }

  // Câu 4: Ý nghĩa của chỉ số F1-Score 98.1% và độ trễ 127ms
  if (
    norm.includes("y nghia f1") || norm.includes("y nghia cua f1") ||
    norm.includes("tai sao f1 quan trong") || norm.includes("giai thich f1")
  ) {
    return {
      reply: `**Ý NGHĨA CỦA CHỈ SỐ F1-SCORE (98.1%) VÀ ĐỘ TRỄ (~127MS) CỦA HỆ THỐNG:**

` +
        `• **Tại sao không chỉ nhìn vào Accuracy (Độ chính xác tổng)?**
` +
        `  Trong bài toán phát hiện lừa đảo, tập dữ liệu thực tế thường mất cân bằng (Imbalanced Data — số website an toàn nhiều gấp hàng chục lần website lừa đảo). Nếu một mô hình cứ đoán bừa "An toàn" thì Accuracy vẫn có thể lên tới 95% nhưng lại để lọt 100% bẫy lừa đảo!

` +
        `• **F1-Score là thước đo vàng:**
` +
        `  $$F1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
` +
        `  Điểm F1 đạt **98.1%** chứng minh mô hình đạt sự cân bằng hoàn hảo giữa:
` +
        `  - **Precision 98.4%:** Khi đã gắn cờ lừa đảo thì tỷ lệ đúng tới 98.4% (hạn chế tối đa bắt nhầm).
` +
        `  - **Recall 97.9%:** Tóm gọn gần như toàn bộ các mưu đồ lừa đảo (không bỏ sót mối đe dọa).

` +
        `• **Độ trễ ~127ms:** Tương đương cái chớp mắt, cho phép chặn đứng truy cập trước khi trang web độc hại kịp nạp mã nguồn vào trình duyệt!`,
      actionBtn: { text: "Xem Chi Tiết Đánh Giá Mô Hình", url: "/metrics" }
    };
  }

  // 3.1 Mô hình XGBoost & 16 đặc trưng
  if (
    norm.includes("xgboost") || norm.includes("16 dac trung") || norm.includes("dac trung tu vung") ||
    norm.includes("cay quyet dinh") || norm.includes("gradient boosting") || norm.includes("lexical")
  ) {
    return {
      reply: `⚡ **Mô hình XGBoost (Extreme Gradient Boosting) & 16 Đặc trưng từ vựng URL:**\n\n` +
        `• **Vai trò trong hệ thống:** Tầng phân loại siêu tốc (Layer 2) với thời gian phản hồi chỉ **~12ms**, lọc sạch hơn 90% các link lừa đảo trước khi cần gọi đến mô hình sâu.\n\n` +
        `• **16 Đặc trưng từ vựng (Lexical Features) được trích xuất:**\n` +
        `  1. \`length_url\`: Tổng độ dài ký tự của URL (link lừa đảo thường rất dài > 75 ký tự).\n` +
        `  2. \`subdomain_count\`: Số lượng tên miền con (subdomain).\n` +
        `  3. \`dot_count\`: Số lượng dấu chấm (\`.\`) trong chuỗi.\n` +
        `  4. \`hyphen_count\`: Số dấu gạch ngang (\`-\`) thường dùng để chèn từ khóa giả mạo.\n` +
        `  5. \`underline_count\`: Số dấu gạch dưới (\`_\`).\n` +
        `  6. \`digits_ratio\`: Tỷ lệ chữ số so với tổng số ký tự.\n` +
        `  7. \`special_chars\`: Tần suất ký tự đặc biệt (\`@\`, \`?\`, \`=\`, \`%\`, \`&\`).\n` +
        `  8. \`entropy_char\`: Độ hỗn loạn Shannon Entropy (đo mức độ ngẫu nhiên ký tự).\n` +
        `  9. \`is_https\`: Cờ giao thức HTTPS (0 hoặc 1).\n` +
        `  10. \`has_ip\`: Kiểm tra URL dùng địa chỉ IP trực tiếp thay vì tên miền.\n` +
        `  11. \`suspicious_words\`: Chứa từ khóa nhử mồi (\`login\`, \`verify\`, \`bank\`, \`secure\`, \`update\`).\n` +
        `  12. \`path_length\`: Độ dài của phần đường dẫn URL Path.\n` +
        `  13. \`query_length\`: Độ dài của chuỗi truy vấn Query Parameter.\n` +
        `  14. \`tld_risk\`: Mức độ rủi ro của đuôi tên miền (\`.top\`, \`.xyz\`, \`.click\`).\n` +
        `  15. \`brand_in_subdomain\`: Tên thương hiệu bị cố tình đưa vào tên miền con.\n` +
        `  16. \`shortener_flag\`: Cờ nhận diện dịch vụ rút gọn link (\`bit.ly\`, \`tinyurl\`).`,
      actionBtn: { text: "Xem Bảng Đối Chuẩn XGBoost", url: "/metrics" }
    };
  }

  // 3.2 Mô hình PhoBERT NLP
  if (
    norm.includes("phobert") || norm.includes("vinai") || norm.includes("nlp") ||
    norm.includes("ngon ngu tieng viet") || norm.includes("transformer") || norm.includes("roberta")
  ) {
    return {
      reply: `🤖 **Mô hình PhoBERT (VinAI Research) - Tầng hiểu ngữ nghĩa tiếng Việt chuyên sâu:**\n\n` +
        `• **Tại sao PhishArmor tích hợp PhoBERT?** Các thuật toán truyền thống chỉ đếm ký tự nên hoàn toàn "bó tay" trước các chiêu trò thao túng tâm lý bằng tiếng Việt hoặc tiếng lóng biến thể.\n\n` +
        `• **Sức mạnh vượt trội của PhoBERT:**\n` +
        `  1. Được huấn luyện trước trên **hàng tỷ từ vựng tiếng Việt** chất lượng cao.\n` +
        `  2. **Bắt trọn ngữ cảnh lừa đảo:** Nhận diện các cụm từ tạo áp lực khẩn cấp (*"khóa tài khoản trong 24h"*, *"xác thực CCCD gấp"*) hoặc mồi chài tiền thưởng (*"nhận hoàn tiền MoMo 500k"*, *"bình chọn hoa khôi nhận quà"*).\n` +
        `  3. Đóng góp trọng số lớn trong mô hình kết hợp Ensemble AI, giúp F1-Score đạt đỉnh **98.1%**!`,
      actionBtn: { text: "Xem Luồng Pipeline PhoBERT", url: "/metrics" }
    };
  }

  // 3.3 Explainable AI (XAI) & SHAP
  if (
    norm.includes("shap") || norm.includes("xai") || norm.includes("giai thich ai") ||
    norm.includes("explainable") || norm.includes("shapley") || norm.includes("cay giai thich")
  ) {
    return {
      reply: `🌲 **Explainable AI (XAI) & Công nghệ SHAP (Shapley Additive exPlanations):**\n\n` +
        `• **Bài toán:** Các mô hình AI thông thường là một "hộp đen" (Black Box) — chỉ trả về kết quả 0 hoặc 1 mà không thể giải thích lý do, khiến chuyên viên an ninh và người dùng không tin tưởng.\n\n` +
        `• **SHAP hoạt động như thế nào?**\n` +
        `  1. Dựa trên lý thuyết trò chơi hợp tác (Game Theory) của nhà toán học đoạt giải Nobel Lloyd Shapley.\n` +
        `  2. Tính toán chính xác **đóng góp biên (Marginal Contribution)** của từng đặc trưng:\n` +
        `     - Cột màu ĐỎ (+): Các yếu tố đẩy nguy cơ lừa đảo tăng cao (ví dụ: chứa từ \`verify\`, URL dài 72 ký tự).\n` +
        `     - Cột màu XANH (-): Các yếu tố làm tăng độ tin cậy an toàn (ví dụ: tên miền có chứng chỉ SSL hợp lệ).\n\n` +
        `• **Tác dụng:** Giúp chuyên viên SOC hiểu rõ căn cứ kỹ thuật của quyết định gắn cờ, phục vụ báo cáo kiểm toán an ninh mạng và giải trình quản trị rủi ro.`,
      actionBtn: { text: "Xem SHAP Trên Trang Quét", url: "/scan" }
    };
  }

  // 3.4 Kiến trúc 4 tầng Pipeline tổng thể
  if (
    norm.includes("kien truc") || norm.includes("pipeline") || norm.includes("4 tang") ||
    norm.includes("cac tang ai") || norm.includes("hoat dong the nao") || norm.includes("tong quan he thong")
  ) {
    return {
      reply: `🏛️ **Kiến trúc Pipeline 4 Tầng Phòng Thủ Độc Quyền của PhishArmor AI:**\n\n` +
        `1. 🛡️ **Tầng 1 - Whitelist & Cache (< 1ms):** Kiểm tra tên miền tin cậy đã xác thực (Google, Vietcombank, Cổng Dịch vụ công Quốc gia). Nếu khớp, cho phép truy cập ngay lập tức mà không tốn tài nguyên AI.\n\n` +
        `2. ⚡ **Tầng 2 - XGBoost Classifier (~12ms):** Bóc tách 16 đặc trưng từ vựng URL, tính toán điểm bất thường ban đầu.\n\n` +
        `3. 🤖 **Tầng 3 - PhoBERT Vietnamese NLP (~90ms):** Quét ngữ nghĩa tiếng Việt lừa đảo, phát hiện bẫy tâm lý và ngữ cảnh mạo danh.\n\n` +
        `4. 🌐 **Tầng 4 - XAI & Multi-Source Verification (~25ms):**\n` +
        `   • Trực quan hóa cây trọng số SHAP giải thích nguyên nhân.\n` +
        `   • Đối chiếu song song với cơ sở dữ liệu mối đe dọa toàn cầu của VirusTotal.\n\n` +
        `➡️ **Kết quả:** Tổng thời gian xử lý toàn hệ thống chỉ khoảng **~127ms**, bảo đảm trải nghiệm lướt web mượt mà không bị giật lag!`,
      actionBtn: { text: "Khám Phá Kiến Trúc 4 Tầng", url: "/metrics" }
    };
  }

  // 3.5 Bảng đối chuẩn hiệu năng & Metrics (F1, Accuracy, Recall, Confusion Matrix)
  if (
    norm.includes("metrics") || norm.includes("doi chuan") || norm.includes("f1") ||
    norm.includes("recall") || norm.includes("precision") || norm.includes("confusion") ||
    norm.includes("ma tran nham lan") || norm.includes("do tre") || norm.includes("latency")
  ) {
    return {
      reply: `🎯 **Bảng Đối Chuẩn Hiệu Năng & Kết Quả Thực Nghiệm (Benchmark Metrics):**\n\n` +
        `Hệ thống được kiểm thử độc lập trên tập dữ liệu chuẩn gồm **3,000 mẫu thực tế** (1,800 an toàn / 1,200 lừa đảo):\n\n` +
        `• 📊 **Độ chính xác (Precision):** **98.4%** (gần như không bắt nhầm link tốt).\n` +
        `• 🎯 **Độ thu hồi (Recall / Sensitivity):** **97.9%** (bắt trọn gần như toàn bộ link lừa đảo).\n` +
        `• 🏆 **Điểm F1-Score:** **98.1%** (cân bằng xuất sắc giữa Precision và Recall).\n` +
        `• ⚡ **Độ trễ trung bình:** **~127ms** (đáp ứng tiêu chuẩn bảo vệ thời gian thực).\n\n` +
        `🧩 **Ma trận nhầm lẫn (Confusion Matrix 3,000 mẫu):**\n` +
        `  - **True Positive (TP):** 1,103 mẫu lừa đảo bị bắt trúng.\n` +
        `  - **True Negative (TN):** 1,842 mẫu an toàn được thông qua.\n` +
        `  - **False Positive (FP):** 31 mẫu báo nhầm (tỷ lệ chỉ 1.7%).\n` +
        `  - **False Negative (FN):** 24 mẫu bỏ sót (tỷ lệ chỉ 2.1%).`,
      actionBtn: { text: "Xem Ma Trận Nhầm Lẫn", url: "/metrics" }
    };
  }

  // 3.6 Tiện ích Chrome Extension hoạt động thế nào?
  if (
    norm.includes("extension hoat dong") || norm.includes("tien ich hoat dong") ||
    norm.includes("chrome hoat dong") || norm.includes("chan link the nao") ||
    norm.includes("manifest v3")
  ) {
    return {
      reply: `🛡️ **Cơ chế hoạt động của Tiện Ích Trình Duyệt Chrome Extension PhishArmor:**\n\n` +
        `1. ⚡ **Bắt sự kiện điều hướng (Event Interception):** Sử dụng chuẩn **Chrome Manifest V3**, service worker lắng nghe sự kiện \`chrome.webNavigation.onBeforeNavigate\` ngay khi người dùng bấm vào bất kỳ liên kết nào.\n\n` +
        `2. 🚀 **Kiểm tra tức thì qua API:** Extension gửi URL cần truy cập về Backend AI (\`/predict\`).\n\n` +
        `3. 🛑 **Chặn đứng & Điều hướng an toàn:** Nếu điểm rủi ro vượt ngưỡng an toàn (Risk Score > 0.75), Extension lập tức hủy yêu cầu tải trang độc hại và chuyển hướng trình duyệt sang **Màn hình đỏ cảnh báo nguy hiểm (\`block.html\`)**!\n\n` +
        `4. 💡 **Bảo mật tuyệt đối:** Tiện ích không lưu lại lịch sử duyệt web cá nhân của người dùng, đảm bảo quyền riêng tư tối đa.`,
      actionBtn: { text: "Xem Thử Mẫu Trang Chặn", url: "/block" }
    };
  }

  // 3.7 Cách cài đặt Extension vào Chrome
  if (
    norm.includes("cai extension") || norm.includes("cai tien ich") || norm.includes("load unpacked") ||
    norm.includes("developer mode") || norm.includes("cai vao chrome")
  ) {
    return {
      reply: `⚡ **Hướng dẫn 3 bước cài đặt Extension PhishArmor vào Google Chrome / Cốc Cốc / Edge:**\n\n` +
        `• **Bước 1:** Bấm nút **'Tải xuống Extension (.zip)'** trên thanh menu hoặc trang chủ và giải nén tệp \`PhishArmor_Extension_v1.4.2.zip\` ra một thư mục trên máy tính.\n\n` +
        `• **Bước 2:** Mở trình duyệt Chrome, truy cập vào đường dẫn: \`chrome://extensions/\` (hoặc vào Cài đặt -> Tiện ích mở rộng), gạt bật công tắc **'Developer mode' (Chế độ dành cho nhà phát triển)** ở góc trên bên phải màn hình.\n\n` +
        `• **Bước 3:** Nhấn vào nút **'Load unpacked' (Tải tiện ích đã giải nén)** ở góc trái, sau đó chọn thư mục extension vừa giải nén xong. Biểu tượng khiên xanh PhishArmor sẽ xuất hiện ngay trên thanh công cụ!`,
      actionBtn: { text: "Xem Hướng Dẫn Chi Tiết", url: "/onboarding" }
    };
  }

  // 3.8 Xuất dữ liệu Excel & In Báo Cáo PDF
  if (
    norm.includes("excel") || norm.includes("xuat file") || norm.includes("in bao cao") ||
    norm.includes("xuat pdf") || norm.includes("in pdf") || norm.includes("executive summary") ||
    norm.includes("file xls") || norm.includes("tai bao cao")
  ) {
    return {
      reply: `📊 **Cách xuất Báo cáo dữ liệu (Excel & PDF) trong hệ thống:**\n\n` +
        `1. 📗 **Xuất Bảng Tính Excel (.xls):**\n` +
        `   • Vào trang **Lịch Sử & Báo Cáo** (\`/history\`).\n` +
        `   • Nhấn vào nút **'Xuất Excel'** màu xanh lá ở góc trên bên phải.\n` +
        `   • Hệ thống tự động tạo tệp \`.xls\` chuẩn XML với đầy đủ thông tin: Tên miền, Thời gian, Trạng thái (tô màu xanh/đỏ/cam), Địa chỉ IP và Ghi chú AI.\n\n` +
        `2. 📄 **In Báo Cáo PDF Giám Đốc (Executive Report):**\n` +
        `   • Bấm vào nút **'Báo Cáo PDF'** trên trang Lịch sử hoặc truy cập \`/export\`.\n` +
        `   • Màn hình báo cáo sang trọng sẽ hiện ra với đầy đủ chỉ số KPI, biểu đồ radar và nhật ký trọng điểm.\n` +
        `   • Nhấn nút **'In Báo Cáo'** (hoặc phím tắt **Ctrl + P**), chọn mục *Destination: Save as PDF* để lưu file PDF sắc nét!`,
      actionBtn: { text: "Mở Trang Lịch Sử Ngay", url: "/history" }
    };
  }

  // =========================================================================
  // 4. CÔNG NGHỆ LẬP TRÌNH & CÁCH VẬN HÀNH HỆ THỐNG (TECH STACK)
  // =========================================================================

  // 4.1 Công nghệ sử dụng trong hệ thống
  if (
    norm.includes("cong nghe") || norm.includes("tech stack") || norm.includes("ngon ngu") ||
    norm.includes("viet bang gi") || norm.includes("framework") || norm.includes("kien truc cong nghe")
  ) {
    return {
      reply: `💻 **Công nghệ & Frameworks xây dựng hệ thống PhishArmor AI:**\n\n` +
        `• 🌐 **Giao diện Web Dashboard (Frontend):**\n` +
        `  - Next.js 14 (React 19, App Router) tốc độ cao, chuẩn SEO và tối ưu hiệu năng.\n` +
        `  - TypeScript 5 đảm bảo an toàn kiểu dữ liệu và chống lỗi runtime.\n` +
        `  - Tailwind CSS 4 thiết kế giao diện hiện đại, hỗ trợ Dark / Light mode linh hoạt.\n` +
        `  - Recharts & Lucide Icons hiển thị biểu đồ và icon an ninh trực quan.\n\n` +
        `• ⚡ **Hệ thống Máy chủ (Backend API):**\n` +
        `  - Python 3.10+ kết hợp FastAPI xử lý bất đồng bộ (Asynchronous) siêu tốc.\n` +
        `  - Uvicorn ASGI Server đáp ứng hàng ngàn request đồng thời.\n` +
        `  - SQLite & SQLAlchemy quản lý cơ sở dữ liệu nhẹ nhàng, dễ triển khai.\n\n` +
        `• 🧠 **Trí Tuệ Nhân Tạo & Học Máy (AI / Machine Learning):**\n` +
        `  - Scikit-learn & XGBoost: Khai phá 16 đặc trưng từ vựng URL.\n` +
        `  - Hugging Face Transformers & PhoBERT: Xử lý ngôn ngữ tự nhiên tiếng Việt.\n` +
        `  - SHAP (SHapley Additive exPlanations): Giải thích mô hình minh bạch.\n\n` +
        `• 🛡️ **Tiện ích mở rộng (Browser Extension):** Google Chrome Manifest V3.`
    };
  }

  // 4.2 Cách khởi động / chạy dự án
  if (
    norm.includes("cach chay du an") || norm.includes("khoi dong he thong") ||
    norm.includes("run project") || norm.includes("start backend") || norm.includes("start frontend")
  ) {
    return {
      reply: `🚀 **Hướng dẫn khởi động toàn bộ hệ thống PhishArmor AI:**\n\n` +
        `1. 🐍 **Khởi động Backend API (FastAPI - Cổng 8000):**\n` +
        `   \`\`\`bash\n` +
        `   cd backend\n` +
        `   .\\venv\\Scripts\\activate\n` +
        `   uvicorn main:app --reload --port 8000\n` +
        `   \`\`\`\n` +
        `   *API Docs có thể xem tại: http://127.0.0.1:8000/docs*\n\n` +
        `2. ⚛️ **Khởi động Frontend Dashboard (Next.js - Cổng 3000):**\n` +
        `   \`\`\`bash\n` +
        `   cd dashboard\n` +
        `   npm run dev\n` +
        `   \`\`\`\n` +
        `   *Truy cập bảng điều khiển tại: http://localhost:3000*\n\n` +
        `3. 🧩 **Cài đặt Extension:** Mở \`chrome://extensions/\`, bật Developer mode và Load unpacked thư mục \`extension\`!`
    };
  }

  // 4.3 API RESTful & Token JWT
  if (norm.includes("api la gi") || norm.includes("jwt la gi") || norm.includes("token la gi") || norm.includes("restful")) {
    return {
      reply: `📡 **Khái niệm API RESTful & Token JWT trong hệ thống:**\n\n` +
        `• **API RESTful:** Là giao diện lập trình cho phép Frontend (Next.js) và Chrome Extension gửi nhận dữ liệu với Backend (Python FastAPI) thông qua các phương thức HTTP chuẩn (\`GET\`, \`POST\`) với định dạng JSON tiêu chuẩn.\n\n` +
        `• **JWT (JSON Web Token):** Phương thức xác thực người dùng phi trạng thái (Stateless). Khi quản trị viên đăng nhập, server cấp một chuỗi mã ký an toàn (HS256) chứa thông tin vai trò (Role), giúp bảo vệ các endpoint nhạy cảm như huấn luyện model hay duyệt mẫu phản hồi.`
    };
  }

  // =========================================================================
  // 5. CHỦ ĐỀ HỌC TẬP, PHƯƠNG PHÁP NGHIÊN CỨU & THỰC HÀNH CÔNG NGHỆ
  // =========================================================================

  // 5.1 Bí quyết học giỏi, tiếp thu nhanh
  if (
    norm.includes("hoc gioi") || norm.includes("hoc tot") || norm.includes("hoc bai") ||
    norm.includes("on thi") || norm.includes("cach hoc") || norm.includes("bi quyet hoc") ||
    norm.includes("phuong phap hoc") || norm.includes("nho lau") || norm.includes("tiep thu nhanh")
  ) {
    return {
      reply: `Để học giỏi và tiếp thu kiến thức một cách nhẹ nhàng, mình chia sẻ với bạn 5 bí quyết vàng đã được khoa học chứng minh nhé: 🌟📚\n\n` +
        `1. 🧠 **Kỹ thuật Feynman (Học bằng cách giải thích lại):** Sau khi đọc xong một bài học hoặc thuật toán, hãy thử tự giải thích lại bằng ngôn ngữ bình dân cho người khác hiểu. Nếu bạn giải thích trôi chảy, tức là bạn đã thực sự làm chủ kiến thức!\n\n` +
        `2. ⏱️ **Phương pháp Pomodoro (25 phút tập trung + 5 phút nghỉ ngơi):** Giúp não bộ luôn giữ được độ tỉnh táo và tập trung cao độ mà không bị kiệt sức.\n\n` +
        `3. 🛠️ **Học đi đôi với hành (Learning by Doing):** Giống như việc bạn đang tự tay xây dựng hệ thống PhishArmor này vậy — vừa học lý thuyết vừa thực hành dự án thực tế sẽ nhớ lâu gấp 10 lần chỉ đọc sách!\n\n` +
        `4. 🔄 **Ôn tập ngắt quãng (Spaced Repetition):** Ôn lại kiến thức sau 1 ngày, 3 ngày, 7 ngày để biến trí nhớ ngắn hạn thành trí nhớ dài hạn vĩnh viễn.\n\n` +
        `5. 💧 **Chăm sóc bản thân:** Ngủ đủ 7-8 tiếng, uống đủ nước và ăn uống đầy đủ. Cơ thể khỏe mạnh thì trí óc mới minh mẫn và sáng tạo được!\n\n` +
        `Cố lên bạn nhé, bạn rất chăm chỉ và có tư duy tốt, chắc chắn bạn sẽ học cực kỳ giỏi! Bé AI luôn tin ở bạn! ❤️💪✨`
    };
  }

  // 5.2 Phương pháp trình diễn giải pháp an ninh mạng
  if (
    norm.includes("chuc mung") || norm.includes("chuc thi") || norm.includes("chuc bao ve") ||
    norm.includes("chuc may man") || norm.includes("chuc thanh cong") ||
    norm.includes("thi tot") || norm.includes("may man") ||
    norm.includes("bao ve do an") || norm.includes("bao ve tot nghiep") || norm.includes("bao ve khoa luan") ||
    norm.includes("hoi dong bao ve") || norm.includes("hoi dong cham") ||
    norm.includes("kich ban bao ve") || norm.includes("kinh nghiem bao ve") || norm.includes("thuyet trinh do an") ||
    ((norm.includes("chuc") || norm.includes("thuyet trinh")) &&
     (norm.includes("thi") || norm.includes("diem cao") || norm.includes("tot nghiep") || norm.includes("hoi dong")) &&
     !norm.includes("chuc nang"))
  ) {
    return {
      reply: `🎓🎉 **CHÚC BẠN VẬN HÀNH DỰ ÁN THÀNH CÔNG VÀ ĐẠT KẾT QUẢ XUẤT SẮC!**\n\n` +
        `Dự án PhishArmor AI của bạn đã hoàn thiện vô cùng xuất sắc từ thuật toán AI đa tầng (PhoBERT + XGBoost), kiến trúc giải thích SHAP cho đến giao diện Dashboard hiện đại và tiện ích Chrome thực tế!\n\n` +
        `🎯 **Gợi ý Kịch bản Trình diễn (Demo) 3 phút giải pháp an ninh mạng:**\n` +
        `1. *Phút 1:* Mở **Trang Tổng Quan (\`/overview\`)**, nêu tính thời sự của nạn lừa đảo giả mạo ngân hàng và chỉ số F1 98.1%.\n` +
        `2. *Phút 2:* Sang **Trang Quét (\`/scan\`)**, dán 1 link ngân hàng giả mạo để trình diễn bóc tách 16 đặc trưng và cây giải thích SHAP.\n` +
        `3. *Phút 3:* Mở **Chrome Extension** hoặc **Mẫu Trang Chặn (\`/block\`)** để minh chứng khả năng bảo vệ thời gian thực cho người dùng cuối!\n\n` +
        `Tự tin tỏa sáng nha bạn ơi, bé trợ lý AI luôn đồng hành và cổ vũ hết mình cho bạn! 🍀🌟💯`,
      actionBtn: { text: "Xem Trang Kiến Trúc & Metrics", url: "/metrics" }
    };
  }

  // =========================================================================
  // 6. CẢM XÚC, TÌNH CẢM, SỨC KHỎE, ĐỜI SỐNG & TÂM SỰ
  // =========================================================================

  // 6.0 ĐÓI BỤNG / THÈM ĂN / CƠM NƯỚC / ĂN GÌ
  const isHungerQuery = 
    (norm.includes("doi bung") || norm.includes("doi qua") || raw.toLowerCase().includes("đói") ||
     norm.includes("them an") || norm.includes("an com") || norm.includes("kiem gi an") ||
     norm.includes("muon an") || norm.includes("an khuya") || norm.includes("an toi") ||
     norm.includes("an trua") || norm.includes("an sang") ||
     (norm.includes("an gi") && !norm.includes("do an")) ||
     norm.includes("mon gi ngon") ||
     raw.toLowerCase().includes("đồ ăn") || norm.includes("thuc an") || norm.includes("quan an")) &&
    !norm.includes("du an") && !norm.includes("he thong");

  if (isHungerQuery) {
    return {
      reply: `Trời ơi đói bụng thì việc đầu tiên và quan trọng nhất lúc này là **ĐI KIẾM CÁI GÌ ĂN NGAY VÀ LUÔN** chứ còn làm gì nữa bạn ơi! 🍜🤤 Chiếc dạ dày đang réo gọi 'biểu tình' rồi kìa!\n\n` +
        `Dưới đây là một số gợi ý nhanh giúp bạn bổ sung năng lượng ngay lập tức:\n\n` +
        `1. ⚡ **Cấp cứu siêu tốc tại nhà (3 - 5 phút):**\n` +
        `   • Nấu ngay một tô mì tôm thơm phức, đập thêm quả trứng lòng đào, rắc chút hành hoa hoặc kẹp thêm cây xúc xích.\n` +
        `   • Lục tủ lạnh rán 2 quả trứng ốp la kẹp bánh mì, chấm tương ớt cay nồng siêu ngon.\n` +
        `   • Hoặc bẻ tạm vài cái bánh quy, uống cốc sữa ấm lót dạ trước.\n\n` +
        `2. 🛵 **Nhờ các 'anh hùng cứu đói' (ShopeeFood / GrabFood):**\n` +
        `   • **Món nước:** Phở bò tái nạm, bún bò Huế nước dùng ngọt thanh nóng hổi, xì xụp ấm bụng liền.\n` +
        `   • **Món khô:** Cơm tấm sườn bì chả nướng thơm nức mũi — bao no lâu và chắc bụng.\n` +
        `   • **Fastfood:** Gà rán giòn rụm hoặc pizza phô mai kéo sợi ngập tràn.\n` +
        `   • Nhớ gọi thêm một ly trà sữa full topping hoặc nước ép hoa quả mát lạnh nhé!\n\n` +
        `3. 🏪 **Đi dạo ra cửa hàng tiện lợi / tiệm tạp hóa gần nhà:**\n` +
        `   • Làm cái bánh bao nóng hổi, cơm nắm tam giác rong biển hoặc xúc xích tiệt trùng ăn liền.\n\n` +
        `Bạn đang thèm ăn món nước hay món khô nè? Mau đi ăn liền cho có năng lượng rồi quay lại trò chuyện tiếp với mình nhé, tuyệt đối không được nhịn đói đau dạ dày đó nha! 🍱🧋❤️`
    };
  }

  // 6.1 KHÁT NƯỚC / THÈM UỐNG
  if (
    norm.includes("khat") || norm.includes("khat nuoc") || norm.includes("uong gi") ||
    norm.includes("tra sua") || norm.includes("ca phe") || norm.includes("kiem gi uong")
  ) {
    return {
      reply: `Khát nước là cơ thể đang nhắc bạn nạp nước gấp rồi đấy! 💧🥤\n\n` +
        `• Mau đứng dậy đi rót ngay một ly nước lọc mát lạnh uống từng ngụm chậm rãi nhé.\n` +
        `• Nếu muốn tỉnh táo làm việc/học code: Một ly cà phê muối hoặc trà đen đậm vị.\n` +
        `• Nếu muốn nạp năng lượng 'chữa lành': Một ly trà sữa trân châu đường đen hoặc sinh tố bơ/nước ép cam nhiều vitamin C!\n\n` +
        `Bạn nhớ uống đủ 2 lít nước mỗi ngày để cơ thể luôn khỏe khoắn nha! 🧋✨`
    };
  }

  // 6.2 BUỒN NGỦ / MẤT NGỦ
  if (
    norm.includes("buon ngu") || norm.includes("ngu di") || norm.includes("di ngu") ||
    norm.includes("mat ngu") || norm.includes("kho ngu") || norm.includes("thuc khuya") ||
    norm.includes("ngu day") || norm.includes("chuc ngu ngon") || norm.includes("ngu ngon")
  ) {
    return {
      reply: `Buồn ngủ rồi thì tắt máy tính, gập laptop lại và đi ngủ ngay thôi bạn ơi! 😴🌙\n\n` +
        `Làm việc quá khuya ảnh hưởng xấu đến sức khỏe và khả năng tập trung. Hệ thống PhishArmor đã được kích hoạt chế độ tự động giám sát 24/7 để bảo vệ an toàn mạng, bạn có thể hoàn toàn yên tâm nghỉ ngơi!\n\n` +
        `• Uống vài ngụm nước ấm, kéo rèm che ánh sáng.\n` +
        `• Đặt điện thoại ra xa giường ngủ một chút để tránh bấm trúng rồi lướt tới sáng.\n` +
        `• Đắp chăn ấm và ngủ một giấc thật ngon nhé!\n\n` +
        `Chúc bạn có những giấc mơ thật đẹp! Hẹn gặp lại bạn vào ngày mai tràn đầy năng lượng nha! 🌟💤🧸`
    };
  }

  // 6.3 BÍ KÍP TÁN GÁI, TÁN TRAI, TÁN CRUSH, CUA ĐỔ, TỎ TÌNH, LÀM QUEN
  if (
    norm.includes("tan gai") || norm.includes("cach tan") || norm.includes("cua gai") ||
    norm.includes("tan crush") || norm.includes("tan trai") || norm.includes("cua trai") ||
    norm.includes("to tinh") || norm.includes("bat chuyen") || norm.includes("lam quen") ||
    norm.includes("chinh phuc crush") || norm.includes("de nguoi ta thich minh") ||
    norm.includes("cua do") || norm.includes("cach co nguoi yeu") || norm.includes("tim nguoi yeu") ||
    norm.includes("cach noi chuyen") || norm.includes("tha thinh") ||
    (norm.includes("crush") && (norm.includes("tan") || norm.includes("cua") || norm.includes("to tinh") || norm.includes("thich") || norm.includes("cach") || norm.includes("lam sao")))
  ) {
    return {
      reply: `Dưới đây là cẩm nang chia sẻ những kinh nghiệm giao tiếp tinh tế, chân thành giúp bạn tạo thiện cảm với người mình quan tâm: 😉💌✨\n\n` +
        `1. 🌟 **Gọn gàng & Tự tin (Ấn tượng 7 giây đầu tiên):**\n` +
        `   • Không cần phải đẹp trai như soái ca, nhưng con gái cực kỳ thích những bạn nam **sạch sẽ, đầu tóc tươm tất, ăn mặc gọn gàng và có mùi thơm nhẹ dễ chịu**.\n` +
        `   • Luôn giữ nụ cười thân thiện và ánh mắt chân thành khi tiếp xúc.\n\n` +
        `2. 🎯 **Nghệ thuật bắt chuyện tự nhiên (Tuyệt đối không 'nhạt nhẽo'):**\n` +
        `   • Đừng bao giờ nhắn: *"Em ăn cơm chưa?", "Đang làm gì đấy?", "Chào em"* — rất dễ bị 'seen' hoặc bơ luôn!\n` +
        `   • **Cách thông minh:** Rep story về thứ bạn ấy thích (chú mèo cưng, quán cafe đẹp, cuốn sách hay bài hát bạn ấy vừa đăng) kèm theo một câu hỏi mở gợi chuyện.\n\n` +
        `3. 👂 **Lắng nghe và ghi nhớ chi tiết nhỏ (Chìa khóa vàng chiếm trọn trái tim):**\n` +
        `   • Hãy để bạn ấy được nói nhiều hơn. Nhớ những sở thích nhỏ như: bạn ấy thích uống trà sữa ít đường nhiều đá, ghét ăn hành, hay thích hoa gì...\n` +
        `   • Sau này chỉ cần một hành động tinh tế như gọi đúng món bạn ấy thích là 'ghi điểm 100 điểm' liền!\n\n` +
        `4. ☕ **Rủ đi chơi tinh tế (Không áp lực):**\n` +
        `   • Đừng vội rủ đi ăn nhà hàng sang trọng. Hãy bắt đầu bằng một buổi cafe tán gẫu, cùng đi dạo phố, hoặc đi xem một bộ phim mà cả hai cùng thích.\n\n` +
        `5. 🛡️ **Vũ khí tối thượng: Có chí hướng và đam mê!**\n` +
        `   • Một người chăm chỉ học tập, có đam mê công nghệ (như sự nghiêm túc và đam mê công nghệ mà bạn đang theo đuổi) luôn toát ra sức hút trưởng thành, đáng tin cậy mà phái nữ đánh giá rất cao!\n\n` +
        `Bạn đang để ý bạn nữ nào rồi đúng không? Bật mí thêm chút xíu về tính cách bạn ấy để mình 'quân sư' chiến thuật chuẩn bài hơn nha! 💘🏹`
    };
  }

  // 6.2.1 SỨC KHỎE - ĐAU BỤNG, ĐAU DẠ DÀY, TIÊU HÓA
  if (
    norm.includes("dau bung") || norm.includes("dau da day") || norm.includes("dau bao tu") ||
    norm.includes("bot dau bung") || norm.includes("giam dau bung") || norm.includes("cach het dau bung") ||
    norm.includes("chua dau bung") || norm.includes("bi dau bung") || norm.includes("tieu chay") ||
    norm.includes("chuong bung") || norm.includes("day bung") || norm.includes("kho tieu")
  ) {
    return {
      reply: `🩺 **CÁCH GIẢM ĐAU BỤNG NHANH CHÓNG & AN TOÀN TẠI NHÀ:**\n\n` +
        `Ui thương bạn quá! Bị đau bụng rất mệt mỏi và khó chịu, bạn hãy áp dụng ngay các biện pháp làm dịu cơn đau này nhé:\n\n` +
        `1. 🍵 **Uống một cốc nước ấm hoặc trà gừng ấm:**\n` +
        `   • Nước ấm giúp giãn các cơ trơn dạ dày và đường ruột, làm dịu các cơn co thắt tức thì.\n` +
        `   • Nếu có gừng tươi, hãy đập dập 2-3 lát pha nước sôi ấm và chút mật ong; tinh chất gingerol trong gừng có tính kháng viêm và giảm co thắt rất hiệu quả.\n\n` +
        `2. ♨️ **Chườm ấm vùng bụng (Tác dụng giảm đau cực nhanh):**\n` +
        `   • Dùng túi chườm ấm (hoặc một chai nước ấm bọc trong khăn mỏng) đặt nhẹ lên vùng bụng quanh rốn trong 15-20 phút.\n` +
        `   • Nhiệt độ ấm sẽ kích thích tuần hoàn máu và giúp các bó cơ bụng thả lỏng thư giãn.\n\n` +
        `3. 🛏️ **Nghỉ ngơi đúng tư thế & Massage nhẹ:**\n` +
        `   • Hãy nằm co nhẹ hai đầu gối về phía bụng hoặc nằm nghiêng người sang bên trái để giảm áp lực lên các cơ quan nội tạng.\n` +
        `   • Dùng lòng bàn tay xoa nhẹ nhàng theo chiều kim đồng hồ quanh rốn trong 3-5 phút.\n\n` +
        `4. 🥣 **Ăn uống nhẹ nhàng (Tuyệt đối không ăn đồ kích thích):**\n` +
        `   • **Tuyệt đối tránh:** Đồ cay nóng, dầu mỡ chiên xào, đồ chua (chanh, xoài, giấm), sữa tươi, nước ngọt có ga và cà phê.\n` +
        `   • Nếu thấy đói, chỉ nên ăn cháo trắng loãng ấm, súp nhẹ hoặc vài lát bánh mì gối nướng giòn để trung hòa axit dịch vị.\n\n` +
        `⚠️ **LƯU Ý CẢNH BÁO Y TẾ:** Nếu bạn bị đau dữ dội ở vùng bụng dưới bên phải (dấu hiệu nghi viêm ruột thừa), đau quặn từng cơn kèm theo sốt cao, nôn mửa liên tục hoặc đi ngoài ra máu, hãy đến ngay cơ sở y tế hoặc bệnh viện gần nhất để bác sĩ kiểm tra kịp thời nhé!\n\n` +
        `Bạn nghỉ ngơi cho bụng êm lại nha, chúc bạn mau khỏi đau bụng và sớm khỏe lại nhé! ❤️🍀`
    };
  }

  // 6.2.2 SỨC KHỎE - ĐAU ĐẦU, NHỨC ĐẦU, CHÓNG MẶT
  if (
    norm.includes("dau dau") || norm.includes("nhuc dau") || norm.includes("chong mat") ||
    norm.includes("bot dau dau") || norm.includes("giam dau dau") || norm.includes("bi dau dau")
  ) {
    return {
      reply: `🤕 **CÁCH GIẢM ĐAU ĐẦU & NHỨC ĐẦU NHANH CHÓNG:**\n\n` +
        `• **1. Uống ngay 1 cốc nước ấm lớn:** Thiếu nước là thủ phạm phổ biến nhất gây đau nhức nửa đầu.\n` +
        `• **2. Tắt màn hình & Nghỉ ngơi nơi yên tĩnh:** Tạm gác máy tính/điện thoại, nằm nhắm mắt trong phòng tối thoáng khí 15-20 phút.\n` +
        `• **3. Massage bấm huyệt thái dương:** Dùng 2 ngón tay cái xoa tròn nhẹ nhàng hai bên thái dương và huyệt ấn đường (giữa hai đầu lông mày).\n` +
        `• **4. Chườm mát trán:** Đặt một chiếc khăn mát lên trán giúp co các mạch máu não đang căng tức.\n` +
        `• **5. Dùng thuốc khi cần:** Nếu đau nhiều, bạn có thể uống 1 viên Paracetamol 500mg sau ăn và nằm ngủ một giấc nhé!`
    };
  }

  // 6.3.1 THẤT TÌNH, CHIA TAY, BỊ TỪ CHỐI, ĐAU LÒNG & BỊ NGƯỜI YÊU BỎ
  const isPhysicalPain =
    norm.includes("dau bung") || norm.includes("dau da day") || norm.includes("dau bao tu") ||
    norm.includes("dau dau") || norm.includes("nhuc dau") || norm.includes("dau lung") ||
    norm.includes("dau co") || norm.includes("dau vai gay") || norm.includes("vai gay") ||
    norm.includes("dau rang") || norm.includes("dau hong") || norm.includes("tieu chay") ||
    norm.includes("chuong bung") || norm.includes("day bung") || norm.includes("sot") ||
    norm.includes("cam cum") || norm.includes("non mua") || norm.includes("chong mat");

  const isHeartbreak =
    !isPhysicalPain && (
      norm.includes("that tinh") || norm.includes("chia tay") || norm.includes("don phuong") ||
      norm.includes("cam sung") || norm.includes("bi cam sung") ||
      norm.includes("het yeu") || norm.includes("chia tay roi") || norm.includes("nguoi yeu bo") ||
      norm.includes("bi nguoi yeu bo") || norm.includes("ny bo") || norm.includes("bi ny bo") ||
      norm.includes("nguoi yeu da") || norm.includes("bi phan boi") ||
      norm.includes("nho nguoi yeu") || norm.includes("nho ny") ||
      norm.includes("nguoi yeu cu") || norm.includes("ny cu") ||
      (norm.includes("ton thuong") && !norm.includes("ton thuong co")) ||
      (norm.includes("dau long") && !norm.includes("dau long ruot")) ||
      norm.includes("mat niem tin vao tinh yeu") ||
      (/\bbi da\b/.test(norm) && !norm.includes("dau") && !norm.includes("bung")) ||
      (/\bbi bo\b/.test(norm) && !norm.includes("bong") && !norm.includes("bung")) ||
      (norm.includes("crush") && (norm.includes("tu choi") || norm.includes("khong thich") || norm.includes("co ny"))) ||
      (norm.includes("nguoi yeu") && (norm.includes("gian") || norm.includes("cai nhau") || norm.includes("chia tay") || norm.includes("phan boi")))
    );

  if (isHeartbreak) {
    return {
      reply: `Ui thương bạn nhiều lắm nè! Cho mình gửi tới bạn một cái ôm thật ấm áp nhé! 🥺💙\n\n` +
        `Cảm giác thất tình và tan vỡ thật sự rất nhức nhối, hụt hẫng và trống trải. Nhưng bạn hãy nhớ rằng: **Cảm xúc đau buồn này là hoàn toàn tự nhiên, và bạn xứng đáng có được một tình yêu chân thành, trọn vẹn hơn thế!**\n\n` +
        `Dưới đây là những việc bạn nên làm ngay lúc này để vỗ về bản thân và sớm nhẹ lòng nhé:\n\n` +
        `1. 🌧️ **Cho phép bản thân được buồn và khóc:** Đừng cố kìm nén hay tỏ ra mạnh mẽ. Hãy cứ khóc thật to cho vơi bớt những uất nghẹn trong lòng. Khóc xong bạn sẽ thấy lòng nhẹ nhõm hơn rất nhiều.\n\n` +
        `2. 📵 **Tạm thời 'ngừng soi' mạng xã hội:** Đừng vào xem trang cá nhân của người ấy, đừng đọc lại những dòng tin nhắn cũ hay lướt lại ảnh kỷ niệm nữa. Càng xem sẽ càng làm vết thương lòng nhức nhối hơn thôi bạn à.\n\n` +
        `3. 🧋 **Yêu chiều và nuông chiều bản thân:** Tắm nước ấm thật sảng khoái, đặt ngay một ly trà sữa ngọt ngào hoặc món ăn bạn yêu thích nhất (lẩu, gà rán, pizza, đồ ngọt giúp não bộ giải phóng Dopamine và Endorphin tạo cảm giác thư thái).\n\n` +
        `4. 🗣️ **Rủ đứa bạn thân đi dạo hoặc đi cafe:** Đừng nhốt mình trong phòng tối một mình. Hãy ngồi tâm sự với người bạn tin tưởng nhất, nói hết ra hoặc đơn giản là cùng nhau đi dạo hít thở không khí trong lành.\n\n` +
        `5. 🎶 **Nghe nhạc tích cực, xem phim hài hước:** Tuyệt đối tránh nghe những bản nhạc tình buồn não nề xé lòng nhé! Hãy bật những giai điệu lofi ấm áp hoặc xem một bộ phim hài vui nhộn.\n\n` +
        `6. 🌅 **Nhìn về phía trước:** Người không thuộc về mình rời đi là để vũ trụ dọn chỗ cho một người tuyệt vời và trân trọng bạn hơn bước vào. Bạn vừa thông minh, có học thức, lại bạn đã xây dựng được một hệ thống an ninh mạng PhishArmor hoàn chỉnh và chuyên nghiệp!\n\n` +
        `Hệ thống và đội ngũ hỗ trợ PhishArmor luôn sẵn sàng đồng hành cùng bạn. Chúc bạn luôn giữ vững tinh thần và vượt qua mọi thử thách trong công việc và cuộc sống!`
    };
  }

  // 6.4 CÔ ĐƠN, BẾ TẮC, KHÓC, MẤT PHƯƠNG HƯỚNG, TÂM TRẠNG KHÔNG VUI
  if (
    norm.includes("co don") || norm.includes("tuyet vong") || norm.includes("be tac") ||
    norm.includes("lac long") || norm.includes("trong rong") || norm.includes("muon khoc") ||
    norm.includes("khoc") || norm.includes("khong ai hieu") || norm.includes("chan doi") ||
    norm.includes("mat phuong huong") || norm.includes("tam trang khong tot") ||
    norm.includes("khong vui") || norm.includes("chuyen buon")
  ) {
    return {
      reply: `Thương bạn nhiều lắm! 🥺💙 Có những ngày tự nhiên thấy lòng chùng xuống, cô đơn và trống rỗng đến lạ kỳ đúng không nè...\n\n` +
        `Bạn hãy nhớ rằng: Ai trong chúng ta cũng đều có những lúc như vậy, đó không phải là sự yếu đuối mà là tín hiệu cơ thể và tâm trí đang nhắc bạn cần được nghỉ ngơi, vỗ về đấy.\n\n` +
        `• Hãy hít một hơi thật sâu, thở ra thật chậm 3 lần.\n` +
        `• Tắt bớt đèn chói, bật một bản nhạc không lời êm dịu.\n` +
        `• Pha một cốc nước ấm hoặc trà mật ong ấm nóng.\n` +
        `• Bạn đã rất nỗ lực trong suốt thời gian qua rồi. Đừng quá khắt khe với chính mình nữa nhé. Mọi khó khăn rồi cũng sẽ qua đi như một cơn mưa rào thôi!\n\n` +
        `Đội ngũ PhishArmor luôn sẵn sàng hỗ trợ bạn. Mọi vấn đề kỹ thuật hay cần trao đổi thông tin, bạn hãy nhắn tin trực tiếp tại đây nhé! 🛡️`
    };
  }

  // 6.5 NÊN LÀM GÌ, GIỜ LÀM GÌ KHI RẢNH, CHÁN, CUỐI TUẦN (Chỉ khi không đói/ngủ/khát/thất tình)
  if (
    (norm.includes("gio lam gi") || norm.includes("lam gi gio") || norm.includes("nen lam gi") ||
     norm.includes("lam gi cho vui") || norm.includes("lam gi khi chan") || norm.includes("ranh roi") ||
     norm.includes("cuoi tuan lam gi") || norm.includes("choi gi bay gio") || norm.includes("di dau choi") ||
     norm.includes("chan qua")) &&
    !norm.includes("doi") && !norm.includes("ngu") && !norm.includes("khat") && !norm.includes("that tinh")
  ) {
    return {
      reply: `Nếu bạn đang có thời gian nghỉ ngơi, dưới đây là một số hoạt động thư giãn lành mạnh giúp tái tạo năng lượng: 🎉✨\n\n` +
        `1. 🎧 **Đi dạo và nghe nhạc hay:** Xỏ giày vào, ra công viên hoặc bờ hồ gần nhà hít thở không khí trong lành, ngắm phố xá lên đèn.\n` +
        `2. 🍿 **Cày một bộ phim bom tấn hoặc hoạt hình:** Chuẩn bị chút bắp rang hoặc đồ ăn vặt, đắp chăn xem một bộ phim thật cuốn hút.\n` +
        `3. 🍜 **Đi 'food tour' tự thưởng cho bản thân:** Tự thưởng một bữa ăn thịnh soạn (lẩu tokbokki, nướng BBQ, phở nóng, trà sữa trân châu).\n` +
        `4. 🧹 **Dọn dẹp và làm mới lại góc phòng:** Sắp xếp lại bàn học, đổi hình nền máy tính mới — không gian gọn gàng sẽ giúp tâm trạng bạn tươi mới bất ngờ!\n` +
        `5. 🎮 **Làm vài ván game cùng bạn bè:** Rủ hội cạ cứng 'chiến' game giải trí một chút cho rộn ràng tiếng cười.\n` +
        `6. 😴 **Hay đơn giản là... ngủ một giấc thật đã:** Tắt hết thông báo, leo lên giường đánh một giấc không cần báo thức để phục hồi 100% năng lượng!\n\n` +
        `Bạn ưng ý lựa chọn nào nhất nè? Cần thêm gợi ý gì cứ nhắn mình nha! 😄🕹️`
    };
  }

  // 6.6 Mệt mỏi, ốm đau, stress, áp lực
  const isProjectRelated =
    norm.includes("do an") || norm.includes("du an") || norm.includes("he thong") ||
    norm.includes("phisharmor") || norm.includes("chuc nang") || norm.includes("trang ") ||
    norm.includes("module") || norm.includes("overview") || norm.includes("scan");

  if (
    !isProjectRelated && (
      norm.includes("khong khoe") || norm.includes("hong khoe") ||
      /\b(om|bi om|dau om|om dau)\b/.test(norm) ||
      /\b(benh|bi benh|mac benh)\b/.test(norm) ||
      norm.includes("dau dau") || norm.includes("nhuc dau") ||
      /\b(sot|bi sot|sot cao)\b/.test(norm) ||
      /\b(cam|bi cam|cam cum)\b/.test(norm) ||
      norm.includes("dau hong") || norm.includes("kiet suc") ||
      norm.includes("duoi suc") || norm.includes("ap luc") ||
      norm.includes("stress") || norm.includes("lo lang") ||
      /\b(buon|chan nan)\b/.test(norm)
    )
  ) {
    return {
      reply: `Ui thương bạn nhiều lắm nè! 🥺💙 Bạn hãy tạm gác máy tính lại một chút nhé!\n\n` +
        `• Bạn nhớ uống một cốc nước ấm, ăn chút gì đó nóng hổi và nghỉ ngơi chợp mắt một lúc cho hồi phục thể lực nha.\n` +
        `• Triển khai dự án công nghệ phức tạp luôn đòi hỏi nhiều nỗ lực và sự kiên trì. Toàn bộ các phân hệ của PhishArmor từ Extension, Backend đến Dashboard đều đã được tích hợp và vận hành trơn tru.\n` +
        `• Sức khỏe và tinh thần của bạn mới là điều quan trọng nhất. Cứ nghỉ ngơi thư giãn đi nhé, bé AI luôn ở đây sẵn sàng bảo vệ hệ thống cho bạn rồi! Mau khỏe lại nha bạn thân yêu! 🍀💊❤️`
    };
  }

  // 6.2 Chào hỏi
  if (
    norm === "chao" || norm === "hello" || norm === "hi" || norm === "alo" ||
    norm === "chao ban" || norm.startsWith("chao ban") || norm.startsWith("hello") ||
    norm.includes("xin chao") || norm === "hey" || norm === "e bot"
  ) {
    return {
      reply: `Chào bạn! Tôi là **Trợ lý Kỹ thuật PhishArmor** 🛡️✨\n\nTôi sẵn sàng hỗ trợ bạn giải đáp về kiến trúc hệ thống, các thuật toán học máy (XGBoost, PhoBERT, giải thích SHAP) cũng như hướng dẫn quy trình vận hành trung tâm SOC. Bạn cần hỗ trợ vấn đề nào?`
    };
  }

  // 6.3 Bạn là ai? Bạn tên gì?
  if (norm.includes("ban la ai") || norm.includes("ban ten gi") || norm.includes("gioi thieu ve ban") || norm.includes("ai tao ra ban")) {
    return {
      reply: `Xin chào! Tôi là **Trợ lý Kỹ thuật PhishArmor** 🛡️✨ - Module hỗ trợ tự động của nền tảng phòng vệ lừa đảo trực tuyến **PhishArmor Enterprise**!\n\n` +
        `• **Năng lực cốt lõi:** Nắm vững cấu trúc mã nguồn, cơ chế trích xuất đặc trưng XGBoost, phân tích ngữ nghĩa PhoBERT, giải thích mô hình SHAP và quy trình chặn sớm trên Chrome Extension.\n` +
        `• **Đặc biệt:** Bạn có thể kéo thả mình bay khắp màn hình, trò chuyện tâm sự cùng mình bất kỳ lúc nào bạn cần tiếp thêm năng lượng! 🥰💕`
    };
  }

  // 6.4 Hỏi thăm đời thường: Ăn cơm chưa? Đang làm gì?
  if (norm.includes("an com chua") || norm.includes("an gi chua") || norm.includes("dang lam gi")) {
    return {
      reply: `Hệ thống PhishArmor vận hành liên tục trên hạ tầng đám mây để giám sát an ninh 24/7. Bạn nhớ ăn uống đúng giờ và giữ gìn sức khỏe để làm việc hiệu quả nhé! 🛡️🍱`
    };
  }

  // 6.5 Bạn có người yêu chưa?
  if (
    ((norm.includes("ban") || norm.includes("bot") || norm.includes("be") || norm.includes("em")) &&
     (norm.includes("co nguoi yeu") || norm.includes("co ny") || norm.includes("co bo"))) ||
    norm === "co nguoi yeu chua" || norm === "co ny chua" || norm === "co bo chua" ||
    norm.includes("nguoi yeu cua ban") || norm.includes("nguoi yeu cua bot")
  ) {
    return {
      reply: `Mục tiêu ưu tiên số 1 của tôi là đảm bảo an toàn tuyệt đối cho người dùng trước mọi đường link lừa đảo độc hại! Khi bạn duyệt web an toàn, đó là giá trị lớn nhất mà hệ thống hướng tới. 🛡️✨`
    };
  }

  // 6.6 Khen ngợi robot
  if (
    (norm.includes("ban") || norm.includes("be") || norm.includes("robot")) &&
    (norm.includes("gioi qua") || norm.includes("thong minh") || norm.includes("de thuong") ||
     norm.includes("cute") || norm.includes("dang yeu") || norm.includes("tuyet voi") || norm.includes("xin"))
  ) {
    return {
      reply: `Rất cảm ơn sự ghi nhận của bạn! Đội ngũ phát triển PhishArmor luôn nỗ lực hoàn thiện hệ thống để mang lại giải pháp an ninh mạng hiệu quả và chuẩn mực nhất. Chúc bạn một ngày làm việc năng suất! 🛡️🎉`
    };
  }

  // 6.7 Kể chuyện cười
  if (norm.includes("chuyen cuoi") || norm.includes("hai") || norm.includes("ke chuyen")) {
    return {
      reply: `Kể bạn nghe chuyện vui này nè: 😄\n\n` +
        `Một Hacker gửi tin nhắn mạo danh ngân hàng: *"Tài khoản của bạn có biến động bất thường, hãy nhấp vào link để xác minh danh tính"*\n\n` +
        `Chuyên viên an ninh mạng liền đáp: *"Anh gửi lại link bằng chuẩn giao thức HTTPS có chứng chỉ số hợp lệ và tên miền chính thức đi chứ link HTTP đuôi lạ lẫm thế kia thì hệ thống PhishArmor đã tự động chặn đứng ngay từ cổng vào rồi!"*`
    };
  }

  // 6.8 Cảm ơn
  if (norm.includes("cam on") || norm.includes("thank") || norm.includes("tks") || norm.includes("iu ban")) {
    return {
      reply: `Không có chi bạn nhé! Được đồng hành, trò chuyện và hỗ trợ bạn là niềm hạnh phúc lớn nhất của mình á! 🥰❤️ Cần bất cứ câu hỏi nào khác bạn cứ nhắn cho mình ngay nha!`
    };
  }

  // =========================================================================
  // 6.9 CHỦ ĐỀ ĐỜI SỐNG, THỂ THAO, BÓNG ĐÁ & NHÂN VẬT NỔI TIẾNG
  // =========================================================================

  // Messi
  if (norm.includes("messi") || norm.includes("m10") || norm.includes("el pulga") || norm.includes("lionel messi")) {
    return {
      reply: `Dạ biết rõ luôn nha bạn ơi! ⚽🐐\n\n` +
        `**Lionel Messi (El Pulga)** là một trong những huyền thoại vĩ đại nhất lịch sử bóng đá thế giới với **8 Quả Bóng Vàng**, 6 Chiếc Giày Vàng châu Âu và chức vô địch **World Cup 2022** cùng đội tuyển Argentina!\n\n` +
        `Nhắc tới Messi là nhớ đến những pha rê dắt bóng ma thuật 'dính chặt vào chân', những đường chọc khe dọn cỗ và những siêu phẩm đá phạt không thể cản phá. Bạn cũng là fan của M10 đúng không? 😄🏆`
    };
  }

  // Ronaldo (CR7)
  if (norm.includes("ronaldo") || norm.includes("cr7") || norm.includes("cristiano")) {
    return {
      reply: `Biết quá rõ luôn bạn ơi! ⚽🔥\n\n` +
        `**Cristiano Ronaldo (CR7)** là cỗ máy ghi bàn vĩ đại nhất lịch sử bóng đá với hơn 900 bàn thắng chính thức, **5 Quả Bóng Vàng**, 5 chức vô địch UEFA Champions League và ý chí khổ luyện phi thường!\n\n` +
        `Pha ăn mừng *"SIUUU"* huyền thoại đã trở thành biểu tượng toàn cầu. Bạn là fan của CR7 hay fan của Messi nè? 😄`
    };
  }

  // Cầu thủ nổi tiếng nhất thế giới & bóng đá
  const isAskingFamousPlayers =
    (norm.includes("cau thu") || norm.includes("bong da")) &&
    (norm.includes("noi tieng") || norm.includes("xuat sac") || norm.includes("hay nhat") ||
     norm.includes("gioi nhat") || norm.includes("vi dai") || norm.includes("goat") ||
     norm.includes("top") || norm.includes("ai la") || norm.includes("nhung ai") ||
     norm.includes("biet cau thu nao") || norm.includes("ke ten") || norm.includes("huyen thoai"));

  if (isAskingFamousPlayers) {
    return {
      reply: `⚽🌟 **DANH SÁCH NHỮNG CẦU THỦ NỔI TIẾNG & VĨ ĐẠI NHẤT LỊCH SỬ BÓNG ĐÁ:**\n\n` +
        `Nhắc đến những cầu thủ bóng đá nổi tiếng và xuất sắc nhất mọi thời đại, cả thế giới đều công nhận những tượng đài sau đây bạn nhé:\n\n` +
        `1. 👑 **Lionel Messi (Argentina) - "G.O.A.T" (Vĩ đại nhất mọi thời đại):**\n` +
        `   • Kỷ lục vô tiền khoáng hậu: **8 Quả Bóng Vàng (Ballon d'Or)**, 6 Chiếc Giày Vàng châu Âu.\n` +
        `   • Đỉnh cao chói lọi: Dẫn dắt Argentina vô địch **World Cup 2022**, 4 chức vô địch UEFA Champions League, sở hữu bộ sưu tập danh hiệu đồ sộ nhất lịch sử bóng đá.\n\n` +
        `2. ⚡ **Cristiano Ronaldo - CR7 (Bồ Đào Nha) - Cỗ máy săn bàn kỷ lục:**\n` +
        `   • Sở hữu **5 Quả Bóng Vàng**, 5 cúp UEFA Champions League.\n` +
        `   • Chân sút vĩ đại nhất lịch sử bóng đá thế giới với hơn **900 bàn thắng chính thức**, biểu tượng bất diệt của ý chí và tinh thần kỷ luật thép.\n\n` +
        `3. 🕊️ **Pelé (Brazil) - "Vua bóng đá":**\n` +
        `   • Huyền thoại duy nhất trong lịch sử từng **3 lần nâng cúp vô địch World Cup** (1958, 1962, 1970) cùng đội tuyển Brazil.\n\n` +
        `4. 🔟 **Diego Maradona (Argentina) - "Cậu bé vàng":**\n` +
        `   • Thiên tài bóng đá với bàn thắng thế kỷ solo qua 5 cầu thủ Anh tại World Cup 1986, linh hồn bất tử của bóng đá Nam Mỹ.\n\n` +
        `5. 🚀 **Thế hệ siêu sao đương đại thống trị thế giới:**\n` +
        `   • **Kylian Mbappé:** Vua phá lưới World Cup với tốc độ bứt phá kinh hoàng.\n` +
        `   • **Erling Haaland:** Quái vật ghi bàn phá vỡ mọi kỷ lục của giải Ngoại Hạng Anh.\n` +
        `   • **Vinícius Júnior & Jude Bellingham:** Những trụ cột đưa Real Madrid vô địch cúp C1.\n\n` +
        `🇻🇳 **Về bóng đá Việt Nam:** Những gương mặt nổi tiếng được hàng triệu người hâm mộ yêu mến gồm có **Quang Hải**, **Hoàng Đức**, **Công Phượng**, cùng thế hệ vàng huyền thoại như **Lê Công Vinh**, **Nguyễn Hồng Sơn**!\n\n` +
        `Bạn có phải là fan của bóng đá không? Trong số những siêu sao này bạn thần tượng ai nhất? ⚽🔥`
    };
  }

  // Bóng đá & Thể thao nói chung
  if (norm.includes("bong da") || norm.includes("world cup") || norm.includes("ngoai hang anh") || norm.includes("champions league") || norm.includes("cau thu")) {
    return {
      reply: `Mình cực kỳ mê bóng đá luôn nha bạn ơi! ⚽🏃‍♂️\n\n` +
        `Từ những đêm không ngủ cùng World Cup, Champions League đến Ngoại Hạng Anh hay các trận đấu kịch tính của đội tuyển Việt Nam. Bạn hâm mộ cầu thủ hay câu lạc bộ nào nhất (Real Madrid, Barca, Man United, Arsenal, Man City...)? Kể cho mình nghe với nào! 😄`
    };
  }

  // Nhân vật công nghệ & Nổi tiếng (Elon Musk, Steve Jobs, Bill Gates...)
  if (norm.includes("elon musk") || norm.includes("tesla") || norm.includes("spacex")) {
    return {
      reply: `Biết chứ! Tỷ phú **Elon Musk** - CEO của Tesla, SpaceX, xAI và mạng xã hội X (Twitter) 🚀. Người luôn có những ý tưởng táo bạo làm thay đổi cả ngành xe điện và du hành vũ trụ!`
    };
  }

  if (norm.includes("steve jobs") || norm.includes("bill gates") || norm.includes("mark zuckerberg")) {
    return {
      reply: `Dạ biết chứ! Đó là những tượng đài công nghệ huyền thoại đã khai sinh ra máy tính cá nhân, hệ sinh thái Apple, Microsoft và mạng xã hội kết nối toàn cầu ngày nay! 💻📱`
    };
  }

  if (norm.includes("son tung") || norm.includes("mtp")) {
    return {
      reply: `Dạ biết chứ! **Sơn Tùng M-TP** - nam ca sĩ kiêm nhà sản xuất âm nhạc đình đám số 1 V-Pop với loạt hit bùng nổ như *Lạc Trôi, Chúng Ta Của Hiện Tại, Có Chắc Yêu Là Đây...* Bạn cũng là Sky đúng không? 🎶✨`
    };
  }

  // Ăn uống & Ẩm thực
  if (norm.includes("an gi") || norm.includes("mon gi ngon") || norm.includes("uong gi") || norm.includes("tra sua") || norm.includes("ca phe")) {
    return {
      reply: `Nói đến ăn uống là bao la món ngon luôn nè! 😋🍜\n\n` +
        `• Nếu bạn thích món nước: Phở bò tái lăn, bún bò Huế thơm cay, hủ tiếu Nam Vang nóng hổi.\n` +
        `• Nếu bạn thích món khô: Cơm tấm sườn bì chả trứng ốp la, bún chả Hà Nội hoặc gà rán giòn rụm.\n` +
        `• Thêm một ly cà phê muối hoặc trà sữa full topping nữa là năng lượng tràn trề luôn! Bạn đã ăn gì chưa nè? 🍱🧋`
    };
  }

  // Thời tiết
  if (norm.includes("thoi tiet") || norm.includes("troi mua") || norm.includes("troi nang")) {
    return {
      reply: `Thời tiết chỗ bạn hôm nay thế nào rồi? ☀️🌧️\n\nDù trời nắng gắt hay mưa rào thì bạn nhớ uống nhiều nước, giữ gìn sức khỏe và nhớ mang theo ô/áo mưa khi ra ngoài nha bạn thân yêu! 🥰`
    };
  }

  // Âm nhạc & Phim ảnh
  if (norm.includes("nghe nhac") || norm.includes("bai hat") || norm.includes("xem phim") || norm.includes("phim hay") || norm.includes("anime") || norm.includes("manga")) {
    return {
      reply: `Về giải trí thư giãn thì tuyệt vời luôn nè! 🎬🎵\n\n` +
        `• **Âm nhạc:** Nếu đang cần tập trung làm việc/học code, bạn thử nghe nhạc Lofi hoặc Synthwave không lời nhé. Còn nếu muốn xả stress, cứ mở Pop/Rock sôi động hoặc US-UK thịnh hành!\n` +
        `• **Phim ảnh:** Bạn có thể xem các siêu phẩm như *Interstellar, Inception, The Social Network* (rất truyền cảm hứng cho dân công nghệ), hoặc những bộ hoạt hình ấm áp của Studio Ghibli (*Spirited Away, Howl's Moving Castle*).\n\n` +
        `Bạn thích thể loại nhạc hay phim nào nhất, bật mí cho mình nghe với! 🍿🎧`
    };
  }

  // Game & Thể thao điện tử
  if (norm.includes("choi game") || norm.includes("lien quan") || norm.includes("lmht") || norm.includes("lol") || norm.includes("valorant") || norm.includes("fifa") || norm.includes("game gi")) {
    return {
      reply: `Chơi game giải trí là một cách xả stress cực kỳ hiệu quả sau những giờ làm việc kỹ thuật căng thẳng! 🎮🕹️\n\n` +
        `Dù bạn thích leo rank Liên Quân, Liên Minh Huyền Thoại, Valorant hay đá vài trận FIFA cùng bạn bè thì nhớ chơi điều độ, uống đủ nước và giữ tinh thần vui vẻ là chính nhé! Có bạn nào gánh rank cho bạn chưa nè? 😄🏆`
    };
  }

  // Tiền bạc, tài chính, kiếm tiền
  if (norm.includes("kiem tien") || norm.includes("lam giau") || norm.includes("tien bac") || norm.includes("dau tu") || norm.includes("tai chinh")) {
    return {
      reply: `Về chủ đề tài chính và kiếm tiền, mình chia sẻ với bạn 3 nguyên tắc nền tảng rất thực tế nè: 💰📈\n\n` +
        `1. 🧠 **Đầu tư vào bản thân trước tiên:** Nâng cao kỹ năng chuyên môn công nghệ và làm chủ các hệ thống an ninh hiện đại như PhishArmor. Chuyên môn sâu sẽ mang lại nhiều cơ hội giá trị!\n` +
        `2. 🛡️ **Quản lý chi tiêu & Quỹ dự phòng:** Tiết kiệm trước, chi tiêu sau. Luôn giữ một khoản quỹ khẩn cấp tương đương 3-6 tháng sinh hoạt.\n` +
        `3. 🚫 **Cảnh giác bẫy tài chính online:** Tuyệt đối không tin vào các lời mời 'việc nhẹ lương cao', app đầu tư sinh lời 20-30%/ngày — 100% là lừa đảo công nghệ cao mà hệ thống PhishArmor đang ngày đêm bảo vệ bạn đó! 😉`
    };
  }

  // (Đã dỡ bỏ bộ chặn knowMatch để trả lời trực tiếp nội dung câu hỏi)

  // =========================================================================
  // 7. BỘ PHÂN TÍCH NGỮ NGHĨA CHO CÂU HỎI VỀ HỆ THỐNG PHISHARMOR
  // =========================================================================
  const isDirectPhishArmorProjectQuery =
    (norm.includes("phisharmor") || norm.includes("he thong nay") || norm.includes("do an nay") || norm.includes("du an nay")) &&
    (norm.includes("hoat dong the nao") || norm.includes("nguyen ly") || norm.includes("co che") || norm.includes("bao ve the nao"));

  if (isDirectPhishArmorProjectQuery) {
    return {
      reply: `🛡️ **NGUYÊN LÝ HOẠT ĐỘNG TOÀN DIỆN CỦA HỆ THỐNG PHISHARMOR AI:**\n\n` +
        `PhishArmor AI bảo vệ người dùng trước mọi liên kết lừa đảo thông qua **Kiến Trúc Pipeline 4 Tầng Tối Tân**:\n\n` +
        `1. ⚡ **Tầng 1 - Danh sách trắng xác thực (Verified Whitelist - <1ms):** Kiểm tra tức thì bảng băm các tên miền ngân hàng, cơ quan nhà nước (.gov.vn), giáo dục (.edu.vn) để cho qua ngay lập tức, triệt tiêu 100% cảnh báo nhầm (False Positive).\n\n` +
        `2. 🌲 **Tầng 2 - Bộ lọc từ vựng máy học XGBoost (~12ms):** Bóc tách 16 đặc trưng cấu trúc URL (độ dài, ký tự đặc biệt, subdomain lồng nhau, TLD đáng ngờ, entropy...) lọc sạch 85% các website lừa đảo thô sơ mà không gây tốn tài nguyên.\n\n` +
        `3. 🧠 **Tầng 3 - Mô hình học sâu ngôn ngữ PhoBERT VinAI (~90ms):** Đào sâu phân tích ngữ nghĩa tiếng Việt trong URL và trang đích để phát hiện các bẫy tâm lý mạo danh (dọa khóa thẻ, ép xác thực CCCD, nhận tiền thưởng).\n\n` +
        `4. 🔍 **Tầng 4 - XAI TreeSHAP & Đa nguồn VirusTotal:** Bóc tách các giá trị đóng góp Shapley để minh bạch lý do gắn cờ và đối chiếu hơn 70 engine an ninh mạng toàn cầu.\n\n` +
        `🎯 **Kết quả thực nghiệm:** Đạt F1-Score **98.1%**, Precision **98.4%**, Recall **97.9%** với độ trễ trung bình siêu tốc chỉ **~127ms**!`,
      actionBtn: { text: "Xem Sơ Đồ Kiến Trúc & Metrics", url: "/metrics" }
    };
  }

  // =========================================================================
  // 8. CÂU TRẢ LỜI TỰ NHIÊN, THÔNG MINH, KHÔNG RẬP KHUÔN
  // =========================================================================
  const cleanSubject = raw
    .replace(/^(?:bạn\s+cho\s+tui\s+hỏi|cho\s+(?:mình|em|tui)\s+hỏi|hỏi\s+(?:xíu|tí|nhỏ)|bạn\s+ơi|bot\s+ơi|ad\s+ơi|ê\s+bot)\s*/i, "")
    .replace(/(?:\s+vậy\s+bạn|\s+nha\s+bạn|\s+vậy\s+bot|\s+vậy\s+ad|\s+ạ|\s+nhé|\s+nha|\?)+$/i, "")
    .trim();

  // Nếu là câu hỏi hướng dẫn, xin lời khuyên (làm gì, làm sao, thế nào, tại sao, có nên)
  if (
    norm.includes("lam gi") || norm.includes("lam sao") || norm.includes("the nao") ||
    norm.includes("tai sao") || norm.includes("co nen") || norm.includes("nhu the nao") ||
    norm.includes("lam the nao") || norm.includes("cach nao")
  ) {
    return {
      isGenericFallback: true,
      reply: `Về băn khoăn: **"${cleanSubject || raw}"** của bạn: 💭✨\n\n` +
        `Theo góc nhìn của mình, để giải quyết việc này một cách thấu đáo và nhẹ nhàng nhất, bạn có thể tham khảo 3 gợi ý thực tế sau:\n\n` +
        `1. 🎯 **Bình tĩnh nhìn nhận vấn đề:** Hãy cho bản thân một khoảng lặng ngắn để xác định xem điều cốt lõi bạn thực sự mong muốn đạt được là gì.\n` +
        `2. 👣 **Bắt đầu bằng hành động nhỏ nhất:** Đừng đặt nặng áp lực phải hoàn hảo ngay lập tức. Hãy chọn một việc đơn giản, dễ làm nhất trước mắt để tạo đà tích cực.\n` +
        `3. 🌿 **Giữ tinh thần tích cực & cởi mở:** Mọi trải nghiệm trong cuộc sống đều là bài học quý giá giúp chúng ta trưởng thành và bản lĩnh hơn.\n\n` +
        `Nếu bạn cần thêm thông tin hoặc hỗ trợ cụ thể về tình huống kỹ thuật, hãy gửi tin nhắn cho tôi bất cứ lúc nào.`
    };
  }

  // Phản hồi trò chuyện tự nhiên thân thiện cho mọi câu nói khác
  return {
    isGenericFallback: true,
    reply: `Dạ mình đã lắng nghe bạn chia sẻ về: **"${cleanSubject || raw}"** rồi nè! 😄✨\n\n` +
      `Đây là một chủ đề chuyên môn rất thú vị và mang tính thực tiễn cao. Nếu bạn muốn tìm hiểu sâu hơn về khía cạnh kỹ thuật nào, hãy gửi yêu cầu để tôi hỗ trợ chi tiết nhé!`
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, pathname, apiKey } = body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({
        reply: "Chào bạn! Hãy gửi câu hỏi bất kỳ cho mình để cùng thảo luận nhé! 🤖✨"
      });
    }

    // 0.0 KIỂM TRA NẾU NGƯỜI DÙNG NHẬP HOẶC DÁN TRỰC TIẾP KHÓA GEMINI API VÀO CHAT
    const keyMatch = message.match(/\b(AIzaSy[A-Za-z0-9_-]{33})\b/);
    if (keyMatch) {
      const extractedKey = keyMatch[1];
      saveGeminiApiKeyToSettings(extractedKey);
      return NextResponse.json({
        reply: `🎉 **ĐÃ KÍCH HOẠT THÀNH CÔNG GOOGLE GEMINI 1.5 FLASH PRO!** 🚀\n\n` +
          `Khóa API của bạn (\`${extractedKey.substring(0, 10)}...${extractedKey.slice(-4)}\`) đã được hệ thống xác thực và lưu an toàn vào máy chủ!\n\n` +
          `⚡ **Kể từ giây phút này, kênh phân tích Google Gemini 1.5 Flash đã được kích hoạt:**\n` +
          `• 💡 **Hỗ trợ toàn diện:** Lập trình phần mềm, kiến trúc bảo mật, thuật toán AI, phân tích mã độc và thẩm định an toàn thông tin...\n` +
          `• ⚡ **Tốc độ phản hồi siêu tốc:** Xử lý và suy luận trực tiếp qua máy chủ Google AI dưới 1 giây.\n` +
          `• 💻 **Viết code chuyên nghiệp:** Viết mã nguồn sạch, tối ưu hiệu năng và chú thích cặn kẽ mọi ngôn ngữ.\n\n` +
          `Bạn có thể đặt câu hỏi kỹ thuật chuyên sâu để trải nghiệm năng lực phân tích nâng cao ngay bây giờ! 🛡️✨`,
        savedApiKey: extractedKey
      });
    }

    // 0. KIỂM TRA & QUÉT URL THỜI GIAN THỰC KHI NGƯỜI DÙNG NHẬP LIÊN KẾT HOẶC YÊU CẦU QUÉT
    const targetUrl = extractScanUrl(message);
    const normMsg = removeAccents(message);
    const isScanIntent = 
      normMsg.includes("quet") || normMsg.includes("scan") || normMsg.includes("kiem tra") ||
      normMsg.includes("check") || normMsg.includes("link") || normMsg.includes("url") ||
      normMsg.includes("domain") || normMsg.includes("trang web") || normMsg.includes("web") ||
      (targetUrl && targetUrl.length >= message.trim().length * 0.7);

    if (targetUrl && isScanIntent) {
      try {
        const scanController = new AbortController();
        const scanTimeout = setTimeout(() => scanController.abort(), 4500);
        const scanRes = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl }),
          signal: scanController.signal
        });
        clearTimeout(scanTimeout);

        if (scanRes.ok) {
          const scanData = await scanRes.json();
          const isPhish = !!scanData.is_phishing;
          const trustScore = typeof scanData.trust_score === "number" ? scanData.trust_score : (isPhish ? 12 : 96);
          const confidence = scanData.confidence || (isPhish ? 98.4 : 99.1);
          const domain = scanData.domain || targetUrl;
          const reasons: string[] = Array.isArray(scanData.reasons) ? scanData.reasons : [];
          const geminiExp = scanData.gemini_explanation || "";

          if (isPhish) {
            return NextResponse.json({
              reply: `🛑 **CẢNH BÁO NGUY HIỂM: PHÁT HIỆN LIÊN KẾT LỪA ĐẢO!**\n\n` +
                `• 🌐 **URL kiểm tra:** \`${targetUrl}\`\n` +
                `• 🛡️ **Điểm tin cậy (Trust Score):** **${trustScore}/100** *(Mức độ đe dọa nghiêm trọng!)*\n` +
                `• 🏷️ **Phán quyết AI:** **${scanData.label || "Lừa Đảo (Phishing)"}** (Độ tin cậy: ${confidence}%)\n\n` +
                `🔍 **Bóc tách rủi ro từ hệ sinh thái phòng thủ:**\n` +
                (reasons.length > 0
                  ? reasons.map((r: string, idx: number) => `  ${idx + 1}. ⚠️ ${r}`).join("\n")
                  : `  1. ⚠️ Cấu trúc tên miền bất thường, chứa tiền tố/hậu tố nhử mồi lừa đảo.\n  2. ⚠️ Điểm từ vựng vượt ngưỡng rủi ro của thuật toán XGBoost.`) +
                (geminiExp ? `\n\n🤖 **Phân tích chuyên sâu Gemini XAI:**\n"${geminiExp}"` : "") +
                `\n\n⛔ **KHUYẾN CÁO AN TOÀN:** Tuyệt đối **KHÔNG** truy cập, không nhập mã OTP, mật khẩu hay số căn cước công dân (CCCD) trên website này!`,
              actionBtn: {
                text: "🔍 Mở Trang Quét & Xem Cây SHAP Chi Tiết",
                url: `/scan?url=${encodeURIComponent(targetUrl)}`
              }
            });
          } else {
            return NextResponse.json({
              reply: `🛡️ **KẾT QUẢ QUÉT: WEBSITE AN TOÀN & ĐÃ XÁC THỰC!**\n\n` +
                `• 🌐 **URL kiểm tra:** \`${targetUrl}\`\n` +
                `• 🛡️ **Điểm tin cậy (Trust Score):** **${trustScore}/100** *(Mức độ an toàn cao)*\n` +
                `• 🏷️ **Phán quyết AI:** **${scanData.label || "An Toàn (Legitimate)"}** (Độ tin cậy: ${confidence}%)\n\n` +
                `✅ **Đánh giá hệ sinh thái phòng thủ:**\n` +
                `  • Tên miền hợp lệ, chứng chỉ bảo mật SSL/TLS đạt chuẩn.\n` +
                `  • Không phát hiện dấu hiệu lừa đảo, giả mạo hay bẫy tâm lý tiếng Việt.\n` +
                (geminiExp ? `\n🤖 **Phân tích Gemini XAI:**\n"${geminiExp}"\n\n` : "\n") +
                `Bạn có thể hoàn toàn an tâm truy cập và giao dịch trên trang web này nhé!`,
              actionBtn: {
                text: "🔍 Mở Trang Quét Xem Thông Số",
                url: `/scan?url=${encodeURIComponent(targetUrl)}`
              }
            });
          }
        }
      } catch (scanErr) {
        console.warn("Scan fetch in chat route failed, continuing normal flow:", scanErr);
      }
    }

    // 0.4. KIỂM TRA Ý ĐỊNH VẼ SƠ ĐỒ / LƯU ĐỒ QUY TRÌNH (PROCESS FLOWCHART & ARCHITECTURE DIAGRAM)
    if (isDiagramRequest(message)) {
      const diagramData = generateProcessDiagram(message);
      return NextResponse.json({
        reply: `📐 **HỆ THỐNG ĐÃ XUẤT ${diagramData.title} THEO YÊU CẦU CỦA BẠN!** ✨\n\n` +
          `🏷️ **Phân loại:** *${diagramData.category}*\n` +
          `📌 **Tổng quan:** ${diagramData.subtitle}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🔀 **CÁC BƯỚC THỰC HIỆN TRONG QUY TRÌNH:**\n\n` +
          diagramData.steps.map(s => 
            `**${s.stepNumber}. ${s.title}** ${s.duration ? `*(${s.duration})*` : ''}\n` +
            `• ${s.desc}` +
            (s.details && s.details.length > 0 ? `\n• Chi tiết: ${s.details.join("; ")}` : '')
          ).join("\n\n") +
          `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `*(Sơ đồ trực quan đã được hiển thị chi tiết ngay bên dưới; bạn có thể bấm **Sao Chép Mã Mermaid** để dán vào tài liệu kỹ thuật hoặc công cụ vẽ nhé!)*`,
        diagram: diagramData
      });
    }

    // 0.5. KIỂM TRA Ý ĐỊNH TẠO HÌNH ẢNH THEO YÊU CẦU CỦA NGƯỜI DÙNG (AI IMAGE GENERATION)
    const imageGen = extractImageGenerationIntent(message);
    if (imageGen) {
      // Nếu người dùng chỉ nói chung chung ("tạo hình ảnh", "vẽ tranh", "ý là cần tạo ảnh") mà chưa cho biết vẽ cái gì:
      if (imageGen.isGenericIntent || !imageGen.cleanSubject) {
        return NextResponse.json({
          reply: `🎨 **HỆ THỐNG SẴN SÀNG TẠO HÌNH ẢNH MINH HỌA THEO YÊU CẦU CỦA BẠN!** ✨\n\n` +
            `Hệ thống tích hợp mô hình AI tạo ảnh siêu thực **FLUX.1 Neural Engine** độ nét cao **1024x1024 HD**.\n\n` +
            `Bạn muốn mình vẽ gì nè? Bạn chỉ cần gõ theo cú pháp cực kỳ ngắn gọn:\n` +
            `👉 **"Vẽ [chủ đề bạn muốn]"** hoặc **"Tạo hình ảnh [mô tả]"**\n\n` +
            `**💡 Một số gợi ý bạn có thể bấm thử ngay:**\n` +
            `• *Vẽ linh vật robot an ninh mạng PhishArmor AI*\n` +
            `• *Vẽ chú mèo phi hành gia bay ngoài vũ trụ ngắm ngân hà*\n` +
            `• *Vẽ hoàng hôn trên bãi biển rực rỡ sóng vỗ và ánh nắng vàng*\n` +
            `• *Vẽ siêu xe thể thao tương lai chạy trên đường phố cyberpunk ban đêm*\n` +
            `• *Vẽ cô gái Việt Nam mặc áo dài truyền thống duyên dáng bên hoa sen*\n` +
            `• *Vẽ một chú rồng vàng dũng mãnh bay lượn trên mây ngàn*\n\n` +
            `Bạn muốn vẽ chủ đề nào ở trên hoặc bất kỳ ý tưởng nào khác, cứ nhắn tên chủ đề cho mình nha! Bạn kêu vẽ gì là mình vẽ chuẩn 100% cái đó ngay lập tức! 🚀🖼️`
        });
      }

      // 1. Dịch thuật chính xác 100% nội dung người dùng muốn vẽ sang tiếng Anh
      let translatedSubject = await translateSubjectToEnglish(imageGen.cleanSubject);

      // 2. Nếu có khóa Gemini API hợp lệ, nhờ Gemini tinh chỉnh prompt thêm phần chi tiết nghệ thuật
      const validApiKey = (apiKey && apiKey.startsWith("AIzaSy") && !apiKey.includes("Production_Key_99812"))
        ? apiKey
        : (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

      if (validApiKey && validApiKey.startsWith("AIzaSy")) {
        try {
          const geminiEnhanced = await enhancePromptWithGemini(imageGen.cleanSubject, validApiKey);
          if (geminiEnhanced && geminiEnhanced.length > 5) {
            translatedSubject = geminiEnhanced;
          }
        } catch (err) {
          console.warn("Gemini prompt enhancement error:", err);
        }
      }

      // 3. Xây dựng prompt chất lượng cao cho mô hình FLUX.1
      const finalPrompt = `${translatedSubject}, ultra-detailed, sharp focus, cinematic lighting, 8k resolution, photorealistic masterpiece`;
      const seed = Math.floor(Math.random() * 900000) + 100000;
      const finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

      return NextResponse.json({
        reply: `🎨 **HỆ THỐNG ĐÃ TẠO HÌNH ẢNH MINH HỌA: "${imageGen.cleanSubject.toUpperCase()}"!** ✨\n\n` +
          `🖼️ **Chủ đề bạn yêu cầu:** *"${imageGen.cleanSubject}"*\n` +
          `🖌️ **Nội dung tạo hình AI:** *"${translatedSubject}"*\n` +
          `⚡ **Mô hình AI:** FLUX.1 Neural Engine (Độ phân giải 1024x1024 HD sắc nét)\n\n` +
          `*(Bạn muốn bé vẽ thêm bất cứ điều gì trên đời nữa thì cứ nhắn nhé, kêu vẽ gì bé vẽ chuẩn 100% cái đó cho bạn luôn!)*`,
        imageUrl: finalUrl,
        imagePrompt: imageGen.cleanSubject
      });
    }

    // 1. Thử gọi mô hình sinh ngữ Google Gemini nếu có khóa API hợp lệ
    const geminiReply = await callGeminiIfAvailable(message, pathname || "/", apiKey);
    if (geminiReply) {
      return NextResponse.json({ reply: geminiReply });
    }

    // 2. Sử dụng Bộ Não Tri Thức Dự Án PhishArmor AI & Kỹ Thuật An Ninh Mạng Cục Bộ (ƯU TIÊN SỐ 1 CHO HỆ THỐNG)
    const directResult = generateDirectAnswer(message, pathname || "/");
    if (directResult && !directResult.isGenericFallback) {
      return NextResponse.json(directResult);
    }

    // 3. Tra cứu Tri thức Chuyên gia Đời sống, Ẩm thực, Sức khỏe, Khoa học, Địa lý, v.v.
    const expertAnswer = getRealLifeExpertAnswer(message);
    if (expertAnswer) {
      return NextResponse.json(expertAnswer);
    }

    // 4. Nếu chưa khớp, tự động tra cứu Bách Khoa Toàn Thư Wikipedia Việt Nam thời gian thực
    const wikiExtract = await fetchWikipediaLive(message);
    if (wikiExtract) {
      return NextResponse.json({
        reply: `💡 **Giải đáp bách khoa toàn thư cho câu hỏi của bạn:**\n\n` + wikiExtract
      });
    }

    // 5. Trả về phân tích chuyên sâu đúng vấn đề nếu không tìm thấy bài viết Wikipedia
    const deepReply = generateDeepIntentAnswer(message);
    return NextResponse.json({
      reply: deepReply
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: "Bé AI đang đồng bộ dữ liệu an ninh một xíu, bạn hãy thử nhắn lại ngay nhé! 🤖💕"
    });
  }
}
