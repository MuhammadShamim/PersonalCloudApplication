# PersonalCloudApplication
![Splash Screen](./public/splash-screen.png)
![Personal Cloud Application](./public/main-screen.png)

## 1. Overview
A cross-platform desktop application for personal file management.
- **Goal:** Manage files locally and on cloud providers (MVP: Google Drive).
- **Current Status:** Phase 1 Complete (App Shell + Python Sidecar + Splash Screen).

## 2. Key Features
- **Hybrid Architecture:** React Frontend + Python Backend (Sidecar).
- **Fast Startup:** Native Rust splash screen while Python backend initializes.
- **Security:** Tauri v2 Capabilities model.

## 3. Developer Setup

### Prerequisites
- Node.js, Rust, Python 3.10+
- \`npm install\`
- \`pip install -r python-backend/requirements.txt\`

### Build & Run
1. **Build Python Sidecar:**
   \`\`\`bash
   cd python-backend
   source venv/bin/activate
   pyinstaller --clean --onefile --name api main.py
   mv dist/api ../src-tauri/bin/api-aarch64-apple-darwin
   \`\`\`
2. **Run App:**
   \`\`\`bash
   npm run tauri dev
   \`\`\`

## 4. Architecture Notes
- **Sidecar:** Python runs as a subprocess. Rebuild binary after changing Python code.
- **Splash Screen:** The main window is hidden until Python reports it is ready.