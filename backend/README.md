# PhishArmor AI - Backend Service

Phân hệ máy chủ dịch vụ lõi (Core Backend Engine) của nền tảng an ninh mạng **PhishArmor Enterprise**, chịu trách nhiệm xử lý dự đoán website lừa đảo theo thời gian thực, lưu trữ nhật ký an ninh và cung cấp các giao diện lập trình ứng dụng (RESTful API & WebSocket) cho Dashboard và Browser Extension.

---

## 1. Công Nghệ & Nền Tảng

* **Ngôn ngữ**: Python 3.12+
* **Framework**: FastAPI (Xử lý bất đồng bộ Asynchronous ASGI hiệu năng cao)
* **Web Server**: Uvicorn ASGI Server
* **Cơ sở dữ liệu**: SQLite (`phisharmor.db`) kết nối qua SQLAlchemy ORM
* **Mô hình AI**: Scikit-Learn (`phishing_model.pkl`), Joblib, NumPy, Pandas
* **Giải thích mô hình (XAI)**: SHAP (SHapley Additive exPlanations) & Tích hợp Google Gemini 1.5 Flash

---

## 2. Các Phân Hệ Chức Năng Chính

### 2.1. Động Cơ Trích Xuất 16 Đặc Trưng URL (```textract_features`)
Khi nhận một URL từ client, backend thực hiện phân rã cú pháp URL và trích xuất vector 16 chiều mà không cần tải mã nguồn website, đảm bảo độ trễ siêu tốc ($\le 15\text{ms}$):
1. `url_length`: Độ dài tổng thể của chuỗi URL.
2. `domain_length`: Độ dài tên miền gốc.
3. `having_ip_address`: Nhận diện URL sử dụng địa chỉ IPv4/IPv6 thay cho domain.
4. `count_dots`: Đếm số lượng dấu chấm trong URL.
5. `count_hyphens`: Đếm số ký tự gạch nối `-` (thường dùng trong tấn công mạo danh).
6. `count_at_rate`: Nhận diện ký tự `@` dùng để che giấu URL đích.
7. `count_double_slash`: Kiểm tra sự xuất hiện bất thường của dấu `//`.
8. `count_subdomains`: Số cấp tên miền phụ (subdomain).
9. `prefix_suffix`: Kiểm tra tên miền có chứa tiền tố/hậu tố nối bằng `-`.
10. `is_https`: Trạng thái sử dụng giao thức HTTPS.
11. `shortening_service`: Nhận diện các dịch vụ rút gọn link (bit.ly, tinyurl...).
12. `has_suspicious_words`: Kiểm tra sự xuất hiện của các từ khóa nhử mồi: `login`, `verify`, `banking`, `secure`, `update`.

### 2.2. Cơ Chế Giải Thích Mô Hình (XAI Engine)
* Định lượng phần trăm đóng góp của từng đặc trưng vào kết quả phán đoán thông qua trọng số SHAP.
* Gọi mô hình Gemini để sinh giải thích tường minh bằng tiếng Việt tự nhiên khi quản trị viên phân tích sâu trên giao diện SOC.

### 2.3. Quản Trị Cơ Sở Dữ Liệu
Hệ thống sử dụng cơ sở dữ liệu quan hệ với các bảng chính:
* `scan_records`: Lưu trữ lịch sử tất cả các URL được kiểm tra từ Extension và Dashboard.
* `feedback_reports`: Tiếp nhận báo cáo phản hồi từ người dùng (False Positive / False Negative) phục vụ cơ chế Active Learning.
* `model_versions`: Lưu trữ lịch sử và chỉ số đánh giá của các phiên bản mô hình AI.

---

## 3. Cấu Trúc Thư Mục Phân Hệ

```text
backend/
├── main.py               # Ứng dụng FastAPI chính, định tuyến REST và kênh WebSocket (/ws)
├── database.py           # Kết nối cơ sở dữ liệu SQLAlchemy SQLite và quản lý session
├── models.py             # Định nghĩa schema bảng: scan_records, feedback_reports, model_versions
├── phishing_model.pkl    # Tệp nhị phân chứa trọng số mô hình AI đã huấn luyện sẵn (Scikit-Learn/Joblib)
├── phisharmor.db         # Tệp cơ sở dữ liệu SQLite lưu trữ dữ liệu an ninh thực tế
├── settings.json         # Tệp cấu hình tham số hệ thống động (ngưỡng bảo vệ, danh sách an toàn/chặn)
├── requirements.txt      # Danh mục thư viện Python phụ thuộc (FastAPI, Uvicorn, SQLAlchemy, Scikit-learn...)
├── Dockerfile            # Cấu hình container hóa Docker cho môi trường Backend
├── .env.example          # Tệp mẫu thiết lập biến môi trường (Gemini API Key, CORS origins)
└── README.md             # Tài liệu thuyết minh kỹ thuật phân hệ (File này)
```

---

## 4. Danh Mục API Điểm Cuối (Endpoints Summary)

| Phương thức | Đường dẫn | Chức năng | Đối tượng sử dụng |
|---|---|---|---|
| `POST` | `/predict` | Dự đoán URL nhanh (< 15ms) | Browser Extension |
| `POST` | `/api/scan` | Phân tích URL chuyên sâu kèm trọng số XAI | SOC Dashboard |
| `GET` | `/stats` | Thống kê KPI an ninh mạng tổng thể | SOC Dashboard |
| `GET` | `/history` | Lấy danh sách lịch sử kiểm toán URL | SOC Dashboard |
| `DELETE` | `/history` | Xóa nhật ký kiểm toán | SOC Dashboard |
| `GET` / `POST` | `/api/feedback` | Quản lý báo cáo phản hồi người dùng | SOC Dashboard & Ext |
| `POST` | `/api/feedback/{id}/action` | Phê duyệt gán nhãn Safe / Phishing | SOC Dashboard |
| `POST` | `/api/feedback/{id}/retrain`| Đẩy mẫu vào hàng đợi nạp dữ liệu | SOC Dashboard |
| `GET` / `POST` | `/api/settings` | Đọc và ghi cấu hình ngưỡng bảo vệ | SOC Dashboard |
| `GET` | `/api/training/status` | Xem tiến độ & danh sách Checkpoints | SOC Dashboard |
| `POST` | `/api/training/start` | Kích hoạt phiên huấn luyện lại (Retrain) | SOC Dashboard |
| `POST` | `/api/training/deploy` | Triển khai phiên bản mô hình mới | SOC Dashboard |
| `WS` | `/ws` | Kênh WebSocket phát sóng cảnh báo trực tiếp | SOC Dashboard |

---

## 5. Hướng Dẫn Cài Đặt & Khởi Chạy

### 5.1. Khởi tạo môi trường ảo Python
```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường:
# Trên Windows:
.\venv\Scripts\activate
# Trên Linux/macOS:
source venv/bin/activate
```

### 5.2. Cài đặt các thư viện phụ thuộc
```bash
pip install -r requirements.txt
```

### 5.3. Nạp dữ liệu mẫu ban đầu (Database Seed)
Từ thư mục gốc dự án, chạy kịch bản nạp dữ liệu chuẩn hóa:
```bash
python ../scripts/seed_database.py
```

### 5.4. Khởi chạy máy chủ API
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

* **Swagger UI (Tài liệu API tương tác)**: `http://127.0.0.1:8000/docs`
* **Redoc UI**: `http://127.0.0.1:8000/redoc`
* **Kiểm tra trạng thái máy chủ (Healthcheck)**: `http://127.0.0.1:8000/api/stats`
