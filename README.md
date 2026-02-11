# PersonalCloudApplication
![Splash Screen](./public/splash-screen.png)
![Personal Cloud Application](./public/main-screen.png)

## 1. Overview
A cross-platform desktop application for personal file management, built with a "Polyglot" architecture to combine performance, UI quality, and data capabilities.

- **Goal:** Manage files locally and on cloud providers (MVP: Google Drive).
- **Architecture:** Tauri (Rust) + React (UI) + Python (Logic Sidecar).

## 2. Roadmap & Status

### Phase 1: Foundation (Completed ✅)
- [x] **Project Skeleton:** Setup Rust, Node, Python environments.
- [x] **Sidecar Integration:** Bundle Python FastAPI as a subprocess.
- [x] **Inter-Process Communication:** React talks to Python via localhost.
- [x] **UX Polish:** Native Splash Screen to hide backend startup time.
- [x] **Architecture:** Typed API Client (\`src/api/client.ts\`) for type-safe requests.

### Phase 2: Authentication (Next 🚧)
- [ ] **Google Cloud Setup:** Create project and get Client ID/Secret.
- [ ] **OAuth Flow:** Python opens system browser for login.
- [ ] **Token Management:** Securely store Access/Refresh tokens.
- [ ] **User Profile:** Display user name and avatar in React.

### Phase 3: Drive Integration
- [ ] **List Files:** Fetch file tree from Google Drive API.
- [ ] **File Operations:** Download/Upload functionality.

## 3. Developer Setup

### Prerequisites
- Node.js & npm
- Rust (Cargo)
- Python 3.10+

### Installation
1. **Install Frontend Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`
2. **Setup Backend:**
   \`\`\`bash
   cd python-backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   \`\`\`

### Build & Run
**Important:** You must rebuild the Python binary whenever you change \`main.py\`.
\`\`\`bash
# 1. Build Sidecar
cd python-backend
pyinstaller --clean --onefile --name api main.py
mv dist/api ../src-tauri/bin/api-aarch64-apple-darwin 
# (Note: Use your specific architecture suffix)

# 2. Run App
cd ..
npm run tauri dev
\`\`\`

## 4. Key Design Decisions
- **Why 3 Languages?** Rust for OS security, React for UI, Python for complex API logic.
- **Why Native Fetch?** We use standard browser fetch + CORS for simplicity and speed.
- **Why Static Splash?** \`public/splashscreen.html\` loads instantly, masking the 2s Python startup.