# PersonalCloudApplication

## 1. Overview
A cross-platform desktop application for personal file management.
- **Goal:** Manage files locally and on cloud providers (MVP: Google Drive).
- **Architecture:** Tauri (Rust Core) + React (UI) + FastAPI (Python Sidecar).

## 2. Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Core:** Tauri (Rust)
- **Backend:** Python FastAPI (bundled as a sidecar)
- **Database:** SQLite (planned for metadata)

## 3. Developer Setup
See \`docs/development/setup.md\` for detailed installation steps.

### Quick Start
1. **Install Dependencies:**
   \`\`\`bash
   npm install
   cd python-backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
   \`\`\`

2. **Run Development Mode:**
   \`\`\`bash
   npm run tauri dev
   \`\`\`

## 4. Architecture Notes
This app uses the **Sidecar Pattern**. The Python backend is compiled into a binary and bundled with the Tauri application. It runs as a subprocess to handle heavy logic and API authentication.