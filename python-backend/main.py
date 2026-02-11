import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routes import router

# 1. Initialize App
app = FastAPI(title="Personal Cloud Sidecar")

# 2. Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Include our Modular Routes
app.include_router(router)

if __name__ == "__main__":
    # 4. Start Server
    # Note: We use settings.PORT which comes dynamically from Rust
    print(f"Starting Modular Backend on Port {settings.PORT}...", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=settings.PORT)