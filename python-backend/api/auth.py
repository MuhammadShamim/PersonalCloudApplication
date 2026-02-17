from fastapi import APIRouter, HTTPException
from services.google_drive import drive_service

# 1. Create the instance
router = APIRouter()

# 2. Use the instance decorator (NOT APIRouter.post)
@router.post("/login")
def login_google():
    """
    Triggers the Google Login Flow.
    Running as synchronous 'def' ensures FastAPI puts this in a thread,
    so the 'run_local_server' blocking call doesn't freeze the whole app.
    """
    try:
        status = drive_service.authenticate()
        return status
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="client_secret.json not found on server")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files")
def list_drive_files():
    """Fetches top 10 files to prove auth worked."""
    try:
        files = drive_service.list_files()
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Not authenticated")