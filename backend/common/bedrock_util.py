"""
Amazon Bedrock utility for Haqdaar.

Only two callers:
  1. ingest_scheme Lambda  → DRAFT_SYSTEM_PROMPT  (offline authoring)
  2. check_eligibility Lambda → REPHRASE_SYSTEM_PROMPT (online, guarded)

The decision itself NEVER passes through this module.
"""
import json
import os

import boto3
import botocore.exceptions

from backend.common.errors import UpstreamError

_client = None
MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "")


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client("bedrock-runtime")
    return _client


def invoke_text(system: str, user: str, max_tokens: int = 4000, temperature: float = 0.0) -> str:
    """
    Call Bedrock using the Anthropic Messages format.
    Returns the concatenated text content blocks.
    Raises UpstreamError on any failure.
    """
    if not MODEL_ID:
        raise UpstreamError("Bedrock model not configured.", "BEDROCK_NOT_CONFIGURED")
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "temperature": temperature,
        "system": system,
        "messages": [{"role": "user", "content": [{"type": "text", "text": user}]}],
    }
    try:
        resp = _get_client().invoke_model(
            modelId=MODEL_ID,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json",
        )
        payload = json.loads(resp["body"].read())
        return "".join(b["text"] for b in payload.get("content", []) if b.get("type") == "text")
    except botocore.exceptions.ClientError as exc:
        raise UpstreamError(f"Bedrock error: {exc}") from exc


# ── Prompts ──────────────────────────────────────────────────────────────────

DRAFT_SYSTEM_PROMPT = """You convert the text of an Indian government scheme document into a machine-readable
eligibility rules file. You are a careful legal transcriber, not a summariser.

OUTPUT
Return ONLY one JSON object, no markdown fences, no commentary.

SCHEMA
{
  "schemeId": <given>,
  "name": {"en": str, "hi": str},
  "ministry": str,
  "officialUrl": str or "",
  "sourcePdfKey": <given>,
  "clauses": [ { clauseId, kind, attribute, op, value, citation{page,section,quote},
                 humanText{en,hi}, remedy{en,hi,counterfactual}, verified{by:"",at:""} } ]
}

ALLOWED ATTRIBUTES (use ONLY these, exactly as spelled):
age(long), familyIncomeInr(long), state(string), gender(string), socialCategory(string),
occupation(string), artisanTrade(string), hasCultivableLand(boolean),
isInstitutionalLandHolder(boolean), isIncomeTaxPayer(boolean), isGovtEmployee(boolean),
hasBankAccount(boolean), isEnrolledInHigherEd(boolean), class12Percentile(long),
hasAvailedSimilarCreditScheme5y(boolean)

ALLOWED OPS: eq, neq, gte, lte, between, in, is_true, is_false
kind = "requirement" when the sentence says who MAY/MUST qualify.
kind = "exclusion" when the sentence says who is NOT eligible / is excluded.
For an exclusion, op/value describe the condition that EXCLUDES a person.

RULES
1. Each clause must correspond to ONE sentence or bullet in the document.
2. citation.quote must be copied VERBATIM from the document, at most 25 words.
   citation.page is the number from the nearest preceding [[PAGE n]] marker.
3. Values for string attributes must be lowercase snake_case slugs.
4. If a rule in the document cannot be expressed with the allowed attributes, DO NOT
   invent an attribute. Add the clause with "unsupported": true, keep the quote and
   citation, and put null in attribute/op/value.
5. Never guess. If you are unsure of a threshold, leave the clause out and add its
   quote to a top-level "notes" array.
6. Do not include benefit amounts, deadlines, or application steps.
7. clauseId format: <3-4 letter scheme code>-R-nn for requirements, -X-nn for exclusions.
8. remedy.counterfactual is one {attribute,value} pair that would satisfy the clause,
   or null if a person cannot change it (for example an age limit).
9. hi strings are natural Hindi in Devanagari, max 140 characters."""


REPHRASE_SYSTEM_PROMPT = """You rephrase a pre-decided eligibility result into plain language.

STRICT RULES — violation is not acceptable:
1. The decision (ELIGIBLE / NOT_ELIGIBLE) is ALREADY DECIDED. You must not change it,
   imply doubt, hedge, or suggest appeal except through official channels.
2. Use ONLY the clause text and citation provided. Do not add thresholds, amounts, or
   conditions not present in the input.
3. If explanation language is "hi", write natural Hindi in Devanagari. Otherwise English.
4. Maximum 3 sentences. No bullet points. No markdown.
5. Do not mention AI, Bedrock, LLM, or Cedar.
6. Output ONLY the plain-language text, nothing else."""
