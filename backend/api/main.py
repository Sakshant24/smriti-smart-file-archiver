from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.db import database
from backend.db import models
from backend.archive.manager import archive_file_process, restore_file_process
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SMRITI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
models.Base.metadata.create_all(bind=database.engine)

# Pydantic models for request/response
class SettingsUpdate(BaseModel):
    auto_archive_enabled: bool | None = None
    size_threshold: float | None = None
    inactivity_days: int | None = None

@app.get("/")
def read_root():
    return {"message": "Welcome to SMRITI API"}

@app.get("/files")
def get_files(db: Session = Depends(database.get_db)):
    return db.query(models.FileDetail).all()

@app.get("/recommendations")
def get_recommendations(db: Session = Depends(database.get_db)):
    return db.query(models.FileDetail).filter(models.FileDetail.lifecycle_state == "DORMANT").all()

@app.get("/archived")
def get_archived_files(db: Session = Depends(database.get_db)):
    return db.query(models.FileDetail).filter(models.FileDetail.lifecycle_state == "ARCHIVED").all()

@app.post("/archive/{file_id}")
def archive_file(file_id: int, db: Session = Depends(database.get_db)):
    file = db.query(models.FileDetail).filter(models.FileDetail.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if file.lifecycle_state == "ARCHIVED":
        return {"message": f"File {file.file_name} is already archived"}
        
    archive_data = archive_file_process(file.file_path, file.id)
    if archive_data:
        file.lifecycle_state = "ARCHIVED"
        file.archive_path = archive_data['path']
        file.archive_size = archive_data['size']
        file.compression_ratio = archive_data['ratio']
        file.compression_time_ms = archive_data['time_ms']
        db.commit()
        return {"message": f"File {file.file_name} archived successfully."}
    else:
        raise HTTPException(status_code=500, detail="Archiving failed or file locked")

@app.post("/restore/{file_id}")
def restore_file(file_id: int, db: Session = Depends(database.get_db)):
    file = db.query(models.FileDetail).filter(models.FileDetail.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if file.lifecycle_state != "ARCHIVED" or not file.archive_path:
        raise HTTPException(status_code=400, detail="File is not archived")
        
    import os
    original_dir = os.path.dirname(file.file_path)
    os.makedirs(original_dir, exist_ok=True)
    
    success = restore_file_process(file.archive_path, original_dir)
    if success:
        file.lifecycle_state = "ACTIVE"
        file.archive_path = None
        file.archive_size = None
        file.compression_ratio = None
        file.compression_time_ms = None
        db.commit()
        return {"message": f"File {file.file_name} restored successfully."}
    else:
        raise HTTPException(status_code=500, detail="Restoration failed")

@app.get("/settings")
def get_settings(db: Session = Depends(database.get_db)):
    setting = db.query(models.Settings).first()
    if not setting:
        setting = models.Settings(auto_archive_enabled=False, size_threshold=100.0, inactivity_days=180)
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@app.post("/settings")
def update_settings(settings_update: SettingsUpdate, db: Session = Depends(database.get_db)):
    setting = db.query(models.Settings).first()
    if not setting:
        setting = models.Settings(auto_archive_enabled=False, size_threshold=100.0, inactivity_days=180)
        db.add(setting)
    
    if settings_update.auto_archive_enabled is not None:
        setting.auto_archive_enabled = settings_update.auto_archive_enabled
    if settings_update.size_threshold is not None:
        setting.size_threshold = settings_update.size_threshold
    if settings_update.inactivity_days is not None:
        setting.inactivity_days = settings_update.inactivity_days
        
    db.commit()
    db.refresh(setting)
    return setting
