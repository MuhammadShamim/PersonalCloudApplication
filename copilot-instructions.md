# PersonalCloudApplication - AI Coding Instructions

## Project Overview
A secure, military-grade desktop app using Tauri v2 (Rust), React, and Python.

## Critical Security Rules (DO NOT BREAK)
1.  **Shared Secret Auth:**
    - Rust MUST generate a random \`api_token\` at runtime.
    - Python MUST enforce \`Authorization: Bearer <token>\` on ALL sensitive endpoints.
    - React MUST fetch the token from Rust and inject it into the API Client.
2.  **Environment Variables:**
    - The token is passed to Python via the \`env\` parameter in \`Command.sidecar\`.
    - NEVER hardcode tokens in source code.

## Tech Stack Guidelines

### 1. Tauri Core (Rust)
- **File:** \`src-tauri/src/lib.rs\`
- **Responsibilities:**
    - Generate \`api_token\` (using \`rand\` crate).
    - Expose \`get_api_token\` command.
    - Manage Splash Screen lifecycle.

### 2. Frontend (React)
- **File:** \`src/api/client.ts\`
- **Responsibilities:**
    - Store the token in a private variable.
    - Attach \`Authorization\` header to native \`fetch\` calls.
    - Use **Native Fetch** (not Tauri HTTP plugin).

### 3. Backend (Python)
- **File:** \`python-backend/main.py\`
- **Responsibilities:**
    - Use \`fastapi.security.HTTPBearer\`.
    - Validate token against \`os.getenv("API_SECRET_TOKEN")\`.
    - Enable CORS for localhost.