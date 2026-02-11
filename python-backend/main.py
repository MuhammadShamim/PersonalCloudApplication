import os
import sys
from fastapi import FastAPI, Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# 1. Get the Secret Token from Environment (Passed by Rust)
# In dev mode (manual run), we can default to "dev-token" for easier testing
API_SECRET_TOKEN = os.getenv("API_SECRET_TOKEN", "dev-token-insecure-default")

# 2. Security Scheme
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Validates the Bearer token against our secret."""
    if credentials.credentials != API_SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid API Token")
    return credentials.credentials

# 3. Add CORS (Still needed for browser fetch)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Protect Routes
# We apply the dependency to specific routes or globally
@app.get("/")
def read_root(token: str = Security(verify_token)):
    return {"message": "Secure Backend Connected! 🔒"}

@app.get("/login")
def login(token: str = Security(verify_token)):
    return {"url": "https://accounts.google.com/o/oauth2/v2/auth..."}

if __name__ == "__main__":
    # Ensure stdout flushing for Tauri
    print(f"Starting Secure Backend... (Token protection active)", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=8000)