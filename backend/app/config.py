from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://tracker:tracker@localhost:5432/tracker"
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    cors_origins: list[str] = ["http://localhost:3000"]
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-sonnet-4-5"

    class Config:
        env_file = ".env"


settings = Settings()
