# PersonalCloudApplication - AI Coding Instructions

## Project Overview
A cross-platform desktop app using Tauri v2, React, and a Python FastAPI sidecar.

## Tech Stack
- **Core:** Tauri v2 (Rust) - 
- **Frontend:** React + TypeScript + Vite
- **Backend:** Python FastAPI (Sidecar pattern)

## Critical Architecture Patterns

### 1. API Communication (Strict Rule)
- **Client:** All backend communication MUST go through \`src/api/client.ts\`.
- **Usage:** Do NOT use raw \`fetch()\` in components. Import \`api\` and call methods like \`api.healthCheck()\`.
- **Transport:** Use the browser's **Native Fetch API**. Do NOT use \`@tauri-apps/plugin-http\` for localhost communication (it adds unnecessary complexity for local sidecars).

### 2. Python Sidecar (FastAPI)
- **CORS:** The backend MUST enable \`CORSMiddleware\` allowing \`*\` to support the native fetch from localhost.
- **Output:** Always use \`print(..., flush=True)\`.
- **Entry Point:** The script must use \`if __name__ == "__main__":\` to run \`uvicorn.run()\`.

### 3. Splash Screen & Initialization
- **Strategy:** \`public/splashscreen.html\` (Static HTML) -> React (Hidden Window) -> Window Swap.
- **Rust Command:** \`close_splashscreen\` in \`lib.rs\` handles the swap.
- **Trigger:** React calls \`invoke("close_splashscreen")\` ONLY after the API confirms the backend is healthy.

### 4. Tauri v2 Security
- **Capabilities:** Permissions are in \`src-tauri/capabilities/default.json\`.
- **Shell:** Use \`shell:allow-spawn\` for \`bin/api\`.

## File Structure Standards
- \`src/api/\`: Contains \`client.ts\` (Data Access Layer).
- \`src-tauri/src/lib.rs\`: Registers plugins and window commands.
- \`python-backend/\`: specific folder for the FastAPI sidecar.