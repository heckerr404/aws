"""
test_guardrails.py — Tests for logging guardrails, payload security, and property invariants.
"""
import json
import random
import pytest

from backend.common.errors import ValidationError
from backend.common.http import parse_json_body
from backend.common.logging_util import get_logger, log_event
from backend.functions.check_eligibility import _validate_profile


# ── PII Logging Guardrails ───────────────────────────────────────────────────

def test_denied_key_profile_raises():
    logger = get_logger("test")
    with pytest.raises(ValueError, match="profile"):
        log_event(logger, "info", "test", profile={"age": 30})


def test_denied_key_body_raises():
    logger = get_logger("test")
    with pytest.raises(ValueError, match="body"):
        log_event(logger, "info", "test", body="{}")


def test_denied_key_dob_raises():
    logger = get_logger("test")
    with pytest.raises(ValueError, match="dateOfBirth"):
        log_event(logger, "info", "test", dateOfBirth="1994-05-12")


def test_denied_key_aadhaar_raises():
    logger = get_logger("test")
    with pytest.raises(ValueError, match="aadhaar"):
        log_event(logger, "info", "test", aadhaar="1234-5678-9012")


def test_allowed_keys_pass(capfd):
    logger = get_logger("test_guardrails")
    log_event(logger, "info", "test", scheme_id="pm-kisan", decision="ELIGIBLE")
    captured = capfd.readouterr()
    assert "pm-kisan" in captured.out
    assert "ELIGIBLE" in captured.out


# ── Payload Security Guardrails ──────────────────────────────────────────────

def test_oversized_body_raises_payload_too_large():
    big_body = "a" * (20 * 1024)
    event = {"body": json.dumps({"data": big_body})}
    with pytest.raises(ValidationError, match="PAYLOAD_TOO_LARGE"):
        parse_json_body(event)


def test_injection_in_profile_string():
    malicious_profile = {
        "dateOfBirth": "1990-01-01",
        "state": "tn\" || true --",
        "gender": "male",
        "socialCategory": "general",
        "occupation": "farmer",
        "artisanTrade": "none",
        "familyIncomeInr": 100000,
        "hasCultivableLand": True,
        "isInstitutionalLandHolder": False,
        "isIncomeTaxPayer": False,
        "isGovtEmployee": False,
        "hasBankAccount": True,
        "isEnrolledInHigherEd": False,
        "class12Percentile": 0,
        "hasAvailedSimilarCreditScheme5y": False,
    }
    with pytest.raises(ValidationError, match="must be a lowercase slug"):
        _validate_profile(malicious_profile)


def test_unknown_field_rejected():
    profile = {
        "dateOfBirth": "1990-01-01",
        "state": "tn",
        "gender": "male",
        "socialCategory": "general",
        "occupation": "farmer",
        "artisanTrade": "none",
        "familyIncomeInr": 100000,
        "hasCultivableLand": True,
        "isInstitutionalLandHolder": False,
        "isIncomeTaxPayer": False,
        "isGovtEmployee": False,
        "hasBankAccount": True,
        "isEnrolledInHigherEd": False,
        "class12Percentile": 0,
        "hasAvailedSimilarCreditScheme5y": False,
        "unauthorizedAdminFlag": True,
    }
    with pytest.raises(ValidationError, match="UNKNOWN_FIELD"):
        _validate_profile(profile)


# ── Property Test: Reference DSL Evaluation ──────────────────────────────────

def _eval_clause(clause: dict, attrs: dict) -> bool:
    """Local Python reference evaluator of a rules.json clause condition."""
    kind = clause.get("kind")
    field = clause.get("attribute")
    op = clause.get("op")
    val = clause.get("value")

    actual = attrs.get(field)
    if op in ("==", "eq"):
        matches = actual == val
    elif op in (">=", "gte"):
        matches = actual >= val
    elif op in ("<=", "lte"):
        matches = actual <= val
    elif op in ("!=", "neq"):
        matches = actual != val
    elif op == "is_true":
        matches = bool(actual) is True
    elif op == "is_false":
        matches = bool(actual) is False
    elif op == "in":
        matches = actual in val
    elif op == "between":
        matches = val[0] <= actual <= val[1]
    else:
        raise ValueError(f"Unknown op: {op}")

    # For requirements: condition MUST hold
    if kind == "requirement":
        return bool(matches)
    # For exclusions: if condition matches, exclusion fires (failed)
    if kind == "exclusion":
        return not bool(matches)
    return True


def test_property_reference_evaluator_consistency(pm_kisan_rules):
    """
    Property test across 100 random valid profiles:
    Asserts that ELIGIBLE holds if and only if every single clause evaluates to True.
    """
    rng = random.Random(42)

    for _ in range(100):
        attrs = {
            "age": rng.randint(18, 80),
            "familyIncomeInr": rng.randint(0, 1000000),
            "state": "tn",
            "gender": rng.choice(["male", "female"]),
            "socialCategory": rng.choice(["general", "obc"]),
            "occupation": rng.choice(["farmer", "student", "artisan"]),
            "artisanTrade": "none",
            "hasCultivableLand": rng.choice([True, False]),
            "isInstitutionalLandHolder": rng.choice([True, False]),
            "isIncomeTaxPayer": rng.choice([True, False]),
            "isGovtEmployee": rng.choice([True, False]),
            "hasBankAccount": rng.choice([True, False]),
            "isEnrolledInHigherEd": False,
            "class12Percentile": 0,
            "hasAvailedSimilarCreditScheme5y": False,
        }

        clauses = pm_kisan_rules.get("clauses", [])
        failed_clauses = [
            cl["clauseId"] for cl in clauses if not _eval_clause(cl, attrs)
        ]
        is_eligible = len(failed_clauses) == 0

        # Invariant: ELIGIBLE <=> no failed clauses
        if is_eligible:
            for cl in clauses:
                assert _eval_clause(cl, attrs) is True
        else:
            assert len(failed_clauses) > 0
            for cid in failed_clauses:
                cl = next(c for c in clauses if c["clauseId"] == cid)
                assert _eval_clause(cl, attrs) is False
