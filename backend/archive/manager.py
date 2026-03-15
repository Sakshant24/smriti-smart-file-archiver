import os
import zipfile
from backend.db.models import FileDetail
from backend.db.database import get_db

ARCHIVE_DIR = os.path.join(os.getcwd(), 'data', 'archives')

# Ensure archive directory exists
os.makedirs(ARCHIVE_DIR, exist_ok=True)

def archive_file_process(file_path: str, file_id: int) -> str | None:
    """Compresses a file into a zip archive and deletes original if successful"""
    if not os.path.exists(file_path):
        return None
        
    file_name = os.path.basename(file_path)
    archive_name = f"{file_id}_{file_name}.zip"
    archive_path = os.path.join(ARCHIVE_DIR, archive_name)
    
    try:
        with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # We want to maintain original file name inside archive
            zipf.write(file_path, arcname=file_name)
            
        # Delete original file
        os.remove(file_path)
        return archive_path
    except Exception as e:
        print(f"Error archiving file {file_path}: {e}")
        # Clean up partial archive if it exists
        if os.path.exists(archive_path):
            os.remove(archive_path)
        return None

def restore_file_process(archive_path: str, original_dir: str) -> bool:
    """Restores a compressed file from the archive path back to its original location"""
    if not os.path.exists(archive_path):
        return False
        
    try:
        with zipfile.ZipFile(archive_path, 'r') as zipf:
            zipf.extractall(path=original_dir)
            
        # Optionally, delete the archive file
        os.remove(archive_path)
        return True
    except Exception as e:
        print(f"Error restoring file from {archive_path}: {e}")
        return False
