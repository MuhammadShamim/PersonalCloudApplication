# Python Sidecar Development Guide

## 1. The Secure Python Server
The backend is a FastAPI application that acts as a Sidecar. It is **secured** by a mandatory Bearer Token.

### Key Requirements
1.  **CORS:** Must allow \`*\` origin.
2.  **Auth:** Must check \`Authorization: Bearer <token>\`.
3.  **Env:** Reads \`API_SECRET_TOKEN\` from environment variables.

### Minimal Secure Code Template
\`\`\`python
import os
from fastapi import FastAPI, Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
security = HTTPBearer()

# Default to insecure token ONLY for manual dev testing
SECRET = os.getenv("API_SECRET_TOKEN", "dev-manual-mode")

def verify_token(creds: HTTPAuthorizationCredentials = Security(security)):
    if creds.credentials != SECRET:
        raise HTTPException(403, "Invalid Token")
    return creds.credentials

@app.get("/", dependencies=[Security(verify_token)])
def health_check():
    return {"status": "secure_and_ready"}
\`\`\`

## 2. Running Locally (Manual Test)
Since the app expects a token, you must provide one when testing manually:

\`\`\`bash
# Linux/Mac
export API_SECRET_TOKEN="my-test-token"
uvicorn main:app --reload

# Then in a separate terminal:
curl http://127.0.0.1:8000/ -H "Authorization: Bearer my-test-token"
\`\`\`

## 3. Build Process (Production)
The build process remains the same, but remember: **The binary must be rebuilt if you change security logic.**
\`\`\`bash
pyinstaller --clean --onefile --name api main.py
\`\`\`