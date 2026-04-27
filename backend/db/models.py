from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from .database import Base

class FileDetail(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, unique=True, index=True)
    file_name = Column(String, index=True)
    file_size = Column(Float) # in MB
    last_access_time = Column(DateTime, default=datetime.utcnow)
    access_count = Column(Integer, default=1)
    lifecycle_state = Column(String, default="ACTIVE") # 'ACTIVE', 'DORMANT', 'ARCHIVED'
    archive_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    file_type = Column(String, nullable=True)
    last_modified_time = Column(DateTime, default=datetime.utcnow)

    # Advanced Storage Analytics
    archive_size = Column(Float, nullable=True) # in MB
    compression_ratio = Column(Float, nullable=True) # e.g. 2.5x
    compression_time_ms = Column(Float, nullable=True) # execution speed

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    auto_archive_enabled = Column(Boolean, default=False)
    size_threshold = Column(Float, default=100.0) # MB
    inactivity_days = Column(Integer, default=180) # days
