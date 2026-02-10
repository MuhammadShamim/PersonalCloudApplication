from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <--- Import this
import uvicorn
import sys

app = FastAPI()

# <--- Add this block to allow the frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (simplest for local apps)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from PersonalCloudApplication Backend!"}

@app.get("/login")
def login():
    return {"url": "https://accounts.google.com/o/oauth2/v2/auth..."}

if __name__ == "__main__":
    try:
        print("Starting PersonalCloud Backend...", flush=True)
        uvicorn.run(app, host="127.0.0.1", port=8000)
    except Exception as e:
        print(f"Error starting server: {e}", flush=True)