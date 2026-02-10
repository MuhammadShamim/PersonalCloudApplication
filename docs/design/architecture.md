# System Architecture

## The Sidecar Pattern
PersonalCloudApplication uses the Tauri "Sidecar" pattern to bundle a Python executable.

### Data Flow
1. **User Action:** User clicks "Login to Google" in the React UI.
2. **Frontend:** React sends an HTTP GET request to \`http://localhost:port/login\`.
3. **Backend (Sidecar):**
    - The Python FastAPI server receives the request.
    - It generates the Google OAuth URL.
    - It opens the system default browser.
4. **Callback:**
    - Google redirects back to the localhost Python server.
    - Python captures the token and stores it securely.
5. **Response:** Python returns "Success" to the React UI.

### Diagram
[React UI] <--> (HTTP Localhost) <--> [FastAPI Python Server] <--> [Google APIs]
     ^                                         ^
     |                                         |
     ------------------[Tauri App]--------------
            (Manages Lifecycle of both)
