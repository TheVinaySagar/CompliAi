"""
Team Management Models
Pydantic models for team management functionality.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from models.user_models import UserRole

class MemberStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"

class TeamMember(BaseModel):
    """Team member representation"""
    id: str
    name: str
    email: EmailStr
    role: UserRole
    status: MemberStatus
    department: Optional[str] = None
    permissions: List[str] = []
    join_date: datetime
    last_login: Optional[datetime] = None
    added_by: Optional[str] = None  # ID of admin who added this user
    added_by_name: Optional[str] = None  # Name of admin who added this user
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "name": "John Doe",
                "email": "john.doe@company.com",
                "role": "user",
                "status": "active",
                "department": "IT Security",
                "permissions": ["chat_access", "document_upload"],
                "join_date": "2024-01-15T10:30:00Z",
                "last_login": "2024-01-20T15:45:00Z"
            }
        }

class TeamStats(BaseModel):
    """Team statistics and metrics"""
    total_members: int
    active_members: int
    pending_members: int
    admin_count: int
    role_distribution: Dict[str, int]
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_members": 25,
                "active_members": 23,
                "pending_members": 2,
                "admin_count": 3,
                "role_distribution": {
                    "admin": 3,
                    "user": 15,
                    "auditor": 4,
                    "viewer": 3
                }
            }
        }

class InviteUserRequest(BaseModel):
    """Request to invite a new team member"""
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.VIEWER
    department: Optional[str] = None
    permissions: Optional[List[str]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "newuser@company.com",
                "full_name": "Jane Smith",
                "role": "user",
                "department": "Compliance",
                "permissions": ["chat_access", "document_upload"]
            }
        }

class TeamInvitation(BaseModel):
    """Team invitation details"""
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    department: Optional[str] = None
    invited_by: str
    invited_at: datetime
    expires_at: datetime
    status: str = "pending"  # pending, accepted, expired
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "invite@company.com",
                "full_name": "New User",
                "role": "user",
                "department": "HR",
                "invited_by": "507f1f77bcf86cd799439012",
                "invited_at": "2024-01-15T10:30:00Z",
                "expires_at": "2024-01-22T10:30:00Z",
                "status": "pending"
            }
        }

class RoleUpdateRequest(BaseModel):
    """Request to update a team member's role"""
    role: UserRole
    permissions: Optional[List[str]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "admin",
                "permissions": ["chat_access", "document_upload", "user_management", "system_admin"]
            }
        }

class StatusUpdateRequest(BaseModel):
    """Request to update a team member's status"""
    is_active: bool
    
    class Config:
        json_schema_extra = {
            "example": {
                "is_active": False
            }
        }

class TeamMemberUpdate(BaseModel):
    """Update team member information"""
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Updated Name",
                "role": "admin",
                "department": "IT Security",
                "permissions": ["chat_access", "user_management"],
                "is_active": True
            }
        }
