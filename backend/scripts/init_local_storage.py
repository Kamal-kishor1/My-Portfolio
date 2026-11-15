"""Create the private bucket used by the local Docker S3-compatible service."""
import os
import time

import boto3
from botocore.config import Config


bucket = os.environ.get("NEON_STORAGE_BUCKET", "portfolio-local")
client = boto3.client(
    "s3",
    endpoint_url=os.environ.get("AWS_ENDPOINT_URL_S3", "http://minio:9000"),
    region_name=os.environ.get("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
)

last_error = None
for _ in range(60):
    try:
        client.head_bucket(Bucket=bucket)
        print("Local S3 bucket is ready")
        break
    except Exception as error:  # MinIO may still be starting, or the bucket may not exist.
        last_error = error
        try:
            client.create_bucket(Bucket=bucket)
            print("Created local S3 bucket")
            break
        except Exception as create_error:
            last_error = create_error
            time.sleep(1)
else:
    raise RuntimeError("Local S3 bucket could not be initialized") from last_error
