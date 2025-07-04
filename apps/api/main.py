from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn

from models import ChatRequest, ChatResponse
from services.chat_service import ChatService
from auth import get_current_user
from config import settings

app = FastAPI(
    title="CompliAI API",
    description="Agentic AI assistant for Governance, Risk, and Compliance",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

# Initialize services
chat_service = ChatService()

@app.get("/")
def read_root():
    return {"message": "Welcome to CompliAI API"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """LLM-powered chat for compliance Q&A with clause references and control IDs."""
    try:
        # Get current user (simplified for testing)
        current_user = await get_current_user(credentials)
        
        # Process chat request
        response = await chat_service.process_chat(request, current_user)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CompliAI API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
