# ĐẶC TẢ KỸ THUẬT GIAO DIỆN LẬP TRÌNH ỨNG DỤNG (API SPECIFICATION)
### Đề tài: Hệ thống phòng chống tấn công lừa đảo trực tuyến PhishArmor AI
*Tài liệu kỹ thuật đặc tả chuẩn RESTful API & WebSocket hệ sinh thái an ninh mạng PhishArmor Enterprise*

---

## 📌 1. Thông Tin Chung & Địa Chỉ Truy Cập

Hệ thống máy chủ **PhishArmor Backend** hoạt động trên nền tảng **FastAPI (Python 3.12)** và **Uvicorn ASGI Server**:
* **Địa chỉ máy chủ cục bộ (Base URL)**: `http://127.0.0.1:8000`
* **Giao diện tương tác trực tiếp Swagger UI**: `http://127.0.0.1:8000/docs`
* **Giao diện tài liệu học thuật Redoc**: `http://127.0.0.1:8000/redoc`
* **Quy chuẩn dữ liệu trao đổi**: JSON (JavaScript Object Notation), mã hóa ký tự UTF-8.

---

## 🔐 2. Nhóm API Xác Thực Danh Tính Quản Trị (Authentication)

Hệ thống áp dụng chuẩn bảo mật **OAuth2 Password Bearer** kết hợp mã hóa chữ ký số **JSON Web Token (JWT - HS256)** với thời hạn hiệu lực 30 phút.

### 2.1. Đăng nhập hệ thống & Cấp phát JWT
* **Endpoint**: `POST /login`
* **Content-Type**: `application/x-www-form-urlencoded`
* **Tham số biểu mẫu**:
  * `username` (string, bắt buộc): Email quản trị viên (Mặc định: `admin@phisharmor.ai`)
  * `password` (string, bắt buộc): Mật khẩu (Mặc định: `123`)
