# Project Structure

## Root Directory
- \`/src-tauri\`: **Rust Core**. Contains \`tauri.conf.json\` and system logic.
- \`/src\`: **React Frontend**. UI components, styles, and assets.
- \`/python-backend\`: **FastAPI Backend**.
    - \`main.py\`: Entry point for the API.
    - \`venv/\`: Python virtual environment (do not commit).
- \`package.json\`: Node dependencies.

## Key Files
- \`src-tauri/tauri.conf.json\`: Main configuration for the desktop window.
- \`src/App.tsx\`: Main React component.