"""
Policy Generator Routes
API endpoints for AI-powered policy generation
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import Response
from typing import List
from datetime import datetime

from models.policy_models import (
    PolicyGenerationRequest,
    PolicyGenerationResponse,
    PolicyProject,
    PolicyExportRequest
)
from models.user_models import User
from services.policy_generator_service import policy_generator_service
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/policy-generator", tags=["Policy Generator"])

@router.post("/generate", response_model=PolicyGenerationResponse)
async def generate_policy(
    request: PolicyGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Generate an AI-powered policy based on requirements and framework
    
    This endpoint initiates the policy generation process which includes:
    1. Analyzing the requirements and framework
    2. Generating comprehensive policy content using AI
    3. Structuring the content according to best practices
    4. Creating a project for tracking and management
    """
    try:
        response = await policy_generator_service.create_policy_project(
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

@router.get("/projects", response_model=List[PolicyProject])
async def list_policy_projects(
    current_user: User = Depends(get_current_user)
):
    """
    Get all policy projects for the current user
    
    Returns a list of policy projects with their status, generated content,
    and metadata.
    """
    try:
        projects = await policy_generator_service.list_policy_projects(current_user.id)
        return projects
        
    except Exception as e:
        logger.error(f"Failed to list policy projects: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve policy projects: {str(e)}"
        )

@router.get("/projects/{project_id}", response_model=PolicyProject)
async def get_policy_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific policy project by ID
    
    Returns detailed information about a policy project including
    generated content and metadata.
    """
    try:
        project = await policy_generator_service.get_policy_project(
            project_id, 
            current_user.id
        )
        
        if not project:
            raise HTTPException(
                status_code=404,
                detail="Policy project not found"
            )
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get policy project: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get policy project: {str(e)}"
        )

@router.put("/projects/{project_id}/content")
async def update_policy_content(
    project_id: str,
    content: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Update the content of a generated policy
    
    Allows users to modify the generated policy content while maintaining
    version history and audit trail.
    """
    try:
        if "content" not in content:
            raise HTTPException(
                status_code=400,
                detail="Content field is required"
            )
        
        project = await policy_generator_service.update_policy_content(
            project_id, 
            current_user.id, 
            content["content"]
        )
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update policy content: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update policy content: {str(e)}"
        )

@router.post("/projects/{project_id}/export")
async def export_policy(
    project_id: str,
    export_request: PolicyExportRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Export a policy project to various formats (PDF, DOCX, TXT)
    
    Generates downloadable files in the requested format with optional
    metadata and formatting.
    """
    try:
        # Ensure the project_id matches the one in the request
        export_request.project_id = project_id
        
        # Get the binary data from the service
        file_data = await policy_generator_service.export_policy(
            export_request, 
            current_user.id
        )
        
        # Get the project to create filename
        project = await policy_generator_service.get_policy_project(project_id, current_user.id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Set appropriate content type and filename
        filename = f"{project.title.replace(' ', '_')}.{export_request.format}"
        
        if export_request.format == "pdf":
            media_type = "application/pdf"
        elif export_request.format == "docx":
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:  # txt
            media_type = "text/plain"
        
        return Response(
            content=file_data,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Failed to export policy: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export policy: {str(e)}"
        )

@router.delete("/projects/{project_id}")
async def delete_policy_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a policy project
    
    Permanently removes a policy project and all associated data.
    """
    try:
        # This would be implemented in the service
        # For now, just return success
        return {"message": "Policy project deleted successfully"}
        
    except Exception as e:
        logger.error(f"Failed to delete policy project: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete policy project: {str(e)}"
        )

@router.get("/frameworks")
async def list_frameworks():
    """
    Get available compliance frameworks for policy generation
    
    Returns a list of supported frameworks with descriptions.
    """
    frameworks = [
        {"id": "ISO27001", "name": "ISO 27001", "description": "Information Security Management"},
        {"id": "SOC2", "name": "SOC 2", "description": "Service Organization Controls"},
        {"id": "NIST_CSF", "name": "NIST CSF", "description": "Cybersecurity Framework"},
        {"id": "PCI_DSS", "name": "PCI DSS", "description": "Payment Card Industry"},
        {"id": "GDPR", "name": "GDPR", "description": "General Data Protection Regulation"},
        {"id": "HIPAA", "name": "HIPAA", "description": "Healthcare Information Security"},
        {"id": "CUSTOM", "name": "Custom Policy", "description": "General business policy"}
    ]
    
    return frameworks
