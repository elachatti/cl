from functools import lru_cache
from typing import List

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL

_DEFAULT_SECRET = "replace-this-with-a-long-random-secret-of-at-least-32-characters"


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Application
    APP_NAME: str = "AI Career Companion API"
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = "http://localhost:3000"

    # MySQL
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_DATABASE: str = "ai_career_companion"
    DATABASE_URL: str = ""
    DB_ECHO: bool = False
    AUTO_CREATE_TABLES: bool = True

    # JWT
    JWT_SECRET_KEY: str = _DEFAULT_SECRET
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REMEMBER_ME_EXPIRE_DAYS: int = 30
    EMAIL_VERIFY_EXPIRE_HOURS: int = 24
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30
    BCRYPT_ROUNDS: int = 12

    # Auth behaviour
    REQUIRE_EMAIL_VERIFICATION: bool = True

    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False
    EMAIL_FROM: str = "AI Career Companion <no-reply@aicareercompanion.local>"

    # First admin account
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""
    ADMIN_FULL_NAME: str = "Platform Admin"

    # Event image uploads
    UPLOAD_DIR: str = "static/uploads/events"
    STATIC_URL_PREFIX: str = "/static"
    MAX_IMAGE_SIZE_MB: float = 5.0

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip().rstrip("/") for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        url = URL.create(
            drivername="mysql+pymysql",
            username=self.MYSQL_USER,
            password=self.MYSQL_PASSWORD or None,
            host=self.MYSQL_HOST,
            port=self.MYSQL_PORT,
            database=self.MYSQL_DATABASE,
            query={"charset": "utf8mb4"},
        )
        return url.render_as_string(hide_password=False)

    @model_validator(mode="after")
    def _validate_production_secrets(self) -> "Settings":
        if self.is_production:
            if self.JWT_SECRET_KEY == _DEFAULT_SECRET or len(self.JWT_SECRET_KEY) < 32:
                raise ValueError(
                    "JWT_SECRET_KEY must be a unique random string of at least 32 "
                    "characters when APP_ENV=production."
                )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
