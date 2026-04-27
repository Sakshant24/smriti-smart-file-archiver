import pystray
from PIL import Image, ImageDraw
import subprocess
import threading
import sys
import os
import webbrowser

# Add project root to sys path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

# Global process holders
api_process = None
watcher_process = None

def create_image():
    """Generates a dynamic abstract icon for the system tray (a glowing indigo dot)."""
    image = Image.new('RGB', (64, 64), color=(15, 15, 20))
    d = ImageDraw.Draw(image)
    d.ellipse((16, 16, 48, 48), fill=(99, 102, 241), outline=(199, 210, 254), width=2)
    return image

def start_services(icon, item):
    global api_process, watcher_process
    if not api_process:
        api_process = subprocess.Popen(["python", "-m", "uvicorn", "backend.api.main:app"], cwd=project_root)
    if not watcher_process:
        watcher_process = subprocess.Popen(["python", "startup.py"], cwd=project_root)
    print("SMRITI OS Services Started.")

def launch_dashboard(icon, item):
    webbrowser.open("http://localhost:5173")

def quit_app(icon, item):
    global api_process, watcher_process
    icon.stop()
    if api_process:
        api_process.terminate()
    if watcher_process:
        watcher_process.terminate()
    os._exit(0)

print("Starting SMRITI Background System Tray...")

menu = pystray.Menu(
    pystray.MenuItem('Launch Dashboard', launch_dashboard),
    pystray.MenuItem('Start AI Watchdog Services', start_services),
    pystray.MenuItem('Quit SMRITI', quit_app)
)

icon = pystray.Icon("SMRITI", create_image(), "SMRITI Sub-OS", menu)
icon.run()
