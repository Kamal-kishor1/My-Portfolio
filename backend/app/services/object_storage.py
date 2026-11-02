"""Neon Object Storage access through its S3-compatible API."""
from functools import lru_cache

import boto3
from botocore.config import Config

from app.core.config import settings


@lru_cache(maxsize=1)
def _client():
    if not settings.storage_configured:
        raise RuntimeError("Neon Object Storage is not configured")
    return boto3.client(
        "s3",
        endpoint_url=settings.aws_endpoint_url_s3,
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id.get_secret_value(),
        aws_secret_access_key=settings.aws_secret_access_key.get_secret_value(),
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
            retries={"max_attempts": 3, "mode": "standard"},
        ),
    )


def upload_object(key: str, body: bytes, content_type: str) -> None:
    _client().put_object(
        Bucket=settings.neon_storage_bucket,
        Key=key,
        Body=body,
        ContentType=content_type,
        CacheControl="private, max-age=3600",
    )


def delete_object(key: str) -> None:
    _client().delete_object(Bucket=settings.neon_storage_bucket, Key=key)


def presigned_download_url(key: str) -> str:
    return _client().generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.neon_storage_bucket, "Key": key},
        ExpiresIn=settings.storage_url_expiry_seconds,
    )


def resolve_media_url(url: str, storage_key: str | None) -> str:
    """Presign private Neon objects; leave manually registered URLs unchanged."""
    return presigned_download_url(storage_key) if storage_key else url
