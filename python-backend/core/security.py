from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings

# Define the security scheme once
bearer_scheme = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    """
    Validates that the Bearer token in the header matches 
    the API_SECRET_TOKEN provided by Rust.
    """
    if credentials.credentials != settings.SECRET_TOKEN:
        # Log this intrusion attempt in a real app
        raise HTTPException(
            status_code=403, 
            detail="Invalid Authentication Token"
        )
    return credentials.credentials