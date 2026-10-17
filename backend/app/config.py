from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered CS Learning Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "super_secret_jwt_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "sqlite:///./platform.db"
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]
        return self.BACKEND_CORS_ORIGINS

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
