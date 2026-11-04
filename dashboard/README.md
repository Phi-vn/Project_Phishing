# PhishArmor AI - Security Operations Center (SOC) Dashboard

Phân hệ giao diện điều hành và giám sát an ninh mạng trung tâm của nền tảng an ninh mạng **PhishArmor Enterprise**. Được xây dựng trên nền tảng **Next.js 16 (App Router)** và **Tailwind CSS**, cung cấp cho chuyên viên an ninh mạng (SOC Analyst) bức tranh toàn cảnh về các cuộc tấn công lừa đảo trực tuyến (Phishing), công cụ mổ xẻ mã độc thời gian thực và quản trị mô hình học máy.

---

## 1. Tính Năng & Các Phân Hệ Chức Năng

Giao diện được thiết kế theo chuẩn trung tâm điều hành SOC với các module chuyên biệt:

* **Tổng Quan Điều Hành (`/overview`)**:
  * Thống kê KPI an ninh mạng: Tổng lượt quét, số đe dọa đã chặn, độ trễ trung bình (~12ms) và điểm F1-Score (98.1%).
  * Biểu đồ xu hướng tấn công (Threat Analytics) theo mốc thời gian 24h, 7 ngày và 30 ngày.
  * Luồng giám sát trực tiếp (Live Threats Stream) nhận dữ liệu từ WebSocket Backend.
* **Mổ Xẻ & Quét Chuyên Sâu (`/scan`)**:
  * Phân tích URL theo yêu cầu hoặc chọn từ bộ URL mẫu giả mạo ngân hàng (Vietcombank, MB, Techcombank).
  * Biểu đồ Radar 5 chiều định lượng độ an toàn.
  * Bóc tách 16 đặc trưng kỹ thuật và giải thích trọng số mô hình AI bằng biểu đồ SHAP XAI.
* **Nhật Ký & Kiểm Toán An Ninh (`/history`)**:
  * Lưu trữ và tra cứu lịch sử các lượt quét URL kèm nhãn an toàn, điểm tin cậy và địa chỉ IP.
  * Hỗ trợ tìm kiếm theo tên miền, lọc theo trạng thái và xuất dữ liệu ra tệp Excel (.xls) hoặc Báo cáo PDF.
* **Đánh Giá & Đối Chuẩn Mô Hình (`/metrics`)**:
  * Trực quan hóa kiến trúc Pipeline 4 tầng (Whitelist → XGBoost 16 đặc trưng → PhoBERT → XAI SHAP).
  * Bảng đối chuẩn hiệu năng thực nghiệm giữa các thuật toán: Decision Tree, Random Forest, SVM, XGBoost, PhoBERT và Ensemble.
  * Ma trận nhầm lẫn (Confusion Matrix) trên tập kiểm thử thực tế 3,000 mẫu.
* **Tái Huấn Luyện Chủ Động (`/training`)**:
  * Sơ đồ quy trình 4 giai đoạn chuẩn MLOps: Nạp dữ liệu ➔ Trích xuất 16 đặc trưng ➔ Tối ưu cây quyết định XGBoost ➔ Thẩm định độc lập & đóng gói Checkpoint.
  * Tinh chỉnh siêu tham số: Tốc độ học (Learning Rate), Max Depth, Số cây (n_estimators), Tỷ lệ lấy mẫu con (Subsample), Hàm mất mát Cross-Entropy.
  * Terminal nhật ký thực thi thời gian thực in chi tiết Log-Loss và Ma trận nhầm lẫn qua từng Epoch.
  * Triển khai nóng (Hot-swap Deploy) phiên bản mô hình mới chỉ với 1 click chuột mà không cần tắt máy chủ.
* **Duyệt Phản Hồi Mẫu (`/feedback`)**:
  * Cơ chế Human-in-the-loop: Tiếp nhận báo cáo cảnh báo sai (False Positive) từ tiện ích Chrome của người dùng.
  * Xem xét bằng chứng, gắn nhãn lại và phê duyệt nạp vào tập dữ liệu huấn luyện tiếp theo.
* **Cài Đặt Cấu Hình Hệ Thống (`/settings`)**:
  * Tinh chỉnh ngưỡng nhạy cảm phát hiện (Detection Sensitivity Threshold: 0.50 - 0.90).
  * Quản lý danh sách Whitelist / Blacklist, cấu hình API Key (Google Gemini, VirusTotal) và Webhook thông báo.
