# UI/UX Architecture

## 1. Splash Screen Pattern
The application uses a **Multi-Window Initialization Strategy** to ensure perceived performance and reliability.

### The Problem
- The Python Sidecar takes 1-3 seconds to start up (loading libraries, binding ports).
- Showing a blank white screen while React loads is a poor user experience.
- React components cannot render until the webview is fully initialized.

### The Solution
We use a lightweight, static HTML file as the initial window.

1.  **Window A (Splash):**
    - Source: \`public/splashscreen.html\`
    - Type: Static HTML/CSS (No JS framework).
    - Behavior: Loads instantly, shows branding/spinner.
    - Configuration: \`decorations: false\`, \`center: true\`.

2.  **Window B (Main App):**
    - Source: React App
    - Visibility: **Hidden** by default (\`visible: false\` in \`tauri.conf.json\`).
    - Behavior: Loads in background, waits for Sidecar.

### The Handshake
1.  **React Starts:** React app launches (invisible) and spawns the Python sidecar.
2.  **Sidecar Ready:** Python prints \`Application startup complete\`.
3.  **Frontend Signal:** React detects the log, waits 1s (for effect), and calls the Rust command.
4.  **Rust Command (\`close_splashscreen\`):**
    - Closes Window A.
    - Shows Window B.

## 2. Window Configuration
Managed in \`src-tauri/tauri.conf.json\`.
- **main:** The React app. Hidden on launch.
- **splashscreen:** The loader. Shown on launch.