# System Architecture

## 1. High-Level Design
PersonalCloudApplication follows a **Hybrid Desktop Architecture**.
- **Core:** Tauri (Rust) manages the application lifecycle, windows, and system security.
- **UI:** React (TypeScript) runs in a webview to provide the user interface.
- **Logic:** Python (FastAPI) runs as a **Sidecar** (subprocess) to handle business logic, file operations, and OAuth.

## 2. The Sidecar Pattern
Instead of compiling Python into the main binary, we bundle it as a standalone executable.
- **Communication:** The Frontend talks to the Backend via HTTP (REST API) over `localhost`.
- **Security:** The Sidecar is only accessible from `127.0.0.1`.
- **Lifecycle:** The Sidecar is spawned by the React app on launch and killed by Tauri when the app closes.

## 3. Initialization Flow (Splash Screen)
To mask the Python startup time (approx. 1-2s), we use a multi-window strategy.

### Startup Sequence Diagram`
```mermaid
sequenceDiagram
    actor User
    participant Rust as Tauri Core (Rust)
    participant Splash as Splash Window (HTML)
    participant React as Main Window (React)
    participant Python as Python Sidecar (FastAPI)

    User->>Rust: Launch App
    
    rect rgb(240, 240, 240)
        note right of Rust: Initialization Phase
        Rust->>Splash: Create & Show Window (splashscreen.html)
        Rust->>React: Create Hidden Window (App.tsx)
    end
    
    Note over Splash: Spinner Animation...

    React->>Rust: Command.sidecar("bin/api").spawn()
    Rust->>Python: Start Subprocess
    
    loop Output Monitoring
        Python-->>React: [stderr] "INFO: Started server process"
        Python-->>React: [stderr] "INFO: Application startup complete"
    end

    React->>React: Detect "startup complete" log
    
    rect rgb(220, 255, 220)
        note right of React: Handover Phase
        React->>Rust: invoke("close_splashscreen")
        Rust->>Splash: Close Window
        Rust->>React: Show Main Window
    end
    
    User->>React: See App Interface
    
    rect rgb(240, 240, 255)
        note right of React: Runtime Phase
        User->>React: Click "Ping Backend"
        React->>Python: HTTP GET http://127.0.0.1:8000/
        Python-->>React: JSON {"message": "Hello"}
    end
```

## 4. Key Components

### A. Tauri Core (`src-tauri`)
- **`lib.rs`**: Registers the `shell` plugin and the `close_splashscreen` command.
- **`capabilities/default.json`**: Grants permission to spawn the `bin/api` sidecar.
- **`tauri.conf.json`**: Configures the two windows (`main` hidden, `splashscreen` visible).

### B. Python Sidecar (`python-backend`)
- **`main.py`**: The FastAPI entry point.
- **Requirements:**
    - Must use `CORSMiddleware` to allow requests from the Tauri origin.
    - Must use `print(..., flush=True)` to ensure logs reach React instantly.

### C. Frontend (`src`)
- **`App.tsx`**: Orchestrates the startup. It spawns the sidecar, listens for the "Ready" signal, and triggers the window swap.

## 5. Technology Rationale (The "Triple Stack")

Our architecture is "Polyglot," meaning it uses specific languages for specific domains to maximize performance and developer productivity.

### A. Rust (Tauri Core) - The "Body"
- **Role:** Operating System (OS) Interface & Security.
- **Why:** Rust is memory-safe and has a tiny footprint. It handles window creation, file system permissions, and spawning the sidecar securely.
- **Alternative:** Electron (uses Node.js). We rejected Electron because it is heavy (bundles Chrome) and uses 10x more RAM.

### B. React (Frontend) - The "Face"
- **Role:** User Interface (UI).
- **Why:** React is the industry standard for interactive UIs. It offers the richest ecosystem of component libraries (charts, grids, animations) that are hard to build in native Rust or Python (Tkinter).

### C. Python (Sidecar) - The "Brain"
- **Role:** Business Logic & Integrations.
- **Why:** Python has the world's best libraries for Data Science, AI, and Cloud APIs (Google Drive).
- **Justification:** Writing complex Google API OAuth logic or image processing in Rust is difficult and slow. In Python, it is effortless. We trade a small amount of startup speed for massive development speed.

