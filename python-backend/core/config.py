import os

class Settings:
    # 1. Rename 'PORT' -> 'API_PORT' so main.py can find it
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # 2. Rename 'SECRET_TOKEN' -> 'API_SECRET_TOKEN'
    API_SECRET_TOKEN: str = os.getenv("API_SECRET_TOKEN", "unsafe-dev-mode")
    
    # CORS Origins
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()