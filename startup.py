import os
import sys
import time
import threading

# Add project root to sys path
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.monitor.watcher import start_monitor
from scripts.scheduler import run_prediction_and_archiving

def configure_realtime_folder():
    """Sets up a secure folder on the desktop for the user to drop files into and test SMRITI."""
    desktop = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop') 
    target_dir = os.path.join(desktop, 'SMRITI_Test_Folder')
    os.makedirs(target_dir, exist_ok=True)
    return target_dir

def monitor_thread(folder_path):
    print(f"\n[+] Watchdog Initialized.")
    print(f"[*] REAL-TIME MONITORING FOLDER: {folder_path}")
    print("[*] Drop files into this folder to see them appear on the dashboard.\n")
    start_monitor([folder_path])

if __name__ == "__main__":
    print("="*60)
    print("      SMRITI AI - CORE RUNNER (Watcher + ML Scheduler)")
    print("="*60)
    
    # 1. Start the folder monitor
    folder_to_watch = configure_realtime_folder()
    t = threading.Thread(target=monitor_thread, args=(folder_to_watch,), daemon=True)
    t.start()
    
    # 2. Run the ML Prediction Loop
    print("[+] Background ML Predictor Initialized.")
    print("[*] Auto-evaluating files every 30 seconds...\n")
    
    while True:
        try:
            run_prediction_and_archiving()
            time.sleep(30)
        except KeyboardInterrupt:
            print("\n[-] SMRITI AI Shutting Down...")
            sys.exit(0)
