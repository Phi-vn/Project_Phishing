# Hệ Thống Phát Hiện Website Phishing Bằng Trí Tuệ Nhân Tạo

Đây là mã nguồn cho Đồ án tốt nghiệp: **Xây dựng hệ thống phát hiện và cảnh báo website lừa đảo (Phishing) sử dụng Machine Learning**.

## Cấu trúc thư mục

- `ml-training/`: Chứa mã nguồn chuẩn bị dữ liệu, trích xuất đặc trưng và huấn luyện mô hình (Random Forest).
- `backend/`: Chứa mã nguồn API bằng FastAPI, làm nhiệm vụ load mô hình dự đoán và cung cấp endpoint cho Extension.
- `extension/`: Tiện ích mở rộng cài đặt trên trình duyệt Chrome/Edge để bảo vệ người dùng theo thời gian thực.
- `dashboard/`: Trang web quản trị xây dựng bằng Next.js để theo dõi và thống kê.
- `docs/`: Chứa các tài liệu, báo cáo đồ án và sơ đồ.

## Hướng dẫn cài đặt và chạy hệ thống

### 1. Khởi chạy Backend (API)
Mở Terminal, di chuyển vào thư mục `backend` và chạy lệnh sau:
```bash
cd backend
pip install fastapi uvicorn pydantic scikit-learn joblib
uvicorn main:app --reload
```
Server sẽ chạy tại: `http://127.0.0.1:8000`

### 2. Cài đặt Extension
1. Mở Chrome, truy cập `chrome://extensions/`.
2. Bật **Developer mode** (Chế độ dành cho nhà phát triển).
3. Nhấp vào **Load unpacked** (Tải tiện ích đã giải nén).
4. Chọn thư mục `extension` trong dự án.

### 3. Khởi chạy Dashboard
Mở Terminal mới, di chuyển vào thư mục `dashboard` và chạy lệnh sau:
```bash
cd dashboard
npm install
npm run dev
```
Truy cập trang web tại: `http://localhost:3000`
