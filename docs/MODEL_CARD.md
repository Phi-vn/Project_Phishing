# BÁO CÁO ĐẶC TẢ MÔ HÌNH HỌC MÁY (AI MODEL CARD)
### Đề tài: Hệ thống phát hiện website lừa đảo trực tuyến PhishArmor AI

*Chuẩn hóa theo cấu trúc Model Card khoa học (Mitchell et al., 2019) cho hệ thống PhishArmor Enterprise.*

---

## 1. Chi Tiết Mô Hình (Model Details)

* **Tên mô hình**: PhishArmor URL Classifier (Phiên bản: v1.4.2-prod)
* **Loại thuật toán**: XGBoost Gradient Boosting Ensemble (150 cây quyết định, `max_depth=6`, `learning_rate=0.08`, `subsample=0.85`, hàm mục tiêu `binary:logistic`) kết hợp phân tích ngữ nghĩa tiếng Việt PhoBERT Transformer.
* **Thời gian huấn luyện**: ~14.2 phút trên vi xử lý 8-core CPU, 16GB RAM.
* **Thư viện triển khai**: XGBoost 2.0+, Scikit-Learn 1.4, Joblib, NumPy, Pandas, SHAP.
* **Định dạng tệp đóng gói**: `phisharmor_xgb_v1.x.pkl` (Dung lượng: ~90.2 KB).
* **Môi trường suy luận**: Python 3.12, Uvicorn ASGI Server.

---

## 2. Mục Đích & Phạm Vi Ứng Dụng (Intended Use)

* **Mục đích chính**: Phát hiện và phân loại các liên kết URL độc hại, trang web lừa đảo trực tuyến (Phishing) giả mạo ngân hàng thương mại, cổng dịch vụ công và sàn thương mại điện tử.
* **Bối cảnh sử dụng**:
  * Tích hợp trực tiếp vào tiện ích mở rộng trình duyệt (Chrome Extension) để cảnh báo tức thì cho người dùng phổ thông.
  * Tích hợp vào hệ thống giám sát an ninh mạng (SOC Dashboard) để chuyên viên mổ xẻ mã độc và phân tích nguy cơ.
* **Phạm vi không khuyến nghị**: Không sử dụng để thay thế hoàn toàn tường lửa mạng cấp doanh nghiệp (Next-Gen Firewall) hoặc hệ thống phát hiện mã độc nội dung chuyên sâu (Deep Packet Inspection).

---

## 3. Tập Dữ Liệu Huấn Luyện & Kiểm Thử (Data & Partitioning)

Tập dữ liệu nghiên cứu bao gồm **580,200 mẫu URL** đã được chuẩn hóa và cân bằng nhãn:

* **Tập mẫu lừa đảo (Phishing - Nhãn 1)**: 289,800 URLs thu thập từ:
  * PhishTank Verified Database (2024 - 2026).
  * OpenPhish Community Threat Feed.
  * Các chiến dịch tấn công mạo danh ngân hàng và cơ quan tại Việt Nam.
* **Tập mẫu hợp pháp (Benign - Nhãn 0)**: 290,400 URLs thu thập từ:
  * Alexa Top 1M Domains.
  * Tranco Top Sites List.
  * Cổng thông tin điện tử các bộ ban ngành Việt Nam (`.gov.vn`, `.edu.vn`).
* **Phân chia dữ liệu**:
  * **Tập huấn luyện (Training Set - 80%)**: 464,160 mẫu.
  * **Tập kiểm thử độc lập (Test Set - 20%)**: 116,040 mẫu (Không tham gia vào quá trình huấn luyện và chọn siêu tham số).

---

## 4. Không Gian 16 Đặc Trưng URL (Feature Engineering)

Mô hình chỉ phân tích cấu trúc từ vựng của URL mà không tải nội dung trang web nhằm bảo đảm thời gian suy luận $\le 15\text{ms}$:

