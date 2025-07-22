"""
Authentication Routes
Handles user registration, login, and user management.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from datetime import timedelta
from typing import List

from models.user_models import (
    User, UserCreate, UserLogin, UserUpdate, Token, UserRole
)
from database.user_repository import user_repository
from utils.auth_utils import create_token_for_user
from utils.exceptions import AuthenticationError, UserExistsError, UserNotFoundError
from auth import get_current_user, require_admin_role
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register_user(user_data: UserCreate):
    """
    ## Public User Registration
    
    Create a new user account and receive an authentication token.
    
    ### Public Endpoint:
    This endpoint allows public user registration without authentication.
    
    ### Request Body:
    - **email**: Valid email address (will be username)
    - **full_name**: User's full name
    - **password**: Strong password (min 8 characters)
    - **role**: Optional role (defaults to 'viewer' for public registration)
    - **department**: Optional department name
    - **permissions**: Optional list of permissions (defaults to basic permissions)
    
    ### Response:
    Returns authentication token with user information:
    - **access_token**: JWT bearer token for immediate API access
    - **token_type**: Always "bearer"
    - **expires_in**: Token expiration time in seconds
    - **user**: Created user profile information
    
    ### Errors:
    - **400**: Invalid input data or user already exists
    - **422**: Validation errors (invalid email, weak password, etc.)
    """
    try:
        # Check if user already exists
        existing_user = await user_repository.get_user_by_email(user_data.email)
        if existing_user:
            raise UserExistsError("User with this email already exists")
        
        # Set default role and permissions for public registration
        if not user_data.role:
            user_data.role = UserRole.VIEWER
        if not user_data.permissions:
            user_data.permissions = ["chat_access"]
        
        # Create new user
        new_user = await user_repository.create_user(user_data)
        
        # Create access token for immediate login
        access_token = create_token_for_user(
            user_id=str(new_user.id),
            email=new_user.email,
            role=new_user.role
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=new_user
        )
        
    except UserExistsError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """
    ## User Authentication
    
    Authenticate user credentials and receive a JWT access token.
    
    ### Public Endpoint:
    This is the only endpoint that doesn't require authentication.
    
    ### Request Body:
    - **email**: User's email address
    - **password**: User's password
    
    ### Response:
    Returns JWT token with user information:
    - **access_token**: JWT bearer token for API access
    - **token_type**: Always "bearer"
    - **expires_in**: Token expiration time in seconds
    - **user**: User profile information
    
    ### Token Usage:
    Include the token in the Authorization header:
    ```
    Authorization: Bearer <access_token>
    ```
    
    ### Token Expiration:
    Default expiration: 7 days (configurable)
    
    ### Errors:
    - **401**: Invalid credentials
    - **400**: Invalid request format
    - **403**: Account disabled or locked
    
    ### Default Admin:
    - Email: `admin@compliai.com`
    - Password: `admin123` (change immediately!)
    """
    try:
        # Authenticate user
        user = await user_repository.authenticate_user(
            user_credentials.email, 
            user_credentials.password
        )
        
        if not user:
            raise AuthenticationError("Invalid email or password")
        
        # Create access token
        access_token = create_token_for_user(
            user_id=str(user.id),
            email=user.email,
            role=user.role
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=user
        )
        
    except Exception as e:
        if isinstance(e, AuthenticationError):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    """
    return current_user

@router.put("/me", response_model=User)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update current user information.
    Users can only update their own profile (except role and permissions).
    """
    try:
        # Prevent users from changing their own role/permissions
        if current_user.role != "admin":
            user_update.role = None
            user_update.permissions = None
        
        updated_user = await user_repository.update_user(
            str(current_user.id), 
            user_update
        )
        
        if not updated_user:
            raise UserNotFoundError("User not found")
        
        return updated_user
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin_role)
):
    """
    List all users (Admin only).
    """
    try:
        users = await user_repository.list_users(skip=skip, limit=limit)
        return users
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(require_admin_role)
):
    """
    Get specific user by ID (Admin only).
    """
    try:
        user = await user_repository.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError("User not found")
        
        return user
        
    except Exception as e:
        if isinstance(e, UserNotFoundError):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(require_admin_role)
):
    """
    Update user by ID (Admin only).
    """
    try:
        updated_user = await user_repository.update_user(user_id, user_update)
        if not updated_user:
            raise UserNotFoundError("User not found")
        
        return updated_user
        
    except Exception as e:
        if isinstance(e, UserNotFoundError):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_admin_role)
):
    """
    Delete user by ID (Admin only).
    """
    try:
        # Prevent admin from deleting themselves
        if user_id == str(current_user.id):
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete your own account"
            )
        
        success = await user_repository.delete_user(user_id)
        if not success:
            raise UserNotFoundError("User not found")
        
        return {"message": "User deleted successfully"}
        
    except Exception as e:
        if isinstance(e, UserNotFoundError):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/register", response_model=User)
async def admin_register_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin_role)
):
    """
    ## Admin User Registration
    
    Create a new user account as an administrator. Only administrators can use this endpoint.
    
    ### Required Role: 
    **Admin** - Only users with admin role can create new accounts
    
    ### Request Body:
    - **email**: Valid email address (will be username)
    - **full_name**: User's full name
    - **password**: Strong password (min 8 characters)
    - **role**: User role (admin, user, auditor, viewer)
    - **department**: Optional department name
    - **permissions**: List of specific permissions
    
    ### Response:
    Returns the created user object (without password)
    
    ### Errors:
    - **400**: Invalid input data or user already exists
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    """
    try:
        # Check if user already exists
        existing_user = await user_repository.get_user_by_email(user_data.email)
        if existing_user:
            raise UserExistsError("User with this email already exists")
        
        # Create new user with admin privileges
        new_user = await user_repository.create_user(user_data)
        return new_user
        
    except UserExistsError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="User creation failed")

@router.post("/init-admin")
async def initialize_admin():
    """
    Initialize default admin user if no admin exists.
    This endpoint can only be used when no admin users exist in the system.
    """
    try:
        # Check if any admin user exists
        admin_exists = await user_repository.check_admin_exists()
        
        if admin_exists:
            raise HTTPException(
                status_code=400,
                detail="Admin user already exists"
            )
        
        # Create default admin
        admin_user = await user_repository.create_default_admin()
        
        return {
            "message": "Default admin user created successfully",
            "email": admin_user.email,
            "temporary_password": "admin123",  # Change this immediately
            "note": "Please change the default password immediately"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
