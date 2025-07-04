from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class ComplianceFramework(str, Enum):
    ISO_27001 = "ISO 27001"
    SOC_2 = "SOC 2"
    NIST_CSF = "NIST CSF"
    GDPR = "GDPR"
    HIPAA = "HIPAA"

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    framework_context: Optional[ComplianceFramework] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    clause_references: List[str]
    control_ids: List[str]
    confidence_score: float
    sources: List[Dict[str, Any]]
    framework_context: Optional[ComplianceFramework] = None
