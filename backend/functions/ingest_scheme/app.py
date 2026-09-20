"""
ingest_scheme Lambda — authoring path (async invoke, never via HTTP API).

Flow:
  1. Read scheme PDF from S3 raw/<schemeId>.pdf
  2. Start Textract async job; poll until SUCCEEDED
  3. Concatenate pages, insert [[PAGE n]] markers
  4. Call Bedrock to draft rules JSON
  5. Validate draft (known attributes only, required fields)
  6. Write draft to S3 drafts/<schemeId>-<timestamp>.rules.json
  7. Write DynamoDB item with status=DRAFT

Human reviews the draft in S3, edits it, moves to approved/, then
calls compile_publish Lambda.
"""
import json
import os
import re
import time
import uuid
from datetime import datetime, timezone
from typing import Any

import boto3
import botocore.exceptions

from backend.common.bedrock_util import DRAFT_SYSTEM_PROMPT, invoke_text
from backend.common.errors import HaqdaarError, UpstreamError, ValidationError
from backend.common.http import fail, ok
from backend.common.logging_util import get_logger, log_event
from backend.common.schema import CITIZEN_ATTRS

logger = get_logger("ingest_scheme")
TABLE_NAME = os.environ.get("TABLE_NAME", "")
BUCKET_NAME = os.environ.get("BUCKET_NAME", "")

_s3 = None
_textract = None
_dynamo = None


def _s3_client():
    global _s3
    if _s3 is None:
        _s3 = boto3.client("s3")
    return _s3


def _textract_client():
    global _textract
    if _textract is None:
        _textract = boto3.client("textract")
    return _textract


def _dynamo_resource():
    global _dynamo
    if _dynamo is None:
        _dynamo = boto3.resource("dynamodb").Table(TABLE_NAME)
    return _dynamo


# ── Textract helpers ──────────────────────────────────────────────────────────

def _start_textract(bucket: str, key: str) -> str:
    resp = _textract_client().start_document_text_detection(
        DocumentLocation={"S3Object": {"Bucket": bucket, "Name": key}}
    )
    return resp["JobId"]


def _poll_textract(job_id: str, max_wait: int = 480) -> list[dict]:
    """Poll until SUCCEEDED; raise UpstreamError on FAILED or timeout."""
    deadline = time.time() + max_wait
    next_token = None
    pages: list[dict] = []
    status = "IN_PROGRESS"

    while True:
        kwargs: dict[str, Any] = {"JobId": job_id}
        if next_token:
            kwargs["NextToken"] = next_token
        try:
            resp = _textract_client().get_document_text_detection(**kwargs)
        except botocore.exceptions.ClientError as exc:
            raise UpstreamError(f"Textract poll error: {exc}") from exc

        status = resp.get("JobStatus", "")
        if status == "FAILED":
            raise UpstreamError("Textract job FAILED", "TEXTRACT_FAILED")
        if status == "SUCCEEDED":
            pages.extend(resp.get("Blocks", []))
            next_token = resp.get("NextToken")
            if not next_token:
                break
        else:
            if time.time() > deadline:
                raise UpstreamError("Textract timed out", "TEXTRACT_TIMEOUT")
            time.sleep(5)

    return pages


def _blocks_to_text(blocks: list[dict]) -> str:
    """Assemble Textract blocks into page-marked plain text."""
    page_lines: dict[int, list[str]] = {}
    for block in blocks:
        if block.get("BlockType") != "LINE":
            continue
        pg = block.get("Page", 1)
        page_lines.setdefault(pg, []).append(block.get("Text", ""))
    parts = []
    for pg in sorted(page_lines):
        parts.append(f"[[PAGE {pg}]]")
        parts.extend(page_lines[pg])
    return "\n".join(parts)


# ── Bedrock draft helpers ─────────────────────────────────────────────────────

_KNOWN_ATTRS = set(CITIZEN_ATTRS.keys())


