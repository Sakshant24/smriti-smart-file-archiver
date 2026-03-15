# SMRITI (Smart Monitoring and Resource Intelligent Temporal Indexer)

SMRITI is a full-stack, cross-platform Operating Systems project that monitors file usage across your PC, uses a Machine Learning model (Decision Tree Classifier) to predict file dormancy, and intelligently archives inactive files to optimize your disk space.

It features a robust Python/FastAPI backend, background OS-level file monitoring, and a sleek, dynamic React dashboard with Tailwind CSS.

## Key Features & OS Concepts Demonstrated
* **File System Monitoring:** Uses `watchdog` to abstract OS differences (Windows WinAPI, Linux inotify, macOS FSEvents) and track real-time access and modifications.
* **System Calls:** Relies on deep OS calls (`os.stat`, `os.path`) for metadata extraction.
* **Concurrency & Background Processes:** A standalone scheduler and observer thread manage continuous monitoring and periodic ML prediction without blocking the main REST API.
* **Predictive ML Archiving:** A Decision Tree model automatically flags files that are no longer used based on access frequency, size, and idle days.

## Project Structure
```text
smriti/
├── backend/
│   ├── api/          # FastAPI Routes (main.py)
│   ├── archive/      # Zipfile compression and restoration
│   ├── db/           # SQLite SQLAlchemy Models
│   ├── ml/           # Model training and prediction
│   └── monitor/      # Background file watcher
├── frontend/
│   └── react-dashboard/ # React + Vite UI
├── scripts/
│   └── scheduler.py  # Automation thread
└── README.md
```

## Setup Instructions

### 1. Backend Setup (Python)
Ensure Python 3.10+ is installed.

```bash
cd smritifilearchiver
pip install -r requirements.txt
```

**Start the API Server:**
```bash
uvicorn backend.api.main:app --reload
```

**Start the OS Monitor & Scheduler (In a separate terminal):**
```bash
python scripts/scheduler.py
```

### 2. Frontend Setup (React/Node.js)
Ensure Node.js 18+ is installed.

```bash
cd frontend/react-dashboard
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.

## Architecture Details
1. **File Monitoring:** Triggers on OS system events, pulls `stat` data, and updates an SQLite DB.
2. **Machine Learning:** Looks for files with high relative inactivity and low access count to output a binary (1/0) 'dormant' classification. 
3. **Archiver:** Uses `zipfile` streams to compress large dormant files to a separate `data/archives` vault. Stored mappings allow immediate 1-click restore from UI.
