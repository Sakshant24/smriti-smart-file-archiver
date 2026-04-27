import os
import sys
import time
import threading

# Add project root to sys path
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.monitor.watcher import start_monitor
from backend.monitor.scanner import scan_existing_files
from scripts.scheduler import run_prediction_and_archiving
from backend.db import models
from backend.db.database import engine

# To prevent an SQLite race-condition, wait a couple seconds for Uvicorn to create the DB first
time.sleep(3)

def configure_realtime_folder():
    """Sets up realistic OS tracking covering core user directories."""
    user_home = os.environ['USERPROFILE']
    docs = os.path.join(user_home, 'Documents')
    downloads = os.path.join(user_home, 'Downloads')
    
    dirs_to_watch = []
    if os.path.exists(docs): dirs_to_watch.append(docs)
    if os.path.exists(downloads): dirs_to_watch.append(downloads)
    
    return dirs_to_watch

def monitor_thread(folder_paths):
    print(f"\n[+] Watchdog Initialized.")
    for path in folder_paths:
        print(f"[*] MONITORING: {path}")
        
    print(f"\n[*] Bootstrapping Database with Existing OS Files...")
    scan_existing_files(folder_paths)
    
    print(f"\n[*] OS Initial Scan Complete. Starting Real-time Event Listener...")
    start_monitor(folder_paths)

if __name__ == "__main__":
    print("="*60)
    print("      SMRITI AI - CORE RUNNER (Watcher + ML Scheduler)")
    print("="*60)
    
    # 1. Start the folder monitor
    folders_to_watch = configure_realtime_folder()
    t = threading.Thread(target=monitor_thread, args=(folders_to_watch,), daemon=True)
    t.start()
    
    # 2. Run the ML Prediction Loop
    print("[+] Background ML Predictor Initialized.")
    print("[*] Auto-evaluating files every 2 seconds...\n")
    
    while True:
        try:
            run_prediction_and_archiving()
            time.sleep(2)
        except KeyboardInterrupt:
            print("\n[-] SMRITI AI Shutting Down...")
            sys.exit(0)
