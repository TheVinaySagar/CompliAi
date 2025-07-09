"""
API Documentation Configuration
Enhanced OpenAPI documentation with comprehensive schemas and examples.
"""

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from typing import Dict, Any

def custom_openapi(app: FastAPI) -> Dict[str, Any]:
    """
    Custom OpenAPI schema generation with enhanced documentation.
    """
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="CompliAI API",
        version="2.0.0",
        description="""
## CompliAI - Advanced GRC AI Assistant API

CompliAI is a comprehensive Governance, Risk, and Compliance (GRC) AI assistant designed to help organizations navigate complex compliance frameworks and maintain regulatory adherence.

### Key Features

- **Multi-Framework Support**: ISO 27001, SOC 2, NIST CSF, PCI DSS, GDPR, HIPAA
- **Intelligent Chat**: Context-aware conversations with GRC expertise
- **Document Processing**: Upload and analyze compliance documents
- **User Management**: Role-based access control with admin capabilities
- **Conversation History**: Track and manage compliance discussions
- **Real-time Responses**: Fast and accurate compliance guidance

### Authentication

All endpoints require JWT Bearer token authentication except for the login endpoint.

**Default Admin Credentials:**
- Email: `admin@compliai.com`
- Password: `admin123` (Change immediately in production!)

### Framework Coverage

| Framework | Version | Coverage |
|-----------|---------|----------|
| ISO 27001 | 2022 | Information Security Management |
| SOC 2 | 2017 | Trust Services Criteria |
| NIST CSF | 1.1 | Cybersecurity Framework |
| PCI DSS | 4.0 | Payment Card Security |
| GDPR | 2018 | Data Protection Regulation |
| HIPAA | 2013 | Healthcare Information Security |

### Getting Started

1. **Login**: Use `/auth/login` to obtain an access token
2. **Chat**: Start conversations using `/chat/` endpoints
3. **Upload**: Process documents with `/chat/documents/upload`
4. **Manage**: Admin operations via `/admin/` endpoints

### Response Format

All chat responses include:
- **Response**: Formatted compliance guidance
- **Sources**: Referenced standards and controls
- **Confidence Score**: AI confidence in the response
- **Clause References**: Specific framework citations
- **Control IDs**: Relevant control identifiers

### Rate Limits

- **Chat Endpoints**: 100 requests/minute per user
- **Auth Endpoints**: 10 requests/minute per IP
- **Admin Endpoints**: 50 requests/minute per admin

### Error Handling

The API uses standard HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

### Support

For technical support or API questions, contact your system administrator.
        """,
        routes=app.routes,
        servers=[
            {
                "url": "http://localhost:8001",
                "description": "Development server"
            },
            {
                "url": "https://api.compliai.com", 
                "description": "Production server"
            }
        ]
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT Bearer token authentication. Use the token received from /auth/login endpoint."
        }
    }
    
    # Add global security requirement
    openapi_schema["security"] = [{"BearerAuth": []}]
    
    # Add custom schemas and examples
    openapi_schema["components"]["schemas"].update({
        "ErrorResponse": {
            "type": "object",
            "properties": {
                "detail": {
                    "type": "string",
                    "description": "Error message",
                    "example": "Authentication failed"
                },
                "error_code": {
                    "type": "string", 
                    "description": "Error code",
                    "example": "AUTH_001"
                }
            },
            "required": ["detail"]
        },
        "HealthResponse": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "example": "healthy"
                },
                "service": {
                    "type": "string",
                    "example": "CompliAI API"
                },
                "version": {
                    "type": "string",
                    "example": "2.0.0"
                },
                "database": {
                    "type": "string",
                    "example": "connected"
                },
                "timestamp": {
                    "type": "string",
                    "format": "date-time"
                }
            }
        }
    })
    
    # Add tags with descriptions
    openapi_schema["tags"] = [
        {
            "name": "Authentication",
            "description": "User authentication and authorization endpoints. Handle login, registration, and user management.",
            "externalDocs": {
                "description": "Authentication Guide",
                "url": "https://docs.compliai.com/auth"
            }
        },
        {
            "name": "Chat",
            "description": "Intelligent GRC chat endpoints. Process compliance questions and manage conversations.",
            "externalDocs": {
                "description": "Chat API Guide", 
                "url": "https://docs.compliai.com/chat"
            }
        },
        {
            "name": "Administration",
            "description": "Administrative endpoints for system management and framework configuration.",
            "externalDocs": {
                "description": "Admin Guide",
                "url": "https://docs.compliai.com/admin"
            }
        },
        {
            "name": "System",
            "description": "System health and information endpoints."
        }
    ]
    
    # Add contact information
    openapi_schema["info"]["contact"] = {
        "name": "CompliAI Support",
        "email": "support@compliai.com",
        "url": "https://compliai.com/support"
    }
    
    # Add license information
    openapi_schema["info"]["license"] = {
        "name": "Proprietary",
        "url": "https://compliai.com/license"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema
