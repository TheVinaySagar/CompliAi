from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import json

class AuditProjectStatus(str, Enum):
    DRAFT = "Draft"
    GENERATING = "Generating"
    REVIEW = "Review" 
    COMPLETED = "Completed"
    FAILED = "Failed"

class PolicyCitation(BaseModel):
    control_id: str
    control_title: str
    framework: str
    section: str
    description: str
    policy_section: str
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class AuditTrailEntry(BaseModel):
    id: str
    timestamp: datetime
    action: str
    details: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class GeneratedPolicy(BaseModel):
    id: str
    content: str
    citations: List[PolicyCitation]
    word_count: int
    generated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class AuditProject(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    framework: str
    source_document_id: Optional[str] = None
    source_document_name: Optional[str] = None
    status: AuditProjectStatus
    created_at: datetime
    updated_at: datetime
    user_id: str
    compliance_score: Optional[float] = None
    covered_controls: List[str] = []
    missing_controls: List[str] = []
    generated_policy: Optional[GeneratedPolicy] = None
    audit_trail: List[AuditTrailEntry] = []
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class PolicyGenerationRequest(BaseModel):
    project_title: str = Field(..., min_length=1, max_length=200)
    source_document_id: str
    target_framework: str
    description: Optional[str] = Field(None, max_length=500)

class PolicyGenerationResponse(BaseModel):
    project_id: str
    status: str  # "started", "completed", "failed"
    message: str
    compliance_score: Optional[float] = None
    covered_controls: Optional[List[str]] = None
    missing_controls: Optional[List[str]] = None
    policy_content: Optional[str] = None
    citations: Optional[List[PolicyCitation]] = None

class ComplianceDashboard(BaseModel):
    compliance_score: float
    covered_controls: List[str]
    missing_controls: List[str]
    framework_coverage: Dict[str, Dict[str, Any]]

class PolicyExportRequest(BaseModel):
    project_id: str
    format: str = Field(..., pattern="^(pdf|docx|txt)$")
    include_citations: bool = True
    include_audit_trail: bool = True

class PolicyExportResponse(BaseModel):
    download_url: str
    file_name: str
    format: str
    expires_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
