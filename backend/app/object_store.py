"""Private S3-compatible storage for form evidence uploads."""

import os
from functools import lru_cache

import boto3
from botocore.config import Config


@lru_cache(maxsize=1)
def client():
    endpoint = os.environ.get("OBJECT_STORAGE_ENDPOINT_URL", "http://localhost:8333")
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID", "oneput-local-access"),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY", "oneput-local-secret"),
        region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1"),
        config=Config(s3={"addressing_style": "path"}, retries={"max_attempts": 3, "mode": "standard"}),
    )


def bucket_name():
    return os.environ.get("S3_BUCKET", "oneput-submissions")


def put(key: str, body, content_type: str):
    client().put_object(Bucket=bucket_name(), Key=key, Body=body, ContentType=content_type)


def get(key: str):
    return client().get_object(Bucket=bucket_name(), Key=key)


def delete(key: str):
    client().delete_object(Bucket=bucket_name(), Key=key)
