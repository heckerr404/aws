"""
conftest.py — pytest fixtures shared across all test modules.
"""
import pytest


@pytest.fixture
def pm_kisan_rules():
    return {
        "schemeId": "pm-kisan",
        "name": {"en": "PM-KISAN", "hi": "पीएम-किसान"},
        "ministry": "Ministry of Agriculture",
        "officialUrl": "https://pmkisan.gov.in",
        "sourcePdfKey": "raw/pm-kisan.pdf",
        "clauses": [
            {
                "clauseId": "PMK-R-01",
                "kind": "requirement",
                "attribute": "occupation",
                "op": "eq",
                "value": "farmer",
                "citation": {"page": 2, "section": "1.1", "quote": "All landholding farmer families shall be eligible."},
                "humanText": {"en": "Must be a farmer.", "hi": "किसान होना चाहिए।"},
                "remedy": {"en": "Farmers only.", "hi": "केवल किसान।", "counterfactual": {"attribute": "occupation", "value": "farmer"}},
                "verified": {"by": "test", "at": "2026-09-01"},
            },
            {
                "clauseId": "PMK-R-02",
                "kind": "requirement",
                "attribute": "hasCultivableLand",
                "op": "is_true",
                "citation": {"page": 2, "section": "1.1", "quote": "Must have cultivable land."},
                "humanText": {"en": "Must have cultivable land.", "hi": "कृषि भूमि होनी चाहिए।"},
                "remedy": {"en": "Own land required.", "hi": "", "counterfactual": None},
                "verified": {"by": "test", "at": "2026-09-01"},
            },
            {
                "clauseId": "PMK-X-01",
                "kind": "exclusion",
                "attribute": "isIncomeTaxPayer",
                "op": "is_true",
                "citation": {"page": 4, "section": "2.5", "quote": "Income Tax assessees are not eligible."},
                "humanText": {"en": "Must not be income tax payer.", "hi": ""},
                "remedy": {"en": "Tax payers excluded.", "hi": "", "counterfactual": None},
                "verified": {"by": "test", "at": "2026-09-01"},
            },
        ],
    }


@pytest.fixture
def farmer_profile():
    return {
        "age": 35,
        "familyIncomeInr": 80000,
        "state": "up",
        "gender": "male",
        "socialCategory": "obc",
        "occupation": "farmer",
        "artisanTrade": "none",
        "hasCultivableLand": True,
        "isInstitutionalLandHolder": False,
        "isIncomeTaxPayer": False,
        "isGovtEmployee": False,
        "hasBankAccount": True,
        "isEnrolledInHigherEd": False,
        "class12Percentile": 0,
        "hasAvailedSimilarCreditScheme5y": False,
    }


@pytest.fixture
def student_profile():
    return {
        "age": 20,
        "familyIncomeInr": 300000,
        "state": "tn",
        "gender": "female",
        "socialCategory": "obc",
        "occupation": "student",
        "artisanTrade": "none",
        "hasCultivableLand": False,
        "isInstitutionalLandHolder": False,
        "isIncomeTaxPayer": False,
        "isGovtEmployee": False,
        "hasBankAccount": True,
        "isEnrolledInHigherEd": True,
        "class12Percentile": 92,
        "hasAvailedSimilarCreditScheme5y": False,
    }
