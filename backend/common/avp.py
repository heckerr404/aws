"""
Thin wrapper around Amazon Verified Permissions (AVP).

Exposes:
  citizen_entity()      — build entity dict for a Citizen principal
  scheme_entity()       — build entity dict for a Scheme resource
  batch_is_authorized() — chunked batch evaluation (max 30 per call)
  is_authorized()       — single evaluation

AVP batch constraint: in one batch call the principal OR resource must be identical
across all requests. We always keep principal fixed (one citizen, many schemes).
"""
import os
from typing import Any

import boto3
import botocore.exceptions

from backend.common.errors import UpstreamError

_client = None
NS = "Haqdaar"
_BATCH_CAP = 30  # AVP hard limit


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client("verifiedpermissions")
    return _client


def _attr(v: Any) -> dict:
    """Map a Python value to an AVP attribute value dict."""
    if isinstance(v, bool):
        return {"boolean": v}
    if isinstance(v, int):
        return {"long": v}
    return {"string": str(v)}


def citizen_entity(entity_id: str, attrs: dict) -> dict:
    return {
        "identifier": {"entityType": f"{NS}::Citizen", "entityId": entity_id},
        "attributes": {k: _attr(v) for k, v in attrs.items()},
    }


def scheme_entity(scheme_id: str) -> dict:
    return {
        "identifier": {"entityType": f"{NS}::Scheme", "entityId": scheme_id},
        "attributes": {"schemeId": {"string": scheme_id}},
    }


def _make_request(citizen_id: str, scheme_id: str) -> dict:
    return {
        "principal": {"entityType": f"{NS}::Citizen", "entityId": citizen_id},
        "action": {"actionType": f"{NS}::Action", "actionId": ACTION_ID},
        "resource": {"entityType": f"{NS}::Scheme", "entityId": scheme_id},
    }


try:
    from backend.common.schema import ACTION_ID
except ImportError:
    ACTION_ID = "CheckEligibility"


def batch_is_authorized(
    policy_store_id: str,
    citizen_id: str,
    citizen_attrs: dict,
    scheme_ids: list[str],
) -> list[dict]:
    """
    Evaluate one citizen against many schemes.
    Returns results in the same order as scheme_ids.
    Chunks automatically at 30 per call.
    """
    client = _get_client()
    entities = {
        "entityList": [
            citizen_entity(citizen_id, citizen_attrs),
            *[scheme_entity(sid) for sid in scheme_ids],
        ]
    }
    requests = [_make_request(citizen_id, sid) for sid in scheme_ids]

    results: list[dict] = []
    for i in range(0, len(requests), _BATCH_CAP):
        chunk = requests[i : i + _BATCH_CAP]
        try:
            resp = client.batch_is_authorized(
                policyStoreId=policy_store_id,
                entities=entities,
                requests=chunk,
            )
        except botocore.exceptions.ClientError as exc:
            raise UpstreamError(str(exc), "POLICY_ENGINE_UNAVAILABLE") from exc
        # Match by position — requests and results are positionally aligned
        for item in resp.get("results", []):
            results.append(item)

    return results


def is_authorized(
    policy_store_id: str,
    citizen_id: str,
    citizen_attrs: dict,
    scheme_id: str,
) -> dict:
    """Single scheme evaluation. Returns the AVP result dict."""
    results = batch_is_authorized(policy_store_id, citizen_id, citizen_attrs, [scheme_id])
    if not results:
        raise UpstreamError("AVP returned no results", "POLICY_ENGINE_UNAVAILABLE")
    return results[0]