def _validate_draft(draft: dict) -> None:
    """Light validation of Bedrock-produced draft. Raises ValidationError."""
    if not isinstance(draft, dict):
        raise ValidationError("Draft is not a JSON object")
    for required in ("schemeId", "clauses"):
        if required not in draft:
            raise ValidationError(f"Draft missing field: {required}")
    for cl in draft.get("clauses", []):
        attr = cl.get("attribute")
        if attr and not cl.get("unsupported") and attr not in _KNOWN_ATTRS:
            raise ValidationError(f"Draft clause uses unknown attribute: {attr!r}")
        # Reset citation.page if suspicious
        page = (cl.get("citation") or {}).get("page", 0)
        if not isinstance(page, int) or page < 0:
            if "citation" in cl:
                cl["citation"]["page"] = 0


def _invoke_bedrock_with_retry(scheme_id: str, text: str, pdf_key: str) -> dict:
    """Call Bedrock, validate. One retry on validation failure."""
    user_text = (
        f"schemeId: {scheme_id}\nsourcePdfKey: {pdf_key}\n\nDOCUMENT TEXT:\n{text[:40000]}"
    )
    for attempt in range(2):
        raw = invoke_text(DRAFT_SYSTEM_PROMPT, user_text, max_tokens=4000)
        # Strip any accidental markdown fences
        raw = re.sub(r"^```[a-z]*\n?", "", raw.strip(), flags=re.MULTILINE)
        raw = re.sub(r"\n?```$", "", raw.strip(), flags=re.MULTILINE)
        try:
            draft = json.loads(raw)
            _validate_draft(draft)
            return draft
        except (json.JSONDecodeError, ValidationError) as exc:
            if attempt == 0:
                log_event(logger, "warning", "Draft validation failed, retrying", attempt=attempt, error=str(exc))
                continue
            raise ValidationError(f"Bedrock draft invalid after retry: {exc}") from exc
    raise ValidationError("Bedrock draft invalid after retry")  # unreachable


# ── Handler ───────────────────────────────────────────────────────────────────

def handler(event: dict, context: Any) -> dict:
    request_id = getattr(context, "aws_request_id", str(uuid.uuid4()))
    try:
        scheme_id = event.get("schemeId") or (event.get("queryStringParameters") or {}).get("schemeId")
        if not scheme_id:
            raise ValidationError("schemeId is required")

        pdf_key = f"raw/{scheme_id}.pdf"
        log_event(logger, "info", "Starting ingest", scheme_id=scheme_id, pdf_key=pdf_key)

        # 1. Start Textract
        job_id = _start_textract(BUCKET_NAME, pdf_key)
        log_event(logger, "info", "Textract job started", job_id=job_id)

        # 2. Poll
        blocks = _poll_textract(job_id)
        extracted_text = _blocks_to_text(blocks)

        # 3. Save extracted text
        ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
        extracted_key = f"extracted/{scheme_id}-{ts}.txt"
        _s3_client().put_object(Bucket=BUCKET_NAME, Key=extracted_key, Body=extracted_text.encode())

        # 4. Bedrock draft
        draft = _invoke_bedrock_with_retry(scheme_id, extracted_text, pdf_key)

        # 5. Save draft
        draft_key = f"drafts/{scheme_id}-{ts}.rules.json"
        _s3_client().put_object(
            Bucket=BUCKET_NAME,
            Key=draft_key,
            Body=json.dumps(draft, ensure_ascii=False, indent=2).encode(),
        )

        # 6. DynamoDB DRAFT item
        _dynamo_resource().put_item(
            Item={
                "PK": f"SCHEME#{scheme_id}",
                "SK": "META",
                "GSI1PK": "CATALOG",
                "GSI1SK": f"SCHEME#{scheme_id}",
                "schemeId": scheme_id,
                "name": draft.get("name", {"en": scheme_id, "hi": scheme_id}),
                "ministry": draft.get("ministry", ""),
                "officialUrl": draft.get("officialUrl", ""),
                "status": "DRAFT",
                "sourcePdfKey": pdf_key,
                "draftKey": draft_key,
                "extractedKey": extracted_key,
                "ingestedAt": datetime.now(timezone.utc).isoformat(),
            }
        )

        log_event(logger, "info", "Ingest complete", scheme_id=scheme_id, draft_key=draft_key)
        return ok({"schemeId": scheme_id, "draftKey": draft_key, "status": "DRAFT"})

    except HaqdaarError as exc:
        return fail(exc, request_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in ingest_scheme")
        return fail(exc, request_id)
