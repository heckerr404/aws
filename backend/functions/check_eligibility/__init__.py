"""
check_eligibility Lambda — the core decision engine.

POST /v1/check
  { profile: {...}, language: "en"|"hi", explain: true }

Architecture rules (from Master Context):
- NO LLM in the decision path.
- Decision comes 100% from AVP batch_is_authorized.
- Bedrock is used ONLY to rephrase the already-decided result, and ONLY if explain=true.
- DOB is discarded immediately after age computation.
- No profile data is logged or stored.
"""
import hashlib
import json
import os
import re
import uuid
from datetime import date, datetime, timezone
from typing import Any

import boto3

from backend.common import avp as avp_lib
from backend.common import catalog
from backend.common.bedrock_util import REPHRASE_SYSTEM_PROMPT, invoke_text
from backend.common.errors import (
    HaqdaarError,
    UpstreamError,
    ValidationError,
)
from backend.common.http import fail, ok, parse_json_body
from backend.common.logging_util import get_logger, log_event
from backend.common.schema import ARTISAN_TRADES, CITIZEN_ATTRS, ENUMS

logger = get_logger("check_eligibility")
POLICY_STORE_ID = os.environ.get("POLICY_STORE_ID", "")

_SLUG_RE = re.compile(r"^[a-z0-9_]{1,40}$")
_DOB_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


# ── Validation ───────────────────────────────────────────────────────────────

def _validate_profile(profile: Any, today: date | None = None) -> tuple[dict, int]:
    """
    Validate and normalise a raw profile dict.
    Returns (citizen_attrs, age).
    DOB is NOT present in the returned attrs.
    """
    if not isinstance(profile, dict):
        raise ValidationError("profile must be an object")

    known = set(CITIZEN_ATTRS.keys()) | {"dateOfBirth"}
    for key in profile:
        if key not in known:
            raise ValidationError(f"Unknown field: {key}", f"UNKNOWN_FIELD:{key}")

    # Date of birth → age
    dob_raw = profile.get("dateOfBirth")
    if not dob_raw or not isinstance(dob_raw, str) or not _DOB_RE.match(dob_raw):
        raise ValidationError("dateOfBirth must be YYYY-MM-DD", "MISSING_FIELD:dateOfBirth")
    try:
        dob = date.fromisoformat(dob_raw)
    except ValueError as exc:
        raise ValidationError(f"Invalid dateOfBirth: {exc}") from exc
    if today is None:
        today = datetime.now(timezone.utc).date()
    if dob > today:
        raise ValidationError("dateOfBirth cannot be in the future")
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    if age > 120:
        raise ValidationError("dateOfBirth implies age > 120")

    attrs: dict[str, Any] = {"age": age}

    for field, typ in CITIZEN_ATTRS.items():
        if field == "age":
            continue
        raw = profile.get(field)
        if raw is None:
            raise ValidationError(f"Missing required field: {field}", f"MISSING_FIELD:{field}")

        if typ == "boolean":
            if not isinstance(raw, bool):
                raise ValidationError(f"{field} must be a boolean")
            attrs[field] = raw

        elif typ == "long":
            if isinstance(raw, bool) or not isinstance(raw, int):
                raise ValidationError(f"{field} must be an integer")
            if field == "familyIncomeInr" and not (0 <= raw <= 1_000_000_000):
                raise ValidationError(f"{field} out of range (0..1,000,000,000)")
            if field == "class12Percentile" and not (0 <= raw <= 100):
                raise ValidationError(f"{field} out of range (0..100)")
            attrs[field] = raw

        elif typ == "string":
            if not isinstance(raw, str) or not _SLUG_RE.match(raw):
                raise ValidationError(f"{field} must be a lowercase slug")
            if field in ENUMS and raw not in ENUMS[field]:
                raise ValidationError(f"Invalid value for {field}: {raw!r}")
            if field == "artisanTrade" and raw not in (["none"] + ARTISAN_TRADES):
                raise ValidationError(f"Unknown artisanTrade: {raw!r}")
            attrs[field] = raw

    return attrs, age