* **Mã phản hồi thành công (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBwaGlzaGFybW9yLmFpIiwiZXhwIjoxNzYyMDAwMDAwfQ...",
  "token_type": "bearer",
  "role": "Super Admin"
}
```

---

## ⚡ 3. Nhóm API Dự Đoán & Mổ Xẻ URL (Inference Engine)

### 3.1. Dự đoán an toàn URL thời gian thực (Dành cho Extension & Kiểm tra nhanh)
* **Endpoint**: `POST /predict`
* **Mô tả**: Tiếp nhận URL từ Browser Extension hoặc Dashboard, bóc tách 16 đặc trưng và trả kết quả phân loại trong thời gian $\le 15\text{ms}$.
* **Request Body**:
```json
{
  "url": "http://vietcombank-login-otp-security.net/auth"
}
```
* **Mã phản hồi thành công (200 OK)**:
```json
{
  "url": "http://vietcombank-login-otp-security.net/auth",
  "domain": "vietcombank-login-otp-security.net",
  "is_phishing": true,
  "confidence": 98.7,
  "trust_score": 12,
  "label": "Lừa đảo (Phishing)",
  "reasons": [
    "Cấu trúc tên miền chứa tiền tố/hậu tố nhại thương hiệu ngân hàng (vietcombank)",
    "Xuất hiện các từ khóa nhạy cảm cao: login, otp, security",
    "Không sử dụng chứng chỉ mã hóa SSL hợp lệ"
  ],
  "features": {
    "length_url": 48,
    "length_domain": 35,
    "count_dot": 1,
    "count_hyphen": 3,
    "count_slash": 3,
    "has_ip": 0,
    "subdomain_count": 0,
    "is_https": 0,
    "suspicious_count": 3
  },
  "gemini_explanation": "Website có dấu hiệu mạo danh cổng ngân hàng số Vietcombank nhằm mục đích chiếm đoạt mật khẩu và mã xác thực OTP."
}
```

### 3.2. Mổ xẻ URL chuyên sâu kèm phân tích XAI đa chiều (Dành cho SOC Analyst)
* **Endpoint**: `POST /api/scan`
* **Mô tả**: Trả về chi tiết 16 đặc trưng toán học, phân tích điểm Radar 5 chiều và trọng số giải thích SHAP phục vụ trang `/scan`.
* **Request Body**: `{"url": "https://..."}`
* **Response (200 OK)**: Trả về đối tượng JSON gồm điểm Radar (`url_length`, `entropy`, `dots`, `special_chars`, `keywords`), trọng số SHAP và danh sách các vi phạm kỹ thuật.

---

## 📊 4. Nhóm API Giám Sát & Thống Kê SOC (Analytics & Audit)

### 4.1. Lấy chỉ số tổng hợp KPI hệ thống
* **Endpoint**: `GET /stats`
* **Response (200 OK)**:
```json
{
  "total_scanned": 1420,
  "phishing_detected": 412,
  "suspicious_count": 138,
  "safe_count": 870,
  "accuracy_rate": 98.42,
  "avg_latency_ms": 12.4
}
```

### 4.2. Lấy dữ liệu biểu đồ xu hướng tấn công (Threat Trend)
* **Endpoint**: `GET /stats/trend`
* **Query Parameters**:
  * `range` (string, tùy chọn): `24h` (mặc định), `7d`, `30d`.
* **Response (200 OK)**: Mảng các điểm dữ liệu gồm nhãn thời gian, số lượng đe dọa bị chặn, cảnh báo và an toàn.

### 4.3. Truy xuất nhật ký kiểm toán URL (Audit Logs)
* **Endpoint**: `GET /history`
* **Query Parameters**:
  * `limit` (integer): Số bản ghi tối đa (mặc định: 50).
  * `offset` (integer): Vị trí bắt đầu phân trang (mặc định: 0).
  * `filter` (string): `all`, `safe`, `suspicious`, `malicious`.
  * `search` (string): Từ khóa tìm kiếm domain, IP hoặc URL.
* **Xóa nhật ký**:
  * `DELETE /history`: Xóa toàn bộ lịch sử quét.
  * `DELETE /history/{record_id}`: Xóa một bản ghi cụ thể theo mã ID.

---

## 📥 5. Nhóm API Học Chủ Động & Duyệt Phản Hồi (Active Learning Loop)

### 5.1. Lấy danh sách hàng đợi phản hồi người dùng
* **Endpoint**: `GET /api/feedback`
* **Mô tả**: Danh sách các báo cáo do người dùng gửi từ Extension (báo chặn nhầm hoặc báo bỏ sót).

### 5.2. Gửi báo cáo phản hồi mới từ người dùng
* **Endpoint**: `POST /api/feedback`
* **Request Body**:
```json
{
  "url": "http://vneid-dinhdanh-kichhoat.top",
  "type": "false_negative",
  "user_comment": "Link giả mạo ứng dụng VNeID lừa nạp tiền",
  "reporter_email": "nguoidung@gmail.com"
}
```

### 5.3. Thao tác phê duyệt & Đẩy vào hàng đợi huấn luyện
* **Endpoint**: `POST /api/feedback/{report_code}/action`
  * Body: `{"action": "safe" | "phishing"}`
* **Endpoint**: `POST /api/feedback/{report_code}/retrain`
  * Đẩy trực tiếp mẫu đã duyệt vào hàng đợi nạp dữ liệu Active Learning.
* **Endpoint**: `POST /api/feedback/batch-approve`
  * Phê duyệt tự động toàn bộ hàng đợi đang chờ xử lý theo phân tích rủi ro.

---

## 🚀 6. Nhóm API Quản Trị Huấn Luyện Học Máy (MLOps Engine)

### 6.1. Kiểm tra trạng thái huấn luyện & Danh sách Checkpoints
* **Endpoint**: `GET /api/training/status`
* **Response (200 OK)**:
```json
{
  "current_version": "v1.2",
  "current_f1": "98.4%",
  "current_latency": "120ms",
  "current_arch": "PhoBERT + XGBoost",
  "pending_retrain_samples": 3,
  "models": [
    {
      "version": "v1.3",
      "date": "28/10/2026",
      "f1": "98.7%",
      "latency": "115ms",
      "arch": "PhoBERT + XGBoost",
      "status": "Sẵn sàng",
      "active": false,
      "samples_count": 580450
    },
    {
      "version": "v1.2",
      "date": "07/10/2026",
      "f1": "98.4%",
      "latency": "120ms",
      "arch": "PhoBERT + XGBoost",
      "status": "Đang dùng",
      "active": true,
      "samples_count": 580200
    }
  ]
}
```

### 6.2. Kích hoạt quy trình huấn luyện lại (Retrain Pipeline)
* **Endpoint**: `POST /api/training/start`
* **Request Body**:
```json
{
  "learning_rate": "0.08",
  "max_depth": "6",
  "epochs": "3",
  "n_estimators": "150",
  "subsample": "0.85",
  "k_folds": "5"
}
```
* **Response (200 OK)**:
```json
{
  "status": "success",
  "new_version": "v1.4",
  "f1": "98.8%",
  "precision": "98.6%",
  "recall": "99.0%",
  "accuracy": "98.8%",
  "latency": "112ms",
  "total_samples": 580450,
  "train_samples": 464360,
  "val_samples": 116090,
  "retrain_samples_used": 3,
  "message": "Huấn luyện thành công mô hình v1.4 với F1-Score 98.8%!"
}
```

### 6.3. Triển khai nóng phiên bản mô hình (Hot-swap Deploy)
* **Endpoint**: `POST /api/training/deploy`
* **Request Body**: `{"version": "v1.4"}`
* **Mô tả**: Kích hoạt phiên bản mới phục vụ toàn bộ các lượt quét tiếp theo mà không cần tắt máy chủ.

---

## ⚙️ 7. Nhóm API Cài Đặt Hệ Thống & Kiểm Tra Tích Hợp

* **Endpoint**: `GET /api/settings`: Đọc toàn bộ cấu hình ngưỡng bảo vệ và danh sách tên miền.
* **Endpoint**: `POST /api/settings`: Cập nhật cấu hình hệ thống (`settings.json`).
* **Endpoint**: `POST /api/settings/reset`: Khôi phục các thiết lập bảo mật về trạng thái khuyến nghị.
* **Endpoint**: `POST /api/settings/test-gemini`: Gửi yêu cầu kiểm tra tính hợp lệ của Google Gemini API Key.
* **Endpoint**: `GET /api/dataset`: Tải tệp dữ liệu huấn luyện lớn `phisharmor_dataset_580k.csv` về máy.

---

## 🔄 8. Kênh Truyền Thông Thời Gian Thực (WebSocket Event Stream)

* **Endpoint**: `WS /ws`
* **Giao thức chuẩn**: WebSocket RFC 6455
* **Mô tả**: Kênh kết nối hai chiều liên tục giữa Backend và SOC Dashboard. Khi có bất kỳ lượt quét nào từ tiện ích Chrome hoặc khi mô hình huấn luyện xong, máy chủ sẽ tự động phát sóng (Broadcast) sự kiện xuống các màn hình giám sát để cập nhật giao diện thời gian thực mà không cần tải lại trang.

* **Cấu trúc gói tin quét mới (`NEW_SCAN_EVENT`)**:
```json
{
  "event": "NEW_SCAN_EVENT",
  "id": 1421,
  "url": "http://shopee-khuyenmai-triankhachhang.xyz",
  "domain": "shopee-khuyenmai-triankhachhang.xyz",
  "is_phishing": true,
  "confidence": 97.5,
  "trust_score": 15,
  "timestamp": "2026-11-03 22:50:00"
}
```

* **Cấu trúc gói tin cập nhật mô hình (`model_updated`)**:
```json
"model_updated"
```
Dashboard nhận sự kiện này sẽ tự động làm mới bảng Model Checkpoints và thẻ chỉ số KPI.
