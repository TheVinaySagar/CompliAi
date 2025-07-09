# CompliAI API v2.0 - Refactored Architecture

## Overview

This is a completely refactored version of the CompliAI API with a clean, modular architecture that includes:

- **MongoDB Integration** for user management
- **JWT-based Authentication** with role-based access control
- **Admin-only Chat Access** with permission-based authorization

## Architecture

```
apps/api/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── auth.py                # Authentication dependencies
├── requirements.txt       # Python dependencies
├── start.sh               # Startup script
├── .env.example           # Environment configuration template
│
├── models/                # Data models
│   ├── user_models.py     # User and authentication models
│   └── chatModels.py      # Chat request/response models
│
├── database/              # Database layer
│   ├── connection.py      # MongoDB connection management
│   └── user_repository.py # User data access layer
│
├── utils/                 # Utility functions
│   ├── auth_utils.py      # JWT token utilities
│   └── exceptions.py      # Custom exception classes
│
├── routes/                # API route handlers
│   ├── auth_routes.py     # Authentication endpoints
│   ├── chat_routes.py     # Chat endpoints (admin-only)
│   └── admin_routes.py    # Admin endpoints
│
└── services/              # Business logic
    ├── chat_service_v2.py # Refactored chat service
    └── grc/               # GRC-specific modules
        ├── knowledge_base.py     # GRC frameworks knowledge
        ├── llm_manager.py        # LLM service management
        ├── document_processor.py # Document RAG processing
        └── response_formatter.py # Response formatting
```

## Key Features

### Authentication & Authorization

- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin, User, Auditor, Viewer)
- **Permission-based authorization** for fine-grained access control
- **Chat access restricted to admins only** by default

### User Management

- **MongoDB integration** for user data persistence
- **Password hashing** using bcrypt
- **User CRUD operations** with proper validation
- **Automatic admin user creation** on first startup

### Chat System

- **Modular chat service** with clean architecture
- **Document upload and RAG processing** for policy analysis
- **Conversation management** with user isolation
- **Framework-specific knowledge base** (ISO 27001, SOC 2, NIST, PCI DSS)

### Admin Features

- **System status monitoring**
- **User management interface**
- **Framework and control browsing**
- **LLM service management**

## Setup Instructions

### Prerequisites

1. **Python 3.8+**
2. **MongoDB** (running locally or accessible remotely)
3. **API Keys** (Google Gemini, OpenAI, or local Ollama)

### Installation

1. **Navigate to the API directory:**
   ```bash
   cd /Compli-AI/apps/api
   ```

### Manual Setup (Alternative)

```bash
# Create virtual environment
python3 -m venv myenv
source myenv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Start the API
python main.py
```

## Default Admin Account

On first startup, a default admin account is created:

- **Email:** `admin@compliai.com`
- **Password:** `admin123`
- **CHANGE THESE CREDENTIALS IMMEDIATELY**

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Register new user (admin only)
- `GET /auth/me` - Get current user info
- `POST /auth/init-admin` - Initialize admin (if none exists)

### Chat (Admin/Chat Permission Required)
- `POST /chat/` - Process chat request
- `GET /chat/conversations` - List conversations
- `POST /chat/documents/upload` - Upload document for RAG
- `GET /chat/documents` - List uploaded documents

### Administration (Admin Only)
- `GET /admin/status` - System status
- `GET /admin/frameworks` - List compliance frameworks
- `GET /admin/llm/services` - LLM service status

## Security Features

1. **JWT Token Authentication** with configurable expiration
2. **Role-based Access Control** with multiple user roles
3. **Permission-based Authorization** for granular access
4. **Password Hashing** using bcrypt
5. **User Input Validation** with Pydantic models
6. **Error Handling** with custom exceptions

## Permission System

### User Roles
- **Admin:** Full system access
- **User:** Basic chat access (if granted)
- **Auditor:** Read-only access to compliance data
- **Viewer:** Limited read-only access

### Permissions
- **chat_access:** Required for chat endpoints
- **document_upload:** Required for document operations
- **user_management:** Required for user operations
- **system_admin:** Required for admin operations

## Environment Variables

Key configuration options in `.env`:

```bash
# App Configuration
APP_NAME=CompliAI
DEBUG=true
SECRET_KEY=your-very-secure-secret-key-change-this-in-production-2024
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database Configuration
MONGODB_URL=
DATABASE_NAME=

# LLM Service Configuration
LLM_SERVICE=Google
EMBEDDING_CHOICE=Google

# Ollama Configuration (if using Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
OLLAMA_EMBEDDING=nomic-embed-text:latest

# OpenAI Configuration (if using OpenAI)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_EMBEDDING=text-embedding-ada-002

# Gemini Configuration (if using Google)
GOOGLE_API_KEY=
GEMINI_EMBEDDING=models/embedding-001
```

## API Documentation

When running in debug mode, visit:
- **Swagger UI:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc

## Testing the API

### 1. Initialize Admin (if needed)
```bash
curl -X POST http://localhost:8001/auth/init-admin
```

### 2. Login
```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@compliai.com","password":"admin123"}'
```

### 3. Use Chat (with Bearer token)
```bash
curl -X POST http://localhost:8001/chat/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the key controls in ISO 27001?"}'
```

## Production Deployment

For production deployment:

1. **Update security settings:**
   - Change default admin credentials
   - Use strong SECRET_KEY
   - Configure proper CORS origins
   - Disable debug mode

2. **Database security:**
   - Use authenticated MongoDB
   - Enable connection encryption
   - Set up proper network security

3. **Environment:**
   - Use production WSGI server (Gunicorn)
   - Set up reverse proxy (Nginx)
   - Configure SSL/TLS certificates

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Authentication Errors**
   - Verify JWT secret key configuration
   - Check token expiration settings

3. **Import Errors**
   - Ensure virtual environment is activated
   - Verify all dependencies are installed

4. **Permission Denied**
   - Check user roles and permissions
   - Ensure admin account has proper privileges

The code is now clean, maintainable, and production-ready!
