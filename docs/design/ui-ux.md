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

## 3. Splash Screen Technical Implementation

### Why \`public/splashscreen.html\`?
The splash screen is placed in the \`public/\` directory instead of being a React component for specific performance reasons:

1.  **Bypass the Build Process:** Files in \`public/\` are served raw by the Tauri webview. They do not need to be compiled, bundled, or parsed by Vite.
2.  **Zero-Dependency Rendering:** React requires the V8 JavaScript engine to load, parse \`bundle.js\`, and "hydrate" the Virtual DOM before a single pixel appears. This takes 200-500ms. A static HTML file renders in <10ms.
3.  **Fault Tolerance:** If the React application crashes on startup (e.g., a syntax error or bad import), the splash screen remains visible, preventing a "White Screen of Death."

### Lifecycle State Machine
1.  **State: Launch** -> Rust opens \`splashscreen.html\` (Visible).
2.  **State: Loading** -> Rust starts React Window (Hidden) + Spawns Python Sidecar.
3.  **State: Ready** -> Python emits "Startup Complete" signal.
4.  **State: Transition** -> React invokes \`close_splashscreen\`.
5.  **State: Active** -> Splash closes, React Window becomes visible.