# ── Receipt ───────────────────────────────────────────────────────────────────

def _make_receipt(policy_hash: str, attrs: dict) -> dict:
    canonical = json.dumps(attrs, sort_keys=True, separators=(",", ":"))
    input_hash = hashlib.sha256(canonical.encode()).hexdigest()
    receipt_id = hashlib.sha256(f"{policy_hash}:{input_hash}".encode()).hexdigest()[:16]
    return {
        "policyHash": policy_hash,
        "inputHash": input_hash,
        "receiptId": receipt_id,
    }


# ── Counterfactuals ───────────────────────────────────────────────────────────

def _compute_counterfactuals(
    policy_store_id: str,
    citizen_id: str,
    base_attrs: dict,
    scheme_id: str,
    failing_clauses: list[dict],
) -> list[dict]:
    """
    For each failing clause that has a counterfactual, re-evaluate with the
    modified attribute to prove the decision would change.
    """
    results = []
    for clause in failing_clauses:
        cf = (clause.get("remedy") or {}).get("counterfactual")
        if not cf:
            results.append({"clauseId": clause["clauseId"], "change": None})
            continue
        modified = {**base_attrs, cf["attribute"]: cf["value"]}
        try:
            resp = avp_lib.is_authorized(policy_store_id, citizen_id, modified, scheme_id)
            would_allow = resp.get("decision") == "ALLOW"
        except UpstreamError:
            would_allow = False
        results.append(
            {
                "clauseId": clause["clauseId"],
                "attribute": cf["attribute"],
                "currentValue": base_attrs.get(cf["attribute"]),
                "requiredValue": cf["value"],
                "wouldBeEligible": would_allow,
                "change": cf,
            }
        )
    return results


# ── Rephrase ──────────────────────────────────────────────────────────────────

def _rephrase(scheme_name: str, decision: str, clauses: list[dict], lang: str) -> dict:
    failing = [c for c in clauses if c.get("status") == "FAILED"]
    passing = [c for c in clauses if c.get("status") == "PASSED"]
    user_text = (
        f"Scheme: {scheme_name}\n"
        f"Decision: {decision}\n"
        f"Failing clauses: {json.dumps([c.get('text', {}).get(lang, '') for c in failing])}\n"
        f"Passing clauses count: {len(passing)}\n"
        f"Language: {lang}\n"
        "Rephrase the result in plain language for the citizen."
    )
    try:
        text = invoke_text(REPHRASE_SYSTEM_PROMPT, user_text, max_tokens=300)
        return {"en": text if lang == "en" else "", "hi": text if lang == "hi" else "", "generatedBy": "bedrock"}
    except UpstreamError:
        template = (
            "You are eligible for this scheme."
            if decision == "ELIGIBLE"
            else "You do not meet one or more requirements for this scheme."
        )
        return {"en": template, "hi": "", "generatedBy": "template"}


# ── Main handler ──────────────────────────────────────────────────────────────

