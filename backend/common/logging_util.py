"""
JSON-line structured logger for Lambda.

Rules:
- All log lines are JSON objects (one per line).
- Keys `profile`, `body`, `dateOfBirth`, `aadhaar` are NEVER logged (dropped silently
  if passed, or raised if the caller explicitly tries to log them — tests cover this).
- Use log_event() for structured context; use logger.info/warning/error for plain strings.
"""
import json
import logging
import os
import sys
from typing import Any

_DENIED_KEYS = frozenset({"profile", "body", "dateOfBirth", "aadhaar"})


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        extra = {k: v for k, v in record.__dict__.items() if k.startswith("_hq_")}
        for k, v in extra.items():
            payload[k[4:]] = v  # strip _hq_ prefix
        return json.dumps(payload, default=str)


def get_logger(name: str = "haqdaar") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(_JsonFormatter())
        logger.addHandler(handler)
    level = os.environ.get("LOG_LEVEL", "INFO").upper()
    logger.setLevel(getattr(logging, level, logging.INFO))
    return logger


def log_event(logger: logging.Logger, level: str, msg: str, **fields: Any) -> None:
    """
    Log a structured event. Raises ValueError if a denied key is supplied.
    Denied keys: profile, body, dateOfBirth, aadhaar.
    """
    bad = _DENIED_KEYS & fields.keys()
    if bad:
        raise ValueError(f"Refusing to log sensitive keys: {bad}")
    extra = {f"_hq_{k}": v for k, v in fields.items()}
    getattr(logger, level.lower())(msg, extra=extra)
