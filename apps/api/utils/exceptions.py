from fastapi import HTTPException, status

class CompliAIException(HTTPException):
    """Base exception for CompliAI"""
    pass

class AuthenticationError(CompliAIException):
    """Authentication related errors"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )

class AuthorizationError(CompliAIException):
    """Authorization related errors"""
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

class UserNotFoundError(CompliAIException):
    """User not found error"""
    def __init__(self, detail: str = "User not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )

class UserExistsError(CompliAIException):
    """User already exists error"""
    def __init__(self, detail: str = "User already exists"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )

class DocumentNotFoundError(CompliAIException):
    """Document not found error"""
    def __init__(self, detail: str = "Document not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )

class LLMServiceError(CompliAIException):
    """LLM service related errors"""
    def __init__(self, detail: str = "LLM service error"):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail
        )
