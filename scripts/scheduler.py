import os
import sys
import time

# Add project root to sys path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.db.database import SessionLocal
from backend.db.models import FileDetail, Settings
from backend.ml.classifier import predict_dormancy
from backend.archive.manager import archive_file_process

def run_prediction_and_archiving():
    print("Running scheduled prediction and archiving cycle...")
    db = SessionLocal()
    
    try:
        settings = db.query(Settings).first()
        if not settings:
            print("No settings found. Using defaults.")
            auto_archive = False
            size_threshold = 100.0
        else:
            auto_archive = settings.auto_archive_enabled
            size_threshold = settings.size_threshold
            
        files = db.query(FileDetail).filter(FileDetail.lifecycle_state != "ARCHIVED").all()
        for f in files:
            is_dormant = predict_dormancy(f)
            
            # State transitions
            if is_dormant and f.lifecycle_state == "ACTIVE":
                f.lifecycle_state = "DORMANT"
            elif not is_dormant and f.lifecycle_state == "DORMANT":
                f.lifecycle_state = "ACTIVE"
                
            if is_dormant and auto_archive and f.file_size >= size_threshold:
                print(f"Auto-archiving dormant file: {f.file_name}")
                archive_data = archive_file_process(f.file_path, f.id)
                if archive_data:
                    f.lifecycle_state = "ARCHIVED"
                    f.archive_path = archive_data['path']
                    f.archive_size = archive_data['size']
                    f.compression_ratio = archive_data['ratio']
                    f.compression_time_ms = archive_data['time_ms']
                    
        db.commit()
    except Exception as e:
        print(f"Error in scheduler: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting SMRITI Background Scheduler...")
    while True:
        run_prediction_and_archiving()
        # Run every 60 seconds for demonstration purposes
        time.sleep(60)