## 6. Security Architecture (The "Secure Handshake")

To prevent unauthorized access to the local backend (e.g., from malicious browser extensions or malware), we implement a **Shared Secret Authentication** protocol.

### The Problem
By default, \`localhost:8000\` is open to any process on the machine. A malicious script could theoretically send commands to delete files if it guessed the port.

### The Solution: Ephemeral Bearer Tokens
We use a "Defense in Depth" strategy where the Rust Core acts as the Source of Truth for security.

### Protocol Flow
1.  **Generation:** On app launch, Rust generates a cryptographically secure random 32-char string (\`API_SECRET_TOKEN\`).
2.  **Injection:** React asks Rust for this token via \`invoke('get_api_token')\`.
3.  **Spawn:** React spawns the Python Sidecar, passing the token as a **private environment variable**.
4.  **Enforcement:** Python's FastAPI middleware rejects *any* request that does not include the header \`Authorization: Bearer <TOKEN>\`.

### Security Sequence Diagram
```mermaid
sequenceDiagram
    participant Rust as Tauri Core
    participant React as Frontend (UI)
    participant Python as Sidecar (API)

    Note over Rust: App Launch
    Rust->>Rust: Generate Random Token (e.g. "aB3...")
    
    React->>Rust: invoke("get_api_token")
    Rust-->>React: Returns "aB3..."
    
    React->>React: Store Token in Memory (APIClient)
    
    Note over React: Spawning Sidecar
    React->>Python: Spawn Process (env: API_SECRET_TOKEN="aB3...")
    
    Note over Python: Server Start
    Python->>Python: Load Token from Env
    Python->>Python: Enable Auth Middleware
    
    Note over React: Runtime
    React->>Python: GET /files (Header: Authorization: Bearer aB3...)
    Python->>Python: Verify Token == Env Token
    Python-->>React: 200 OK (Data)
    
    Note over React: Attack Attempt
    React->>Python: GET /files (No Header)
    Python-->>React: 403 Forbidden
```

## 7. Dynamic Infrastructure (Port & Security)

To ensure reliability across different environments, the application uses **Dynamic Port Allocation** instead of hardcoded ports.

### The Problem
- Hardcoding \`localhost:8000\` fails if the port is already in use by another application.
- Managing secrets and ports separately in 3 languages is error-prone.

### The Solution: Rust as "Source of Truth"
Rust (Tauri Core) is responsible for defining the infrastructure configuration at runtime.

### Orchestration Flow
1.  **Rust Startup:**
    - Binds to Port 0 (OS assigns a random free port, e.g., \`54321\`).
    - Generates a random 32-char \`API_SECRET_TOKEN\`.
    - Stores \`{ port, token }\` in the global AppState.

2.  **Frontend Config:**
    - React invokes \`get_server_config\`.
    - Rust returns the JSON object: \`{ "port": 54321, "token": "xyz..." }\`.
    - React configures the API Client with the base URL \`http://127.0.0.1:54321\`.

3.  **Backend Config:**
    - React spawns the Python Sidecar using \`Command.sidecar\`.
    - Injects Environment Variables: \`API_PORT=54321\` and \`API_SECRET_TOKEN=xyz...\`.
    - Python starts Uvicorn on the specified port.

### Sequence Diagram
```mermaid
sequenceDiagram
    participant Rust as Tauri Core
    participant React as Frontend
    participant Python as Sidecar

    Note over Rust: App Launch
    Rust->>Rust: Find Free Port (e.g. 54321)
    Rust->>Rust: Generate Token (e.g. "SecretKey")
    
    React->>Rust: invoke("get_server_config")
    Rust-->>React: { port: 54321, token: "SecretKey" }
    
    React->>React: api.configure(port, token)
    
    React->>Python: Spawn Process (env: API_PORT=54321, API_SECRET_TOKEN=...)
    
    Python->>Python: Uvicorn.run(port=54321)
    
    React->>Python: GET http://127.0.0.1:54321/ (Auth: Bearer SecretKey)
    Python-->>React: 200 OK
```