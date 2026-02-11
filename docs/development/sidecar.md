# Python Sidecar Development Guide

## 1. The Secure, Dynamic Server
The backend is a FastAPI application that runs on a **Dynamic Port** assigned by the Tauri host.

### Key Requirements
1.  **Dynamic Port:** Must read \`API_PORT\` from environment (default to 8000 only for dev).
2.  **Shared Secret:** Must read \`API_SECRET_TOKEN\` from environment.
3.  **CORS:** Must allow \`*\` origin.

### Minimal Code Template
\`\`\`python
import os
import uvicorn
from fastapi import FastAPI, Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
security = HTTPBearer()

# CONFIGURATION (Injected by Rust/React)
API_PORT = int(os.getenv("API_PORT", "8000"))
API_SECRET = os.getenv("API_SECRET_TOKEN", "unsafe-dev-mode")

def verify_token(creds: HTTPAuthorizationCredentials = Security(security)):
    if creds.credentials != API_SECRET:
        raise HTTPException(403, "Invalid Token")
    return creds.credentials

@app.get("/", dependencies=[Security(verify_token)])
def root():
    return {"status": "running", "port": API_PORT}

if __name__ == "__main__":
    # Must use flush=True for Tauri logs
    print(f"Starting on Port {API_PORT}...", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=API_PORT)
\`\`\`

## 2. Build Process
**Crucial:** You must rebuild the binary every time you change \`main.py\`.
\`\`\`bash
pyinstaller --clean --onefile --name api main.py
\`\`\`