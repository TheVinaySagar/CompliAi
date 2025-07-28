"""
Team Repository
Database operations for team management.
"""

from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId

from database.connection import get_database
from models.team_models import TeamInvitation

class TeamRepository:
    """Repository for team-related database operations"""
    
    def __init__(self):
        self.db = None
    
    async def get_collection(self):
        """Get team invitations collection"""
        if self.db is None:
            self.db = get_database()
        return self.db.team_invitations
    
    async def create_invitation(
        self, 
        email: str, 
        full_name: str, 
        role: str,
        department: Optional[str],
        invited_by: str
    ) -> TeamInvitation:
        """Create a new team invitation"""
        collection = await self.get_collection()
        
        invitation_doc = {
            "email": email,
            "full_name": full_name,
            "role": role,
            "department": department,
            "invited_by": invited_by,
            "invited_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=7),
            "status": "pending"
        }
        
        result = await collection.insert_one(invitation_doc)
        invitation_doc["_id"] = result.inserted_id
        
        return TeamInvitation(**invitation_doc)
    
    async def get_invitation(self, invitation_id: str) -> Optional[TeamInvitation]:
        """Get invitation by ID"""
        collection = await self.get_collection()
        invitation_doc = await collection.find_one({"_id": ObjectId(invitation_id)})
        
        if invitation_doc:
            return TeamInvitation(**invitation_doc)
        return None
    
    async def get_invitation_by_email(self, email: str) -> Optional[TeamInvitation]:
        """Get pending invitation by email"""
        collection = await self.get_collection()
        invitation_doc = await collection.find_one({
            "email": email, 
            "status": "pending",
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if invitation_doc:
            return TeamInvitation(**invitation_doc)
        return None
    
    async def update_invitation_status(
        self, 
        invitation_id: str, 
        status: str
    ) -> bool:
        """Update invitation status"""
        collection = await self.get_collection()
        result = await collection.update_one(
            {"_id": ObjectId(invitation_id)},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    async def list_pending_invitations(self) -> List[TeamInvitation]:
        """List all pending invitations"""
        collection = await self.get_collection()
        cursor = collection.find({
            "status": "pending",
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        invitations = []
        async for invitation_doc in cursor:
            invitations.append(TeamInvitation(**invitation_doc))
        
        return invitations
    
    async def cleanup_expired_invitations(self) -> int:
        """Clean up expired invitations"""
        collection = await self.get_collection()
        result = await collection.update_many(
            {
                "status": "pending",
                "expires_at": {"$lt": datetime.utcnow()}
            },
            {"$set": {"status": "expired", "updated_at": datetime.utcnow()}}
        )
        return result.modified_count

# Global team repository instance
team_repository = TeamRepository()
