"""
check_eligibility Lambda handler — see __init__.py for full implementation.
"""
from backend.functions.check_eligibility import handler as _handler  # noqa: F401

# SAM expects `handler` at module level
from backend.functions.check_eligibility import handler
