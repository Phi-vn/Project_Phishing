// =============================================================================
// BỘ NÃO TẠO SƠ ĐỒ & QUY TRÌNH TRỰC QUAN CHUYÊN SÂU (DIAGRAM & FLOWCHART ENGINE)
// =============================================================================

export interface ProcessDiagramStep {
  stepNumber: number;
  title: string;
  desc: string;
  badge: string;
  type: "start" | "process" | "decision" | "alert" | "success";
  duration?: string;
  details?: string[];
}

export interface ProcessDiagramData {
  title: string;
  subtitle: string;
  category: string;
  mermaidCode: string;
  steps: ProcessDiagramStep[];
}

function normalizeVi(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function isDiagramRequest(raw: string): boolean {
  const norm = normalizeVi(raw);
  return (
    norm.includes("quy trinh") ||
    norm.includes("so do") ||
    norm.includes("luu do") ||
    norm.includes("flowchart") ||
    norm.includes("diagram") ||
    norm.includes("cac buoc thuc hien") ||
    norm.includes("cac giai doan") ||
    norm.includes("luong xu ly") ||
    (norm.includes("ve ") && (norm.includes("trinh") || norm.includes("so do") || norm.includes("luu do") || norm.includes("kien truc")))
  );
}

export function generateProcessDiagram(message: string): ProcessDiagramData {
  const norm = normalizeVi(message);

  // 1. QUY TRÌNH PHÁT HIỆN & PHÒNG THỦ PHISHING 4 TẦNG (PHISHARMOR PIPELINE)
  if (
    norm.includes("phisharmor") || norm.includes("phishing") || norm.includes("lua dao") ||
    norm.includes("4 tang") || norm.includes("pipeline") || norm.includes("phat hien") ||
    norm.includes("kien truc")
  ) {
    return {
      title: "QUY TRÌNH 4 TẦNG PHÒNG THỦ PHISHING THỜI GIAN THỰC (PHISHARMOR AI)",
      subtitle: "Kiến trúc phòng thủ tích hợp AI đa tầng với độ trễ tối ưu ~127ms và F1-Score đạt 98.1%",
      category: "An Ninh Mạng & Trí Tuệ Nhân Tạo",
      mermaidCode: `graph TD
  A["🌐 Người dùng nhập/nhấp vào liên kết (URL)"] --> B["⚡ TẦNG 1: Whitelist & Cache (< 1ms)"]
  B -->|"✅ Khớp danh sách trắng"| Z1["🟢 Cho phép truy cập ngay"]
  B -->|"❓ Chưa xác định"| C["📊 TẦNG 2: XGBoost Feature Extraction (~12ms)"]
  C -->|"Bóc tách 16 đặc trưng từ vựng URL"| D["🤖 TẦNG 3: PhoBERT Vietnamese NLP (~90ms)"]
  D -->|"Quét bẫy tâm lý mạo danh tiếng Việt"| E["🌲 TẦNG 4: Explainable AI SHAP & VirusTotal (~25ms)"]
  E --> F{"⚖️ ĐÁNH GIÁ ĐIỂM TRUST SCORE"}
  F -->|"❌ Trust Score < 40 (Nguy hiểm)"| G["🛑 KÍCH HOẠT CHẶN: Điều hướng sang trang /block"]
  F -->|"✅ Trust Score >= 80 (An toàn)"| Z2["🟢 Xác nhận an toàn & Cho phép truy cập"]
  G --> H["📋 Ghi nhật ký vào Hệ thống Lịch sử (/history)"]`,
      steps: [
        {
          stepNumber: 1,
          title: "Khởi Đầu: Nhận Diện Đường Dẫn (URL Capture)",
          desc: "Bắt sự kiện điều hướng khi người dùng nhấp vào link trên trình duyệt Chrome hoặc dán vào ô quét trên Dashboard.",
          badge: "Khởi Đầu",
          type: "start",
          duration: "< 1ms",
          details: ["Bắt sự kiện qua Chrome webNavigation API", "Lọc các giao thức hợp lệ http:// và https://"]
        },
        {
          stepNumber: 2,
          title: "Tầng 1: Tra Cứu Danh Sách Trắng & Bộ Nhớ Đệm (Whitelist & Cache)",
          desc: "Đối chiếu tên miền với cơ sở dữ liệu các cổng dịch vụ công, ngân hàng uy tín đã xác thực và bảng hash cache gần nhất.",
          badge: "Tầng 1",
          type: "decision",
          duration: "< 1ms",
          details: ["Nếu khớp Whitelist: Cho phép duyệt ngay mà không tốn chi phí chạy AI", "Nếu chưa có: Chuyển sang Tầng 2"]
        },
        {
          stepNumber: 3,
          title: "Tầng 2: Trích Xuất 16 Đặc Trưng Từ Vựng (XGBoost Classifier)",
          desc: "Phân tích cấu trúc kỹ thuật của URL: Độ dài chuỗi, số lượng dấu chấm, cờ IP, tên thương hiệu ở subdomain, từ khóa nhử mồi (verify, secure, otp).",
          badge: "Tầng 2",
          type: "process",
          duration: "~12ms",
          details: ["Tốc độ tính toán siêu tốc", "Gán nhãn điểm bất thường ban đầu dựa trên mô hình cây quyết định"]
        },
        {
          stepNumber: 4,
          title: "Tầng 3: Hiểu Ngữ Nghĩa Tiếng Việt Chuyên Sâu (PhoBERT VinAI)",
          desc: "Mô hình ngôn ngữ RoBERTa tiếng Việt phân tích ngữ cảnh thao túng tâm lý: hối thúc khẩn cấp ('khóa tài khoản sau 24h'), mồi chài tài chính ('nhận thưởng 500k').",
          badge: "Tầng 3",
          type: "process",
          duration: "~90ms",
          details: ["Bắt trọn từ lóng và biến thể tiếng Việt", "Khắc phục triệt để điểm yếu đếm ký tự đơn thuần của AI truyền thống"]
        },
        {
          stepNumber: 5,
          title: "Tầng 4: Minh Bạch Hóa AI (XAI SHAP) & Tra Cứu Đa Nguồn (VirusTotal)",
          desc: "Tính toán giá trị đóng góp biên (Shapley values) giải thích tại sao website bị coi là nguy hiểm + Đối chiếu cơ sở dữ liệu mối đe dọa toàn cầu.",
          badge: "Tầng 4",
          type: "process",
          duration: "~25ms",
          details: ["Trực quan hóa cột đỏ/xanh rõ ràng", "Tạo sự tin cậy tuyệt đối cho Ban Giám Đốc và Chuyên viên kiểm toán an ninh mạng"]
        },
        {
          stepNumber: 6,
          title: "Kết Thúc: Phán Quyết & Hành Động Bảo Vệ",
          desc: "Nếu rủi ro cao: Chuyển hướng tự động sang màn hình đỏ cảnh báo nguy hiểm (/block); Nếu an toàn: Cho phép người dùng duyệt web bình thường.",
          badge: "Phán Quyết",
          type: "alert",
          duration: "Tức thì",
          details: ["Lưu vết vào nhật ký /history để tra cứu và xuất báo cáo", "Phát cảnh báo âm thanh và pop-up bảo vệ"]
        }
      ]
    };
  }

  // 2. QUY TRÌNH HỒI SINH TIM PHỔI (CPR) & SƠ CỨU CẤP CỨU
  if (norm.includes("cpr") || norm.includes("so cuu") || norm.includes("ngung tim") || norm.includes("cap cuu")) {
    return {
      title: "SƠ ĐỒ QUY TRÌNH CẤP CỨU HỒI SINH TIM PHỔI (CPR) THEO CHUẨN Y KHOA",
      subtitle: "Quy trình 5 bước vàng cứu sống nạn nhân ngưng tim ngưng thở trước khi xe cấp cứu đến",
      category: "Y Tế & Kỹ Năng Sơ Cứu",
      mermaidCode: `graph TD
  A["🔍 BƯỚC 1: Đánh giá an toàn & Tri giác"] --> B{"Nạn nhân có phản ứng / Còn thở không?"}
  B -->|"❌ Không phản ứng, ngừng thở"| C["🚨 BƯỚC 2: Gọi cấp cứu 115 & Tìm máy sốc tim AED"]
  B -->|"✅ Còn thở"| Z1["Đặt nạn nhân ở tư thế hồi sức nghiêng an toàn"]
  C --> D["💓 BƯỚC 3: Ép tim ngoài lồng ngực (30 lần)"]
  D -->|"Vị trí giữa ngực, sâu 5-6cm, tốc độ 100-120 l/p"| E["🫁 BƯỚC 4: Khai thông đường thở & Thổi ngạt (2 hơi)"]
  E --> F{"BƯỚC 5: Kiểm tra tuần hoàn sau 5 chu kỳ (2 phút)"}
  F -->|"Chưa có mạch"| D
  F -->|"Nạn nhân thở lại"| Z2["🟢 Giữ ấm & Chờ nhân viên y tế bàn giao"]`,
      steps: [
        {
          stepNumber: 1,
          title: "Bước 1: Quan Sát Hiện Trường & Kiểm Tra Tri Giác",
          desc: "Đảm bảo môi trường xung quanh an toàn. Vỗ nhẹ vào hai vai nạn nhân và gọi lớn: 'Bạn có sao không?'. Quan sát lồng ngực trong 10 giây.",
          badge: "Đánh Giá",
          type: "start",
          duration: "10 giây"
        },
        {
          stepNumber: 2,
          title: "Bước 2: Kích Hoạt Hệ Thống Cấp Cứu Khẩn Cấp (Gọi 115)",
          desc: "Chỉ định rõ một người cụ thể: 'Anh áo xanh gọi ngay 115 và tìm máy sốc tim tự động AED mang lại đây!'.",
          badge: "Báo Động",
          type: "alert",
          duration: "Ngay lập tức"
        },
        {
          stepNumber: 3,
          title: "Bước 3: Ép Tim Ngoài Lồng Ngực Đúng Kỹ Thuật (30 Lần)",
          desc: "Đặt gót bàn tay vào giữa xương ức, đan tay kia lên. Ép thẳng góc bằng trọng lượng thân trên sâu 5-6 cm, tần số 100-120 lần/phút.",
          badge: "Ép Tim",
          type: "process",
          duration: "30 lần ép"
        },
        {
          stepNumber: 4,
          title: "Bước 4: Khai Thông Đường Thở & Thổi Ngạt (2 Lần)",
          desc: "Nâng cằm, ngửa đầu, bịt mũi nạn nhân. Áp miệng thổi ngạt liên tục 2 hơi vừa đủ để nhìn thấy lồng ngực phập phồng.",
          badge: "Hô Hấp",
          type: "process",
          duration: "2 hơi thở"
        },
        {
          stepNumber: 5,
          title: "Bước 5: Lặp Lại Chu Kỳ 30:2 & Bàn Giao Y Tế",
          desc: "Tiếp tục liên tục tỷ lệ 30 ép tim : 2 thổi ngạt. Không ngừng ép tim quá 10 giây cho đến khi nạn nhân tỉnh hoặc xe cứu thương tới.",
          badge: "Duy Trì",
          type: "success",
          duration: "Liên tục"
        }
      ]
    };
  }

  // 3. QUY TRÌNH NGHIÊN CỨU PHÁT TRIỂN & CHUẨN HÓA MÔ HÌNH BẢO MẬT DOANH NGHIỆP
  if (norm.includes("do an") || norm.includes("khoa luan") || norm.includes("nghien cuu khoa hoc") || norm.includes("diem a")) {
    return {
      title: "SƠ ĐỒ QUY TRÌNH NGHIÊN CỨU & TRIỂN KHAI GIẢI PHÁP AN NINH MẠNG CHUẨN DOANH NGHIỆP",
      subtitle: "Quy trình chuẩn hóa 6 bước bảo đảm tính thực tiễn, tính mới và phương pháp luận khoa học chặt chẽ",
      category: "Phương Pháp Luận & Nghiên Cứu Kỹ Thuật",
      mermaidCode: `graph TD
  A["🎯 GIAI ĐOẠN 1: Xác định bài toán (Problem Statement)"] --> B["📚 GIAI ĐOẠN 2: Tổng quan tài liệu & Nghiên cứu lý thuyết"]
  B --> C["🧹 GIAI ĐOẠN 3: Thu thập, Tiền xử lý dữ liệu & Chuẩn bị Dataset"]
  C --> D["⚙️ GIAI ĐOẠN 4: Thiết kế kiến trúc mô hình & Huấn luyện (AI Model)"]
  D --> E["📊 GIAI ĐOẠN 5: Thực nghiệm, Đối chuẩn (Benchmarking) & Minh bạch XAI"]
  E --> F{"Đạt chỉ số kỳ vọng? (F1 > 95%, Trễ < 200ms)"}
  F -->|"❌ Chưa đạt"| D
  F -->|"✅ Đạt chuẩn"| G["🏆 GIAI ĐOẠN 6: Đóng gói sản phẩm thực tế, Nghiệm thu & Triển khai"]`,
      steps: [
        {
          stepNumber: 1,
          title: "Giai Đoạn 1: Xác Định Bài Toán & Nỗi Đau Thực Tế (Problem Statement)",
          desc: "Đề tài phải giải quyết một vấn đề nhức nhối trong đời sống (như PhishArmor bảo vệ người dùng trước lừa đảo mạo danh ngân hàng). Tránh đề tài sáo rỗng.",
          badge: "Khởi Điểm",
          type: "start",
          duration: "Tuần 1 - 2"
        },
        {
          stepNumber: 2,
          title: "Giai Đoạn 2: Khảo Sát Tài Liệu Quốc Tế (Literature Review)",
          desc: "Đọc ít nhất 10-15 bài báo khoa học chuẩn IEEE/ACM để hiểu rõ giới hạn của các công trình đi trước và xác định điểm mới (Novelty) của dự án phát triển.",
          badge: "Nghiên Cứu",
          type: "process",
          duration: "Tuần 3 - 4"
        },
        {
          stepNumber: 3,
          title: "Giai Đoạn 3: Thu Thập & Tiền Xử Lý Dữ Liệu (Data Engineering)",
          desc: "Xây dựng tập dữ liệu đa dạng mẫu (cân bằng nhãn an toàn/lừa đảo), làm sạch ký tự rác, chuẩn hóa unicode và phân chia tập Train/Val/Test (70/15/15).",
          badge: "Dữ Liệu",
          type: "process",
          duration: "Tuần 5 - 6"
        },
        {
          stepNumber: 4,
          title: "Giai Đoạn 4: Xây Dựng & Huấn Luyện Mô Hình Kết Hợp (Ensemble AI)",
          desc: "Kết hợp mô hình từ vựng nhanh (XGBoost) với mô hình ngữ nghĩa sâu (PhoBERT VinAI) để phát huy tối đa ưu điểm và bù trừ khuyết điểm.",
          badge: "Phát Triển",
          type: "process",
          duration: "Tuần 7 - 9"
        },
        {
          stepNumber: 5,
          title: "Giai Đoạn 5: Thực Nghiệm Khách Quan & Minh Bạch Hóa (Benchmarking & XAI)",
          desc: "So sánh công bằng với các thuật toán cơ sở (Random Forest, SVM, Naive Bayes), kiểm thử chỉ số F1-Score, Ma trận nhầm lẫn và tích hợp SHAP giải thích nguyên nhân.",
          badge: "Thực Nghiệm",
          type: "decision",
          duration: "Tuần 10 - 11"
        },
        {
          stepNumber: 6,
          title: "Giai Đoạn 6: Hoàn Thiện Sản Phẩm, Viết Khóa Luận & Bảo Vệ Tự Tin",
          desc: "Triển khai Dashboard trực quan (Next.js) + Tiện ích Chrome Extension thực chiến; chuẩn bị slide súc tích và trình bày tự tin theo mô hình STAR.",
          badge: "Về Đích",
          type: "success",
          duration: "Tuần 12 - 14"
        }
      ]
    };
  }

  // 4. QUY TRÌNH XỬ PHẠT NỒNG ĐỘ CỒN THEO NGHỊ ĐỊNH 100/2019 & 123/2021
  if (norm.includes("nong do con") || norm.includes("nghi dinh 100") || norm.includes("csgt") || norm.includes("giao thong")) {
    return {
      title: "SƠ ĐỒ QUY TRÌNH KIỂM TRA & XỬ PHẠT NỒNG ĐỘ CỒN (NGHỊ ĐỊNH 100 & 123)",
      subtitle: "Quy trình thực thi pháp luật an toàn giao thông theo chuẩn thông tư của Bộ Công an",
      category: "Pháp Luật & An Toàn Giao Thông",
      mermaidCode: `graph TD
  A["🛑 BƯỚC 1: CSGT ra hiệu lệnh dừng phương tiện an toàn"] --> B["💨 BƯỚC 2: Đo định tính bằng phễu cảm biến hơi thở"]
  B -->|"❌ Không có cồn (Đèn xanh)"| Z1["🟢 Cảm ơn & Mời người dân tiếp tục hành trình"]
  B -->|"⚠️ Phát hiện cồn (Đèn đỏ)"| C["🧪 BƯỚC 3: Đo định lượng bằng ống thổi tiệt trùng mới"]
  C --> D["📋 BƯỚC 4: In phiếu kết quả & Xác định khung xử phạt"]
  D -->|"Khung 1: < 0.25 mg/l"| E1["Phạt 2-3tr (Xe máy) / 6-8tr (Ô tô) | Tước GPLX 10-12th"]
  D -->|"Khung 2: 0.25 - 0.4 mg/l"| E2["Phạt 4-5tr (Xe máy) / 16-18tr (Ô tô) | Tước GPLX 16-18th"]
  D -->|"Khung 3: > 0.4 mg/l (Kịch khung)"| E3["Phạt 6-8tr (Xe máy) / 30-40tr (Ô tô) | Tước GPLX 22-24th"]
  E1 & E2 & E3 --> F["🔒 BƯỚC 5: Lập biên bản vi phạm & Niêm phong tạm giữ xe 7 ngày"]`,
      steps: [
        {
          stepNumber: 1,
          title: "Bước 1: Ra Hiệu Lệnh Dừng Phương Tiện",
          desc: "Cảnh sát giao thông sử dụng gậy chỉ huy và đèn tín hiệu hướng dẫn phương tiện tấp vào lề đường tại khu vực kiểm soát an toàn.",
          badge: "Dừng Xe",
          type: "start"
        },
        {
          stepNumber: 2,
          title: "Bước 2: Kiểm Tra Nhanh Định Tính (Phễu Cảm Biến)",
          desc: "Người lái xe chỉ cần đếm số 1-2-3 hoặc nói câu ngắn vào đầu phễu cảm biến cách miệng 5cm mà không cần ngậm miệng vào máy.",
          badge: "Định Tính",
          type: "process"
        },
        {
          stepNumber: 3,
          title: "Bước 3: Đo Định Lượng Chính Xác Bằng Ống Thổi Mới",
          desc: "Nếu máy định tính báo có cồn, tài xế được cấp 1 ống thổi nhựa tiệt trùng bọc túi nylon mới 100% để đo chính xác chỉ số mg/l khí thở.",
          badge: "Định Lượng",
          type: "process"
        },
        {
          stepNumber: 4,
          title: "Bước 4: In Phiếu Kết Quả Đo & Đối Chiếu Khung Xử Phạt",
          desc: "Máy đo in phiếu kết quả tại chỗ gồm: Ngày giờ, nồng độ cồn, chữ ký của người vi phạm và cán bộ thực thi.",
          badge: "Phân Khung",
          type: "decision"
        },
        {
          stepNumber: 5,
          title: "Bước 5: Lập Biên Bản Vi Phạm & Tạm Giữ Phương Tiện",
          desc: "Tiến hành lập biên bản hành chính, tước Giấy phép lái xe có thời hạn và niêm phong tạm giữ phương tiện 7 ngày để ngăn ngừa nguy cơ tai nạn.",
          badge: "Xử Lý",
          type: "alert"
        }
      ]
    };
  }

  // 5. QUY TRÌNH TUYỂN DỤNG, THỬ VIỆC & KÝ HỢP ĐỒNG LAO ĐỘNG (LUẬT LAO ĐỘNG 2019)
  if (norm.includes("tuyen dung") || norm.includes("thu viec") || norm.includes("hop dong lao dong") || norm.includes("viec lam")) {
    return {
      title: "SƠ ĐỒ QUY TRÌNH ỨNG TUYỂN, THỬ VIỆC & KÝ HỢP ĐỒNG LAO ĐỘNG",
      subtitle: "Quy trình tuyển dụng và quyền lợi người lao động chuẩn mực theo Bộ luật Lao động 2019",
      category: "Nghề Nghiệp & Luật Lao Động",
      mermaidCode: `graph TD
  A["📄 BƯỚC 1: Ứng tuyển với CV chuẩn ATS (Công thức XYZ)"] --> B["🎙️ BƯỚC 2: Phỏng vấn hành vi & Kỹ thuật (Mô hình STAR)"]
  B --> C{"Kết quả phỏng vấn?"}
  C -->|"❌ Chưa phù hợp"| Z1["Gửi thư cảm ơn & Lưu hồ sơ cho cơ hội sau"]
  C -->|"✅ Trúng tuyển"| D["📝 BƯỚC 3: Thỏa thuận Offer & Ký Hợp đồng Thử việc"]
  D -->|"Lương thử việc >= 85% lương chính thức"| E["💼 BƯỚC 4: Tiến hành thử việc (Tối đa 60 ngày ĐH)"]
  E --> F{"Đánh giá hết hạn thử việc"}
  F -->|"Đạt yêu cầu"| G["🎉 BƯỚC 5: Ký HĐLĐ chính thức & Tham gia BHXH 10.5%"]
  F -->|"Không đạt"| Z2["Chấm dứt thử việc (Thông báo trước ít nhất 3 ngày)"]`,
      steps: [
        {
          stepNumber: 1,
          title: "Bước 1: Viết & Nộp CV Chuẩn ATS",
          desc: "Áp dụng công thức XYZ của Google (Hoàn thành X, đo lường bằng kết quả Y, thông qua giải pháp Z) để vượt qua bộ lọc tự động.",
          badge: "Hồ Sơ",
          type: "start"
        },
        {
          stepNumber: 2,
          title: "Bước 2: Phỏng Vấn Tuyển Dụng Theo Mô Hình S.T.A.R",
          desc: "Trả lời mạch lạc theo 4 yếu tố: Bối cảnh (Situation), Mục tiêu (Task), Hành động kỹ thuật (Action), và Kết quả định lượng (Result).",
          badge: "Phỏng Vấn",
          type: "process"
        },
        {
          stepNumber: 3,
          title: "Bước 3: Nhận Offer & Ký Hợp Đồng Thử Việc",
          desc: "Đảm bảo mức lương thử việc ít nhất bằng 85% mức lương chính thức; thời gian thử việc tối đa 60 ngày với trình độ CĐ/ĐH.",
          badge: "Thỏa Thuận",
          type: "process"
        },
        {
          stepNumber: 4,
          title: "Bước 4: Thực Hiện Thử Việc & Báo Cáo Tiến Độ",
          desc: "Tham gia dự án thực tế, thích nghi với văn hóa công ty và thể hiện năng lực giải quyết vấn đề.",
          badge: "Thử Thách",
          type: "decision"
        },
        {
          stepNumber: 5,
          title: "Bước 5: Ký Hợp Đồng Lao Động Chính Thức & Quyền Lợi BHXH",
          desc: "Ký hợp đồng có thời hạn/không thời hạn, hưởng 100% lương, đóng BHXH/BHYT/BHTN (10.5%), hưởng 12 ngày phép năm và lương OT.",
          badge: "Chính Thức",
          type: "success"
        }
      ]
    };
  }

  // 6. QUY TRÌNH PHÁT TRIỂN PHẦN MỀM AGILE / SCRUM
  if (norm.includes("agile") || norm.includes("scrum") || norm.includes("sprint") || norm.includes("phan mem")) {
    return {
      title: "SƠ ĐỒ VÒNG ĐỜI PHÁT TRIỂN PHẦN MỀM CHUẨN AGILE / SCRUM",
      subtitle: "Quy trình lặp Sprint 2 tuần tối ưu tốc độ phát hành và phản hồi khách hàng liên tục",
      category: "Kỹ Thuật Phần Mềm & Quản Trị Dự Án",
      mermaidCode: `graph TD
  A["📋 Product Backlog: Danh sách User Stories ưu tiên"] --> B["📅 Sprint Planning: Chọn mục tiêu & Task cho Sprint 2 tuần"]
  B --> C["🚀 SPRINT EXECUTION (Code, Test, Review liên tục)"]
  C --> D["☕ Daily Standup: Họp 15 phút đầu ngày chia sẻ tiến độ"]
  D --> C
  C --> E["🎯 Sprint Review & Demo: Trình diễn tính năng thực tế cho PO"]
  E --> F["🔍 Sprint Retrospective: Rút kinh nghiệm cải tiến quy trình"]
  F -->|"Lặp lại chu kỳ mới"| B`,
      steps: [
        {
          stepNumber: 1,
          title: "Bước 1: Quản Lý Product Backlog",
          desc: "Product Owner thu thập yêu cầu từ người dùng, viết User Stories và sắp xếp thứ tự ưu tiên theo giá trị kinh doanh.",
          badge: "Backlog",
          type: "start"
        },
        {
          stepNumber: 2,
          title: "Bước 2: Lập Kế Hoạch Sprint (Sprint Planning)",
          desc: "Đội ngũ phát triển họp cùng PO, ước lượng Story Points và cam kết khối lượng công việc hoàn thành trong chu kỳ 2 tuần.",
          badge: "Planning",
          type: "process"
        },
        {
          stepNumber: 3,
          title: "Bước 3: Triển Khai Code & Họp Hàng Ngày (Daily Scrum)",
          desc: "Lập trình viên viết mã nguồn, kiểm thử đơn vị (Unit Test), code review và họp 15 phút mỗi sáng trả lời 3 câu hỏi cốt lõi.",
          badge: "Execution",
          type: "process"
        },
        {
          stepNumber: 4,
          title: "Bước 4: Trình Diễn Sản Phẩm (Sprint Review & Demo)",
          desc: "Demo phần mềm hoạt động thực tế trước khách hàng và các bên liên quan để nhận phản hồi ngay lập tức.",
          badge: "Demo",
          type: "decision"
        },
        {
          stepNumber: 5,
          title: "Bước 5: Rút Kinh Nghiệm Cải Tiến (Sprint Retrospective)",
          desc: "Toàn đội nhìn nhận: Điểm gì làm tốt? Điểm gì còn tắc nghẽn? Hành động cụ thể nào cần cải tiến trong Sprint tiếp theo?",
          badge: "Retro",
          type: "success"
        }
      ]
    };
  }

  // 7. QUY TRÌNH TỰ ĐỘNG CHUYÊN SÂU CHO MỌI CHỦ ĐỀ KHÁC (DYNAMIC FLOW GENERATOR)
  const cleanTopic = message
    .replace(/^(?:(?:tôi|tui|mình|em)\s+(?:muốn|nhờ)\s+(?:bạn\s+)?|bạn\s+ơi\s+|bot\s+ơi\s+|bé\s+ơi\s+|bạn\s+)?/i, "")
    .replace(/^(?:hãy\s+)?(?:giúp\s+(?:tôi|tui|mình)\s+|cho\s+(?:tôi|tui|mình)\s+)?(?:vẽ\s+|tạo\s+|thiết\s+kế\s+)?(?:sơ\s+đồ\s+quy\s+trình|sơ\s+đồ|quy\s+trình|lưu\s+đồ|flowchart|diagram)\s*/i, "")
    .replace(/(?:\s+(?:cho\s+tôi|cho\s+tui|cho\s+mình|nha\s+bạn|nhe\s+bạn|nhé\s+bạn|đi\s+bạn|với\s+bạn|được\s+không|nha|nhé|nè|ạ|\?))+$/i, "")
    .trim() || "Thực Hiện Nhiệm Vụ";

  return {
    title: `SƠ ĐỒ QUY TRÌNH: ${cleanTopic.toUpperCase()}`,
    subtitle: `Quy trình thực hiện bài bản và logic từng bước cho chủ đề "${cleanTopic}"`,
    category: "Quy Trình & Hướng Dẫn Thực Hiện",
    mermaidCode: `graph TD
  A["🎯 BƯỚC 1: Chuẩn bị & Xác định mục tiêu (${cleanTopic})"] --> B["🔍 BƯỚC 2: Thu thập thông tin & Khảo sát tiền khả thi"]
  B --> C["⚙️ BƯỚC 3: Triển khai thực hiện các tác vụ trọng tâm"]
  C --> D{"⚖️ BƯỚC 4: Kiểm tra chất lượng & Đánh giá rủi ro"}
  D -->|"Chưa đạt yêu cầu"| C
  D -->|"Đạt tiêu chuẩn"| E["🎉 BƯỚC 5: Nghiệm thu, Tối ưu hóa & Hoàn tất quy trình"]`,
    steps: [
      {
        stepNumber: 1,
        title: `Bước 1: Chuẩn Bị & Xác Định Mục Tiêu Cốt Lõi`,
        desc: `Xác định rõ ràng kết quả cần đạt được, nguồn lực hiện có và mốc thời gian hoàn thành cho "${cleanTopic}".`,
        badge: "Chuẩn Bị",
        type: "start"
      },
      {
        stepNumber: 2,
        title: "Bước 2: Khảo Sát & Thu Thập Thông Tin Tiền Khả Thi",
        desc: "Nghiên cứu các quy định, điều kiện bắt buộc và chuẩn bị đầy đủ hồ sơ/công cụ cần thiết.",
        badge: "Khảo Sát",
        type: "process"
      },
      {
        stepNumber: 3,
        title: "Bước 3: Triển Khai Thực Hiện Tác Vụ Cốt Lõi",
        desc: "Tiến hành thực thi các bước chuyên môn theo đúng trình tự kỹ thuật và quy chuẩn quy định.",
        badge: "Thực Thi",
        type: "process"
      },
      {
        stepNumber: 4,
        title: "Bước 4: Kiểm Định Chất Lượng & Phân Nhánh Quyết Định",
        desc: "Rà soát kỹ lưỡng các tiêu chí, kiểm tra lỗi và khắc phục các điểm chưa hoàn thiện trước khi chuyển bước tiếp theo.",
        badge: "Kiểm Tra",
        type: "decision"
      },
      {
        stepNumber: 5,
        title: "Bước 5: Nghiệm Thu, Đóng Gói & Đưa Vào Vận Hành",
        desc: "Hoàn tất các thủ tục nghiệm thu, lưu trữ hồ sơ và bàn giao kết quả cuối cùng.",
        badge: "Hoàn Tất",
        type: "success"
      }
    ]
  };
}
