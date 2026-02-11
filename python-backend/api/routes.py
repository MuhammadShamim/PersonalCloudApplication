from fastapi import APIRouter, Depends
from core.config import settings
from core.security import verify_token

# Create a router to hold our endpoints
router = APIRouter(dependencies=[Depends(verify_token)])

@router.get("/")
def health_check():
    """
    Root endpoint to verify backend is running and secure.
    """
    return {
        "status": "online",
        "system": "Personal Cloud Backend",
        "port": settings.PORT
    }

@router.get("/login")
def login_route():
    """
    Placeholder for Google OAuth login.
    """
    return {
        "url": "https://accounts.google.com/o/oauth2/v2/auth...",
        "message": "Login flow not yet implemented"
    }