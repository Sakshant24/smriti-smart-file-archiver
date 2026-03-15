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
    predicted_dormant = Column(Boolean, default=False)
    archived = Column(Boolean, default=False)
    archive_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    file_type = Column(String, nullable=True)
    last_modified_time = Column(DateTime, default=datetime.utcnow)


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    auto_archive_enabled = Column(Boolean, default=False)
    size_threshold = Column(Float, default=100.0) # MB
    inactivity_days = Column(Integer, default=180) # days
