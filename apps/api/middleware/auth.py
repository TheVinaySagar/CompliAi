from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from repositories.user_repository import user_repository
from utils.auth_utils import verify_access_token
from utils.exceptions import AuthenticationError, AuthorizationError
from models.user_models import User

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> User:
    """
    Dependency to get current authenticated user.
    Validates JWT token and returns user information.
    """
    
    if not credentials:
        raise AuthenticationError("Authentication token required")
    
    # Verify JWT token
    token_payload = verify_access_token(credentials.credentials)
    if not token_payload:
        raise AuthenticationError("Invalid or expired token")
    
    # Get user from database
    user = await user_repository.get_user_by_id(token_payload.user_id)
    if not user:
        raise AuthenticationError("User not found")
    
    if not user.is_active:
        raise AuthenticationError("User account is inactive")
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user (additional check for user status)"""
    if not current_user.is_active:
        raise AuthenticationError("Inactive user")
    return current_user

async def require_admin_role(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that requires admin role"""
    if current_user.role != "admin":
        raise AuthorizationError("Admin access required")
    return current_user

async def require_chat_permission(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that requires chat access permission"""
    
    # Check if user has admin role (admins have all permissions)
    if current_user.role == "admin":
        return current_user
    
    # Check if user has chat_access permission
    if "chat_access" not in current_user.permissions:
        raise AuthorizationError("Chat access permission required")
    
    return current_user

async def require_permission(permission: str):
    """Factory function to create permission-based dependencies"""
    async def check_permission(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == "admin":
            return current_user
        
        if permission not in current_user.permissions:
            raise AuthorizationError(f"Permission '{permission}' required")
        
        return current_user
    
    return check_permission

# Convenience functions for common permission checks
require_document_upload = require_permission("document_upload")
require_user_management = require_permission("user_management")
require_system_admin = require_permission("system_admin")
