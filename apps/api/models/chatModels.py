from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class ComplianceFramework(str, Enum):
    ISO_27001 = "ISO 27001"
    SOC_2 = "SOC 2"
    NIST_CSF = "NIST CSF"
    PCI_DSS = "PCI DSS"
    GDPR = "GDPR"
    HIPAA = "HIPAA"

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    framework_context: Optional[str] = None
    document_id: Optional[str] = None  # For document-specific queries
    mode: Optional[str] = "auto"  # "general", "document", or "auto"

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    clause_references: List[str] = []
    control_ids: List[str] = []
    confidence_score: float = 0.0
    sources: List[Dict] = []
    framework_context: Optional[str] = None
    mode: Optional[str] = None  # Indicates which mode was used
    document_id: Optional[str] = None
    error: Optional[str] = None

class DocumentUploadRequest(BaseModel):
    document_name: Optional[str] = None
    file_type: str
    content: str  # Base64 encoded or file path

class DocumentUploadResponse(BaseModel):
    document_id: str
    status: str
    message: str
    controls_identified: int = 0
    chunks_created: int = 0
