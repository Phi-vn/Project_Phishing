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
