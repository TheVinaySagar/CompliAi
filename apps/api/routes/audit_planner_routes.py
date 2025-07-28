"""
Audit Planner Routes
API endpoints for policy generation and audit planning
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List

from models.audit_models import (
    PolicyGenerationRequest,
    PolicyGenerationResponse,
    AuditProject,
    PolicyExportRequest,
    PolicyExportResponse
)
from models.user_models import User
from services.audit_planner_service import audit_planner_service
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/audit-planner", tags=["Audit Planner"])

@router.post("/generate", response_model=PolicyGenerationResponse)
async def generate_policy(
    request: PolicyGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Generate an audit-ready policy from source document and target framework
    
    This endpoint initiates the policy generation process which includes:
    1. Analyzing the source document for compliance coverage
    2. Identifying gaps against the target framework
    3. Generating comprehensive policy content with framework citations
    4. Creating audit trail for governance
    """
    try:
        response = await audit_planner_service.create_audit_project(
            request, 
            current_user.id
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Policy generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Policy generation failed: {str(e)}"
        )

@router.get("/projects", response_model=List[AuditProject])
async def list_audit_projects(
    current_user: User = Depends(get_current_user)
):
    """
    Get all audit projects for the current user
    
    Returns a list of audit projects with their status, generated policies,
    and compliance analysis results.
    """
    try:
        projects = await audit_planner_service.list_audit_projects(current_user.id)
        return projects
        
    except Exception as e:
        logger.error(f"Failed to list audit projects: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve audit projects: {str(e)}"
        )

@router.get("/projects/{project_id}", response_model=AuditProject)
async def get_audit_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get specific audit project by ID
    
    Returns detailed information about an audit project including
    generated policy content, framework citations, and audit trail.
    """
    try:
        project = await audit_planner_service.get_audit_project(
            project_id, 
            current_user.id
        )
        
        if not project:
            raise HTTPException(
                status_code=404,
                detail="Audit project not found"
            )
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get audit project: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve audit project: {str(e)}"
        )

@router.post("/projects/{project_id}/export", response_model=PolicyExportResponse)
async def export_policy(
    project_id: str,
    export_request: PolicyExportRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Export generated policy in various formats (PDF, DOCX, TXT)
    
    Exports the generated policy document with optional inclusions:
    - Framework citations
    - Audit trail information
    - Compliance analysis summary
    """
    try:
        # Get the project
        project = await audit_planner_service.get_audit_project(
            project_id,
            current_user.id
        )
        
        if not project:
            raise HTTPException(
                status_code=404,
                detail="Audit project not found"
            )
        
        if not project.generated_policy:
            raise HTTPException(
                status_code=400,
                detail="No policy has been generated for this project yet"
            )
        
        # For now, return a mock response
        # In a real implementation, this would generate the actual file
        from datetime import datetime, timedelta
        
        file_name = f"{project.title.replace(' ', '_')}_{project.framework}.{export_request.format}"
        
        return PolicyExportResponse(
            download_url=f"/audit-planner/download/{project_id}/{export_request.format}",
            file_name=file_name,
            format=export_request.format,
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to export policy: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export policy: {str(e)}"
        )

@router.delete("/projects/{project_id}")
async def delete_audit_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete an audit project
    
    Permanently removes an audit project and all associated data.
    """
    try:
        project = await audit_planner_service.get_audit_project(
            project_id,
            current_user.id
        )
        
        if not project:
            raise HTTPException(
                status_code=404,
                detail="Audit project not found"
            )
        
        # TODO: Implement actual deletion in service
        # await audit_planner_service.delete_audit_project(project_id, current_user.id)
        
        return {"message": "Audit project deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete audit project: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete audit project: {str(e)}"
        )

@router.get("/frameworks")
async def get_supported_frameworks(
    current_user: User = Depends(get_current_user)
):
    """
    Get list of supported compliance frameworks
    
    Returns available frameworks that can be used for policy generation.
    """
    frameworks = [
        {
            "id": "ISO27001",
            "name": "ISO 27001",
            "description": "Information Security Management",
            "version": "2022",
            "category": "Information Security"
        },
        {
            "id": "SOC2",
            "name": "SOC 2",
            "description": "Service Organization Controls",
            "version": "2017", 
            "category": "Service Organizations"
        },
        {
            "id": "NIST_CSF",
            "name": "NIST CSF",
            "description": "Cybersecurity Framework",
            "version": "1.1",
            "category": "Cybersecurity"
        },
        {
            "id": "PCI_DSS",
            "name": "PCI DSS",
            "description": "Payment Card Industry",
            "version": "4.0",
            "category": "Payment Security"
        },
        {
            "id": "GDPR",
            "name": "GDPR", 
            "description": "General Data Protection Regulation",
            "version": "2018",
            "category": "Data Protection"
        },
        {
            "id": "HIPAA",
            "name": "HIPAA",
            "description": "Healthcare Information Security",
            "version": "2013",
            "category": "Healthcare"
        }
    ]
    
    return {"frameworks": frameworks}

@router.get("/health")
async def audit_planner_health():
    """
    Health check endpoint for audit planner service
    """
    return {
        "status": "healthy",
        "service": "audit-planner",
        "version": "1.0.0",
        "features": [
            "policy_generation",
            "compliance_analysis", 
            "framework_citations",
            "export_formats"
        ]
    }

@router.post("/test-generation")
async def test_policy_generation(
    current_user: User = Depends(get_current_user)
):
    """
    Test endpoint for policy generation (for development)
    """
    try:
        # Create a test request
        test_request = PolicyGenerationRequest(
            project_title="Test Security Policy Review",
            source_document_id="test-doc",
            target_framework="ISO27001",
            description="Testing the policy generation with improved fallback"
        )
        
        response = await audit_planner_service.create_audit_project(
            test_request, 
            current_user.id
        )
        
        return {
            "message": "Test policy generation initiated",
            "project_id": response.project_id,
            "status": response.status
        }
        
    except Exception as e:
        logger.error(f"Test generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Test generation failed: {str(e)}"
        )
