from pydantic import SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Postgres
    environment: str = "development"
    database_url: str = ""
    database_url_unpooled: str = ""
    admin_email: str = ""
    admin_password: SecretStr = SecretStr("")
    projects_seed_json: str = "[]"
    skills_seed_json: str = "[]"

    # JWT / auth
    jwt_secret_key: str = "development-only-change-me"
    secret_key: str = "development-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    # Neon Object Storage (S3-compatible). Values are supplied to the backend
    # only; never expose these through VITE_* variables.
    aws_access_key_id: SecretStr = SecretStr("")
    aws_secret_access_key: SecretStr = SecretStr("")
    aws_endpoint_url_s3: str = ""
    aws_region: str = ""
    neon_storage_bucket: str = "uploads"
    storage_url_expiry_seconds: int = 3600
    max_upload_size_bytes: int = 10 * 1024 * 1024

    # Login rate limiting enforced by slowapi.
    login_rate_limit: str = "5/minute"
    contact_rate_limit: str = "5/hour"
    analytics_rate_limit: str = "60/minute"

    # CORS origins supplied as a comma-separated ALLOWED_ORIGINS value.
    allowed_origins: str = "http://localhost:3001,http://127.0.0.1:3001,http://localhost:3000"

    @field_validator("allowed_origins")
    @classmethod
    def validate_origins(cls, value: str) -> str:
        from urllib.parse import urlsplit
        origins = [origin.strip() for origin in value.split(",") if origin.strip()]
        if not origins:
            raise ValueError("ALLOWED_ORIGINS must contain at least one origin")
        for origin in origins:
            parsed = urlsplit(origin)
            try:
                parsed.port
            except ValueError as exc:
                raise ValueError(f"Invalid port in ALLOWED_ORIGINS entry {origin!r}") from exc
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.hostname
                or parsed.username
                or parsed.password
                or parsed.path
                or parsed.query
                or parsed.fragment
                or parsed.hostname == "*"
            ):
                raise ValueError(f"Invalid origin {origin!r}; use scheme://host[:port] without a path")
        return ",".join(origins)

    @model_validator(mode="after")
    def validate_production_secrets(self):
        if self.environment.lower() in {"production", "prod"}:
            from urllib.parse import urlsplit

            if any(urlsplit(origin).scheme != "https" for origin in self.cors_origin_list):
                raise ValueError("ALLOWED_ORIGINS must use HTTPS in production")
            weak = {"development-only-change-me", "change-me-in-production", ""}
            if self.jwt_secret_key in weak or len(self.jwt_secret_key) < 32:
                raise ValueError("JWT_SECRET_KEY must be set to at least 32 characters in production")
            if self.secret_key in weak or len(self.secret_key) < 32:
                raise ValueError("SECRET_KEY must be set to at least 32 characters in production")
            if self.secret_key == self.jwt_secret_key:
                raise ValueError("SECRET_KEY and JWT_SECRET_KEY must be different values in production")
            if not self.database_url or "devpassword" in self.database_url or "change-me" in self.database_url:
                raise ValueError("DATABASE_URL is required in production")
            if not self.database_url_unpooled:
                raise ValueError("DATABASE_URL_UNPOOLED is required in production for migrations")
            if not self.storage_configured:
                raise ValueError(
                    "AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3, "
                    "and AWS_REGION are required in production"
                )
        return self

    @property
    def storage_configured(self) -> bool:
        return all(
            (
                self.aws_access_key_id.get_secret_value(),
                self.aws_secret_access_key.get_secret_value(),
                self.aws_endpoint_url_s3,
                self.aws_region,
                self.neon_storage_bucket,
            )
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", populate_by_name=True)


settings = Settings()
