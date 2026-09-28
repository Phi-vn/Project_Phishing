import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score, confusion_matrix
import joblib

# Các thuộc tính:
# 0: length_url
# 1: length_domain
# 2: count_dot
# 3: count_hyphen
# 4: count_at
# 5: count_slash
# 6: count_question
# 7: count_equal
# 8: has_ip
# 9: subdomain_count
# 10: is_https
# 11: suspicious_count
# 12: digits_ratio

np.random.seed(42)
n_samples = 5000

# Tạo dữ liệu giả định (Synthetic Data)
# Safe domains (Label 0)
safe_len_url = np.random.randint(15, 60, n_samples // 2)
safe_len_domain = np.random.randint(5, 20, n_samples // 2)
safe_count_dot = np.random.randint(1, 3, n_samples // 2)
safe_count_hyphen = np.random.randint(0, 2, n_samples // 2)
safe_count_at = np.zeros(n_samples // 2)
safe_count_slash = np.random.randint(3, 5, n_samples // 2)
safe_count_question = np.random.randint(0, 2, n_samples // 2)
safe_count_equal = np.random.randint(0, 2, n_samples // 2)
safe_has_ip = np.zeros(n_samples // 2)
safe_subdomain_count = np.random.randint(0, 2, n_samples // 2)
safe_is_https = np.ones(n_samples // 2)  # Hầu hết safe đều có https
safe_suspicious_count = np.random.randint(0, 1, n_samples // 2)
safe_digits_ratio = np.random.uniform(0.0, 0.05, n_samples // 2)

safe_X = np.column_stack((
    safe_len_url, safe_len_domain, safe_count_dot, safe_count_hyphen,
    safe_count_at, safe_count_slash, safe_count_question, safe_count_equal,
    safe_has_ip, safe_subdomain_count, safe_is_https, safe_suspicious_count,
    safe_digits_ratio
))
safe_y = np.zeros(n_samples // 2)

# Phishing domains (Label 1)
phish_len_url = np.random.randint(40, 150, n_samples // 2)
phish_len_domain = np.random.randint(15, 40, n_samples // 2)
phish_count_dot = np.random.randint(2, 6, n_samples // 2)
phish_count_hyphen = np.random.randint(1, 5, n_samples // 2)
phish_count_at = np.random.randint(0, 2, n_samples // 2) # Có at
phish_count_slash = np.random.randint(4, 10, n_samples // 2)
phish_count_question = np.random.randint(0, 3, n_samples // 2)
phish_count_equal = np.random.randint(0, 4, n_samples // 2)
phish_has_ip = np.random.choice([0, 1], p=[0.7, 0.3], size=n_samples // 2)
phish_subdomain_count = np.random.randint(1, 5, n_samples // 2)
phish_is_https = np.random.choice([0, 1], p=[0.6, 0.4], size=n_samples // 2)
phish_suspicious_count = np.random.randint(1, 4, n_samples // 2)
phish_digits_ratio = np.random.uniform(0.05, 0.3, n_samples // 2)

phish_X = np.column_stack((
    phish_len_url, phish_len_domain, phish_count_dot, phish_count_hyphen,
    phish_count_at, phish_count_slash, phish_count_question, phish_count_equal,
    phish_has_ip, phish_subdomain_count, phish_is_https, phish_suspicious_count,
    phish_digits_ratio
))
phish_y = np.ones(n_samples // 2)

X = np.vstack((safe_X, phish_X))
y = np.concatenate((safe_y, phish_y))

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Đang huấn luyện mô hình Random Forest...")
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("\n=== ĐÁNH GIÁ MÔ HÌNH ===")
print(classification_report(y_test, y_pred))
print("F1-Score:", f1_score(y_test, y_pred))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

# Lưu Model
joblib.dump(model, 'phishing_model.pkl')
print("\nĐã lưu mô hình thành công vào phishing_model.pkl!")