def handler(event: dict, context: Any) -> dict:
    request_id = getattr(context, "aws_request_id", str(uuid.uuid4()))

    try:
        body = parse_json_body(event)
        raw_profile = body.get("profile")
        language = body.get("language", "en")
        if language not in ("en", "hi"):
            language = "en"
        explain = bool(body.get("explain", True))

        citizen_attrs, _ = _validate_profile(raw_profile)
        citizen_id = f"citizen-{request_id}"

        if not POLICY_STORE_ID:
            raise UpstreamError("Policy store not configured.", "POLICY_ENGINE_UNAVAILABLE")

        # Load published schemes
        schemes = catalog.list_published_schemes()
        if not schemes:
            raise UpstreamError("No schemes published.", "NO_SCHEMES_PUBLISHED")

        scheme_ids = [s["schemeId"] for s in schemes]

        # Main batch evaluation
        avp_results = avp_lib.batch_is_authorized(
            POLICY_STORE_ID, citizen_id, citizen_attrs, scheme_ids
        )

        results = []
        eligible_count = 0
        error_count = 0

        for scheme_meta, avp_result in zip(schemes, avp_results):
            scheme_id = scheme_meta["schemeId"]
            try:
                avp_decision = avp_result.get("decision", "DENY")
                determining_ids = [
                    p.get("policyId", "")
                    for p in avp_result.get("determiningPolicies", [])
                ]
                errors_list = avp_result.get("errors", [])
                if errors_list:
                    raise UpstreamError(f"AVP errors: {errors_list}")

                decision = "ELIGIBLE" if avp_decision == "ALLOW" else "NOT_ELIGIBLE"
                if decision == "ELIGIBLE":
                    eligible_count += 1

                # Load clauses
                db_clauses = catalog.get_scheme_clauses(scheme_id)
                clause_rows = []
                for cl in db_clauses:
                    policy_id = cl.get("policyId", "")
                    status = "FAILED" if policy_id in determining_ids else "PASSED"
                    clause_rows.append(
                        {
                            "clauseId": cl.get("clauseId"),
                            "kind": cl.get("kind"),
                            "status": status,
                            "text": cl.get("humanText", {}),
                            "citation": cl.get("citation", {}),
                            "policyId": policy_id,
                        }
                    )

                # Sort FAILED first
                clause_rows.sort(key=lambda c: (0 if c["status"] == "FAILED" else 1))

                # Counterfactuals for NOT_ELIGIBLE
                what_would_change = []
                if decision == "NOT_ELIGIBLE":
                    failing = [
                        {**orig_cl, **row}
                        for row, orig_cl in zip(clause_rows, db_clauses)
                        if row["status"] == "FAILED"
                    ]
                    what_would_change = _compute_counterfactuals(
                        POLICY_STORE_ID, citizen_id, citizen_attrs, scheme_id, failing
                    )

                policy_hash = scheme_meta.get("policyHash", "")
                receipt = _make_receipt(policy_hash, citizen_attrs)

                explanation = None
                if explain:
                    explanation = _rephrase(
                        scheme_meta.get("name", {}).get(language, scheme_id),
                        decision,
                        clause_rows,
                        language,
                    )

                limitations = [
                    cl.get("humanText", {}).get(language, "")
                    for cl in db_clauses
                    if cl.get("unsupported")
                ]

                results.append(
                    {
                        "schemeId": scheme_id,
                        "name": scheme_meta.get("name", {}),
                        "ministry": scheme_meta.get("ministry", ""),
                        "officialUrl": scheme_meta.get("officialUrl", ""),
                        "decision": decision,
                        "cedarDecision": avp_decision,
                        "determiningPolicyIds": determining_ids,
                        "clauses": clause_rows,
                        "whatWouldChange": what_would_change,
                        "limitations": [l for l in limitations if l],
                        "receipt": receipt,
                        "explanation": explanation,
                    }
                )
            except HaqdaarError as exc:
                error_count += 1
                results.append(
                    {
                        "schemeId": scheme_id,
                        "name": scheme_meta.get("name", {}),
                        "decision": "ERROR",
                        "error": exc.to_dict(),
                    }
                )

        # Sort: ELIGIBLE → NOT_ELIGIBLE → ERROR
        order = {"ELIGIBLE": 0, "NOT_ELIGIBLE": 1, "ERROR": 2}
        results.sort(key=lambda r: order.get(r.get("decision", "ERROR"), 2))

        log_event(
            logger, "info", "check_eligibility completed",
            request_id=request_id,
            checked=len(schemes),
            eligible=eligible_count,
            errors=error_count,
        )

        return ok(
            {
                "requestId": request_id,
                "evaluatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "engine": "amazon-verified-permissions/cedar",
                "summary": {
                    "checked": len(schemes),
                    "eligible": eligible_count,
                    "notEligible": len(schemes) - eligible_count - error_count,
                    "errors": error_count,
                },
                "results": results,
            }
        )

    except HaqdaarError as exc:
        return fail(exc, request_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in check_eligibility")
        return fail(exc, request_id)
