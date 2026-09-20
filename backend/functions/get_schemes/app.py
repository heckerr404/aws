"""
get_schemes Lambda — GET /v1/schemes

Returns all PUBLISHED scheme metadata from DynamoDB.
"""
import uuid
from typing import Any

from backend.common import catalog
from backend.common.errors import HaqdaarError
from backend.common.http import fail, ok
from backend.common.logging_util import get_logger

logger = get_logger("get_schemes")


def handler(event: dict, context: Any) -> dict:
    request_id = getattr(context, "aws_request_id", str(uuid.uuid4()))
    try:
        schemes = catalog.list_published_schemes()
        safe = [
            {
                "schemeId": s.get("schemeId"),
                "name": s.get("name", {}),
                "ministry": s.get("ministry", ""),
                "officialUrl": s.get("officialUrl", ""),
                "clauseCount": s.get("clauseCount", 0),
                "publishedAt": s.get("publishedAt", ""),
            }
            for s in schemes
        ]
        return ok({"schemes": safe, "count": len(safe)})
    except HaqdaarError as exc:
        return fail(exc, request_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in get_schemes")
        return fail(exc, request_id)
