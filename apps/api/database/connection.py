from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: AsyncIOMotorClient = None
    database = None

# Create database instance
database_manager = DatabaseManager()

async def connect_to_mongo():
    """Create database connection"""
    try:
        database_manager.client = AsyncIOMotorClient(settings.mongodb_url)
        database_manager.database = database_manager.client[settings.database_name]

        
        # Test connection
        await database_manager.client.admin.command('ping')
        logger.info(f"Connected to MongoDB at {settings.mongodb_url}")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if database_manager.client:
        database_manager.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # User collection indexes
        await database_manager.database.users.create_index("email", unique=True)
        await database_manager.database.users.create_index("role")
        
        # Conversation collection indexes
        await database_manager.database.conversations.create_index("user_id")
        await database_manager.database.conversations.create_index("created_at")
        
        # Document collection indexes
        await database_manager.database.documents.create_index("user_id")
        await database_manager.database.documents.create_index("document_name")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.warning(f"Failed to create indexes: {e}")

def get_database():
    """Get database instance"""
    return database_manager.database