* **Màn Hình Chặn Cảnh Báo (`/block`)**:
  * Giao diện can thiệp đỏ được gửi tới người dùng khi truy cập trang web lừa đảo, kèm lý do AI phân tích và khuyến cáo an toàn.
* **Xuất Báo Cáo Điều Hành (`/export`)**:
  * Bản báo cáo tổng hợp dành cho Giám đốc An ninh thông tin (CISO) và Ban Giám đốc / Cơ quan kiểm toán an ninh, hỗ trợ in ấn định dạng chuẩn khổ giấy A4.

---

## 2. Công Nghệ Sử Dụng

* **Framework**: Next.js 16.3 (React 19, TypeScript)
* **Styling**: Tailwind CSS, Lucide React Icons
* **Trực quan hóa dữ liệu**: Chart.js, Recharts, SVG Radar Chart
* **Truyền thông mạng**: Fetch API (REST), WebSocket Client
* **Quản trị trạng thái**: React Hooks, LocalStorage Synchronization

---

## 3. Cấu Trúc Thư Mục Phân Hệ

```text
dashboard/
├── app/
│   ├── page.tsx              # Trang chủ: Trình mô phỏng giao diện Popup Tiện ích (Popup Simulator)
│   ├── layout.tsx            # Bố cục khung toàn trang (Sidebar + Header + Robot Assistant)
│   ├── globals.css           # Cấu hình Tailwind CSS và style toàn cục
│   ├── ThemeInit.tsx         # Khởi tạo chủ đề Light/Dark mode không nhấp nháy
│   ├── overview/page.tsx     # Bảng điều khiển SOC Dashboard trung tâm
│   ├── scan/page.tsx         # Trang phân tích URL và giải thích AI SHAP
│   ├── history/page.tsx      # Trang nhật ký kiểm toán và xuất báo cáo
│   ├── metrics/page.tsx      # Trang kiến trúc và ma trận nhầm lẫn AI
│   ├── training/page.tsx     # Trang huấn luyện Active Learning
│   ├── feedback/page.tsx     # Trang duyệt báo cáo người dùng (Human-in-the-loop)
│   ├── settings/page.tsx     # Trang thiết lập tham số hệ thống
│   ├── block/page.tsx        # Trang cảnh báo can thiệp đỏ
│   ├── export/page.tsx       # Báo cáo PDF CISO Executive
│   ├── onboarding/page.tsx   # Hướng dẫn cài đặt tiện ích Chrome
│   ├── login/page.tsx        # Cổng đăng nhập xác thực quản trị viên
│   └── api/                  # Next.js API Routes trung gian
│       ├── chat/             # API Trợ lý Kỹ thuật AI (RobotAssistant)
│       ├── dataset/          # API phục vụ tải tập dữ liệu mẫu CSV
│       └── extension/        # API tải gói zip tiện ích trình duyệt
├── components/
│   ├── Sidebar.tsx           # Thanh điều hướng phân hệ
│   └── RobotAssistant.tsx    # Trợ lý Kỹ thuật PhishArmor hỗ trợ giải đáp và tra cứu
├── public/                   # Tài nguyên tĩnh
│   └── downloads/            # Tệp nén tiện ích PhishArmor_Extension_v1.4.2.zip
├── package.json              # Danh mục gói phụ thuộc npm (React 19, Tailwind CSS)
├── Dockerfile                # Đóng gói container Docker cho Dashboard
├── .env.example              # Biến môi trường mẫu cho Next.js
└── tsconfig.json             # Cấu hình TypeScript
```

---

## 4. Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 4.1. Yêu cầu môi trường
* Node.js phiên bản `18.18.0` hoặc cao hơn (khuyên dùng Node.js 20 LTS).
* Trình quản lý gói `npm` (đi kèm Node.js).

### 4.2. Khởi chạy dự án
```bash
# 1. Di chuyển vào thư mục dashboard
cd dashboard

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```

Ứng dụng web sẽ chạy tại địa chỉ: **`http://localhost:3000`**

### 4.3. Đóng gói bản Production
```bash
# Kiểm tra lỗi cú pháp và đóng gói
npm run build

# Khởi chạy bản đóng gói chính thức
npm run start
```