| STT | Tên đặc trưng | Kiểu dữ liệu | Ý nghĩa an ninh mạng | Trọng số SHAP |
|---|---|---|---|---|
| 1 | `length_url` | Integer | Độ dài toàn bộ URL. Kẻ tấn công thường chèn chuỗi dài để che giấu domain thật. | 14.2% |
| 2 | `length_domain` | Integer | Độ dài của domain chính. | 9.8% |
| 3 | `count_dot` | Integer | Số lượng dấu chấm trong URL. Phản ánh số cấp subdomain giả mạo. | 11.0% |
| 4 | `count_hyphen` | Integer | Ký tự `-`. Thường dùng trong tấn công Typosquatting (nhái thương hiệu). | 10.3% |
| 5 | `count_at` | Integer | Ký tự `@`. Trình duyệt sẽ điều hướng tới chuỗi sau `@` thay vì trước. | 8.4% |
| 6 | `count_slash` | Integer | Số lượng dấu gạch chéo phân chia đường dẫn. | 7.6% |
| 7 | `count_question` | Integer | Ký tự `?` bắt đầu chuỗi truy vấn tham số. | 3.5% |
| 8 | `count_equal` | Integer | Ký tự `=` trong chuỗi truy vấn tham số. | 3.2% |
| 9 | `has_ip` | Binary (0/1) | Sử dụng địa chỉ IP trực tiếp thay cho tên miền chuẩn. | 12.5% |
| 10 | `subdomain_count`| Integer | Số lượng tên miền phụ (subdomain). | 6.5% |
| 11 | `is_https` | Binary (0/1) | Sử dụng giao thức HTTPS bảo mật hay HTTP thông thường. | 4.1% |
| 12-16 | `suspicious_words`| Integer | Số lượng từ khóa bẫy tâm lý: `login`, `verify`, `bank`, `secure`, `update`. | 6.5% |
| - | `digits_ratio` | Float | Tỷ lệ chữ số trên tổng số ký tự của URL. | 2.4% |

---

## 5. Kết Quả Đánh Giá Thực Nghiệm (Quantitative Evaluation)

Đánh giá thực nghiệm trên tập kiểm thử độc lập 116,040 URLs:

| Chỉ số đánh giá (Metric) | Công thức | Kết quả thực nghiệm |
|---|---|---|
| **Accuracy (Độ chính xác tổng thể)** | $\frac{TP + TN}{TP + TN + FP + FN}$ | **98.42%** |
| **Precision (Độ chuẩn xác)** | $\frac{TP}{TP + FP}$ | **98.15%** |
| **Recall (Độ nhạy / Tỷ lệ phát hiện)**| $\frac{TP}{TP + FN}$ | **98.70%** |
| **F1-Score (Trung bình điều hòa)** | $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$ | **98.42%** |
| **ROC - AUC** | Diện tích dưới đường cong ROC | **0.994** |
| **Thời gian suy luận trung bình** | Thời gian xử lý 1 URL | **12.4 ms** / request |

### Ma trận nhầm lẫn (Confusion Matrix trên 116,040 mẫu)

```text
                           DỰ ĐOÁN: HỢP PHÁP         DỰ ĐOÁN: LỪA ĐẢO
THỰC TẾ: HỢP PHÁP (Benign)     57,012 (True Neg)         1,068 (False Pos)
THỰC TẾ: LỪA ĐẢO (Phishing)       760 (False Neg)       57,200 (True Pos)
```

* **Tỷ lệ báo động sai (False Positive Rate - FPR)**: $1.84\%$
* **Tỷ lệ bỏ sót đe dọa (False Negative Rate - FNR)**: $1.31\%$

---

## 6. Khả Năng Giải Thích Mô Hình (Explainable AI - XAI)

* **TreeSHAP Integration**: Giải thuật tính toán đóng góp biên của từng đặc trưng theo lý thuyết trò chơi hợp tác (Cooperative Game Theory), giúp chuyên viên SOC nhìn thấy chính xác đặc trưng nào làm tăng nguy cơ lừa đảo.
* **Tích hợp Gemini 1.5 Flash**: Chuyển đổi các trọng số toán học thành văn bản khuyến cáo an toàn tiếng Việt tự nhiên, giải thích rõ ràng lý do cảnh báo cho người dùng cuối.

---

## 7. Giới Hạn Kỹ Thuật & Giải Pháp Khắc Phục (Limitations & Mitigation)

1. **Hiện tượng suy thoái mô hình (Concept Drift)**:
   * *Rủi ro*: Kẻ tấn công liên tục thay đổi chiến thuật đặt tên miền mới hoặc kỹ thuật obfuscation.
   * *Giải pháp*: Xây dựng cơ chế **Active Learning** và hàng đợi tiếp nhận phản hồi người dùng (`/feedback`) để định kỳ cập nhật dữ liệu và huấn luyện lại mô hình.
2. **Cảnh báo nhầm tên miền nội bộ (False Positives)**:
   * *Rủi ro*: Một số trang nội bộ doanh nghiệp có cấu trúc URL dài hoặc nhiều cấp subdomain có thể bị gắn cờ nhầm.
   * *Giải pháp*: Cho phép người quản trị thêm tên miền vào danh sách Whitelist cục bộ và điều chỉnh ngưỡng nhạy cảm (Sensitivity Threshold) từ $0.50$ đến $0.90$ trên trang Cài đặt.
