from typing import Optional, List
from datetime import datetime
from pymongo import ReturnDocument
from bson import ObjectId
from passlib.context import CryptContext
import logging

from database.connection import get_database
from models.user_models import User, UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

class UserRepository:
    def __init__(self):
        self.db = None
        
    async def get_collection(self):
        if self.db is None:
            self.db = get_database()
        return self.db.users
    
    def hash_password(self, password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def _normalize_user_doc(self, user_doc: dict) -> dict:
        """Normalize user document to ensure all required fields have proper defaults"""
        if user_doc is None:
            return user_doc
        
        # Ensure permissions is always a list, never None
        if user_doc.get("permissions") is None:
            user_doc["permissions"] = ["chat_access"]  # Default permissions
        
        # Ensure other optional fields have proper defaults
        if user_doc.get("department") is None:
            user_doc["department"] = None  # Keep as None for Optional fields
            
        return user_doc
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create new user"""
        collection = await self.get_collection()
        
        # Check if user already exists
        existing_user = await collection.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        hashed_password = self.hash_password(user_data.password)
        
        # Create user document
        user_doc = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": user_data.role,
            "is_active": user_data.is_active,
            "department": user_data.department,
            "permissions": user_data.permissions or ["chat_access"],  # Ensure default permissions
            "added_by": user_data.added_by,  # Include the admin who added this user
            "password_hash": hashed_password,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": None
        }
        
        result = await collection.insert_one(user_doc)
        
        created_user = await collection.find_one({"_id": result.inserted_id})
        created_user = self._normalize_user_doc(created_user)
        return User(**created_user)
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        collection = await self.get_collection()
        user_doc = await collection.find_one({"email": email})
        
        if user_doc:
            user_doc = self._normalize_user_doc(user_doc)
            return User(**user_doc)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        collection = await self.get_collection()
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        
        if user_doc:
            user_doc = self._normalize_user_doc(user_doc)
            return User(**user_doc)
        return None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user"""
        collection = await self.get_collection()
        user_doc = await collection.find_one({"email": email})
        
        if not user_doc:
            return None
        
        if not self.verify_password(password, user_doc.get("password_hash", "")):
            return None
        
        # Update last login
        await collection.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        user_doc = self._normalize_user_doc(user_doc)
        return User(**user_doc)
    
    async def update_user(self, user_id: str, user_update: UserUpdate) -> Optional[User]:
        """Update user"""
        collection = await self.get_collection()
        
        update_doc = {}
        if user_update.full_name is not None:
            update_doc["full_name"] = user_update.full_name
        if user_update.role is not None:
            update_doc["role"] = user_update.role
        if user_update.is_active is not None:
            update_doc["is_active"] = user_update.is_active
        if user_update.department is not None:
            update_doc["department"] = user_update.department
        if user_update.permissions is not None:
            update_doc["permissions"] = user_update.permissions
        
        if not update_doc:
            return await self.get_user_by_id(user_id)
        
        update_doc["updated_at"] = datetime.utcnow()
        
        updated_user = await collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_doc},
            return_document=ReturnDocument.AFTER
        )
        
        if updated_user:
            updated_user = self._normalize_user_doc(updated_user)
            return User(**updated_user)
        return None
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        collection = await self.get_collection()
        result = await collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    
    async def list_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """List all users"""
        collection = await self.get_collection()
        cursor = collection.find().skip(skip).limit(limit)
        users = []
        
        async for user_doc in cursor:
            user_doc = self._normalize_user_doc(user_doc)
            users.append(User(**user_doc))
        
        return users
    
    async def get_admin_users(self) -> List[User]:
        """Get all admin users"""
        try:
            collection = await self.get_collection()
            cursor = collection.find({"role": "admin"})
            admins = []
            async for user_doc in cursor:
                user_doc = self._normalize_user_doc(user_doc)
                admins.append(User(**user_doc))
            return admins
        except Exception as e:
            logger.error(f"Error getting admin users: {str(e)}")
            return []
    
    async def check_admin_exists(self) -> bool:
        """Check if any admin user exists"""
        collection = await self.get_collection()
        admin_count = await collection.count_documents({"role": "admin"})
        return admin_count > 0
    
    async def create_default_admin(self) -> User:
        """Create default admin user"""
        admin_data = UserCreate(
            email="admin@compliai.com",
            full_name="System Administrator",
            role="admin",
            department="IT",
            password="admin123",  # Change this in production
            permissions=["chat_access", "document_upload", "user_management", "system_admin"]
        )
        
        return await self.create_user(admin_data)
    
    async def verify_user_password(self, email: str, password: str) -> bool:
        """Verify user password by email"""
        collection = await self.get_collection()
        user_doc = await collection.find_one({"email": email})
        
        if not user_doc:
            return False
        
        return self.verify_password(password, user_doc.get("password_hash", ""))
    
    async def update_password(self, user_id: str, new_password: str) -> bool:
        """Update user password"""
        try:
            collection = await self.get_collection()
            hashed_password = self.hash_password(new_password)
            
            result = await collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "password_hash": hashed_password,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating password for user {user_id}: {str(e)}")
            return False
    
    async def get_users_by_admin(self, admin_id: str) -> List[User]:
        """Get all users added by a specific admin"""
        try:
            collection = await self.get_collection()
            cursor = collection.find({"added_by": admin_id})
            users = []
            async for user_doc in cursor:
                user_doc = self._normalize_user_doc(user_doc)
                users.append(User(**user_doc))
            return users
        except Exception as e:
            logger.error(f"Error getting users by admin: {str(e)}")
            return []

user_repository = UserRepository()
