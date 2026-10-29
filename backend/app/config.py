from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI CS Learning Platform"
    API_V1_STR: str = "/api"
    GEMINI_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./platform.db"  # Add this line

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()