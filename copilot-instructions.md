# PersonalCloudApplication - AI Coding Instructions

## Project Overview
A cross-platform desktop app using Tauri v2, React, and a Python FastAPI sidecar.

## Tech Stack
- **Core:** Tauri v2 (Rust)
- **Frontend:** React + TypeScript + Vite
- **Backend:** Python FastAPI (Sidecar pattern)

## Critical Patterns & Rules

### 1. Splash Screen & Initialization
- **Pattern:** The app launches with a **static HTML splash screen** (\`public/splashscreen.html\`). The main React window is **hidden** by default.
- **Rust Command:** Do NOT remove \`close_splashscreen\` from \`lib.rs\`. This command performs the window swap.
- **Trigger:** The Frontend must call \`invoke("close_splashscreen")\` ONLY after receiving the "Application startup complete" log from the Python sidecar.

### 2. Python Sidecar (FastAPI)
- **CORS:** Always use \`CORSMiddleware\` allowing \`*\`.
- **Output:** Always use \`print(..., flush=True)\` to avoid buffering.
- **Entry Point:** Must use \`if __name__ == "__main__":\` block.

### 3. Tauri v2 Security
- **Capabilities:** Permissions are in \`src-tauri/capabilities/default.json\`.
- **Shell:** Use \`shell:allow-spawn\` for the sidecar.
- **IPC:** Use \`@tauri-apps/api/core\` for \`invoke\`.

### 4. File Structure
- \`src-tauri/src/lib.rs\`: Registers plugins and window commands.
- \`src/App.tsx\`: Handles Sidecar spawning and Splash screen dismissal.