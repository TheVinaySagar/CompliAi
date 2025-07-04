from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    google_api_key: str = "AIzaSyCUe0COLfOG0wjpgEf1-lvGu0lQiBkT1TA"
    gemini_model: str = "gemini-pro"
    
    app_name: str = "CompliAI"
    debug: bool = True
    
    test_mode: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
