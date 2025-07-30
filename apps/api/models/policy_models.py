from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class PolicyProjectStatus(str, Enum):
    DRAFT = "Draft"
    GENERATING = "Generating"
    COMPLETED = "Completed"
    FAILED = "Failed"

class GeneratedPolicy(BaseModel):
    id: str
    content: str
    word_count: int
    generated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class PolicyProject(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    framework: str
    prompt: str
    status: PolicyProjectStatus
    created_at: datetime
    updated_at: datetime
    user_id: str
    generated_policy: Optional[GeneratedPolicy] = None
    error_message: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class PolicyGenerationRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    framework: str = Field(..., min_length=1)
    prompt: str = Field(..., min_length=10, max_length=2000)
    description: Optional[str] = Field(None, max_length=500)

class PolicyGenerationResponse(BaseModel):
    project_id: str
    status: str  # "started", "completed", "failed"
    message: str
    policy_content: Optional[str] = None

class PolicyExportRequest(BaseModel):
    project_id: str
    format: str = Field(..., pattern="^(pdf|docx|txt)$")
    include_metadata: bool = True

class PolicyExportResponse(BaseModel):
    project_id: str
    format: str
    filename: str
    content: str
    exported_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
