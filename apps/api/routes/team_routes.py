"""
Team Management Routes
Handles team member management, invitations, and role assignments.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from datetime import datetime

from models.user_models import User, UserCreate, UserUpdate, UserRole
from models.team_models import TeamMember, TeamInvitation, TeamStats, InviteUserRequest
from repositories.user_repository import user_repository
from repositories.team_repository import team_repository
from middleware.auth import require_admin_role, get_current_user
from services.email_service import email_service
from utils.auth_utils import generate_random_password
import logging

logger = logging.getLogger(__name__)

async def get_added_by_name(added_by_id: Optional[str]) -> str:
    """Helper function to get the name of the admin who added a user"""
    if not added_by_id:
        return "System"
    
    try:
        admin = await user_repository.get_user_by_id(added_by_id)
        return admin.full_name if admin else "Unknown Admin"
    except Exception:
        return "Unknown Admin"

router = APIRouter(prefix="/team", tags=["Team Management"])

@router.get("/members", response_model=List[TeamMember])
async def get_team_members(
    current_user: User = Depends(require_admin_role)
):
    """
    ## Get Team Members
    
    Retrieve team members added by the current admin.
    
    ### Required Role: 
    **Admin** - Only administrators can view team members
    
    ### Response:
    Returns list of team members added by the current admin with:
    - **id**: User unique identifier
    - **name**: Full name
    - **email**: Email address
    - **role**: User role (admin, user, auditor, viewer)
    - **status**: Account status (active, inactive, pending)
    - **department**: Department name
    - **permissions**: List of permissions
    - **join_date**: Account creation date
    - **last_login**: Last login timestamp
    - **added_by**: ID of admin who added this user
    - **added_by_name**: Name of admin who added this user
    
    ### Errors:
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **500**: Server error
    """
    try:
        # Get only users added by current admin
        users = await user_repository.get_users_by_admin(current_user.id)
        team_members = []
        
        for user in users:
            # Skip the admin themselves from the list
            if user.id == current_user.id:
                continue
            
            # Get the admin who added this user
            added_by_name = "Unknown"
            if user.added_by:
                added_by_admin = await user_repository.get_user_by_id(user.added_by)
                if added_by_admin:
                    added_by_name = added_by_admin.full_name
                
            member = TeamMember(
                id=user.id,
                name=user.full_name,
                email=user.email,
                role=user.role,
                status="active" if user.is_active else "inactive",
                department=user.department,
                permissions=user.permissions,
                join_date=user.created_at,
                last_login=user.last_login,
                added_by=user.added_by,
                added_by_name=added_by_name
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
    
    Retrieve team statistics for users added by the current admin.
    
    ### Required Role: 
    **Admin** - Only administrators can view team statistics
    
    ### Response:
    - **total_members**: Total number of team members added by this admin
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
        # Get only users added by current admin
        users = await user_repository.get_users_by_admin(current_user.id)
        
        # Filter out the admin themselves
        users = [user for user in users if user.id != current_user.id]
        
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
    
    Send an invitation to join the team. The new user will be associated with the current admin.
    
    ### Required Role: 
    **Admin** - Only administrators can invite team members
    
    ### Request Body:
    - **email**: Email address of the invitee
    - **full_name**: Full name of the invitee
    - **role**: Role to assign (user, auditor, viewer - not admin for security)
    - **department**: Optional department name
    - **permissions**: Optional list of specific permissions
    
    ### Response:
    - **message**: Success message
    - **user_id**: Created user ID
    - **email**: User email
    
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
        
        # Restrict role assignment - admins can only create non-admin users
        if invite_request.role == UserRole.ADMIN:
            raise HTTPException(status_code=400, detail="Cannot create admin users through team invitation")
        
        # Generate secure random password
        temporary_password = generate_random_password(length=12)
        
        # Create user with current admin as the one who added them
        user_data = UserCreate(
            email=invite_request.email,
            full_name=invite_request.full_name,
            password=temporary_password,  # Secure random password
            role=invite_request.role,
            department=invite_request.department,
            permissions=invite_request.permissions or ["chat_access"],
            added_by=current_user.id  # Track who added this user
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
    
    Update a team member's role and permissions. Can only update users added by the current admin.
    
    ### Required Role: 
    **Admin** - Only administrators can update member roles
    
    ### Path Parameters:
    - **user_id**: ID of the user to update
    
    ### Request Body:
    - **role**: New role to assign (user, auditor, viewer - not admin)
    - **permissions**: Optional list of specific permissions
    
    ### Response:
    Returns updated team member information
    
    ### Errors:
    - **400**: Invalid role or cannot modify own role
    - **401**: Not authenticated
    - **403**: Insufficient permissions or user not added by current admin
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
        
        # Get current user info for verification
        current_member = await user_repository.get_user_by_id(user_id)
        if not current_member:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if this user was added by the current admin
        if current_member.added_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only modify users that you have added"
            )
        
        old_role = current_member.role.value
        
        # Validate role - prevent creating admins
        new_role = role_update.get("role")
        if new_role == "admin":
            raise HTTPException(status_code=400, detail="Cannot promote users to admin role")
        
        if new_role not in [role.value for role in UserRole if role != UserRole.ADMIN]:
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
                last_login=current_member.last_login,
                added_by=current_member.added_by,
                added_by_name=await get_added_by_name(current_member.added_by)
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
            last_login=updated_user.last_login,
            added_by=updated_user.added_by,
            added_by_name=await get_added_by_name(updated_user.added_by)
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
    
    Activate or deactivate a team member. Can only update users added by the current admin.
    
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
    - **403**: Insufficient permissions or user not added by current admin
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
        
        # Get user to verify they were added by current admin
        user_to_update = await user_repository.get_user_by_id(user_id)
        if not user_to_update:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if this user was added by the current admin
        if user_to_update.added_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only modify users that you have added"
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
            last_login=updated_user.last_login,
            added_by=updated_user.added_by,
            added_by_name=await get_added_by_name(updated_user.added_by)
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
    
    Remove a team member from the organization. Can only remove users added by the current admin.
    
    ### Required Role: 
    **Admin** - Only administrators can remove team members
    
    ### Path Parameters:
    - **user_id**: ID of the user to remove
    
    ### Response:
    - **message**: Success message
    
    ### Errors:
    - **400**: Cannot remove own account
    - **401**: Not authenticated
    - **403**: Insufficient permissions or user not added by current admin
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
        
        # Get user details before removal for email notification and verification
        user_to_remove = await user_repository.get_user_by_id(user_id)
        if not user_to_remove:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if this user was added by the current admin
        if user_to_remove.added_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only remove users that you have added"
            )
        
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

@router.get("/admins")
async def list_admins(current_user: User = Depends(require_admin_role)):
    """
    ## List All Admins
    
    Get a list of all admin users in the system.
    
    ### Required Role: 
    **Admin** - Only administrators can access this endpoint
    
    ### Returns:
    List of admin users with:
    - **id**: Unique user identifier
    - **email**: Admin email address
    - **full_name**: Admin full name
    - **department**: Admin department (if available)
    - **created_at**: When admin account was created
    - **last_login**: Last login timestamp (if available)
    
    ### Errors:
    - **401**: Not authenticated
    - **403**: Insufficient permissions (not admin)
    - **500**: Server error
    """
    try:
        admins = await user_repository.get_admin_users()
        
        # Return simplified admin info (exclude sensitive data)
        admin_list = []
        for admin in admins:
            admin_info = {
                "id": admin.id,
                "email": admin.email,
                "full_name": admin.full_name,
                "department": admin.department,
                "created_at": admin.created_at,
                "last_login": admin.last_login
            }
            admin_list.append(admin_info)
        
        return {
            "admins": admin_list,
            "total": len(admin_list)
        }
        
    except Exception as e:
        logger.error(f"Error listing admins: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve admin list")
