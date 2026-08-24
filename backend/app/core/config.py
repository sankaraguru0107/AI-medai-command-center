import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MedAI Command Center API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "medai_secret_key_super_secure_12345")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # MySQL Database Connection String
    # Format: mysql+pymysql://user:password@host:port/dbname
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql+pymysql://root:password@localhost:3306/medai_db"
    )
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    # Ignore extra fields in .env file (such as AZURE_OPENAI_KEY or VITE_* variables)
    model_config = SettingsConfigDict(extra="ignore", case_sensitive=True, env_file=".env")

settings = Settings()
