import os

class Settings:
    # Default to 8000/dev-token only if env vars are missing (Dev mode)
    PORT: int = int(os.getenv("API_PORT", "8000"))
    SECRET_TOKEN: str = os.getenv("API_SECRET_TOKEN", "unsafe-dev-mode")
    
    # CORS Origins
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()