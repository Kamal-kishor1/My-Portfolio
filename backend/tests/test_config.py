import pytest

from app.core.config import Settings


def test_allowed_origins_are_normalized():
    config = Settings(_env_file=None, environment="development", allowed_origins=" https://site.example, http://localhost:3001 ")
    assert config.cors_origin_list == ["https://site.example", "http://localhost:3001"]


@pytest.mark.parametrize("origin", ["*", "https://site.example/path", "https://user:pass@example.com", "https://example.com:bad"])
def test_rejects_invalid_origins(origin: str):
    with pytest.raises(ValueError):
        Settings(_env_file=None, environment="development", allowed_origins=origin)


def test_production_requires_independent_strong_secrets():
    with pytest.raises(ValueError, match="JWT_SECRET_KEY"):
        Settings(
            _env_file=None,
            environment="production",
            database_url="postgresql+psycopg2://user:pass@db/portfolio",
            allowed_origins="https://site.example",
            jwt_secret_key="short",
            secret_key="another-strong-secret-value-with-32-chars",
        )


def test_production_rejects_http_origins():
    with pytest.raises(ValueError, match="ALLOWED_ORIGINS must use HTTPS"):
        Settings(_env_file=None, environment="production")
