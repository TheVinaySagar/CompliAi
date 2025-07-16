"""
Document Repository
Handles database operations for document metadata.
"""

from typing import Optional, List
from datetime import datetime
from pymongo import ReturnDocument
from bson import ObjectId

from database.connection import get_database

class DocumentRepository:
    """Repository for document metadata database operations"""
    
    def __init__(self):
        self.db = None
        
    async def get_collection(self):
        """Get documents collection"""
        if self.db is None:
            self.db = get_database()
        return self.db.documents
    
    async def save_document_metadata(self, document_data: dict) -> dict:
        """Save document metadata to database"""
        collection = await self.get_collection()
        
        # Prepare document metadata
        doc_metadata = {
            "document_id": document_data["document_id"],
            "name": document_data["name"],
            "file_path": document_data.get("file_path"),
            "user_id": document_data["user_id"],
            "uploaded_at": document_data.get("uploaded_at", datetime.utcnow()),
            "chunks_count": document_data.get("chunks_count", 0),
            "controls_identified": document_data.get("controls_identified", 0),
            "status": document_data.get("status", "processed"),
            "file_size": document_data.get("file_size"),
            "file_type": document_data.get("file_type"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert document metadata
        result = await collection.insert_one(doc_metadata)
        
        # Return saved document
        saved_document = await collection.find_one({"_id": result.inserted_id})
        return saved_document
    
    async def get_document_by_id(self, document_id: str, user_id: str = None) -> Optional[dict]:
        """Get document metadata by document ID"""
        collection = await self.get_collection()
        
        query = {"document_id": document_id}
        if user_id:
            query["user_id"] = user_id
            
        return await collection.find_one(query)
    
    async def list_documents_by_user(self, user_id: str, skip: int = 0, limit: int = 100) -> List[dict]:
        """List documents for a specific user"""
        collection = await self.get_collection()
        
        cursor = collection.find({"user_id": user_id}).skip(skip).limit(limit).sort("uploaded_at", -1)
        documents = []
        
        async for doc in cursor:
            documents.append(doc)
            
        return documents
    
    async def list_all_documents(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """List all documents (admin only)"""
        collection = await self.get_collection()
        
        cursor = collection.find().skip(skip).limit(limit).sort("uploaded_at", -1)
        documents = []
        
        async for doc in cursor:
            documents.append(doc)
            
        return documents
    
    async def update_document_metadata(self, document_id: str, user_id: str, update_data: dict) -> Optional[dict]:
        """Update document metadata"""
        collection = await self.get_collection()
        
        update_data["updated_at"] = datetime.utcnow()
        
        updated_document = await collection.find_one_and_update(
            {"document_id": document_id, "user_id": user_id},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        
        return updated_document
    
    async def delete_document_metadata(self, document_id: str, user_id: str) -> bool:
        """Delete document metadata"""
        collection = await self.get_collection()
        
        result = await collection.delete_one({
            "document_id": document_id, 
            "user_id": user_id
        })
        
        return result.deleted_count > 0
    
    async def count_user_documents(self, user_id: str) -> int:
        """Count documents for a specific user"""
        collection = await self.get_collection()
        return await collection.count_documents({"user_id": user_id})
    
    async def get_document_stats(self, user_id: str = None) -> dict:
        """Get document statistics"""
        collection = await self.get_collection()
        
        pipeline = []
        
        if user_id:
            pipeline.append({"$match": {"user_id": user_id}})
        
        pipeline.extend([
            {
                "$group": {
                    "_id": None,
                    "total_documents": {"$sum": 1},
                    "total_chunks": {"$sum": "$chunks_count"},
                    "total_controls": {"$sum": "$controls_identified"},
                    "avg_chunks_per_doc": {"$avg": "$chunks_count"}
                }
            }
        ])
        
        result = await collection.aggregate(pipeline).to_list(1)
        
        if result:
            stats = result[0]
            del stats["_id"]
            return stats
        
        return {
            "total_documents": 0,
            "total_chunks": 0,
            "total_controls": 0,
            "avg_chunks_per_doc": 0
        }

# Global repository instance
document_repository = DocumentRepository()
