"""
DynamoDB catalog reader for Haqdaar.

Reads scheme META and CLAUSE items from the single DynamoDB table.
Implements a simple in-memory cache per Lambda container lifetime
(safe because policies are immutable per container invocation window).
"""
import os
from decimal import Decimal
from functools import lru_cache
from typing import Any

import boto3
import botocore.exceptions

from backend.common.errors import NotFoundError, UpstreamError

_TABLE_NAME = os.environ.get("TABLE_NAME", "")
_resource = None


def _get_table():
    global _resource
    if _resource is None:
        _resource = boto3.resource("dynamodb").Table(_TABLE_NAME)
    return _resource


def _to_native(obj: Any) -> Any:
    """Recursively convert Decimal → int/float for JSON serialisation."""
    if isinstance(obj, dict):
        return {k: _to_native(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_to_native(i) for i in obj]
    if isinstance(obj, Decimal):
        return int(obj) if obj == int(obj) else float(obj)
    return obj


@lru_cache(maxsize=64)
def get_scheme_meta(scheme_id: str) -> dict:
    """Return the META item for a scheme. Cached per container."""
    table = _get_table()
    try:
        resp = table.get_item(Key={"PK": f"SCHEME#{scheme_id}", "SK": "META"})
    except botocore.exceptions.ClientError as exc:
        raise UpstreamError(str(exc)) from exc
    item = resp.get("Item")
    if not item:
        raise NotFoundError(f"Scheme not found: {scheme_id}")
    return _to_native(item)


@lru_cache(maxsize=64)
def get_scheme_clauses(scheme_id: str) -> list[dict]:
    """Return all CLAUSE items for a scheme sorted by clauseId. Cached per container."""
    table = _get_table()
    try:
        resp = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("PK").eq(f"SCHEME#{scheme_id}")
            & boto3.dynamodb.conditions.Key("SK").begins_with("CLAUSE#"),
        )
    except botocore.exceptions.ClientError as exc:
        raise UpstreamError(str(exc)) from exc
    items = _to_native(resp.get("Items", []))
    return sorted(items, key=lambda x: x.get("clauseId", ""))


def list_published_schemes() -> list[dict]:
    """Return all PUBLISHED scheme META items via GSI1."""
    table = _get_table()
    try:
        resp = table.query(
            IndexName="GSI1",
            KeyConditionExpression=boto3.dynamodb.conditions.Key("GSI1PK").eq("CATALOG"),
        )
    except botocore.exceptions.ClientError as exc:
        raise UpstreamError(str(exc)) from exc
    items = _to_native(resp.get("Items", []))
    return [i for i in items if i.get("status") == "PUBLISHED"]


def get_base_policy(scheme_id: str) -> dict:
    """Return the BASEPOLICY item for a scheme."""
    table = _get_table()
    try:
        resp = table.get_item(Key={"PK": f"SCHEME#{scheme_id}", "SK": "BASEPOLICY"})
    except botocore.exceptions.ClientError as exc:
        raise UpstreamError(str(exc)) from exc
    item = resp.get("Item")
    if not item:
        raise NotFoundError(f"Base policy not found for scheme: {scheme_id}")
    return _to_native(item)
