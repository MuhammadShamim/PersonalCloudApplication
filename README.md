# PersonalCloudApplication
![Splash Screen](./public/splash-screen.png)
![Personal Cloud Application](./public/main-screen.png)

## 1. Overview
A secure, cross-platform desktop application for personal file management.
- **Goal:** Manage files locally and on cloud providers (MVP: Google Drive).
- **Architecture:** Polyglot Stack (Tauri Rust Core + React UI + Python Logic Sidecar).
- **Security:** Military-grade "Shared Secret" authentication.
- **Reliability:** Dynamic Port Allocation (No "Address in use" errors).

## 2. Key Features
- **Hybrid Architecture:** React Frontend + Python Backend (Sidecar).
- **Zero-Config Startup:** Rust automatically finds a free port (e.g., 54321) so the app never crashes due to port conflicts.
- **Secure Handshake:**
    - **Shared Secret:** Rust generates a random 32-char token at launch.
    - **Access Control:** Python backend rejects any request without \`Authorization: Bearer <TOKEN>\`.
    - **Isolation:** Localhost is protected from external/malware access.

## 3. Roadmap & Status

### Phase 1: Foundation (Completed ✅)
- [x] **Project Skeleton:** Setup Rust, Node, Python environments.
- [x] **Sidecar Integration:** Bundle Python FastAPI as a subprocess.
- [x] **UX Polish:** Native Splash Screen.
- [x] **Type Safety:** TypeScript API Client (\`src/api/client.ts\`).
- [x] **Security:** Token-based authentication.
- [x] **Infrastructure:** Dynamic Port Allocation & Configuration Injection.

### Phase 2: Authentication (Next 🚧)
- [ ] **Google Cloud Setup:** Create project and get Client ID/Secret.
- [ ] **OAuth Flow:** Python opens system browser for login.
- [ ] **Token Management:** Securely store Access/Refresh tokens.

## 4. Developer Setup

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
3. **Setup Rust Dependencies:**
   \`\`\`bash
   cd src-tauri
   cargo add rand  # For token generation
   cd ..
   \`\`\`

### Build & Run
**Important:** You must rebuild the Python binary whenever you change \`main.py\`.

\`\`\`bash
# 1. Build Sidecar
cd python-backend
# (Activate venv first)
pyinstaller --clean --onefile --name api main.py
mv dist/api ../src-tauri/bin/api-aarch64-apple-darwin 
# (Note: Use your specific architecture suffix)

# 2. Run App
cd ..
npm run tauri dev
\`\`\`

## 5. Security Architecture
- **Why Dynamic Ports?** Hardcoded ports (8000) cause crashes if other apps use them. We let the OS assign a free port.
- **Why Shared Secret?** Prevents other processes on the user's machine from hijacking the backend.