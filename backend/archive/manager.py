import os
import zipfile
from backend.db.models import FileDetail
from backend.db.database import get_db
import zstandard as zstd
import time
import msvcrt

ARCHIVE_DIR = os.path.join(os.getcwd(), 'data', 'archives')

# Ensure archive directory exists
os.makedirs(ARCHIVE_DIR, exist_ok=True)

def archive_file_process(file_path: str, file_id: int) -> dict | None:
    """Compresses a file using ultrafast Zstandard (zstd) and records analytics."""
    if not os.path.exists(file_path):
        return None
        
    start_time = time.perf_counter()
    st_size = os.stat(file_path).st_size
    original_size_mb = st_size / (1024 * 1024)
    file_name = os.path.basename(file_path)
    archive_name = f"{file_id}_{file_name}.zst"
    archive_path = os.path.join(ARCHIVE_DIR, archive_name)
    
    # Concurrency Lock
    lock_size = max(1, min(st_size, 1024))
    try:
        f = open(file_path, "rb")
        # Try to acquire a non-blocking lock. If the file is deeply opened by another process, this raises an exception.
        msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, lock_size)
    except Exception as e:
        print(f"Skipping {file_name}: File is locked by another OS process. ({e})")
        return None
    
    try:
        cctx = zstd.ZstdCompressor(level=3) # Level 3 is optimal speed/ratio balance
        with open(archive_path, 'wb') as dst:
            with cctx.stream_writer(dst) as compressor:
                while chunk := f.read(65536):
                    compressor.write(chunk)
                    
        # Unlock and close Original
        f.seek(0)
        msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, lock_size)
        f.close()
        
        # Delete original file
        os.remove(file_path)
        
        end_time = time.perf_counter()
        
        # Analytics Calculation
        archive_size_bytes = os.stat(archive_path).st_size
        archive_size_mb = archive_size_bytes / (1024 * 1024)
        ratio = (original_size_mb / archive_size_mb) if archive_size_mb > 0 else 1.0
        time_ms = (end_time - start_time) * 1000
        
        return {
            'path': archive_path,
            'size': archive_size_mb,
            'ratio': ratio,
            'time_ms': time_ms
        }
    except Exception as e:
        f.close()
        print(f"Error archiving file {file_path}: {e}")
        if os.path.exists(archive_path):
            os.remove(archive_path)
        return None

def restore_file_process(archive_path: str, original_dir: str) -> bool:
    """Restores a Zstd compressed file payload back to its original OS location"""
    if not os.path.exists(archive_path):
        return False
        
    try:
        archive_name = os.path.basename(archive_path)
        original_name = "_".join(archive_name.split('_')[1:]).replace(".zst", "")
        dest_path = os.path.join(original_dir, original_name)
        
        dctx = zstd.ZstdDecompressor()
        with open(archive_path, 'rb') as src, open(dest_path, 'wb') as dest:
            dctx.copy_stream(src, dest)
            
        os.remove(archive_path)
        return True
    except Exception as e:
        print(f"Error restoring Zstd file from {archive_path}: {e}")
        return False
