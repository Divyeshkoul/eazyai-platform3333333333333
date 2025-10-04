from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Azure OpenAI
    AZURE_OPENAI_KEY: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_API_VERSION: str = "2024-04-01-preview"
    
    # Azure Storage
    AZURE_STORAGE_CONNECTION_STRING: str
    AZURE_RESUMES_CONTAINER: str = "resumes"
    AZURE_SUMMARIES_CONTAINER: str = "summaries"
    AZURE_CSV_CONTAINER: str = "csvdata"
    
    # Gmail
    GMAIL_EMAIL: str
    GMAIL_APP_PASSWORD: str
    GMAIL_IMAP_SERVER: str = "imap.gmail.com"
    GMAIL_IMAP_PORT: int = 993
    
    # SMTP
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    HR_EMAIL: str
    
    # Models
    FAST_GPT_MODEL: str = "gpt-35-turbo"
    DEEP_GPT_MODEL: str = "gpt-4.1"
    EMBEDDING_MODEL: str = "text-embedding-ada-002"
    
    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()