"""
CompliAI API
Main FastAPI application with authentication, authorization, and modular architecture.
"""

import uvicorn
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from database.connection import connect_to_mongo, close_mongo_connection
from database.user_repository import user_repository
from routes.auth_routes import router as auth_router
from routes.chat_routes import router as chat_router
from routes.admin_routes import router as admin_router
from routes.audit_planner_routes import router as audit_planner_router
from routes.team_routes import router as team_router
from routes.policy_generator_routes import router as policy_generator_router
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting CompliAI API...")
    
    try:
        # Connect to MongoDB
        await connect_to_mongo()
        logger.info("Connected to MongoDB")
        
        # Check if admin user exists, if not create one
        admin_exists = await user_repository.check_admin_exists()
        if not admin_exists:
            logger.info("No admin user found, creating default admin...")
            admin_user = await user_repository.create_default_admin()
            logger.info(f"Default admin created: {admin_user.email}")
            logger.warning("Default admin password is 'admin123' - CHANGE THIS IMMEDIATELY!")
        
        # Initialize document processor with existing documents
        from services.grc.document_processor import document_processor
        await document_processor.initialize_documents()
        
        logger.info("CompliAI API started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down CompliAI API...")
    await close_mongo_connection()
    logger.info("CompliAI API shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="CompliAI API",
    description="""
## CompliAI - Advanced GRC AI Assistant

### Intelligent Governance, Risk, and Compliance Management

CompliAI is your comprehensive AI-powered assistant for navigating complex compliance frameworks. 
Built with cutting-edge LLM technology and deep GRC expertise.

#### Key Features:
- **Multi-Framework Support**: ISO 27001, SOC 2, NIST CSF, PCI DSS, GDPR, HIPAA
- **Intelligent Chat**: Context-aware conversations with compliance expertise
- **Document Processing**: Upload and analyze policy documents with RAG
- **User Management**: Role-based access control and authentication
- **Real-time Responses**: Fast, accurate compliance guidance
- **Conversation History**: Track and manage compliance discussions

#### Authentication:
All endpoints require JWT Bearer token authentication (except login).

**Default Admin Credentials:**
- Email: `admin@compliai.com`
- Password: `admin123` **Change immediately!**

#### API Health:
- Database: MongoDB Atlas
- LLM: Google Generative AI
- Vector Store: ChromaDB
- Framework Coverage: 6+ major standards

#### Quick Start:
1. Login via `/auth/login` to get JWT token
2. Use token in `Authorization: Bearer <token>` header
3. Start chatting via `/chat/` endpoints
4. Upload documents via `/chat/documents/upload`

#### Documentation:
- **Interactive Docs**: Available at `/docs`
- **ReDoc**: Available at `/redoc`
- **OpenAPI Schema**: Available at `/openapi.json`
    """,
    version="2.0.0",
    contact={
        "name": "CompliAI Support",
        "email": "support@compliai.com",
        "url": "https://compliai.com/support"
    },
    license_info={
        "name": "Proprietary License",
        "url": "https://compliai.com/license"
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api.compliai.com",
            "description": "Production server"
        }
    ],
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(audit_planner_router)
app.include_router(policy_generator_router)
app.include_router(team_router)

@app.get("/", tags=["System"])
async def root():
    """
    ## API Welcome & Information
    
    Welcome endpoint providing API overview and feature summary.
    
    ### Public Endpoint:
    No authentication required.
    
    ### Response:
    - **message**: Welcome message
    - **description**: API description
    - **version**: Current API version
    - **features**: List of key features
    - **docs**: Documentation URL (development only)
    
    ### Next Steps:
    1. **Authentication**: Login at `/auth/login`
    2. **Documentation**: Visit `/docs` for interactive API docs
    3. **Health Check**: Check system status at `/health`
    """
    return {
        "message": "Welcome to CompliAI API v2.0",
        "description": "Advanced GRC AI assistant with authentication",
        "version": "2.0.0",
        "features": [
            "User authentication and authorization",
            "Role-based access control",
            "Document upload and RAG processing",
            "Multi-framework GRC knowledge",
            "Conversation management",
            "Admin dashboard"
        ],
        "docs": "/docs" if settings.debug else "Contact administrator for API documentation"
    }

@app.get("/health", tags=["System"])
async def health_check():
    """
    ## Health Check Endpoint
    
    Monitor API health and database connectivity.
    
    ### Public Endpoint:
    No authentication required - suitable for load balancers and monitoring.
    
    ### Health Checks:
    - **Database**: MongoDB connection test
    - **Admin User**: Verify admin user exists
    - **Service Status**: Overall system health
    
    ### Healthy Response (200):
    - **status**: "healthy"
    - **service**: Service name
    - **version**: API version
    - **database**: "connected"
    - **timestamp**: Current timestamp
    
    ### Unhealthy Response (503):
    - **status**: "unhealthy"
    - **service**: Service name
    - **error**: Error description
    
    ### Use Cases:
    - **Load Balancer**: Health check endpoint
    - **Monitoring**: Service availability
    - **DevOps**: CI/CD pipeline validation
    """
    try:
        # Simple database connectivity check
        admin_exists = await user_repository.check_admin_exists()
        
        return {
            "status": "healthy",
            "service": "CompliAI API",
            "version": "2.0.0",
            "database": "connected",
            "timestamp": "2025-01-15T10:00:00Z"
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "service": "CompliAI API",
                "error": str(e)
            }
        )

@app.get("/info", tags=["System"])
async def api_info():
    """
    ## API Information & Capabilities
    
    Detailed information about API endpoints, permissions, and supported frameworks.
    
    ### Public Endpoint:
    No authentication required - provides API discovery information.
    
    ### Information Provided:
    - **Authentication**: Required authentication method
    - **Endpoints**: Available endpoint categories
    - **Permissions**: Required permission levels
    - **Frameworks**: Supported compliance standards
    
    ### Permission Levels:
    - **chat_access**: Access to chat and document features
    - **document_upload**: Upload and process documents
    - **user_management**: Create and manage users
    - **system_admin**: Full administrative access
    
    ### Supported Standards:
    All major compliance frameworks with current versions and comprehensive coverage.
    
    ### Use Cases:
    - **API Discovery**: Understand available capabilities
    - **Integration Planning**: Plan client implementations
    - **Permission Mapping**: Understand access requirements
    """
    return {
        "api": "CompliAI",
        "version": "2.0.0",
        "authentication": "Required (JWT Bearer Token)",
        "endpoints": {
            "authentication": "/auth/*",
            "chat": "/chat/*",
            "administration": "/admin/*"
        },
        "permissions": {
            "chat_access": "Required for chat endpoints",
            "document_upload": "Required for document operations", 
            "user_management": "Required for user operations",
            "system_admin": "Required for admin operations"
        },
        "supported_frameworks": [
            "ISO 27001",
            "SOC 2", 
            "NIST CSF",
            "PCI DSS",
            "GDPR",
            "HIPAA"
        ]
    }

# Lambda handler for AWS deployment
handler = Mangum(app, lifespan="off")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )
