"""
Chat Routes
Handles chat requests with proper authentication and authorization.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File # type: ignore
from typing import List, Optional

from models.chatModels import ChatRequest, ChatResponse
from models.user_models import User
from services.chat_service_v2 import chat_service
from services.grc.document_processor import document_processor
from auth import require_chat_permission
from utils.exceptions import LLMServiceError, DocumentNotFoundError

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    current_user: User = Depends(require_chat_permission)
):
    """
    ## Main Chat Endpoint
    
    Process compliance-related questions with AI-powered GRC expertise.
    
    ### Required Permission: 
    **chat_access** or **admin** role
    
    ### Request Body:
    - **message**: Your compliance question or query
    - **conversation_id**: Optional conversation ID for context (auto-generated if not provided)
    - **framework_context**: Optional framework focus (ISO 27001, SOC 2, NIST CSF, PCI DSS, GDPR, HIPAA)
    - **document_id**: Optional document ID for document-specific queries
    - **mode**: Processing mode - "general", "document", or "auto" (default)
    
    ### Response Features:
    - **response**: Formatted compliance guidance with markdown
    - **conversation_id**: Unique conversation identifier
    - **clause_references**: Referenced framework clauses
    - **control_ids**: Relevant control identifiers
    - **confidence_score**: AI confidence level (0.0-1.0)
    - **sources**: Referenced documents and standards
    - **framework_context**: Detected or specified framework
    
    ### Supported Frameworks:
    | Framework | Coverage | Latest Version |
    |-----------|----------|----------------|
    | ISO 27001 | Complete | 2022 |
    | SOC 2 | Complete | 2017 |
    | NIST CSF | Complete | 1.1 |
    | PCI DSS | Complete | 4.0 |
    | GDPR | Complete | 2018 |
    | HIPAA | Complete | 2013 |
    
    ### Example Questions:
    - "What are the key requirements for ISO 27001 access control?"
    - "How do I implement SOC 2 Type II monitoring controls?"
    - "What PCI DSS requirements apply to tokenization?"
    - "GDPR data retention requirements for customer data"
    
    ### Errors:
    - **401**: Not authenticated
    - **403**: Insufficient permissions
    - **503**: LLM service unavailable
    - **500**: Internal processing error
    """
    try:
        response = await chat_service.process_chat(request, current_user.dict())
        return response
        
    except LLMServiceError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/conversations", response_model=List[dict])
async def list_conversations(
    current_user: User = Depends(require_chat_permission)
):
    """
    Get all conversations for the current user.
    """
    try:
        conversations = await chat_service.list_conversations(str(current_user.id))
        return conversations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{conversation_id}", response_model=List[dict])
async def get_conversation_history(
    conversation_id: str,
    current_user: User = Depends(require_chat_permission)
):
    """
    Get conversation history for a specific conversation.
    Users can only access their own conversations.
    """
    try:
        history = await chat_service.get_conversation_history(
            conversation_id, 
            str(current_user.id)
        )
        
        if not history:
            raise HTTPException(
                status_code=404, 
                detail="Conversation not found or access denied"
            )
        
        return history
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(require_chat_permission)
):
    """
    Delete a conversation.
    Users can only delete their own conversations.
    """
    try:
        success = await chat_service.delete_conversation(
            conversation_id, 
            str(current_user.id)
        )
        
        if not success:
            raise HTTPException(
                status_code=404, 
                detail="Conversation not found or access denied"
            )
        
        return {"message": "Conversation deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_name: Optional[str] = None,
    current_user: User = Depends(require_chat_permission)
):
    """
    ## Document Upload & Processing
    
    Upload compliance documents for RAG-based analysis and querying.
    
    ### Required Permission: 
    **chat_access** or **admin** role
    
    ### Supported File Types:
    - **PDF**: `.pdf` files (recommended for policies)
    - **Word**: `.docx` files
    - **Text**: `.txt` files
    
    ### Parameters:
    - **file**: Document file to upload (required)
    - **document_name**: Optional custom name (uses filename if not provided)
    
    ### Processing Pipeline:
    1. **File Validation**: Check format and size
    2. **Content Extraction**: Extract text from document
    3. **Text Chunking**: Split into semantic chunks
    4. **Embedding Generation**: Create vector embeddings
    5. **Storage**: Save to vector database
    6. **Indexing**: Make searchable for chat queries
    
    ### Response:
    - **document_id**: Unique identifier for the uploaded document
    - **status**: Processing status
    - **message**: Success/error message
    - **controls_identified**: Number of compliance controls found
    - **chunks_created**: Number of text chunks generated
    
    ### Usage After Upload:
    Use the `document_id` in chat requests for document-specific queries:
    ```json
    {
        "message": "What are the access control requirements?",
        "document_id": "doc_12345",
        "mode": "document"
    }
    ```
    
    ### Limits:
    - **File Size**: Maximum 10MB per file
    - **Files per User**: 50 documents max
    - **Processing Time**: 30-60 seconds typical
    
    ### Errors:
    - **400**: Unsupported file type or invalid file
    - **401**: Not authenticated
    - **403**: Insufficient permissions
    - **413**: File too large
    - **500**: Processing error
    """
    try:
        # Check file type
        allowed_extensions = ['.pdf', '.docx', '.txt']
        file_extension = '.' + file.filename.split('.')[-1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_extension} not supported. Allowed: {allowed_extensions}"
            )
        
        # Save uploaded file temporarily
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Process document
            result = await document_processor.upload_and_process_document(
                file_path=tmp_file_path,
                document_name=document_name or file.filename,
                user_id=str(current_user.id)
            )
            
            return result
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@router.get("/documents", response_model=List[dict])
async def list_documents(
    current_user: User = Depends(require_chat_permission)
):
    """
    List all documents uploaded by the current user.
    """
    try:
        documents = await document_processor.list_documents(str(current_user.id))
        return documents
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}")
async def get_document_info(
    document_id: str,
    current_user: User = Depends(require_chat_permission)
):
    """
    Get information about a specific document.
    Users can only access their own documents.
    """
    try:
        # Pass user_id to enforce ownership check at the service level
        doc_info = await document_processor.get_document_info(document_id, str(current_user.id))
        
        # Additional ownership check for admin users
        if doc_info.get('user_id') != str(current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=404, 
                detail="Document not found or access denied"
            )
        
        return doc_info
        
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(require_chat_permission)
):
    """
    Delete a document.
    Users can only delete their own documents.
    """
    try:
        # Pass user_id to enforce ownership check at the service level
        doc_info = await document_processor.get_document_info(document_id, str(current_user.id))
        
        # Additional ownership check for admin users
        if doc_info.get('user_id') != str(current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=404, 
                detail="Document not found or access denied"
            )
        
        success = await document_processor.delete_document(document_id, str(current_user.id))
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete document")
        
        return {"message": "Document deleted successfully"}
        
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/{document_id}/query")
async def query_document(
    document_id: str,
    query: str,
    current_user: User = Depends(require_chat_permission)
):
    """
    Query a specific document directly.
    Users can only query their own documents.
    """
    try:
        # Pass user_id to enforce ownership check at the service level
        doc_info = await document_processor.get_document_info(document_id, str(current_user.id))
        
        # Additional ownership check for admin users
        if doc_info.get('user_id') != str(current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=404, 
                detail="Document not found or access denied"
            )
        
        result = await document_processor.query_document(document_id, query)
        return result
        
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/mapping")
async def get_document_mapping(
    document_id: str,
    current_user: User = Depends(require_chat_permission)
):
    """
    Get compliance framework mapping results for a specific document.
    Users can only access their own documents (unless admin).
    """
    try:
        doc_info = await document_processor.get_document_info(document_id, str(current_user.id))
        # Additional ownership check for admin users
        if doc_info.get('user_id') != str(current_user.id) and current_user.role != "admin":
            raise HTTPException(
                status_code=404, 
                detail="Document not found or access denied"
            )
        mapping = doc_info.get("framework_mapping")
        if mapping is None:
            raise HTTPException(status_code=404, detail="No mapping results found for this document.")
        return {"document_id": document_id, "framework_mapping": mapping}
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
