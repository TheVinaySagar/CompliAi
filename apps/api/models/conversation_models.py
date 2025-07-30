"""
Conversation Models
Data models for conversations and messages in the database.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, values=None):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

class Message(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    conversation_id: str
    user_id: str
    content: str
    sender: str  # "user" or "assistant"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence_score: Optional[float] = None
    sources: Optional[List[Dict[str, Any]]] = None
    clause_references: Optional[List[str]] = None
    control_ids: Optional[List[str]] = None
    framework_context: Optional[str] = None
    mode: Optional[str] = None
    document_id: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Conversation(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    conversation_id: str = Field(default_factory=lambda: str(ObjectId()))
    user_id: str
    title: Optional[str] = None
    last_message: Optional[str] = None
    message_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    framework_context: Optional[str] = None
    is_active: bool = True

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ConversationCreate(BaseModel):
    user_id: str
    title: Optional[str] = None
    framework_context: Optional[str] = None

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    last_message: Optional[str] = None
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_active: Optional[bool] = None

class MessageCreate(BaseModel):
    conversation_id: str
    user_id: str
    content: str
    sender: str
    confidence_score: Optional[float] = None
    sources: Optional[List[Dict[str, Any]]] = None
    clause_references: Optional[List[str]] = None
    control_ids: Optional[List[str]] = None
    framework_context: Optional[str] = None
    mode: Optional[str] = None
    document_id: Optional[str] = None
