import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from sqlalchemy.orm import Session
from datetime import datetime

from backend.db import models
from backend.db.database import SessionLocal

class FileMonitorHandler(FileSystemEventHandler):
    def __init__(self, db: Session):
        self.db = db
        super().__init__()

    def process_file_event(self, event):
        if event.is_directory:
            return
            
        try:
            file_path = os.path.abspath(event.src_path)
            
            # Skip database file and archives directory
            if file_path.endswith('.db') or 'data\\archives' in file_path or 'data/archives' in file_path:
                return

            if not os.path.exists(file_path):
                # File might have been deleted, ignore or handle deletion logic
                return
                
            stat = os.stat(file_path)
            file_size_mb = stat.st_size / (1024 * 1024)
            file_name = os.path.basename(file_path)
            _, ext = os.path.splitext(file_name)
            
            # Use access time and modified time
            access_time = datetime.fromtimestamp(stat.st_atime)
            mod_time = datetime.fromtimestamp(stat.st_mtime)

            db_file = self.db.query(models.FileDetail).filter(models.FileDetail.file_path == file_path).first()
            
            if db_file:
                db_file.file_size = file_size_mb
                db_file.last_modified_time = mod_time
                
                # Check if access time actually advanced to register a new access
                if access_time > db_file.last_access_time:
                    db_file.last_access_time = access_time
                    db_file.access_count += 1
            else:
                db_file = models.FileDetail(
                    file_path=file_path,
                    file_name=file_name,
                    file_size=file_size_mb,
                    last_access_time=access_time,
                    last_modified_time=mod_time,
                    file_type=ext.lower().replace('.', '') if ext else 'unknown',
                    access_count=1
                )
                self.db.add(db_file)
                
            self.db.commit()
            
        except Exception as e:
            print(f"Error processing file {event.src_path}: {e}")
            self.db.rollback()

    def on_modified(self, event):
        self.process_file_event(event)

    def on_created(self, event):
        self.process_file_event(event)

def start_monitor(directories_to_watch: list[str]):
    db = SessionLocal()
    event_handler = FileMonitorHandler(db)
    observer = Observer()
    
    for directory in directories_to_watch:
        if os.path.exists(directory):
            observer.schedule(event_handler, directory, recursive=True)
            print(f"Monitoring directory: {directory}")
        else:
            print(f"Directory {directory} does not exist. Skipping.")
            
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
    db.close()
