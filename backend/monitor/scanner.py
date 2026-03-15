import os
from datetime import datetime
from backend.db import models
from backend.db.database import SessionLocal

def scan_existing_files(directories_to_scan: list[str]):
    """Walks through directories and adds existing files to the SMRITI database."""
    print(f"\n[+] Executing initial OS scan on: {directories_to_scan}")
    
    with SessionLocal() as db:
        files_added = 0
        
        for directory in directories_to_scan:
            if not os.path.exists(directory):
                continue
                
            for root, _, files in os.walk(directory):
                for file in files:
                    try:
                        file_path = os.path.join(root, file)
                        
                        # Skip database file and archives directory
                        if file_path.endswith('.db') or 'data\\archives' in file_path or 'data/archives' in file_path:
                            continue
                            
                        # Check if already in DB
                        exists = db.query(models.FileDetail).filter(models.FileDetail.file_path == file_path).first()
                        if exists:
                            continue
                            
                        stat = os.stat(file_path)
                        file_size_mb = stat.st_size / (1024 * 1024)
                        _, ext = os.path.splitext(file)
                        
                        access_time = datetime.fromtimestamp(stat.st_atime)
                        mod_time = datetime.fromtimestamp(stat.st_mtime)
                        
                        db_file = models.FileDetail(
                            file_path=file_path,
                            file_name=file,
                            file_size=file_size_mb,
                            last_access_time=access_time,
                            last_modified_time=mod_time,
                            file_type=ext.lower().replace('.', '') if ext else 'unknown',
                            access_count=1
                        )
                        db.add(db_file)
                        files_added += 1
                        
                        # Commit in batches to prevent massive memory spikes
                        if files_added % 500 == 0:
                            db.commit()
                            
                    except Exception as e:
                        pass # Ignore permission denied or locked files during the initial OS scan
                        
        db.commit()
        print(f"[*] Initial scan complete. {files_added} files successfully indexed into SMRITI.")
