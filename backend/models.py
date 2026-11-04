from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from database import Base
import datetime

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    domain = Column(String, index=True)
    is_phishing = Column(Boolean, default=False)
    label = Column(String)
    confidence = Column(Float)
    note = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class FeedbackReport(Base):
    __tablename__ = "feedback_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_code = Column(String, unique=True, index=True)
    url = Column(String, index=True)
    domain = Column(String, index=True)
    target_brand = Column(String, nullable=True)
    status = Column(String, default="pending")  # "pending", "safe", "phishing"
    report_type = Column(String, default="false_positive")  # "false_positive", "false_negative"
    user_comment = Column(String)
    reporter_user = Column(String, default="user@phisharmor.vn")
    reporter_ip = Column(String, default="113.185.42.19")
    reporter_country = Column(String, default="Vietnam (Hà Nội)")
    extension_version = Column(String, default="v1.4.2 (Chrome)")
    ai_prediction = Column(String, default="Cảnh báo Phishing")
    confidence_score = Column(Float, default=75.0)
    shap_reasons = Column(String, nullable=True)  # JSON string
    pushed_to_retrain = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, unique=True, index=True)
    date = Column(String)
    f1 = Column(String)
    latency = Column(String, default="115ms")
    arch = Column(String, default="PhoBERT + XGBoost")
    status = Column(String, default="Sẵn sàng")
    active = Column(Boolean, default=False)
    samples_count = Column(Integer, default=580200)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
