from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App settings
    app_name: str
    debug: bool
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    
    # API Keys
    google_api_key: str
    openai_api_key: Optional[str]
    
    # MongoDB settings
    mongodb_url: str
    database_name: str
    
    # LLM settings
    llm_service: str = "Google"  # Google, OpenAI, Ollama
    embedding_choice: str = "Google"
    
    # Ollama settings
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:latest"
    ollama_embedding: str = "nomic-embed-text:latest"
    
    # OpenAI settings
    openai_model: str = "gpt-3.5-turbo"
    openai_embedding: str = "text-embedding-ada-002"
    
    # Gemini settings
    gemini_embedding: str = "models/embedding-001"
    
    class Config:
        env_file = ".env"

settings = Settings()
