import os
import re
from urllib.parse import urlparse
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'Data')
INPUT_FILE = os.path.join(DATA_DIR, 'dataset_full_580k.csv')
OUTPUT_FILE = os.path.join(DATA_DIR, 'dataset_features.csv')

SUSPICIOUS_WORDS = [
    'login', 'verify', 'update', 'banking', 'account',
    'secure', 'webscr', 'signin', 'confirm', 'support'
]

def extract_url_features(url_str):
    url = str(url_str).strip()
    
    # Xử lý an toàn khi phân tích URL (tránh lỗi IPv6 hoặc URL dị dạng)
    try:
        temp_url = url if '://' in url else 'http://' + url
        parsed = urlparse(temp_url)
        domain = parsed.netloc
        scheme = parsed.scheme
    except Exception:
        clean_url = re.sub(r'^https?://', '', url)
        domain = clean_url.split('/')[0]
        scheme = 'https' if url.startswith('https') else 'http'

    length_url = len(url)
    length_domain = len(domain)

    # Đếm ký tự đặc biệt
    count_dot = url.count('.')
    count_hyphen = url.count('-')
    count_at = url.count('@')
    count_slash = url.count('/')
    count_question = url.count('?')
    count_equal = url.count('=')

    # Kiểm tra IP trực tiếp trong tên miền
    has_ip = 1 if re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', domain) else 0

    # Đếm subdomains
    subdomain_count = len(domain.split('.')) - 2 if len(domain.split('.')) > 2 else 0

    # Giao thức HTTPS
    is_https = 1 if scheme == 'https' else 0

    # Từ khóa lừa đảo
    suspicious_count = sum(1 for word in SUSPICIOUS_WORDS if word in url.lower())

    # Tỷ lệ ký tự số
    digits = sum(c.isdigit() for c in url)
    digits_ratio = digits / length_url if length_url > 0 else 0

    return [
        length_url, length_domain, count_dot, count_hyphen,
        count_at, count_slash, count_question, count_equal,
        has_ip, subdomain_count, is_https, suspicious_count,
        round(digits_ratio, 4)
    ]

print("1. Đang nạp dataset...")
df = pd.read_csv(INPUT_FILE)

# Lấy mẫu cân bằng 50.000 link lừa đảo và 50.000 link an toàn (Tổng 100.000)
SAMPLE_PER_CLASS = 50000
df_phish = df[df['label'] == 1].sample(n=min(len(df[df['label'] == 1]), SAMPLE_PER_CLASS), random_state=42)
df_benign = df[df['label'] == 0].sample(n=min(len(df[df['label'] == 0]), SAMPLE_PER_CLASS), random_state=42)

df_sample = pd.concat([df_phish, df_benign]).sample(frac=1, random_state=42).reset_index(drop=True)
print(f"2. Đang trích xuất đặc trưng cho {len(df_sample)} URLs (khoảng 20 - 30 giây)...")

feature_cols = [
    'length_url', 'length_domain', 'count_dot', 'count_hyphen',
    'count_at', 'count_slash', 'count_question', 'count_equal',
    'has_ip', 'subdomain_count', 'is_https', 'suspicious_count',
    'digits_ratio'
]

features_data = [extract_url_features(u) for u in df_sample['url']]
df_features = pd.DataFrame(features_data, columns=feature_cols)

# Gán lại cột nhãn label an toàn tuyệt đối
df_features['label'] = df_sample['label'].values

df_features.to_csv(OUTPUT_FILE, index=False)
print("\n TRÍCH XUẤT ĐẶC TRƯNG THÀNH CÔNG!")
print(f"File lưu tại: {OUTPUT_FILE}")
print(df_features.head())