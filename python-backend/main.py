import uvicorn
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api import auth  # <--- IMPORT AUTH MODULE

app = FastAPI()

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Strict: ["http://localhost:1420"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Middleware (Security)
@app.middleware("http")
async def verify_shared_secret(request: Request, call_next):
    # Allow OPTIONS requests (CORS preflight) without token
    if request.method == "OPTIONS":
        return await call_next(request)

    token = request.headers.get("Authorization")
    
    # We check if the token matches 'Bearer <API_SECRET_TOKEN>'
    expected_token = f"Bearer {settings.API_SECRET_TOKEN}"
    
    if token != expected_token:
        # Return 403 Forbidden if tokens don't match
        # (Or 401 if you prefer "Unauthorized")
        return await call_next(request) # <--- STOP! Read NOTE below.
        # Ideally, we return a JSONResponse(status_code=403) here.
        # But for simplicity in this step, let's keep the existing logic or fix it.
    
    response = await call_next(request)
    return response

# Note: The middleware logic above had a small bug in our previous session 
# (it was returning call_next even on failure). Let's fix it properly now:

from fastapi.responses import JSONResponse

@app.middleware("http")
async def verify_shared_secret_fixed(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    
    # Skip auth for docs (optional)
    if request.url.path in ["/docs", "/openapi.json"]:
        return await call_next(request)

    token = request.headers.get("Authorization")
    expected_token = f"Bearer {settings.API_SECRET_TOKEN}"
    
    if token != expected_token:
        return JSONResponse(
            status_code=403, 
            content={"detail": "Invalid Authentication Token"}
        )
    
    return await call_next(request)

# Routes
@app.get("/")
def health_check():
    return {
        "status": "online", 
        "port": settings.API_PORT, 
        "system": "Personal Cloud Backend"
    }

# Register the Auth Router
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

if __name__ == "__main__":
    # Ensure logs allow us to signal React when ready
    print(f"INFO: Started server process on port {settings.API_PORT}", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=settings.API_PORT)