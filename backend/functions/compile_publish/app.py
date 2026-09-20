"""
compile_publish Lambda — authoring path (async invoke, not via HTTP API).

Flow:
  1. Read approved/<schemeId>.rules.json from S3
  2. Validate all clauses are verified (unless --allow-unverified flag in event)
  3. Compile clauses to Cedar using cedar_compiler
  4. Delete old policies for this scheme from AVP
  5. Create new policies in AVP (base permit + one forbid per clause)
  6. Compute policyHash (sha256 of sorted Cedar statements)
  7. Write scheme META + CLAUSE items to DynamoDB (status=PUBLISHED)
"""
import hashlib
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any

import boto3
import botocore.exceptions

from backend.common import cedar_compiler
from backend.common.errors import CompileError, HaqdaarError, NotVerifiedError, UpstreamError, ValidationError
from backend.common.http import fail, ok
from backend.common.logging_util import get_logger, log_event

logger = get_logger("compile_publish")
TABLE_NAME = os.environ.get("TABLE_NAME", "")
BUCKET_NAME = os.environ.get("BUCKET_NAME", "")
POLICY_STORE_ID = os.environ.get("POLICY_STORE_ID", "")

_s3 = None
_avp = None
_dynamo = None


def _s3_client():
    global _s3
    if _s3 is None:
        _s3 = boto3.client("s3")
    return _s3


def _avp_client():
    global _avp
    if _avp is None:
        _avp = boto3.client("verifiedpermissions")
    return _avp


def _dynamo_table():
    global _dynamo
    if _dynamo is None:
        _dynamo = boto3.resource("dynamodb").Table(TABLE_NAME)
    return _dynamo


def _delete_old_policies(scheme_id: str) -> None:
    """Remove all existing AVP policies for this scheme."""
    paginator = _avp_client().get_paginator("list_policies")
    for page in paginator.paginate(policyStoreId=POLICY_STORE_ID):
        for policy in page.get("policies", []):
            # Filter by scheme resource in policy definition
            defn = policy.get("definition", {}).get("static", {})
            stmt = defn.get("statement", "")
            if f'"{scheme_id}"' in stmt:
                try:
                    _avp_client().delete_policy(
                        policyStoreId=POLICY_STORE_ID,
                        policyId=policy["policyId"],
                    )
                except botocore.exceptions.ClientError:
                    pass


def _create_policy(cedar_statement: str, desc: str) -> str:
    """Create a static Cedar policy in AVP, return policyId."""
    resp = _avp_client().create_policy(
        policyStoreId=POLICY_STORE_ID,
        definition={
            "static": {
                "description": desc,
                "statement": cedar_statement,
            }
        },
    )
    return resp["policyId"]


def handler(event: dict, context: Any) -> dict:
    request_id = getattr(context, "aws_request_id", str(uuid.uuid4()))
    try:
        scheme_id = event.get("schemeId")
        allow_unverified = bool(event.get("allowUnverified", False))
        if not scheme_id:
            raise ValidationError("schemeId is required")

        approved_key = f"approved/{scheme_id}.rules.json"
        log_event(logger, "info", "Compiling scheme", scheme_id=scheme_id)

        # 1. Load approved rules
        try:
            obj = _s3_client().get_object(Bucket=BUCKET_NAME, Key=approved_key)
            rules = json.loads(obj["Body"].read())
        except botocore.exceptions.ClientError as exc:
            raise UpstreamError(f"Could not read {approved_key}: {exc}") from exc

        # 2. Verification check
        if not allow_unverified:
            for cl in rules.get("clauses", []):
                v = cl.get("verified", {})
                if not v.get("by") or not v.get("at"):
                    raise NotVerifiedError(
                        f"Clause {cl.get('clauseId')} is not verified. "
                        "Set verified.by and verified.at before publishing."
                    )

        # 3. Compile
        try:
            compiled = cedar_compiler.compile_scheme(rules)
        except cedar_compiler.CompileError as exc:
            raise CompileError(str(exc)) from exc

        # 4. Compute policy hash
        statements = sorted(c["cedarStatement"] for c in compiled)
        policy_hash = hashlib.sha256("\n".join(statements).encode()).hexdigest()

        # 5. Delete old policies
        _delete_old_policies(scheme_id)

        # 6. Create new policies in AVP
        base_policy_id = None
        clause_policy_map: dict[str, str] = {}

        for entry in compiled:
            clause_id = entry["clauseId"]
            kind = entry["kind"]
            cedar = entry["cedarStatement"]
            desc = f"{scheme_id}::{clause_id}"
            policy_id = _create_policy(cedar, desc)

            if kind == "base_permit":
                base_policy_id = policy_id
            else:
                clause_policy_map[clause_id] = policy_id

        # 7. Write DynamoDB items
        table = _dynamo_table()
        now = datetime.now(timezone.utc).isoformat()

        # META item
        table.put_item(
            Item={
                "PK": f"SCHEME#{scheme_id}",
                "SK": "META",
                "GSI1PK": "CATALOG",
                "GSI1SK": f"SCHEME#{scheme_id}",
                "schemeId": scheme_id,
                "name": rules.get("name", {"en": scheme_id, "hi": scheme_id}),
                "ministry": rules.get("ministry", ""),
                "officialUrl": rules.get("officialUrl", ""),
                "status": "PUBLISHED",
                "policyHash": policy_hash,
                "publishedAt": now,
                "sourcePdfKey": rules.get("sourcePdfKey", ""),
                "clauseCount": len([c for c in compiled if c["kind"] != "base_permit"]),
            }
        )

        # BASE POLICY item
        if base_policy_id:
            table.put_item(
                Item={
                    "PK": f"SCHEME#{scheme_id}",
                    "SK": "BASEPOLICY",
                    "policyId": base_policy_id,
                    "cedarStatement": next(
                        c["cedarStatement"] for c in compiled if c["kind"] == "base_permit"
                    ),
                }
            )

        # CLAUSE items
        for cl in rules.get("clauses", []):
            clause_id = cl.get("clauseId")
            if not clause_id or cl.get("unsupported"):
                continue
            policy_id = clause_policy_map.get(clause_id, "")
            table.put_item(
                Item={
                    "PK": f"SCHEME#{scheme_id}",
                    "SK": f"CLAUSE#{clause_id}",
                    "clauseId": clause_id,
                    "kind": cl.get("kind"),
                    "attribute": cl.get("attribute"),
                    "op": cl.get("op"),
                    "value": cl.get("value"),
                    "policyId": policy_id,
                    "cedarStatement": clause_policy_map.get(clause_id, ""),
                    "citation": cl.get("citation", {}),
                    "humanText": cl.get("humanText", {}),
                    "remedy": cl.get("remedy", {}),
                    "unsupported": cl.get("unsupported", False),
                }
            )

        log_event(
            logger, "info", "Scheme published",
            scheme_id=scheme_id,
            policy_hash=policy_hash,
            clause_count=len(clause_policy_map),
        )
        return ok(
            {
                "schemeId": scheme_id,
                "status": "PUBLISHED",
                "policyHash": policy_hash,
                "clauseCount": len(clause_policy_map),
            }
        )

    except HaqdaarError as exc:
        return fail(exc, request_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in compile_publish")
        return fail(exc, request_id)
