# PersonalCloudApplication - AI Coding Instructions

## Project Overview
A secure, modular desktop app using Tauri v2 (Rust), React, and Python.

## Critical Architecture Rules (Strict Compliance)

### 1. Rust Core (\`src-tauri/src/\`)
- **Pattern:** Modular split.
- **\`commands.rs\`**: ALL \`#[tauri::command]\` functions MUST go here.
- **\`state.rs\`**: ALL shared structs/enums MUST go here.
- **\`lib.rs\`**: Only for setup and registration. NEVER write business logic here.

### 2. Python Sidecar (\`python-backend/\`)
- **Pattern:** FastAPI Service Layer.
- **\`main.py\`**: Setup only (CORSMiddleware, Uvicorn).
- **\`api/routes.py\`**: Route definitions.
- **\`core/config.py\`**: Environment variable loading (Port/Token).
- **Rule:** NEVER hardcode ports (8000). Always use \`settings.PORT\`.

### 3. Frontend (\`src/\`)
- **Pattern:** Logic/View Separation.
- **\`hooks/\`**: All side-effects (Process spawning, Event listening) MUST go into custom hooks (e.g., \`useSidecar\`).
- **\`components/\`**: UI components must be "dumb" (props in, JSX out).
- **\`App.tsx\`**: Layout only. Connects Hooks to Components.

### 4. Security Protocol
- **Shared Secret:**
    - Rust generates \`API_SECRET_TOKEN\`.
    - React fetches it via \`invoke('get_server_config')\`.
    - React injects it into Python Env.
    - Python middleware enforces \`Authorization: Bearer <TOKEN>\`.

## File Placement Guide
- New React Logic -> \`src/hooks/\`
- New UI Element -> \`src/components/\`
- New Backend Route -> \`python-backend/api/\`
- New Tauri Command -> \`src-tauri/src/commands.rs\`