"""
HTTP helpers for Lambda handlers.

ok()   → builds a 200 (or custom) JSON response envelope.
fail() → turns a HaqdaarError (or unexpected exception) into an error envelope.
parse_json_body() → safely parses the event body, handling base64 and empty body.
"""
import base64
import json

from backend.common.errors import HaqdaarError, ValidationError


_MAX_BODY = 16 * 1024  # 16 KB


def _cors_headers() -> dict:
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    }


def ok(body: dict | list, status: int = 200) -> dict:
    return {
        "statusCode": status,
        "headers": _cors_headers(),
        "body": json.dumps(body, default=str),
    }


def fail(err: Exception, request_id: str = "") -> dict:
    if isinstance(err, HaqdaarError):
        status = err.status
        body = {"error": err.to_dict(), "requestId": request_id}
    else:
        status = 500
        body = {
            "error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."},
            "requestId": request_id,
        }
    return {
        "statusCode": status,
        "headers": _cors_headers(),
        "body": json.dumps(body),
    }


def parse_json_body(event: dict) -> dict:
    raw = event.get("body") or ""
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode("utf-8")
    if not raw:
        raise ValidationError("Request body is required.")
    if len(raw.encode()) > _MAX_BODY:
        raise ValidationError("Request body too large.", "PAYLOAD_TOO_LARGE")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValidationError(f"Invalid JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object.")
    return data
