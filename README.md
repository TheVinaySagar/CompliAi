# CompliAI - Complete Setup and Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Environment Configuration](#environment-configuration)
8. [LLM and Embedding Models Setup](#llm-and-embedding-models-setup)
9. [Database Configuration](#database-configuration)
10. [Running the Application](#running-the-application)
11. [API Documentation](#api-documentation)
12. [User Roles and Permissions](#user-roles-and-permissions)
13. [Features](#features)
14. [Security Notes](#security-notes)
15. [Troubleshooting](#troubleshooting)

## Overview

CompliAI is an AI-powered compliance assistant that helps organizations navigate complex regulatory frameworks including ISO 27001, SOC 2, NIST CSF, PCI DSS, GDPR, and HIPAA. The platform provides intelligent chat capabilities, document processing with RAG (Retrieval-Augmented Generation), and comprehensive compliance guidance.

The application is structured as a monorepo with a FastAPI backend and Next.js frontend, designed for enterprise-grade compliance management.

## Tech Stack

### Backend (`/apps/api`)
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (with Motor async driver)
- **Authentication**: JWT with PassLib bcrypt
- **LLM Integration**: 
  - Google Generative AI (Gemini)
  - OpenAI GPT models
  - Ollama (local/self-hosted)
- **Vector Store**: ChromaDB
- **Document Processing**: LangChain, PyPDF, docx2txt
- **Deployment**: Uvicorn ASGI server

### Frontend (`/apps/web`)
- **Framework**: Next.js 15.2.4 (App Router)
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Context API
- **Charts**: Recharts
- **Markdown**: React Markdown with syntax highlighting
- **Type Safety**: TypeScript

## Architecture

```
CompliAI/
├── apps/
│   ├── api/          # FastAPI Backend
│   │   ├── auth/     # Authentication modules
│   │   ├── database/ # MongoDB connection and repositories
│   │   ├── models/   # Pydantic models
│   │   ├── routes/   # API route handlers
│   │   ├── services/ # Business logic and GRC services
│   │   ├── utils/    # Utilities and exceptions
│   │   └── vector_stores/ # ChromaDB integration
│   └── web/          # Next.js Frontend
│       ├── app/      # App Router pages
│       ├── components/ # Reusable UI components
│       ├── contexts/ # React contexts
│       ├── hooks/    # Custom React hooks
│       └── lib/      # Utilities and API client
└── README.md
```

### Backend Architecture

The backend follows a modular, service-oriented architecture:

- **Routes Layer**: FastAPI routers for auth, chat, and admin endpoints
- **Services Layer**: Business logic including chat processing, document handling, and GRC knowledge
- **Repository Layer**: Database access patterns with async MongoDB operations
- **Models Layer**: Pydantic models for request/response validation
- **LLM Manager**: Abstraction layer supporting multiple LLM providers
- **Vector Store**: ChromaDB for document embeddings and similarity search

## Prerequisites

### System Requirements
- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **MongoDB**: 4.4 or higher (local or MongoDB Atlas)
- **Git**: For version control

### Optional Dependencies
- **Ollama**: For local LLM hosting (if not using cloud providers)
- **Docker**: For containerized deployment

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd apps/api
```

### 2. Create Python Virtual Environment
```bash
python -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Copy the example environment file and configure:
```bash
cp .env.example .env
```

Edit `.env` with your specific configuration (see [Environment Configuration](#environment-configuration) section).

### 5. Database Setup
Ensure MongoDB is running and accessible. The application will automatically:
- Create necessary collections
- Set up indexes for performance
- Initialize default admin user

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd apps/web
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration
Create `.env.local` file:
```bash
# Add any frontend-specific environment variables if needed
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Environment Configuration

### Backend Environment Variables (`.env`)

#### Required Configuration
```bash
# Application Settings
APP_NAME=CompliAI
DEBUG=true
SECRET_KEY=your-very-secure-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
MONGODB_URL=mongodb://localhost:27017
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net
DATABASE_NAME=compliai_db

# LLM Service Selection
LLM_SERVICE=Google  # Options: Google, OpenAI, Ollama
EMBEDDING_CHOICE=Google  # Options: Google, OpenAI, Ollama
```

#### API Keys (Choose based on LLM_SERVICE)
```bash
# Google Generative AI
GOOGLE_API_KEY=your-google-api-key-here

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_EMBEDDING=text-embedding-ada-002

# Ollama (Local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
OLLAMA_EMBEDDING=nomic-embed-text:latest

# Gemini Specific
GEMINI_EMBEDDING=models/embedding-001
```

## LLM and Embedding Models Setup

### Option 1: Google Generative AI (Recommended for Production)

1. **Get API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Generate API key
   - Add to `.env`: `GOOGLE_API_KEY=your-key-here`

2. **Configuration**:
   ```bash
   LLM_SERVICE=Google
   EMBEDDING_CHOICE=Google
   ```

3. **Models Used**:
   - **Chat**: `gemini-1.5-flash` (fast, cost-effective)
   - **Embeddings**: `models/embedding-001`

### Option 2: OpenAI

1. **Get API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Generate API key
   - Add to `.env`: `OPENAI_API_KEY=your-key-here`

2. **Configuration**:
   ```bash
   LLM_SERVICE=OpenAI
   EMBEDDING_CHOICE=OpenAI
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_EMBEDDING=text-embedding-ada-002
   ```

### Option 3: Ollama (Local/Self-hosted)

1. **Install Ollama**:
   ```bash
   # Linux/macOS
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Or download from https://ollama.ai/download
   ```

2. **Pull Required Models**:
   ```bash
   # Chat model
   ollama pull llama3.2:latest
   
   # Embedding model
   ollama pull nomic-embed-text:latest
   ```

3. **Start Ollama Server**:
   ```bash
   ollama serve
   # Server runs on http://localhost:11434
   ```

4. **Configuration**:
   ```bash
   LLM_SERVICE=Ollama
   EMBEDDING_CHOICE=Ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2:latest
   OLLAMA_EMBEDDING=nomic-embed-text:latest
   ```

### Switching Between Providers

You can easily switch between LLM providers by changing the `LLM_SERVICE` and `EMBEDDING_CHOICE` environment variables. The application supports:

- **Mixed configurations**: Use Google for embeddings and OpenAI for chat, etc.
- **Fallback support**: The system gracefully handles provider failures
- **Performance optimization**: Each provider is optimized for different use cases

## Database Configuration

### Local MongoDB Setup

1. **Install MongoDB**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS with Homebrew
   brew install mongodb-community
   
   # Windows: Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB**:
   ```bash
   # Linux/macOS
   sudo systemctl start mongod
   # or
   mongod --dbpath /path/to/your/data/directory
   ```

3. **Configuration**:
   ```bash
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=compliai_db
   ```

### MongoDB Atlas (Cloud)

1. **Create Atlas Account**: Visit [MongoDB Atlas](https://www.mongodb.com/atlas)

2. **Create Cluster**: Follow Atlas setup wizard

3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string

4. **Configuration**:
   ```bash
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net
   DATABASE_NAME=compliai_db
   ```

### Database Collections

The application automatically creates these collections:
- **users**: User accounts and authentication
- **conversations**: Chat conversation metadata
- **messages**: Individual chat messages
- **documents**: Uploaded document metadata
- **document_chunks**: Vector embeddings for RAG

## Running the Application

### Development Mode

1. **Start Backend**:
   ```bash
   cd apps/api
   source myenv/bin/activate  # Activate virtual environment
   python main.py
   # Server starts on http://localhost:8000
   ```

2. **Start Frontend** (in new terminal):
   ```bash
   cd apps/web
   npm run dev
   # Application opens on http://localhost:3000
   ```

### Production Mode

1. **Backend**:
   ```bash
   cd apps/api
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Frontend**:
   ```bash
   cd apps/web
   npm run build
   npm start
   ```

### Access Points

- **Frontend Application**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc
- **API Health Check**: http://localhost:8000/

## API Documentation

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login (returns JWT token)
- `GET /auth/verify-token` - Verify JWT token validity

### Chat Endpoints

- `POST /chat/` - Send chat message
- `GET /chat/conversations` - Get user's conversations
- `GET /chat/conversations/{conversation_id}` - Get specific conversation
- `DELETE /chat/conversations/{conversation_id}` - Delete conversation
- `POST /chat/documents/upload` - Upload document for RAG
- `GET /chat/documents` - List uploaded documents
- `DELETE /chat/documents/{document_id}` - Delete document

### Admin Endpoints (Admin role required)

- `GET /admin/users` - List all users
- `PUT /admin/users/{user_id}/role` - Update user role
- `DELETE /admin/users/{user_id}` - Delete user
- `GET /admin/system-status` - System health and configuration
- `GET /admin/stats` - System statistics

### Request/Response Format

All API requests require:
```bash
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

Example chat request:
```json
{
  "message": "What are the key requirements for ISO 27001?",
  "conversation_id": "optional-uuid",
  "document_id": "optional-for-rag-queries"
}
```

## User Roles and Permissions

### Roles

1. **User** (Default)
   - Access chat functionality
   - Upload and manage own documents
   - View own conversations
   - Basic compliance queries

2. **Admin**
   - All user permissions
   - User management (view, modify roles, delete)
   - System administration
   - Access to system statistics and health

### Default Admin Account

- **Email**: `admin@compliai.com`
- **Password**: `admin123`
- **⚠️ Security**: Change password immediately after first login!

### Role Assignment

Admins can promote users to admin role via:
```bash
PUT /admin/users/{user_id}/role
{
  "role": "admin"
}
```

## Features

### 🤖 Intelligent Chat
- **Multi-framework Support**: ISO 27001, SOC 2, NIST CSF, PCI DSS, GDPR, HIPAA
- **Context-aware Conversations**: Maintains conversation history and context
- **Real-time Responses**: Fast, accurate compliance guidance
- **Conversation Management**: Save, retrieve, and delete conversations

### 📄 Document Processing (RAG)
- **Upload Support**: PDF, DOCX, TXT files
- **Intelligent Chunking**: Optimal text segmentation for retrieval
- **Vector Search**: Semantic similarity for relevant context
- **Document-specific Queries**: Ask questions about uploaded documents

### 👥 User Management
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: User and Admin roles
- **Session Management**: Configurable token expiration
- **User Registration**: Self-service account creation

### 📊 Dashboard & Analytics
- **Document Statistics**: Upload counts and processing status
- **Conversation Metrics**: Chat history and usage patterns
- **Compliance Progress**: Framework coverage and completion
- **System Health**: Real-time monitoring

### 🔧 Administration
- **User Management**: View, modify, and delete users
- **System Configuration**: LLM provider settings and health
- **Performance Monitoring**: System statistics and usage
- **Database Management**: Automated indexing and optimization

## Security Notes

### 🔒 Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt
- **Role-based Access**: Granular permission control
- **Token Expiration**: Configurable session timeouts

### 🛡️ Data Protection
- **Database Security**: MongoDB authentication and encryption
- **API Rate Limiting**: Built into FastAPI
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Pydantic model validation

### ⚠️ Production Security Checklist

1. **Change Default Credentials**:
   ```bash
   # Change admin password immediately
   # Use strong, unique SECRET_KEY
   ```

2. **Environment Security**:
   ```bash
   DEBUG=false
   SECRET_KEY=generate-strong-256-bit-key
   ACCESS_TOKEN_EXPIRE_MINUTES=15  # Shorter for production
   ```

3. **Database Security**:
   ```bash
   # Use MongoDB authentication
   MONGODB_URL=mongodb://username:password@host:port/db
   # Enable MongoDB SSL/TLS in production
   ```

4. **API Keys Protection**:
   - Store API keys in secure environment variables
   - Rotate API keys regularly
   - Monitor API usage and costs

5. **Network Security**:
   - Use HTTPS in production
   - Configure firewall rules
   - Implement reverse proxy (nginx/Apache)

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Error: Failed to connect to MongoDB
```
**Solutions**:
- Verify MongoDB is running: `systemctl status mongod`
- Check connection string in `.env`
- For Atlas: Verify network access and credentials

#### 2. LLM API Errors
```bash
# Error: Google API key not found
```
**Solutions**:
- Verify API key in `.env` file
- Check API key validity and quotas
- Ensure correct LLM_SERVICE setting

#### 3. Ollama Connection Issues
```bash
# Error: Failed to connect to Ollama
```
**Solutions**:
- Start Ollama server: `ollama serve`
- Verify base URL: `OLLAMA_BASE_URL=http://localhost:11434`
- Pull required models: `ollama pull llama3.2:latest`

#### 4. Frontend API Connection
```bash
# Error: API requests failing
```
**Solutions**:
- Verify backend is running on port 8000
- Check CORS configuration in `main.py`
- Verify API base URL in frontend

#### 5. JWT Token Issues
```bash
# Error: Invalid or expired token
```
**Solutions**:
- Login again to get new token
- Check token expiration settings
- Verify SECRET_KEY consistency

### Performance Optimization

#### 1. Database Performance
```bash
# MongoDB indexes are created automatically
# Monitor query performance with:
db.conversations.explain("executionStats").find({user_id: "user123"})
```

#### 2. LLM Response Speed
- **Google Gemini**: Fastest for most queries
- **OpenAI**: Good balance of speed and quality
- **Ollama**: Slower but private/local

#### 3. Vector Search Optimization
- Use appropriate chunk sizes (500-1000 tokens)
- Regular ChromaDB maintenance
- Monitor embedding generation time

### Logging and Monitoring

#### Backend Logs
```bash
# Application logs include:
# - Authentication events
# - API request/response timing
# - LLM provider performance
# - Database operation status
```

#### Frontend Monitoring
```bash
# Browser console shows:
# - API call timing
# - Authentication status
# - Component rendering issues
```

### Getting Help

1. **Check Logs**: Review application logs for specific error messages
2. **API Documentation**: Visit `/docs` for interactive API testing
3. **Configuration Validation**: Use `/admin/system-status` endpoint
4. **Database Status**: Check MongoDB logs and connection status
5. **LLM Provider Status**: Verify API key validity and service status

---

## Quick Start Summary

1. **Clone and Setup**:
   ```bash
   git clone <repository>
   cd CompliAI
   ```

2. **Backend Setup**:
   ```bash
   cd apps/api
   python -m venv myenv
   source myenv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   python main.py
   ```

3. **Frontend Setup**:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

4. **Access Application**:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs
   - Login: admin@compliai.com / admin123

5. **Configure LLM Provider**:
   - Get API key from Google AI Studio, OpenAI, or install Ollama
   - Update `.env` with credentials
   - Restart backend

You're now ready to use CompliAI for intelligent compliance assistance!
## 📅 MVP Roadmap to Comply and Pass

1. **Compliance UI**: Build intuitive interfaces for landing, chat, and policy uploads
2. **LLM Integration**: Connect OpenAI/Claude for real-time compliance guidance
3. **Policy Mapping & Generation**: Automate policy creation and framework alignment
4. **Audit Readiness Agent**: Develop an intelligent agent to prioritize tasks and ensure audit success
5. **Multi-Framework Support**: Expand coverage for SOC 2, NIST, and additional standards

## 📄 License

This project is licensed under MIT. See LICENSE for details.

## 🤝 Contributions

We're building CompliAI in public to help teams comply and pass audits. Pull requests are welcome!

## 📬 Contact

For inquiries, early access, or compliance support: [hello@clancodelabs.org]

**Clancode Labs Pvt Ltd**