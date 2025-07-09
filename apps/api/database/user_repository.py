from typing import Optional, List
from datetime import datetime
from pymongo import ReturnDocument
from bson import ObjectId
from passlib.context import CryptContext

from database.connection import get_database
from models.user_models import User, UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRepository:
    def __init__(self):
        self.db = None
        
    async def get_collection(self):
        if self.db is None:
            self.db = get_database()
        return self.db.users
    
    def get_password_hash(self, password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create new user"""
        collection = await self.get_collection()
        
        # Check if user already exists
        existing_user = await collection.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        hashed_password = self.get_password_hash(user_data.password)
        
        # Prepare user document
        user_doc = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": user_data.role,
            "is_active": user_data.is_active,
            "department": user_data.department,
            "permissions": user_data.permissions,
            "password_hash": hashed_password,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": None
        }
        
        # Insert user
        result = await collection.insert_one(user_doc)
        
        # Return created user
        created_user = await collection.find_one({"_id": result.inserted_id})
        return User(**created_user)
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        collection = await self.get_collection()
        user_doc = await collection.find_one({"email": email})
        
        if user_doc:
            return User(**user_doc)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        collection = await self.get_collection()
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        
        if user_doc:
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
        
        return User(**user_doc)
    
    async def update_user(self, user_id: str, user_update: UserUpdate) -> Optional[User]:
        """Update user"""
        collection = await self.get_collection()
        
        update_data = {k: v for k, v in user_update.dict(exclude_unset=True).items()}
        update_data["updated_at"] = datetime.utcnow()
        
        updated_user = await collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        
        if updated_user:
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
            users.append(User(**user_doc))
        
        return users
    
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

# Create repository instance
user_repository = UserRepository()
