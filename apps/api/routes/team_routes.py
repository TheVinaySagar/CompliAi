"""
Team Management Routes
Handles team member management, invitations, and role assignments.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from datetime import datetime

from models.user_models import User, UserCreate, UserUpdate, UserRole
from models.team_models import TeamMember, TeamInvitation, TeamStats, InviteUserRequest
from database.user_repository import user_repository
from database.team_repository import team_repository
from auth import require_admin_role, get_current_user
from services.email_service import email_service
from utils.auth_utils import generate_random_password
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/team", tags=["Team Management"])

@router.get("/members", response_model=List[TeamMember])
async def get_team_members(
    current_user: User = Depends(require_admin_role)
):
    """
    ## Get Team Members
    
    Retrieve all team members with their roles and status.
    
    ### Required Role: 
    **Admin** - Only administrators can view team members
    
    ### Response:
    Returns list of team members with:
    - **id**: User unique identifier
    - **name**: Full name
    - **email**: Email address
    - **role**: User role (admin, user, auditor, viewer)
    - **status**: Account status (active, inactive, pending)
    - **department**: Department name
    - **permissions**: List of permissions
    - **join_date**: Account creation date
    - **last_login**: Last login timestamp
    
    ### Errors:
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **500**: Server error
    """
    try:
        users = await user_repository.list_users()
        team_members = []
        
        for user in users:
            member = TeamMember(
                id=user.id,
                name=user.full_name,
                email=user.email,
                role=user.role,
                status="active" if user.is_active else "inactive",
                department=user.department,
                permissions=user.permissions,
                join_date=user.created_at,
                last_login=user.last_login
            )
            team_members.append(member)
        
        return team_members
        
    except Exception as e:
        logger.error(f"Error retrieving team members: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve team members")

@router.get("/stats", response_model=TeamStats)
async def get_team_stats(
    current_user: User = Depends(require_admin_role)
):
    """
    ## Get Team Statistics
    
    Retrieve team statistics and metrics.
    
    ### Required Role: 
    **Admin** - Only administrators can view team statistics
    
    ### Response:
    - **total_members**: Total number of team members
    - **active_members**: Number of active members
    - **pending_members**: Number of pending invitations
    - **admin_count**: Number of administrators
    - **role_distribution**: Distribution of roles across team
    
    ### Errors:
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **500**: Server error
    """
    try:
        users = await user_repository.list_users()
        
        total_members = len(users)
        active_members = sum(1 for user in users if user.is_active)
        inactive_members = total_members - active_members
        admin_count = sum(1 for user in users if user.role == UserRole.ADMIN)
        
        role_distribution = {
            "admin": sum(1 for user in users if user.role == UserRole.ADMIN),
            "user": sum(1 for user in users if user.role == UserRole.USER),
            "auditor": sum(1 for user in users if user.role == UserRole.AUDITOR),
            "viewer": sum(1 for user in users if user.role == UserRole.VIEWER)
        }
        
        return TeamStats(
            total_members=total_members,
            active_members=active_members,
            pending_members=0,  # TODO: Implement invitations
            admin_count=admin_count,
            role_distribution=role_distribution
        )
        
    except Exception as e:
        logger.error(f"Error retrieving team stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve team statistics")

@router.post("/invite", response_model=dict)
async def invite_team_member(
    invite_request: InviteUserRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin_role)
):
    """
    ## Invite Team Member
    
    Send an invitation to join the team.
    
    ### Required Role: 
    **Admin** - Only administrators can invite team members
    
    ### Request Body:
    - **email**: Email address of the invitee
    - **full_name**: Full name of the invitee
    - **role**: Role to assign (admin, user, auditor, viewer)
    - **department**: Optional department name
    - **permissions**: Optional list of specific permissions
    
    ### Response:
    - **message**: Success message
    - **invitation_id**: Unique invitation identifier
    - **expires_at**: Invitation expiration time
    
    ### Errors:
    - **400**: User already exists or invalid data
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **500**: Server error
    """
    try:
        # Check if user already exists
        existing_user = await user_repository.get_user_by_email(invite_request.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Generate secure random password
        temporary_password = generate_random_password(length=12)
        
        # Create user directly (simplified invitation process)
        user_data = UserCreate(
            email=invite_request.email,
            full_name=invite_request.full_name,
            password=temporary_password,  # Secure random password
            role=invite_request.role,
            department=invite_request.department,
            permissions=invite_request.permissions or ["chat_access"]
        )
        
        new_user = await user_repository.create_user(user_data)
        
        # Send welcome email (background task)
        background_tasks.add_task(
            email_service.send_welcome_email,
            new_user.email,
            new_user.full_name,
            temporary_password
        )
        
        return {
            "message": "Team member invited successfully",
            "user_id": new_user.id,
            "email": new_user.email,
            "note": "User created with secure random password sent via email. They should change it on first login."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inviting team member: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to invite team member")

@router.put("/members/{user_id}/role", response_model=TeamMember)
async def update_member_role(
    user_id: str,
    role_update: dict,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin_role)
):
    """
    ## Update Team Member Role
    
    Update a team member's role and permissions.
    
    ### Required Role: 
    **Admin** - Only administrators can update member roles
    
    ### Path Parameters:
    - **user_id**: ID of the user to update
    
    ### Request Body:
    - **role**: New role to assign
    - **permissions**: Optional list of specific permissions
    
    ### Response:
    Returns updated team member information
    
    ### Errors:
    - **400**: Invalid role or cannot modify own role
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **404**: User not found
    - **500**: Server error
    """
    try:
        # Prevent admin from changing their own role
        if user_id == current_user.id:
            raise HTTPException(
                status_code=400,
                detail="Cannot modify your own role"
            )
        
        # Get current user info for email notification
        current_member = await user_repository.get_user_by_id(user_id)
        if not current_member:
            raise HTTPException(status_code=404, detail="User not found")
        
        old_role = current_member.role.value
        
        # Validate role
        new_role = role_update.get("role")
        if new_role not in [role.value for role in UserRole]:
            raise HTTPException(status_code=400, detail="Invalid role")
        
        # Skip update if role is the same
        if old_role == new_role:
            return TeamMember(
                id=current_member.id,
                name=current_member.full_name,
                email=current_member.email,
                role=current_member.role,
                status="active" if current_member.is_active else "inactive",
                department=current_member.department,
                permissions=current_member.permissions,
                join_date=current_member.created_at,
                last_login=current_member.last_login
            )
        
        # Update user
        user_update = UserUpdate(
            role=UserRole(new_role),
            permissions=role_update.get("permissions")
        )
        
        updated_user = await user_repository.update_user(user_id, user_update)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Send role change notification email (background task)
        background_tasks.add_task(
            email_service.send_role_change_notification,
            updated_user.email,
            updated_user.full_name,
            old_role.title(),
            new_role.title(),
            current_user.full_name
        )
        
        # Return as team member
        return TeamMember(
            id=updated_user.id,
            name=updated_user.full_name,
            email=updated_user.email,
            role=updated_user.role,
            status="active" if updated_user.is_active else "inactive",
            department=updated_user.department,
            permissions=updated_user.permissions,
            join_date=updated_user.created_at,
            last_login=updated_user.last_login
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating member role: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update member role")

@router.put("/members/{user_id}/status", response_model=TeamMember)
async def update_member_status(
    user_id: str,
    status_update: dict,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin_role)
):
    """
    ## Update Team Member Status
    
    Activate or deactivate a team member.
    
    ### Required Role: 
    **Admin** - Only administrators can update member status
    
    ### Path Parameters:
    - **user_id**: ID of the user to update
    
    ### Request Body:
    - **is_active**: Boolean status (true for active, false for inactive)
    
    ### Response:
    Returns updated team member information
    
    ### Errors:
    - **400**: Cannot deactivate own account
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **404**: User not found
    - **500**: Server error
    """
    try:
        # Prevent admin from deactivating themselves
        if user_id == current_user.id:
            raise HTTPException(
                status_code=400,
                detail="Cannot deactivate your own account"
            )
        
        is_active = status_update.get("is_active")
        if not isinstance(is_active, bool):
            raise HTTPException(status_code=400, detail="is_active must be a boolean")
        
        # Update user status
        user_update = UserUpdate(is_active=is_active)
        updated_user = await user_repository.update_user(user_id, user_update)
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Send status change notification email
        try:
            new_status = "active" if is_active else "inactive"
            background_tasks.add_task(
                email_service.send_status_change_notification,
                updated_user.email,
                updated_user.full_name,
                new_status,
                current_user.full_name
            )
        except Exception as e:
            logger.warning(f"Failed to send status change notification email: {str(e)}")
        
        # Return as team member
        return TeamMember(
            id=updated_user.id,
            name=updated_user.full_name,
            email=updated_user.email,
            role=updated_user.role,
            status="active" if updated_user.is_active else "inactive",
            department=updated_user.department,
            permissions=updated_user.permissions,
            join_date=updated_user.created_at,
            last_login=updated_user.last_login
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating member status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update member status")

@router.delete("/members/{user_id}")
async def remove_team_member(
    user_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin_role)
):
    """
    ## Remove Team Member
    
    Remove a team member from the organization.
    
    ### Required Role: 
    **Admin** - Only administrators can remove team members
    
    ### Path Parameters:
    - **user_id**: ID of the user to remove
    
    ### Response:
    - **message**: Success message
    
    ### Errors:
    - **400**: Cannot remove own account
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **404**: User not found
    - **500**: Server error
    """
    try:
        # Prevent admin from removing themselves
        if user_id == current_user.id:
            raise HTTPException(
                status_code=400,
                detail="Cannot remove your own account"
            )
        
        # Get user details before removal for email notification
        user_to_remove = await user_repository.get_user_by_id(user_id)
        if not user_to_remove:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove user
        success = await user_repository.delete_user(user_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Send removal notification email
        try:
            background_tasks.add_task(
                email_service.send_removal_notification,
                user_to_remove.email,
                user_to_remove.full_name,
                current_user.full_name
            )
        except Exception as e:
            logger.warning(f"Failed to send removal notification email: {str(e)}")
        
        return {"message": "Team member removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing team member: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to remove team member")

@router.get("/members/{user_id}", response_model=TeamMember)
async def get_team_member(
    user_id: str,
    current_user: User = Depends(require_admin_role)
):
    """
    ## Get Team Member Details
    
    Retrieve detailed information about a specific team member.
    
    ### Required Role: 
    **Admin** - Only administrators can view team member details
    
    ### Path Parameters:
    - **user_id**: ID of the user to retrieve
    
    ### Response:
    Returns detailed team member information
    
    ### Errors:
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **404**: User not found
    - **500**: Server error
    """
    try:
        user = await user_repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return TeamMember(
            id=user.id,
            name=user.full_name,
            email=user.email,
            role=user.role,
            status="active" if user.is_active else "inactive",
            department=user.department,
            permissions=user.permissions,
            join_date=user.created_at,
            last_login=user.last_login
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving team member: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve team member")
