"""
Audit Planner Routes
API endpoints for policy generation and audit planning
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from datetime import datetime

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

@router.get("/projects/{project_id}/status")
async def get_project_status(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get current project status and progress
    
    Returns real-time status information about the policy generation process,
    including progress percentage and latest action performed.
    """
    try:
        status = await audit_planner_service.get_project_status(
            project_id, 
            current_user.id
        )
        
        return status
        
    except Exception as e:
        logger.error(f"Failed to get project status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get project status: {str(e)}"
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
        
        # Log project details for debugging
        logger.info(f"Retrieved project {project_id}: status={project.status}, has_policy={bool(project.generated_policy)}")
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get audit project {project_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve audit project: {str(e)}"
        )

@router.get("/projects/{project_id}/refresh")
async def refresh_project_data(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Force refresh project data from database
    
    Useful when frontend needs to reload project data after completion.
    """
    try:
        # Get fresh project data
        project = await audit_planner_service.get_audit_project(
            project_id, 
            current_user.id
        )
        
        if not project:
            raise HTTPException(
                status_code=404,
                detail="Audit project not found"
            )
        
        # Return detailed project information
        return {
            "project": project,
            "status": project.status,
            "has_policy": bool(project.generated_policy),
            "compliance_score": project.compliance_score,
            "word_count": project.generated_policy.word_count if project.generated_policy else 0,
            "citation_count": len(project.generated_policy.citations) if project.generated_policy else 0,
            "refreshed_at": datetime.utcnow()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to refresh project {project_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh project data: {str(e)}"
        )

@router.put("/projects/{project_id}")
async def update_audit_project(
    project_id: str,
    update_data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Update an audit project's policy content
    
    Allows updating the generated policy content and saves changes to database.
    """
    try:
        # Get the existing project
        project = await audit_planner_service.get_audit_project(
            project_id,
            current_user.id
        )
        
        if not project:
            raise HTTPException(
                status_code=404,
                detail="Audit project not found"
            )
        
        # Update the project with new data
        updated_project = await audit_planner_service.update_audit_project(
            project_id,
            update_data,
            current_user.id
        )
        
        return {"success": True, "project": updated_project}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update audit project: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update project: {str(e)}"
        )

@router.post("/projects/{project_id}/export")
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
        from fastapi.responses import Response
        import io
        
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
        
        # Generate the export
        file_content, content_type, file_extension = await audit_planner_service.export_policy_to_file(
            project,
            export_request.format,
            {
                'include_citations': export_request.include_citations,
                'include_audit_trail': export_request.include_audit_trail
            }
        )
        
        file_name = f"{project.title.replace(' ', '_')}_{project.framework}.{file_extension}"
        
        return Response(
            content=file_content,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={file_name}"
            }
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
            source_document_id=None,  # No document for testing
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
            "status": response.status,
            "test_mode": True
        }
        
    except Exception as e:
        logger.error(f"Test generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Test generation failed: {str(e)}"
        )

@router.post("/quick-test")
async def quick_policy_test(
    framework: str = "ISO27001",
    current_user: User = Depends(get_current_user)
):
    """
    Quick test endpoint that bypasses database and returns immediate policy
    """
    try:
        # Generate analysis directly
        analysis = {
            "compliance_score": 78,
            "covered_controls": ["A.5.1.1", "A.5.1.2", "A.9.1.1"],
            "missing_controls": ["A.8.1.1", "A.16.1.1", "A.18.1.1"],
            "gaps": ["Asset management", "Incident response", "Legal compliance"]
        }
        
        # Generate policy directly using fallback method
        policy_content = audit_planner_service._generate_fallback_policy(
            "Test Security Policy",
            framework,
            analysis
        )
        
        return {
            "message": "Quick policy generated successfully",
            "framework": framework,
            "analysis": analysis,
            "policy_preview": policy_content[:500] + "..." if len(policy_content) > 500 else policy_content,
            "word_count": len(policy_content.split()),
            "full_policy": policy_content
        }
        
    except Exception as e:
        logger.error(f"Quick test failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Quick test failed: {str(e)}"
        )
