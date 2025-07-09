from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, values=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    AUDITOR = "auditor"
    VIEWER = "viewer"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    department: Optional[str] = None
    permissions: List[str] = []

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    department: Optional[str] = None
    permissions: Optional[List[str]] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: Optional[str] = Field(default=None, alias="_id")
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    @field_validator('id', mode='before')
    @classmethod
    def validate_object_id(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "email": "admin@compliai.com",
                "full_name": "Admin User",
                "role": "admin",
                "is_active": True,
                "department": "IT Security",
                "permissions": ["chat_access", "document_upload", "user_management"]
            }
        }

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: User

class TokenPayload(BaseModel):
    user_id: str
    email: str
    role: str
    exp: int
