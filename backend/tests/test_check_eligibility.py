"""
test_check_eligibility.py — Unit tests for profile validation (no network calls).
"""
import pytest

from backend.functions.check_eligibility import _validate_profile
from backend.common.errors import ValidationError


BASE = {
    "dateOfBirth": "1994-05-12",
    "state": "tn",
    "gender": "female",
    "socialCategory": "obc",
    "occupation": "student",
    "artisanTrade": "none",
    "familyIncomeInr": 300000,
    "hasCultivableLand": False,
    "isInstitutionalLandHolder": False,
    "isIncomeTaxPayer": False,
    "isGovtEmployee": False,
    "hasBankAccount": True,
    "isEnrolledInHigherEd": True,
    "class12Percentile": 92,
    "hasAvailedSimilarCreditScheme5y": False,
}


def test_valid_profile():
    attrs, age = _validate_profile(BASE)
    assert age == 32
    assert "dateOfBirth" not in attrs  # DOB must be discarded
    assert attrs["isEnrolledInHigherEd"] is True


def test_missing_field():
    p = {**BASE}
    del p["hasBankAccount"]
    with pytest.raises(ValidationError, match="MISSING_FIELD"):
        _validate_profile(p)


def test_unknown_field():
    p = {**BASE, "aadhaarNumber": "1234-5678"}
    with pytest.raises(ValidationError, match="UNKNOWN_FIELD"):
        _validate_profile(p)


def test_dob_future():
    p = {**BASE, "dateOfBirth": "2099-01-01"}
    with pytest.raises(ValidationError, match="future"):
        _validate_profile(p)


def test_boolean_string_rejected():
    p = {**BASE, "isIncomeTaxPayer": "true"}
    with pytest.raises(ValidationError):
        _validate_profile(p)


def test_boolean_int_rejected():
    p = {**BASE, "hasCultivableLand": 1}
    with pytest.raises(ValidationError):
        _validate_profile(p)


def test_long_float_rejected():
    p = {**BASE, "familyIncomeInr": 300000.0}
    with pytest.raises(ValidationError):
        _validate_profile(p)


def test_bool_rejected_as_long():
    p = {**BASE, "class12Percentile": True}
    with pytest.raises(ValidationError):
        _validate_profile(p)


def test_income_out_of_range():
    p = {**BASE, "familyIncomeInr": 2_000_000_000}
    with pytest.raises(ValidationError, match="out of range"):
        _validate_profile(p)


def test_percentile_out_of_range():
    p = {**BASE, "class12Percentile": 101}
    with pytest.raises(ValidationError, match="out of range"):
        _validate_profile(p)


def test_invalid_gender_enum():
    p = {**BASE, "gender": "unknown_gender"}
    with pytest.raises(ValidationError):
        _validate_profile(p)


def test_invalid_occupation_enum():
    p = {**BASE, "occupation": "wizard"}
    with pytest.raises(ValidationError):
        _validate_profile(p)


def test_valid_artisan_trade():
    p = {**BASE, "occupation": "artisan", "artisanTrade": "tailor"}
    attrs, _ = _validate_profile(p)
    assert attrs["artisanTrade"] == "tailor"


def test_invalid_artisan_trade():
    p = {**BASE, "artisanTrade": "rocket_scientist"}
    with pytest.raises(ValidationError):
        _validate_profile(p)


def test_invalid_state():
    p = {**BASE, "state": "xx"}
    with pytest.raises(ValidationError):
        _validate_profile(p)
