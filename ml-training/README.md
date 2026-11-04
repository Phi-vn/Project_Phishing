# PhishArmor AI - Machine Learning Pipeline

Phân hệ nghiên cứu thực nghiệm, trích xuất đặc trưng và huấn luyện mô hình học máy (Machine Learning) phát hiện website lừa đảo trong hệ thống an ninh mạng **PhishArmor Enterprise**.

---

## 1. Nguồn Dữ Liệu & Quy Mô Thực Nghiệm

Tập dữ liệu nghiên cứu được tổng hợp từ các nguồn an ninh mạng uy tín toàn cầu và danh bạ tên miền xếp hạng cao, tổng cộng **580,200 mẫu URL**:

* **URL Lừa đảo (Phishing - Nhãn 1)**: 289,800 mẫu được thu thập từ:
  * [PhishTank](https://phishtank.org/) (Cơ sở dữ liệu lừa đảo mở được xác thực bởi cộng đồng an ninh mạng).
  * [OpenPhish](https://openphish.com/) (Dữ liệu nguồn tin tình báo mối đe dọa trực tuyến).
  * [APWG](https://apwg.org/) (Anti-Phishing Working Group).
* **URL Hợp pháp (Benign - Nhãn 0)**: 290,400 mẫu được thu thập từ:
  * [Alexa Top 1M Domains](https://www.alexa.com)
  * [Tranco List](https://tranco-list.eu/) (Danh sách tên miền nghiên cứu khoa học được kiểm chuẩn).
  * Cổng thông tin cơ quan nhà nước và ngân hàng thương mại tại Việt Nam.

Tập dữ liệu được phân chia theo tỷ lệ **80% Training** (464,160 mẫu) và **20% Testing** (116,040 mẫu độc lập) đảm bảo tính khách quan khoa học.

---

## 2. Kỹ Thuật Trích Xuất 16 Đặc Trưng URL (`extract_features.py`)

Để đảm bảo thời gian suy luận trong môi trường thời gian thực ($\le 15\text{ms}$/request), hệ thống không tải mã nguồn HTML mà tập trung bóc tách 16 đặc trưng từ vựng và cú pháp của URL:

| STT | Tên đặc trưng | Mô tả kỹ thuật | Mục đích nhận diện gian lận |
|---|---|---|---|
| 1 | `url_length` | Tổng số ký tự trong URL | URL lừa đảo thường cố ý kéo dài để che giấu domain thật |
| 2 | `domain_length` | Độ dài của tên miền chính | Tên miền mạo danh thường dài hơn bình thường |
| 3 | `having_ip_address` | URL sử dụng địa chỉ IP trực tiếp | Trang web lừa đảo thường dùng IP thay vì mua tên miền |
| 4 | `count_dots` | Số lượng dấu chấm `.` trong URL | Kỹ thuật chia nhiều cấp subdomain giả mạo |
| 5 | `count_hyphens` | Số lượng dấu gạch ngang `-` | Kỹ thuật Typosquatting (ví dụ: `vietcombank-auth-otp.net`) |
| 6 | `count_at_rate` | Ký tự `@` trong URL | Trình duyệt bỏ qua chuỗi trước `@` và điều hướng tới đuôi |
| 7 | `count_double_slash`| Dấu `//` xuất hiện sau giao thức | Kỹ thuật che giấu chuyển hướng URL |
| 8 | `count_subdomains` | Số cấp tên miền con | Tạo subdomain giả thương hiệu ngân hàng |
| 9 | `prefix_suffix` | Dấu `-` nối giữa tiền tố/hậu tố | Tạo cảm giác giống tên miền chính thức |
| 10 | `is_https` | Sử dụng giao thức HTTPS | Nhiều trang lừa đảo dùng HTTP hoặc SSL miễn phí bất thường |
| 11 | `shortening_service`| Sử dụng dịch vụ rút gọn link | Ẩn liên kết đích (bit.ly, tinyurl, t.co...) |
| 12-16 | `suspicious_words` | Từ khóa nhử mồi: `login`, `verify`, `bank`, `secure`, `update` | Dấu hiệu tâm lý bẫy người dùng nhập thông tin nhạy cảm |

---

## 3. Cấu Trúc Mã Nguồn Phân Hệ

```text
ml-training/
├── prepare_dataset.py    # Làm sạch dữ liệu thô, loại bỏ bản ghi trùng lặp và cân bằng nhãn
├── extract_features.py   # Thuật toán trích xuất vector 16 đặc trưng từ URL
├── train_model.py        # Huấn luyện mô hình XGBoost Ensemble, tối ưu siêu tham số & xuất file pkl
├── Data/                 # Thư mục chứa tập dữ liệu
│   └── dataset.csv       # Tệp dữ liệu thực nghiệm đã tiền xử lý (580,200 mẫu URLs)
└── README.md             # Tài liệu thuyết minh quy trình học máy
```

---

## 4. Cơ Chế Huấn Luyện Lại Chủ Động (Active Learning & Continuous Retraining)

Để giải quyết bài toán các biến thể lừa đảo mới liên tục xuất hiện hàng ngày (Zero-Day Phishing):
1. **Thu thập phản hồi**: Khi người dùng duyệt web gặp liên kết nghi vấn hoặc chặn nhầm, tiện ích Chrome gửi URL về hàng đợi `/api/feedback`.
2. **Thẩm định Ground-Truth**: Chuyên viên SOC phân tích và gán nhãn chuẩn (`Safe` hoặc `Phishing`), mẫu này được lưu vào bộ đệm Active Learning.
3. **Quy trình Huấn luyện lại (Retrain Pipeline)**: Quản trị viên kích hoạt huấn luyện trực tiếp trên giao diện Dashboard `/training`. Hệ thống gộp 580k URLs gốc với các mẫu mới, tái tối ưu 150 cây quyết định XGBoost và lưu checkpoint phiên bản mới `phisharmor_xgb_v1.x.pkl`.
4. **Triển khai nóng (Zero-Downtime Deploy)**: Backend tải tệp trọng số mới vào bộ nhớ ngay lập tức mà không cần khởi động lại dịch vụ.

---

## 5. Kết Quả Thực Nghiệm

Đánh giá trên tập kiểm thử độc lập 116,040 mẫu URL:

| Chỉ số (Metric) | Kết quả đạt được | Tiêu chuẩn hệ thống |
|---|---|---|
| **Accuracy (Độ chính xác)** | **98.42%** | $\ge 95\%$ |
| **Precision (Độ chuẩn xác)** | **98.15%** | $\ge 95\%$ |
| **Recall (Độ nhạy)** | **98.70%** | $\ge 95\%$ |
| **F1-Score** | **98.42%** | $\ge 95\%$ |
| **Thời gian suy luận** | **12.4 ms** / URL | $\le 50\text{ ms}$ |

---

## 6. Hướng Dẫn Tái Lập Thực Nghiệm

```bash
# 1. Di chuyển vào thư mục ml-training
cd ml-training

# 2. Tiền xử lý dữ liệu thô
python prepare_dataset.py

# 3. Trích xuất đặc trưng
python extract_features.py

# 4. Huấn luyện mô hình và xuất tệp phisharmor_xgb.pkl
python train_model.py
```

Sau khi huấn luyện thành công, tệp trọng số `phisharmor_xgb.pkl` sẽ được tạo và tự động đồng bộ sang `backend/` để phục vụ máy chủ API.
