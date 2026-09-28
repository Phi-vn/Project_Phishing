# DÀN Ý BÁO CÁO ĐỒ ÁN TỐT NGHIỆP

**Tên đề tài:** Xây dựng hệ thống phát hiện và cảnh báo website lừa đảo (Phishing) sử dụng Machine Learning.

## LỜI CẢM ƠN
## TÓM TẮT ĐỒ ÁN
## MỤC LỤC
## DANH MỤC HÌNH ẢNH / BẢNG BIỂU / TỪ VIẾT TẮT

---

## CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI
1.1. Lý do chọn đề tài (Tình hình lừa đảo mạng hiện nay, sự cần thiết của tiện ích cảnh báo).
1.2. Mục tiêu của đồ án.
1.3. Đối tượng và phạm vi nghiên cứu (Tập trung vào trích xuất đặc trưng Lexical của URL).
1.4. Bố cục quyển báo cáo.

## CHƯƠNG 2: CƠ SỞ LÝ THUYẾT
2.1. Tổng quan về Phishing (Định nghĩa, các hình thức tấn công phổ biến, dấu hiệu nhận biết).
2.2. Kỹ thuật nhận dạng Phishing (Dựa trên danh sách đen Blacklist vs Dựa trên AI).
2.3. Tổng quan về Machine Learning (Giới thiệu các thuật toán: Random Forest, Decision Tree...).
2.4. Công nghệ sử dụng trong đồ án:
- Ngôn ngữ Python & Thư viện Scikit-Learn.
- Framework Backend: FastAPI.
- Công nghệ Frontend/Dashboard: Next.js.
- Kiến trúc Chrome Extension (Manifest V3).

## CHƯƠNG 3: XÂY DỰNG HỆ THỐNG PHÁT HIỆN PHISHING
3.1. Phân tích yêu cầu hệ thống (Yêu cầu chức năng, phi chức năng).
3.2. Sơ đồ kiến trúc tổng thể của hệ thống.
3.3. Xây dựng mô hình Học máy:
- 3.3.1. Thu thập dữ liệu (Dataset).
- 3.3.2. Tiền xử lý dữ liệu và Trích xuất đặc trưng (Feature Extraction - 13 đặc trưng).
- 3.3.3. Huấn luyện mô hình (Training).
- 3.3.4. Đánh giá mô hình (Confusion Matrix, Accuracy).
3.4. Xây dựng Backend API (Quy trình nhận request và xử lý Whitelist/Model).
3.5. Xây dựng Extension cảnh báo cho người dùng.
3.6. Xây dựng Dashboard quản trị.

## CHƯƠNG 4: TRIỂN KHAI VÀ ĐÁNH GIÁ KẾT QUẢ
4.1. Môi trường triển khai và công cụ cài đặt.
4.2. Giao diện và hướng dẫn sử dụng chức năng (Chụp ảnh màn hình Extension, Dashboard).
4.3. Kịch bản kiểm thử (Test cases) với các trang web thật và giả.
4.4. Đánh giá hiệu năng và độ trễ của hệ thống.

## CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
5.1. Kết quả đạt được (Ưu điểm).
5.2. Hạn chế của hệ thống.
5.3. Hướng phát triển trong tương lai (Thêm phân tích mã nguồn HTML, phân tích Domain Age...).

## TÀI LIỆU THAM KHẢO
