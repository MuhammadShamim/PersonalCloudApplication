# PersonalCloudApplication - AI Coding Instructions

## Project Overview
A secure, military-grade desktop app using Tauri v2 (Rust), React, and Python.

## Critical Architecture Rules (DO NOT BREAK)

### 1. Dynamic Infrastructure (Strict Rule)
- **Ports:** NEVER hardcode port 8000 in production logic.
- **Source of Truth:** Rust (\`src-tauri/src/lib.rs\`) determines the Port and Token.
- **Data Flow:** Rust -> React -> Python (via Env Vars).

### 2. Security Handshake
- **Shared Secret:**
    - Rust generates \`API_SECRET_TOKEN\`.
    - Python rejects requests without \`Authorization: Bearer <TOKEN>\`.
    - React must call \`api.configure(config)\` before making requests.

### 3. Frontend (React)
- **File:** \`src/api/client.ts\`
- **Rule:** Do NOT use hardcoded URLs (\`localhost:8000\`). Use \`this.baseUrl\` derived from the config.
- **Rule:** Use **Native Fetch** (not Tauri HTTP plugin).

### 4. Backend (Python)
- **File:** \`python-backend/main.py\`
- **Rule:** Must accept \`API_PORT\` and \`API_SECRET_TOKEN\` from \`os.environ\`.
- **Rule:** Always use \`print(..., flush=True)\`.

## File Structure
- \`src-tauri/src/lib.rs\`: Logic for \`get_server_config\` and \`get_free_port\`.
- \`src/App.tsx\`: Orchestrator (Get Config -> Configure Client -> Spawn Sidecar).