"""
Haqdaar custom exception hierarchy.

Every exception carries a machine-readable `code`, a human `message`, and an
HTTP `status` so the http helper can serialise it without an isinstance chain.
"""


class HaqdaarError(Exception):
    code: str = "INTERNAL_ERROR"
    status: int = 500

    def __init__(self, message: str, code: str | None = None):
        if code:
            self.code = code
        full_msg = f"{self.code}: {message}" if self.code != "INTERNAL_ERROR" else message
        super().__init__(full_msg)
        self.message = message

    def to_dict(self) -> dict:
        return {"code": self.code, "message": self.message}


class ValidationError(HaqdaarError):
    code = "VALIDATION_ERROR"
    status = 400

    def __init__(self, message: str, code: str | None = None):
        super().__init__(message, code or self.code)


class NotFoundError(HaqdaarError):
    code = "NOT_FOUND"
    status = 404


class UpstreamError(HaqdaarError):
    code = "UPSTREAM_ERROR"
    status = 502

    def __init__(self, message: str, code: str | None = None):
        super().__init__(message, code or self.code)


class InternalError(HaqdaarError):
    code = "INTERNAL_ERROR"
    status = 500


class NotVerifiedError(HaqdaarError):
    code = "NOT_VERIFIED"
    status = 422


class CompileError(HaqdaarError):
    code = "COMPILE_ERROR"
    status = 422
