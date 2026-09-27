import os
import re
from urllib.parse import urlparse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
from pydantic import BaseModel

app = FastAPI(title="Phishing Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'phishing_model.pkl')
model = joblib.load(MODEL_PATH)

# DANH SÁCH WHITELIST CÁC TÊN MIỀN AN TOÀN TUYỆT ĐỐI
WHITELIST_DOMAINS = {
    'google.com', 'www.google.com', 'google.com.vn',
    'facebook.com', 'www.facebook.com',
    'youtube.com', 'www.youtube.com',
    'github.com', 'gitlab.com', 'microsoft.com', 'apple.com',
    'wikipedia.org', 'vnexpress.net', 'dantri.com.vn', 'tuoitre.vn',
    'chinhphu.vn', 'moet.gov.vn', 'utc.edu.vn', 'utc2.edu.vn'
}

SUSPICIOUS_WORDS = [
    'login', 'verify', 'update', 'banking', 'account',
    'secure', 'webscr', 'signin', 'confirm', 'support'
]

def extract_features(url_str):
    url = str(url_str).strip()
    try:
        temp_url = url if '://' in url else 'http://' + url
        parsed = urlparse(temp_url)
        domain = parsed.netloc.lower()
        scheme = parsed.scheme.lower()
    except Exception:
        clean_url = re.sub(r'^https?://', '', url)
        domain = clean_url.split('/')[0].lower()
        scheme = 'https' if url.startswith('https') else 'http'

    # Loại bỏ port nếu có (vd localhost:8000)
    if ':' in domain:
        domain = domain.split(':')[0]

    length_url = len(url)
    length_domain = len(domain)
    count_dot = url.count('.')
    count_hyphen = url.count('-')
    count_at = url.count('@')
    count_slash = url.count('/')
    count_question = url.count('?')
    count_equal = url.count('=')
    has_ip = 1 if re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', domain) else 0
    subdomain_count = len(domain.split('.')) - 2 if len(domain.split('.')) > 2 else 0
    is_https = 1 if scheme == 'https' else 0
    suspicious_count = sum(1 for word in SUSPICIOUS_WORDS if word in url.lower())
    digits = sum(c.isdigit() for c in url)
    digits_ratio = digits / length_url if length_url > 0 else 0

    return domain, [
        length_url, length_domain, count_dot, count_hyphen,
        count_at, count_slash, count_question, count_equal,
        has_ip, subdomain_count, is_https, suspicious_count,
        round(digits_ratio, 4)
    ]

class URLRequest(BaseModel):
    url: str

@app.get("/")
def root():
    return {"message": "Phishing Detection API is running"}

@app.post("/predict")
def predict_url(data: URLRequest):
    domain, features = extract_features(data.url)
    
    # 1. Kiểm tra Whitelist trước tiên
    # Nếu domain gốc hoặc subdomain thuộc whitelist -> An toàn 100%
    for safe_domain in WHITELIST_DOMAINS:
        if domain == safe_domain or domain.endswith('.' + safe_domain):
            return {
                "url": data.url,
                "is_phishing": False,
                "label": "An toàn",
                "confidence": 99.9,
                "note": "Domain nằm trong danh sách tín nhiệm (Whitelist)"
            }

    # 2. Nếu không nằm trong Whitelist -> Dự đoán qua Model AI Random Forest
    prediction = int(model.predict([features])[0])
    probabilities = model.predict_proba([features])[0]
    confidence = float(probabilities[prediction])

    return {
        "url": data.url,
        "is_phishing": bool(prediction == 1),
        "label": "Lừa đảo" if prediction == 1 else "An toàn",
        "confidence": round(confidence * 100, 2)
    }