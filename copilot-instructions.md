# PersonalCloudApplication - AI Coding Instructions

## Project Overview
A cross-platform desktop app using Tauri v2, React, and a Python FastAPI sidecar.

## Tech Stack
- **Core:** Tauri v2 (Rust)
- **Frontend:** React + TypeScript + Vite
- **Backend:** Python FastAPI (Sidecar pattern)

## Critical Implementation Details

### 1. Python Sidecar (FastAPI)
- **CORS is Mandatory:** Always add \`CORSMiddleware\` allowing \`*\` origins. Tauri's webview is considered a different origin from localhost.
- **Output Buffering:** Always use \`print("...", flush=True)\`. Without \`flush=True\`, Python buffers output and the Frontend cannot detect when the server is ready.
- **Entry Point:** The script must use \`if __name__ == "__main__":\` to run \`uvicorn.run()\`.

### 2. Tauri v2 Security
- **Capabilities:** Permissions are NOT in \`tauri.conf.json\`. They are in \`src-tauri/capabilities/\`.
- **Shell Plugin:** Use \`@tauri-apps/plugin-shell\` for spawning processes.
- **Spawn vs Execute:** We use \`spawn()\` for long-running servers. Ensure \`shell:allow-spawn\` is granted in capabilities.

### 3. Frontend (React)
- **Readiness Check:** When spawning the sidecar, listen to both \`stdout\` and \`stderr\`. Uvicorn prints startup logs to \`stderr\`.
- **Port:** The Python backend defaults to port \`8000\`.