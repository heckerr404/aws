"""
Deterministic Cedar policy compiler.

Takes a clause dict from a rules.json file and produces a Cedar policy statement.

Cedar modelling rule (from Master Context):
  - One unconditional base permit per scheme.
  - One forbid policy per clause:
      requirement → forbid(...) unless { <condition> };
      exclusion   → forbid(...) when  { <condition> };

Only uses Python stdlib + backend.common.schema — no boto3, no LLM.
"""
import re
from typing import Any

from backend.common.schema import CITIZEN_ATTRS, ENUMS, NAMESPACE, ACTION_ID

_SLUG = re.compile(r"^[a-z0-9_]{1,40}$")
_ID = re.compile(r"^[A-Za-z0-9\-]{1,64}$")

OPS = {"eq", "neq", "gte", "lte", "between", "in", "is_true", "is_false"}


class CompileError(ValueError):
    pass


def _lit(value: Any, typ: str) -> str:
    """Return a Cedar literal for `value` given attribute type."""
    if typ == "long":
        if isinstance(value, bool) or not isinstance(value, int):
            raise CompileError(f"expected integer, got {value!r}")
        return str(value)
    if typ == "boolean":
        if not isinstance(value, bool):
            raise CompileError(f"expected boolean, got {value!r}")
        return "true" if value else "false"
    if typ == "string":
        if not isinstance(value, str) or not _SLUG.match(value):
            raise CompileError(f"invalid string literal {value!r}")
        return f'"{value}"'
    raise CompileError(f"unknown type {typ}")


def condition(clause: dict) -> str:
    """Compile the condition expression for a single clause."""
    attr = clause.get("attribute")
    op = clause.get("op")
    if not attr or not op:
        raise CompileError("clause missing attribute or op")
    if attr not in CITIZEN_ATTRS:
        raise CompileError(f"unknown attribute {attr!r}")
    if op not in OPS:
        raise CompileError(f"unknown op {op!r}")
    typ = CITIZEN_ATTRS[attr]
    p = f"principal.{attr}"
    v = clause.get("value")

    if op == "eq":
        return f"{p} == {_lit(v, typ)}"
    if op == "neq":
        return f"{p} != {_lit(v, typ)}"
    if op == "gte":
        if typ != "long":
            raise CompileError("gte needs a long attribute")
        return f"{p} >= {_lit(v, typ)}"
    if op == "lte":
        if typ != "long":
            raise CompileError("lte needs a long attribute")
        return f"{p} <= {_lit(v, typ)}"
    if op == "between":
        if typ != "long" or not (isinstance(v, list) and len(v) == 2):
            raise CompileError("between needs [lo, hi] on a long attribute")
        lo, hi = v
        if lo > hi:
            raise CompileError("between: lo > hi")
        return f"{p} >= {_lit(lo, typ)} && {p} <= {_lit(hi, typ)}"
    if op == "in":
        if typ != "string" or not (isinstance(v, list) and len(v) >= 1):
            raise CompileError("in needs a non-empty list on a string attribute")
        literals = ", ".join(_lit(item, typ) for item in v)
        return f"[{literals}].contains({p})"
    if op == "is_true":
        if typ != "boolean":
            raise CompileError("is_true needs a boolean attribute")
        return f"{p} == true"
    if op == "is_false":
        if typ != "boolean":
            raise CompileError("is_false needs a boolean attribute")
        return f"{p} == false"
    raise CompileError(f"unhandled op {op!r}")  # should be unreachable


def _scope(scheme_id: str) -> str:
    """Returns the Cedar scope block for a scheme resource."""
    return (
        f"principal is {NAMESPACE}::Citizen,\n"
        f'  action == {NAMESPACE}::Action::"{ACTION_ID}",\n'
        f'  resource == {NAMESPACE}::Scheme::"{scheme_id}"'
    )


def compile_base_permit(scheme_id: str) -> str:
    """One unconditional permit for the scheme."""
    if not _ID.match(scheme_id):
        raise CompileError(f"invalid schemeId {scheme_id!r}")
    return f"permit (\n  {_scope(scheme_id)}\n);"


def compile_clause(scheme_id: str, clause: dict) -> str:
    """
    Compile a single clause dict to a Cedar forbid policy statement.

    requirement → forbid ... unless { <condition> };
    exclusion   → forbid ... when  { <condition> };
    """
    if not _ID.match(scheme_id):
        raise CompileError(f"invalid schemeId {scheme_id!r}")
    kind = clause.get("kind")
    if kind not in ("requirement", "exclusion"):
        raise CompileError(f"unknown kind {kind!r}")
    cond = condition(clause)
    keyword = "unless" if kind == "requirement" else "when"
    return f"forbid (\n  {_scope(scheme_id)}\n) {keyword} {{\n  {cond}\n}};"


def compile_scheme(rules: dict) -> list[dict]:
    """
    Compile a full rules dict into a list of Cedar policy dicts.

    Returns:
        [
            {"clauseId": "__base__", "kind": "base_permit", "cedarStatement": "..."},
            {"clauseId": "PMK-R-01",  "kind": "requirement", "cedarStatement": "..."},
            ...
        ]

    Unsupported clauses (attribute is None / unsupported=True) are skipped.
    """
    scheme_id = rules.get("schemeId", "")
    if not _ID.match(scheme_id):
        raise CompileError(f"invalid schemeId {scheme_id!r}")

    results = [
        {
            "clauseId": "__base__",
            "kind": "base_permit",
            "cedarStatement": compile_base_permit(scheme_id),
        }
    ]

    for clause in rules.get("clauses", []):
        if clause.get("unsupported"):
            continue
        if not clause.get("attribute") or not clause.get("op"):
            continue
        clause_id = clause.get("clauseId", "")
        if not _ID.match(clause_id):
            raise CompileError(f"invalid clauseId {clause_id!r}")
        cedar = compile_clause(scheme_id, clause)
        results.append(
            {
                "clauseId": clause_id,
                "kind": clause.get("kind"),
                "cedarStatement": cedar,
            }
        )

    return results
