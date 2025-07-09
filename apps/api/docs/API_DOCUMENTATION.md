# CompliAI API Documentation

## Overview

CompliAI is an advanced Governance, Risk, and Compliance (GRC) AI assistant that provides intelligent guidance across multiple compliance frameworks. The API is built with FastAPI and provides comprehensive authentication, chat capabilities, and administrative features.

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Models](#models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Authentication

All endpoints (except `/auth/login`) require JWT Bearer token authentication.

### Getting a Token

```bash
curl -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@compliai.com",
    "password": "admin123"
  }'
```

### Using the Token

Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Default Admin Credentials

- **Email**: `admin@compliai.com`
- **Password**: `admin123` (Change immediately in production!)

## Endpoints

### System Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | API welcome and information | No |
| GET | `/health` | Health check for monitoring | No |
| GET | `/info` | API capabilities and frameworks | No |
| GET | `/docs` | Interactive Swagger documentation | No |
| GET | `/redoc` | ReDoc documentation | No |

### Authentication Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User authentication | None |
| POST | `/auth/register` | Register new user | Admin |
| GET | `/auth/me` | Get current user profile | User |
| PUT | `/auth/me` | Update user profile | User |
| GET | `/auth/users` | List all users | Admin |
| GET | `/auth/users/{user_id}` | Get specific user | Admin |
| PUT | `/auth/users/{user_id}` | Update user | Admin |
| DELETE | `/auth/users/{user_id}` | Delete user | Admin |

### Chat Endpoints

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| POST | `/chat/` | Main chat interface | chat_access |
| GET | `/chat/conversations` | List user conversations | chat_access |
| GET | `/chat/conversations/{id}` | Get conversation history | chat_access |
| DELETE | `/chat/conversations/{id}` | Delete conversation | chat_access |
| POST | `/chat/documents/upload` | Upload document for RAG | chat_access |
| GET | `/chat/documents` | List uploaded documents | chat_access |
| DELETE | `/chat/documents/{id}` | Delete document | chat_access |

### Admin Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/admin/status` | System status and health | Admin |
| GET | `/admin/frameworks` | List supported frameworks | Admin |
| GET | `/admin/frameworks/{key}` | Framework details | Admin |
| GET | `/admin/frameworks/{key}/controls` | Framework controls | Admin |
| GET | `/admin/search/controls` | Search controls | Admin |
| GET | `/admin/analytics/usage` | Usage analytics | Admin |
| GET | `/admin/analytics/conversations` | Conversation analytics | Admin |

## Supported Frameworks

| Framework | Version | Coverage | Description |
|-----------|---------|----------|-------------|
| ISO 27001 | 2022 | Complete | Information Security Management |
| SOC 2 | 2017 | Complete | Trust Services Criteria |
| NIST CSF | 1.1 | Complete | Cybersecurity Framework |
| PCI DSS | 4.0 | Complete | Payment Card Industry Security |
| GDPR | 2018 | Complete | Data Protection Regulation |
| HIPAA | 2013 | Complete | Healthcare Information Security |

## Models

### User Models

```python
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    AUDITOR = "auditor"
    VIEWER = "viewer"

class User(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    department: Optional[str]
    permissions: List[str]
    created_at: datetime
    updated_at: datetime
```

### Chat Models

```python
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    framework_context: Optional[str] = None
    document_id: Optional[str] = None
    mode: Optional[str] = "auto"

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    clause_references: List[str]
    control_ids: List[str]
    confidence_score: float
    sources: List[Dict]
    framework_context: Optional[str]
```

## Error Handling

The API uses standard HTTP status codes:

| Status Code | Description | Example |
|-------------|-------------|---------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid or missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Validation Error | Request validation failed |
| 500 | Internal Error | Server error |
| 503 | Service Unavailable | LLM service unavailable |

### Error Response Format

```json
{
  "detail": "Error message",
  "error_code": "AUTH_001"
}
```

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Chat Endpoints | 100 requests | per minute per user |
| Auth Endpoints | 10 requests | per minute per IP |
| Admin Endpoints | 50 requests | per minute per admin |

## Examples

### Basic Chat Query

```bash
curl -X POST "http://localhost:8001/chat/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the key requirements for ISO 27001 access control?",
    "framework_context": "ISO 27001"
  }'
```

### Document Upload

```bash
curl -X POST "http://localhost:8001/chat/documents/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@policy.pdf" \
  -F "document_name=Security Policy v2.1"
```

### Framework-Specific Query

```bash
curl -X POST "http://localhost:8001/chat/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "SOC 2 monitoring requirements for access reviews",
    "framework_context": "SOC 2",
    "conversation_id": "audit-prep-2024"
  }'
```

### User Registration (Admin)

```bash
curl -X POST "http://localhost:8001/auth/register" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "auditor@company.com",
    "full_name": "Jane Auditor",
    "password": "SecurePass123!",
    "role": "auditor",
    "department": "Internal Audit",
    "permissions": ["chat_access", "document_upload"]
  }'
```

## Development

### Running the API

```bash
cd apps/api
source myenv/bin/activate
python main.py
```

### Testing

```bash
# Run comprehensive tests
./tests/test_chat_endpoints.sh

# Test specific functionality
python tests/test_api.py
```

### Environment Variables

Create a `.env` file:

```env
# Database
MONGODB_URL=mongodb+srv://...
DATABASE_NAME=compliai

# Authentication
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=168

# LLM Configuration
LLM_SERVICE=google_genai
GOOGLE_API_KEY=your-google-api-key
OPENAI_API_KEY=your-openai-api-key

# Application
DEBUG=true
LOG_LEVEL=INFO
```

## Support

- **Documentation**: `/docs` endpoint
- **Issues**: Contact system administrator
- **API Status**: `/health` endpoint

---

**Version**: 2.0.0  
**Last Updated**: July 2025  
**License**: Proprietary
