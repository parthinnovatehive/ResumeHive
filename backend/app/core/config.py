from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str = "sqlite:///./resumehive.db"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    STORAGE_DIR: str = "app/storage"

    ADZUNA_APP_ID: str = ""
    ADZUNA_APP_KEY: str = ""
    JOB_SEARCH_CACHE_TTL_HOURS: int = 6

    # Ollama LLM for rewrite suggestions
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    OLLAMA_TIMEOUT: int = 60


settings = Settings()
