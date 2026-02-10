# PersonalCloudApplication - AI Coding Instructions

## Project Overview
This is a cross-platform desktop application designed for personal file management.
- **Name:** PersonalCloudApplication
- **Goal:** Manage files locally and on cloud providers (MVP: Google Drive).

## Tech Stack & Architecture
1.  **Core:** Tauri (Rust) - Handles windowing, OS interaction, and bundles the sidecar.
2.  **Frontend:** React (Vite) + TypeScript + Tailwind CSS - The user interface.
3.  **Backend (Sidecar):** Python FastAPI - Handles business logic, OAuth, and API integrations.

## Coding Standards

### General
- Write modular, clean code.
- Add comments to complex logic.
- adhere to MVP scope: Hello World -> Google Login -> Drive List.

### Frontend (React)
- Use Functional Components with Hooks.
- Use strict TypeScript typing.
- Communicate with the Backend via HTTP requests to localhost (the Python sidecar).

### Backend (Python)
- Use FastAPI for the server.
- Follow PEP 8 style guidelines.
- Use strict type hinting.
- "Sidecar" pattern: This server runs as a child process of the Tauri app.

### Tauri (Rust)
- Only use Rust for system-level commands or spawning the sidecar.
- Keep the `tauri.conf.json` allowlist minimal for security.
