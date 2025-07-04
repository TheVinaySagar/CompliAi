from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from config import settings
from typing import Optional

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = None):
    """Get current user - simplified for testing."""
    
    if settings.test_mode:
        return {
            "user_id": "test_user_123",
            "email": "test@compliai.com",
            "role": "GRC Manager"
        }
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    if credentials.credentials == "test-token":
        return {
            "user_id": "authenticated_user",
            "email": "user@compliai.com", 
            "role": "GRC Manager"
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication token"
    )
