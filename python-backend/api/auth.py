import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse # <--- NEW IMPORT
from services.google_drive import drive_service
from pydantic import BaseModel # <--- ADD THIS IMPORT

# 1. Create the instance
router = APIRouter()

# 2. Use the instance decorator
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

# --- NEW DOWNLOAD ROUTE ---
@router.get("/download/{file_id}")
def download_drive_file(file_id: str):
    try:
        # Now returns a tuple: (stream, original_filename)
        file_stream, original_name = drive_service.download_file(file_id)
        
        return StreamingResponse(
            file_stream, 
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={original_name}"} 
        )
    except Exception as e:
        print(f"Download Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/download-status/{file_id}")
def get_download_status(file_id: str):
    progress = drive_service.get_progress(file_id)
    return {"file_id": file_id, "progress": progress}

# Define the structure of the incoming request
class UploadRequest(BaseModel):
    file_path: str

@router.post("/upload")
async def upload_file_from_path(request: UploadRequest): # <--- USE THE MODEL
    try:
        file_path = request.file_path
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Local file not found")
        
        file_name = os.path.basename(file_path)
        # Assuming drive_service.upload_file is already updated as per previous step
        result = drive_service.upload_file(file_path, file_name)
        return {"status": "success", "file_id": result.get('id')}
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))