"""
Admin Routes
Administrative endpoints for system management.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any

from models.user_models import User
from services.grc.llm_manager import llm_manager
from services.grc.knowledge_base import grc_knowledge
from auth import require_admin_role
from config import settings

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/status")
async def system_status(current_user: User = Depends(require_admin_role)):
    """
    ## System Status & Health
    
    Get comprehensive system health and configuration information.
    
    ### Required Role: 
    **Admin** - Only administrators can access system status
    
    ### Health Metrics:
    - **System Status**: Overall operational status
    - **LLM Services**: Available AI service providers
    - **Frameworks**: Supported compliance frameworks
    - **Database**: MongoDB connection status
    - **Configuration**: Current system settings
    
    ### Response:
    - **system**: System name and version
    - **status**: Operational status (operational/degraded/down)
    - **llm_services**: Available LLM providers and status
    - **frameworks**: Supported compliance frameworks
    - **settings**: Current configuration (sanitized)
    
    ### Errors:
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **500**: System error
    """
    try:
        # Get LLM services status
        llm_services = llm_manager.get_available_services()
        
        # Get available frameworks
        frameworks = grc_knowledge.get_all_frameworks()
        
        return {
            "system": "CompliAI",
            "version": "1.0.0",
            "status": "operational",
            "llm_services": llm_services,
            "frameworks": frameworks,
            "settings": {
                "llm_service": settings.llm_service,
                "embedding_choice": settings.embedding_choice,
                "database": settings.database_name
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/frameworks")
async def list_frameworks(current_user: User = Depends(require_admin_role)):
    """
    Get list of all supported compliance frameworks.
    """
    try:
        frameworks = grc_knowledge.get_all_frameworks()
        return {"frameworks": frameworks}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/frameworks/{framework_key}")
async def get_framework_details(
    framework_key: str,
    current_user: User = Depends(require_admin_role)
):
    """
    Get detailed information about a specific framework.
    """
    try:
        framework_info = grc_knowledge.get_framework_info(framework_key)
        
        if not framework_info:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        return framework_info
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/frameworks/{framework_key}/controls")
async def list_framework_controls(
    framework_key: str,
    current_user: User = Depends(require_admin_role)
):
    """
    List all controls for a specific framework.
    """
    try:
        framework_info = grc_knowledge.get_framework_info(framework_key)
        
        if not framework_info:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        controls = framework_info.get('controls', {})
        return {"framework": framework_key, "controls": controls}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/controls")
async def search_controls(
    query: str,
    framework: str = None,
    current_user: User = Depends(require_admin_role)
):
    """
    Search for controls across frameworks.
    """
    try:
        results = grc_knowledge.search_controls(query, framework)
        return {"query": query, "framework": framework, "results": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/llm/services")
async def get_llm_services(current_user: User = Depends(require_admin_role)):
    """
    Get status of all LLM services.
    """
    try:
        services = llm_manager.get_available_services()
        return {"services": services}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/llm/test")
async def test_llm_service(
    service: str = None,
    current_user: User = Depends(require_admin_role)
):
    """
    Test LLM service connectivity.
    """
    try:
        test_prompt = "Respond with 'Hello from CompliAI' to confirm the connection."
        
        response = await llm_manager.generate_response(test_prompt, service)
        
        return {
            "service": service or settings.llm_service,
            "status": "success",
            "response": response
        }
        
    except Exception as e:
        return {
            "service": service or settings.llm_service,
            "status": "error",
            "error": str(e)
        }

@router.get("/config")
async def get_system_config(current_user: User = Depends(require_admin_role)):
    """
    Get system configuration (sensitive data excluded).
    """
    try:
        config = {
            "app_name": settings.app_name,
            "debug": settings.debug,
            "database_name": settings.database_name,
            "llm_service": settings.llm_service,
            "embedding_choice": settings.embedding_choice,
            "access_token_expire_minutes": settings.access_token_expire_minutes,
            "ollama_base_url": settings.ollama_base_url,
            "ollama_model": settings.ollama_model,
            "openai_model": settings.openai_model,
            # Exclude sensitive information like API keys
        }
        
        return {"config": config}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
