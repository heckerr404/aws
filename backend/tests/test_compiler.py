"""
test_compiler.py — Unit tests for backend/common/cedar_compiler.py
"""
import pytest

from backend.common.cedar_compiler import (
    CompileError,
    compile_base_permit,
    compile_clause,
    compile_scheme,
    condition,
)


class TestCondition:
    def test_eq_string(self):
        c = condition({"attribute": "occupation", "op": "eq", "value": "farmer"})
        assert c == 'principal.occupation == "farmer"'

    def test_eq_boolean(self):
        c = condition({"attribute": "hasCultivableLand", "op": "eq", "value": True})
        assert c == "principal.hasCultivableLand == true"

    def test_gte_long(self):
        c = condition({"attribute": "age", "op": "gte", "value": 18})
        assert c == "principal.age >= 18"

    def test_lte_long(self):
        c = condition({"attribute": "familyIncomeInr", "op": "lte", "value": 450000})
        assert c == "principal.familyIncomeInr <= 450000"

    def test_between(self):
        c = condition({"attribute": "age", "op": "between", "value": [18, 40]})
        assert ">= 18" in c and "<= 40" in c

    def test_between_lo_gt_hi(self):
        with pytest.raises(CompileError):
            condition({"attribute": "age", "op": "between", "value": [40, 18]})

    def test_in_strings(self):
        c = condition({"attribute": "state", "op": "in", "value": ["tn", "ka"]})
        assert "tn" in c and "ka" in c and "contains" in c

    def test_is_true(self):
        c = condition({"attribute": "isIncomeTaxPayer", "op": "is_true"})
        assert c == "principal.isIncomeTaxPayer == true"

    def test_is_false(self):
        c = condition({"attribute": "hasBankAccount", "op": "is_false"})
        assert c == "principal.hasBankAccount == false"

    def test_unknown_attribute(self):
        with pytest.raises(CompileError, match="unknown attribute"):
            condition({"attribute": "aadhaarNumber", "op": "eq", "value": "1234"})

    def test_unknown_op(self):
        with pytest.raises(CompileError, match="unknown op"):
            condition({"attribute": "age", "op": "gt", "value": 18})

    def test_bool_rejected_for_long(self):
        with pytest.raises(CompileError, match="expected integer"):
            condition({"attribute": "age", "op": "gte", "value": True})

    def test_invalid_string_slug(self):
        with pytest.raises(CompileError, match="invalid string literal"):
            condition({"attribute": "occupation", "op": "eq", "value": "Income Tax Payer"})

    def test_gte_on_string_raises(self):
        with pytest.raises(CompileError):
            condition({"attribute": "state", "op": "gte", "value": "tn"})


class TestCompileClause:
    def test_requirement_uses_unless(self):
        clause = {"clauseId": "PMK-R-01", "kind": "requirement", "attribute": "occupation", "op": "eq", "value": "farmer"}
        cedar = compile_clause("pm-kisan", clause)
        assert "forbid" in cedar
        assert "unless" in cedar
        assert "when" not in cedar

    def test_exclusion_uses_when(self):
        clause = {"clauseId": "PMK-X-01", "kind": "exclusion", "attribute": "isIncomeTaxPayer", "op": "is_true"}
        cedar = compile_clause("pm-kisan", clause)
        assert "forbid" in cedar
        assert "when" in cedar
        assert "unless" not in cedar

    def test_invalid_kind(self):
        with pytest.raises(CompileError, match="unknown kind"):
            compile_clause("pm-kisan", {"clauseId": "PMK-A-01", "kind": "allow", "attribute": "age", "op": "gte", "value": 18})


class TestCompileBasePermit:
    def test_permit(self):
        cedar = compile_base_permit("pm-kisan")
        assert cedar.startswith("permit")
        assert "pm-kisan" in cedar

    def test_invalid_scheme_id(self):
        with pytest.raises(CompileError):
            compile_base_permit("pm kisan!")


class TestCompileScheme:
    def test_full_scheme(self, pm_kisan_rules):
        results = compile_scheme(pm_kisan_rules)
        kinds = [r["kind"] for r in results]
        assert "base_permit" in kinds
        assert "requirement" in kinds
        assert "exclusion" in kinds

    def test_base_permit_first(self, pm_kisan_rules):
        results = compile_scheme(pm_kisan_rules)
        assert results[0]["kind"] == "base_permit"

    def test_unsupported_clauses_skipped(self):
        rules = {
            "schemeId": "test-scheme",
            "clauses": [
                {"clauseId": "TST-R-01", "unsupported": True, "attribute": None, "op": None},
            ],
        }
        results = compile_scheme(rules)
        clause_ids = [r["clauseId"] for r in results]
        assert "TST-R-01" not in clause_ids

    def test_cedar_schema_sync(self):
        """Cedar schema attributes and schema.py CITIZEN_ATTRS must agree."""
        import json
        from pathlib import Path
        from backend.common.schema import CITIZEN_ATTRS

        schema_path = Path(__file__).parent.parent.parent / "cedar" / "schema.cedarjson"
        schema = json.loads(schema_path.read_text())
        cedar_attrs = schema["Haqdaar"]["entityTypes"]["Citizen"]["shape"]["attributes"]

        TYPE_MAP = {"Long": "long", "String": "string", "Boolean": "boolean"}
        for name, defn in cedar_attrs.items():
            assert name in CITIZEN_ATTRS, f"Attribute {name!r} in Cedar schema but not in CITIZEN_ATTRS"
            assert CITIZEN_ATTRS[name] == TYPE_MAP[defn["type"]], (
                f"Type mismatch for {name}: Cedar={defn['type']}, schema.py={CITIZEN_ATTRS[name]}"
            )

        assert len(CITIZEN_ATTRS) == 15, f"Expected 15 attributes, got {len(CITIZEN_ATTRS)}"
