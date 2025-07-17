"""
Conversation Repository
Database operations for conversations and messages.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from pymongo import DESCENDING

from database.connection import get_database
from models.conversation_models import (
    Conversation, ConversationCreate, ConversationUpdate, 
    Message, MessageCreate
)

class ConversationRepository:
    def __init__(self):
        self.db = None
        
    async def get_conversations_collection(self):
        if self.db is None:
            self.db = get_database()
        return self.db.conversations
    
    async def get_messages_collection(self):
        if self.db is None:
            self.db = get_database()
        return self.db.messages

    async def create_conversation(self, conversation_data: ConversationCreate) -> Conversation:
        """Create a new conversation"""
        collection = await self.get_conversations_collection()
        
        conversation_dict = conversation_data.dict()
        conversation_dict["conversation_id"] = str(ObjectId())
        conversation_dict["created_at"] = datetime.utcnow()
        conversation_dict["updated_at"] = datetime.utcnow()
        conversation_dict["message_count"] = 0
        conversation_dict["is_active"] = True
        
        result = await collection.insert_one(conversation_dict)
        conversation_dict["_id"] = result.inserted_id
        
        return Conversation(**conversation_dict)

    async def get_conversation(self, conversation_id: str, user_id: str) -> Optional[Conversation]:
        """Get a conversation by ID and user ID"""
        collection = await self.get_conversations_collection()
        
        conversation_doc = await collection.find_one({
            "conversation_id": conversation_id,
            "user_id": user_id,
            "is_active": True
        })
        
        if conversation_doc:
            return Conversation(**conversation_doc)
        return None

    async def update_conversation(self, conversation_id: str, user_id: str, update_data: ConversationUpdate) -> Optional[Conversation]:
        """Update a conversation"""
        collection = await self.get_conversations_collection()
        
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        result = await collection.find_one_and_update(
            {"conversation_id": conversation_id, "user_id": user_id, "is_active": True},
            {"$set": update_dict},
            return_document=True
        )
        
        if result:
            return Conversation(**result)
        return None

    async def list_conversations(self, user_id: str, skip: int = 0, limit: int = 50) -> List[Conversation]:
        """List conversations for a user"""
        collection = await self.get_conversations_collection()
        
        cursor = collection.find({
            "user_id": user_id,
            "is_active": True
        }).sort("updated_at", DESCENDING).skip(skip).limit(limit)
        
        conversations = []
        async for conv_doc in cursor:
            conversations.append(Conversation(**conv_doc))
        
        return conversations

    async def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """Soft delete a conversation"""
        collection = await self.get_conversations_collection()
        
        result = await collection.update_one(
            {"conversation_id": conversation_id, "user_id": user_id},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0

    async def add_message(self, message_data: MessageCreate) -> Message:
        """Add a message to a conversation"""
        messages_collection = await self.get_messages_collection()
        conversations_collection = await self.get_conversations_collection()
        
        message_dict = message_data.dict()
        message_dict["timestamp"] = datetime.utcnow()
        
        # Insert the message
        result = await messages_collection.insert_one(message_dict)
        message_dict["_id"] = result.inserted_id
        
        # Update conversation stats
        await conversations_collection.update_one(
            {"conversation_id": message_data.conversation_id, "user_id": message_data.user_id},
            {
                "$set": {
                    "last_message": message_data.content[:100] + "..." if len(message_data.content) > 100 else message_data.content,
                    "updated_at": datetime.utcnow()
                },
                "$inc": {"message_count": 1}
            }
        )
        
        return Message(**message_dict)

    async def get_conversation_messages(self, conversation_id: str, user_id: str, skip: int = 0, limit: int = 100) -> List[Message]:
        """Get messages for a conversation"""
        collection = await self.get_messages_collection()
        
        cursor = collection.find({
            "conversation_id": conversation_id,
            "user_id": user_id
        }).sort("timestamp", 1).skip(skip).limit(limit)
        
        messages = []
        async for msg_doc in cursor:
            messages.append(Message(**msg_doc))
        
        return messages

    async def get_or_create_conversation(self, conversation_id: str, user_id: str, title: Optional[str] = None) -> Conversation:
        """Get existing conversation or create new one"""
        # Try to get existing conversation
        conversation = await self.get_conversation(conversation_id, user_id)
        
        if conversation:
            return conversation
        
        # Create new conversation
        conversation_data = ConversationCreate(
            user_id=user_id,
            title=title or f"Chat {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        )
        
        return await self.create_conversation(conversation_data)

# Create repository instance
conversation_repository = ConversationRepository()
