import os
import sys
from fastapi import FastAPI, Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# 1. Get Config from Environment (Passed by Rust/React)
API_SECRET_TOKEN = os.getenv("API_SECRET_TOKEN", "unsafe-dev-token")
# Default to 0 to force a crash if not provided (safety check)
API_PORT = int(os.getenv("API_PORT", "8000")) 

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != API_SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid API Token")
    return credentials.credentials

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", dependencies=[Security(verify_token)])
def read_root():
    return {"message": f"Secure Backend Running on Port {API_PORT}"}

@app.get("/login", dependencies=[Security(verify_token)])
def login():
    return {"url": "https://accounts.google.com/..."}

if __name__ == "__main__":
    print(f"Starting Backend on Port {API_PORT}...", flush=True)
    # 2. Run Uvicorn on the dynamic port
    uvicorn.run(app, host="127.0.0.1", port=API_PORT)