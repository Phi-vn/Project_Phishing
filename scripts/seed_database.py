#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PhishArmor AI - Database Seed Script
Kịch bản nạp dữ liệu khởi tạo cơ sở dữ liệu SQLite cho hệ thống PhishArmor Enterprise.
"""

import os
import sys
import datetime

# Đảm bảo in tiếng Việt chuẩn trên mọi console (Windows CP1252 / Linux UTF-8)
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Điều hướng import từ thư mục backend
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

try:
    from database import Base
    from models import ScanRecord, FeedbackReport, ModelVersion
except ImportError as err:
    print(f"[!] Lỗi nạp module từ backend: {err}")
    sys.exit(1)

DB_PATH = os.path.join(BACKEND_DIR, "phisharmor.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_database():
    print(f"[*] Khởi tạo bảng dữ liệu tại: {DB_PATH}")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Nạp các phiên bản mô hình (Model Versions)
        model_count = db.query(ModelVersion).count()
        if model_count == 0:
            print("[*] Đang nạp các phiên bản mô hình mẫu...")
            versions = [
                ModelVersion(
                    version="v1.4.2-prod",
                    date="2026-10-28",
                    f1="98.15%",
                    latency="12.4ms",
                    arch="XGBoost (16 Features) + PhoBERT",
                    status="Đang hoạt động (Production)",
                    active=True,
                    samples_count=580200
                ),
                ModelVersion(
                    version="v1.4.1-rc",
                    date="2026-10-15",
                    f1="97.60%",
                    latency="14.1ms",
                    arch="Random Forest Classifier (150 trees)",
                    status="Lưu trữ (Archived)",
                    active=False,
                    samples_count=520000
                ),
                ModelVersion(
                    version="v1.3.0-baseline",
                    date="2026-09-20",
                    f1="94.80%",
                    latency="18.2ms",
                    arch="Decision Tree + Naive Bayes",
                    status="Baseline",
                    active=False,
                    samples_count=350000
                )
            ]
            db.add_all(versions)
            db.commit()

        # 2. Nạp dữ liệu quét mẫu (Scan Records)
        scan_count = db.query(ScanRecord).count()
        if scan_count < 10:
            print("[*] Đang nạp các bản ghi quét URL mẫu...")
            now = datetime.datetime.utcnow()
            sample_scans = [
                ScanRecord(
                    url="https://vietcombank.com.vn/personal",
                    domain="vietcombank.com.vn",
                    is_phishing=False,
                    label="An toàn (Legitimate)",
                    confidence=99.2,
                    note="Tên miền chính thức của Ngân hàng TMCP Ngoại thương Việt Nam. Chứng chỉ SSL hợp lệ.",
                    timestamp=now - datetime.timedelta(minutes=5)
                ),
                ScanRecord(
                    url="http://vietcombank-login-otp-security.net/auth",
                    domain="vietcombank-login-otp-security.net",
                    is_phishing=True,
                    label="Lừa đảo (Phishing)",
                    confidence=98.7,
                    note="Phát hiện dấu hiệu giả mạo Vietcombank. Tên miền chứa từ khóa nhạy cảm và gạch nối bất thường.",
                    timestamp=now - datetime.timedelta(minutes=15)
                ),
                ScanRecord(
                    url="https://dichvucong.gov.vn/pki/auth",
                    domain="dichvucong.gov.vn",
                    is_phishing=False,
                    label="An toàn (Legitimate)",
                    confidence=99.8,
                    note="Cổng Dịch vụ công Quốc gia. Tên miền cấp cao .gov.vn được bảo vệ nghiêm ngặt.",
                    timestamp=now - datetime.timedelta(minutes=30)
                ),
                ScanRecord(
                    url="http://vneid-dinhdanh-bocongan.top/cai-dat.apk",
                    domain="vneid-dinhdanh-bocongan.top",
                    is_phishing=True,
                    label="Lừa đảo (Phishing)",
                    confidence=99.4,
                    note="Cảnh báo: Giả mạo ứng dụng VNeID Bộ Công An để phát tán mã độc APK đánh cắp tài khoản ngân hàng.",
                    timestamp=now - datetime.timedelta(hours=1)
                ),
                ScanRecord(
                    url="https://github.com/trending",
                    domain="github.com",
                    is_phishing=False,
                    label="An toàn (Legitimate)",
                    confidence=99.5,
                    note="Nền tảng mã nguồn mở GitHub. Tên miền uy tín toàn cầu trong Alexa Top 100.",
                    timestamp=now - datetime.timedelta(hours=2)
                ),
                ScanRecord(
                    url="http://shopee-nhanqua-triankhachhang.xyz/spin",
                    domain="shopee-nhanqua-triankhachhang.xyz",
                    is_phishing=True,
                    label="Lừa đảo (Phishing)",
                    confidence=97.8,
                    note="Kịch bản lừa đảo trúng thưởng và vòng quay may mắn giả mạo sàn thương mại điện tử Shopee.",
                    timestamp=now - datetime.timedelta(hours=3)
                )
            ]
            db.add_all(sample_scans)
            db.commit()

        # 3. Nạp phản hồi người dùng (Feedback Reports)
        feedback_count = db.query(FeedbackReport).count()
        if feedback_count < 3:
            print("[*] Đang nạp báo cáo phản hồi mẫu (Feedback)...")
            feedbacks = [
                FeedbackReport(
                    report_code="FB-20261028-001",
                    url="http://vietcombank-login-otp-security.net/auth",
                    domain="vietcombank-login-otp-security.net",
                    target_brand="Vietcombank",
                    status="phishing",
                    report_type="false_negative",
                    user_comment="Trang này gửi tin nhắn SMS mạo danh thương hiệu ngân hàng yêu cầu nhập mã OTP hủy dịch vụ lạ.",
                    reporter_user="security_analyst@phisharmor.vn",
                    reporter_ip="113.185.42.19",
                    reporter_country="Vietnam (Hà Nội)",
                    extension_version="v1.4.2 (Chrome)",
                    ai_prediction="Cảnh báo Phishing",
                    confidence_score=98.7,
                    shap_reasons='["has_hyphen", "suspicious_words", "domain_length"]',
                    pushed_to_retrain=True,
                    timestamp=datetime.datetime.utcnow()
                ),
                FeedbackReport(
                    report_code="FB-20261028-002",
                    url="https://noi-bo.company-portal.edu.vn/login",
                    domain="noi-bo.company-portal.edu.vn",
                    target_brand="Company Portal",
                    status="safe",
                    report_type="false_positive",
                    user_comment="Trang cổng thông tin nội bộ của trường, mô hình trước đó cảnh báo nhầm do subdomain nhiều cấp.",
                    reporter_user="student@edu.vn",
                    reporter_ip="14.232.180.12",
                    reporter_country="Vietnam (TP.HCM)",
                    extension_version="v1.4.2 (Chrome)",
                    ai_prediction="An toàn (Đã duyệt)",
                    confidence_score=52.0,
                    shap_reasons='["count_subdomains"]',
                    pushed_to_retrain=True,
                    timestamp=datetime.datetime.utcnow()
                )
            ]
            db.add_all(feedbacks)
            db.commit()

        print("[✓] Hoàn tất nạp dữ liệu mẫu thành công!")
    except Exception as e:
        db.rollback()
        print(f"[!] Lỗi khi nạp dữ liệu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
