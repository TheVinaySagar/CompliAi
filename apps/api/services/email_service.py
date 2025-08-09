"""
Email Service
Handles sending emails for invitations and notifications.
"""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional
import asyncio
from utils.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """
    Email service for sending notifications via SMTP.
    """
    
    def __init__(self):
        # Check if email service is properly configured
        self.enabled = bool(
            settings.smtp_server and 
            settings.smtp_username and 
            settings.smtp_password and
            settings.from_email
        )
        
        if self.enabled:
            logger.info("Email service enabled with SMTP configuration")
        else:
            logger.warning("Email service disabled - missing SMTP configuration")
    
    async def _send_smtp_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str, 
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send email via SMTP.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email content
            text_content: Plain text email content (optional)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{settings.from_name} <{settings.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add text content if provided
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._send_smtp_sync, msg, to_email)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def _send_smtp_sync(self, msg: MIMEMultipart, to_email: str):
        """
        Synchronous SMTP sending (called in thread pool).
        """
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            if settings.smtp_use_tls:
                server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg, to_addrs=[to_email])
    
    def _generate_welcome_email_html(
        self, 
        full_name: str, 
        email: str, 
        temporary_password: str
    ) -> str:
        """Generate HTML content for welcome email."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to CompliAI</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }}
                .credentials {{ background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }}
                .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .warning {{ background: #fef3cd; color: #664d03; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🛡️ CompliAI</div>
                    <h1>Welcome to CompliAI!</h1>
                </div>
                
                <p>Hi {full_name},</p>
                
                <p>You've been invited to join CompliAI, the AI-powered compliance management platform. Your account has been created and you can now access the system.</p>
                
                <div class="credentials">
                    <h3>Your Login Credentials:</h3>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Temporary Password:</strong> <code>{temporary_password}</code></p>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> Please log in and change your password immediately for security purposes.
                </div>
                
                <p style="text-align: center;">
                    <a href="{settings.frontend_url}/login" class="button">Login to CompliAI</a>
                </p>
                
                <h3>What you can do with CompliAI:</h3>
                <ul>
                    <li>🤖 Chat with AI for compliance questions</li>
                    <li>📄 Upload and analyze compliance documents</li>
                    <li>📋 Generate policies and procedures</li>
                    <li>🔍 Map controls to compliance frameworks</li>
                    <li>📊 Track compliance status and gaps</li>
                </ul>
                
                <p>If you have any questions or need help getting started, please don't hesitate to reach out to your administrator.</p>
                
                <div class="footer">
                    <p>Best regards,<br>The CompliAI Team</p>
                    <p><small>This email was sent from CompliAI. If you believe you received this email in error, please contact your administrator.</small></p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_welcome_email_text(
        self, 
        full_name: str, 
        email: str, 
        temporary_password: str
    ) -> str:
        """Generate plain text content for welcome email."""
        return f"""
Welcome to CompliAI!

Hi {full_name},

You've been invited to join CompliAI, the AI-powered compliance management platform. Your account has been created and you can now access the system.

Your Login Credentials:
Email: {email}
Temporary Password: {temporary_password}

IMPORTANT: Please log in and change your password immediately for security purposes.

Login URL: {settings.frontend_url}/login

What you can do with CompliAI:
- Chat with AI for compliance questions
- Upload and analyze compliance documents  
- Generate policies and procedures
- Map controls to compliance frameworks
- Track compliance status and gaps

If you have any questions or need help getting started, please don't hesitate to reach out to your administrator.

Best regards,
The CompliAI Team

This email was sent from CompliAI. If you believe you received this email in error, please contact your administrator.
        """
    
    def _generate_registration_welcome_html(
        self, 
        full_name: str, 
        email: str
    ) -> str:
        """Generate HTML content for registration welcome email (no password)."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to CompliAI</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }}
                .welcome-message {{ background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
                .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .features {{ background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🛡️ CompliAI</div>
                    <h1>Welcome to CompliAI!</h1>
                </div>
                
                <div class="welcome-message">
                    <h3>🎉 Account Successfully Created!</h3>
                    <p>Hi {full_name},</p>
                    <p>Thank you for joining CompliAI! Your account has been successfully created and you're now ready to explore our AI-powered compliance management platform.</p>
                </div>
                
                <p style="text-align: center;">
                    <a href="{settings.frontend_url}/dashboard" class="button">Go to Dashboard</a>
                </p>
                
                <div class="features">
                    <h3>🚀 What you can do with CompliAI:</h3>
                    <ul>
                        <li>🤖 <strong>AI Chat Assistant</strong> - Ask compliance questions and get instant answers</li>
                        <li>📄 <strong>Document Analysis</strong> - Upload and analyze compliance documents</li>
                        <li>📋 <strong>Policy Generation</strong> - Create audit-ready policies and procedures</li>
                        <li>🎯 <strong>Framework Mapping</strong> - Map controls to compliance frameworks</li>
                        <li>📊 <strong>Compliance Tracking</strong> - Monitor compliance status and identify gaps</li>
                    </ul>
                </div>
                
                <div style="background: #fef3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <strong>💡 Pro Tip:</strong> Start by visiting the Chat Assistant to ask your first compliance question, or upload a document to see our AI analysis in action!
                </div>
                
                <p>If you have any questions or need help getting started, please don't hesitate to explore our help resources or contact support.</p>
                
                <div class="footer">
                    <p>Best regards,<br>The CompliAI Team</p>
                    <p><small>This email was sent to {email} because you created an account with CompliAI. If you believe you received this email in error, please contact support.</small></p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_registration_welcome_text(
        self, 
        full_name: str, 
        email: str
    ) -> str:
        """Generate plain text content for registration welcome email (no password)."""
        return f"""
Welcome to CompliAI!

Hi {full_name},

Thank you for joining CompliAI! Your account has been successfully created and you're now ready to explore our AI-powered compliance management platform.

Dashboard URL: {settings.frontend_url}/dashboard

What you can do with CompliAI:
- 🤖 AI Chat Assistant - Ask compliance questions and get instant answers
- 📄 Document Analysis - Upload and analyze compliance documents  
- 📋 Policy Generation - Create audit-ready policies and procedures
- 🎯 Framework Mapping - Map controls to compliance frameworks
- 📊 Compliance Tracking - Monitor compliance status and identify gaps

Pro Tip: Start by visiting the Chat Assistant to ask your first compliance question, or upload a document to see our AI analysis in action!

If you have any questions or need help getting started, please don't hesitate to explore our help resources or contact support.

Best regards,
The CompliAI Team

This email was sent to {email} because you created an account with CompliAI. If you believe you received this email in error, please contact support.
        """

    async def send_welcome_email(
        self, 
        email: str, 
        full_name: str, 
        temporary_password: str
    ) -> bool:
        """
        Send welcome email to new team member.
        
        Args:
            email: Recipient email address
            full_name: Recipient full name
            temporary_password: Temporary password for first login
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            if not self.enabled:
                logger.info(f"Email service disabled. Would send welcome email to {email}")
                logger.info(f"Welcome details for {full_name}:")
                logger.info(f"  Email: {email}")
                logger.info(f"  Temporary Password: {temporary_password}")
                logger.info(f"  Message: Please log in and change your password immediately.")
                return True
            
            # Generate email content
            html_content = self._generate_welcome_email_html(full_name, email, temporary_password)
            text_content = self._generate_welcome_email_text(full_name, email, temporary_password)
            subject = f"Welcome to CompliAI - {full_name}"
            
            # Send email
            return await self._send_smtp_email(email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {email}: {str(e)}")
            return False
    
    async def send_registration_welcome_email(
        self, 
        email: str, 
        full_name: str
    ) -> bool:
        """
        Send welcome email to new user who registered themselves.
        This is different from team invitations - no password info included.
        
        Args:
            email: Recipient email address
            full_name: Recipient full name
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            if not self.enabled:
                logger.info(f"Email service disabled. Would send registration welcome email to {email}")
                logger.info(f"Registration welcome for {full_name} ({email})")
                return True
            
            # Generate email content
            html_content = self._generate_registration_welcome_html(full_name, email)
            text_content = self._generate_registration_welcome_text(full_name, email)
            subject = f"Welcome to CompliAI, {full_name}!"
            
            # Send email
            return await self._send_smtp_email(email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Failed to send registration welcome email to {email}: {str(e)}")
            return False

    async def send_invitation_email(
        self, 
        email: str, 
        full_name: str, 
        invited_by: str,
        role: str,
        invitation_link: str
    ) -> bool:
        """
        Send invitation email to potential team member.
        
        Args:
            email: Recipient email address
            full_name: Recipient full name
            invited_by: Name of the person who sent the invitation
            role: Role being offered
            invitation_link: Link to accept invitation
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            if not self.enabled:
                logger.info(f"Email service disabled. Would send invitation email to {email}")
                logger.info(f"Invitation details for {full_name}:")
                logger.info(f"  Email: {email}")
                logger.info(f"  Invited by: {invited_by}")
                logger.info(f"  Role: {role}")
                logger.info(f"  Invitation Link: {invitation_link}")
                return True
            
            # TODO: Implement actual email sending
            return True
            
        except Exception as e:
            logger.error(f"Failed to send invitation email to {email}: {str(e)}")
            return False
    
    def _generate_role_change_email_html(
        self, 
        full_name: str, 
        old_role: str, 
        new_role: str, 
        changed_by: str
    ) -> str:
        """Generate HTML content for role change email."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Role Updated - CompliAI</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }}
                .role-change {{ background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }}
                .role-badge {{ display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 0 5px; }}
                .role-old {{ background: #fee2e2; color: #991b1b; }}
                .role-new {{ background: #dcfce7; color: #166534; }}
                .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🛡️ CompliAI</div>
                    <h1>Your Role Has Been Updated</h1>
                </div>
                
                <p>Hi {full_name},</p>
                
                <p>Your role in CompliAI has been updated by {changed_by}.</p>
                
                <div class="role-change">
                    <h3>Role Change Details:</h3>
                    <p>
                        <span class="role-badge role-old">{old_role}</span> 
                        → 
                        <span class="role-badge role-new">{new_role}</span>
                    </p>
                    <p><small>This change is effective immediately.</small></p>
                </div>
                
                <p>Your new role provides different access levels and permissions within the CompliAI platform. Please log in to see your updated capabilities.</p>
                
                <p style="text-align: center;">
                    <a href="{settings.frontend_url}/login" class="button">Login to CompliAI</a>
                </p>
                
                <p>If you have any questions about your new role or permissions, please contact your administrator.</p>
                
                <div class="footer">
                    <p>Best regards,<br>The CompliAI Team</p>
                    <p><small>This email was sent from CompliAI.</small></p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_role_change_email_text(
        self, 
        full_name: str, 
        old_role: str, 
        new_role: str, 
        changed_by: str
    ) -> str:
        """Generate plain text content for role change email."""
        return f"""
Your Role Has Been Updated - CompliAI

Hi {full_name},

Your role in CompliAI has been updated by {changed_by}.

Role Change Details:
Previous Role: {old_role}
New Role: {new_role}

This change is effective immediately.

Your new role provides different access levels and permissions within the CompliAI platform. Please log in to see your updated capabilities.

Login URL: {settings.frontend_url}/login

If you have any questions about your new role or permissions, please contact your administrator.

Best regards,
The CompliAI Team

This email was sent from CompliAI.
        """
    
    async def send_role_change_notification(
        self, 
        email: str, 
        full_name: str, 
        old_role: str, 
        new_role: str,
        changed_by: str
    ) -> bool:
        """
        Send notification about role change.
        
        Args:
            email: Recipient email address
            full_name: Recipient full name
            old_role: Previous role
            new_role: New role
            changed_by: Name of the admin who made the change
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            if not self.enabled:
                logger.info(f"Email service disabled. Would send role change notification to {email}")
                logger.info(f"Role change for {full_name}:")
                logger.info(f"  Email: {email}")
                logger.info(f"  Old Role: {old_role}")
                logger.info(f"  New Role: {new_role}")
                logger.info(f"  Changed by: {changed_by}")
                return True
            
            # Generate email content
            html_content = self._generate_role_change_email_html(full_name, old_role, new_role, changed_by)
            text_content = self._generate_role_change_email_text(full_name, old_role, new_role, changed_by)
            subject = f"Role Updated to {new_role} - CompliAI"
            
            # Send email
            return await self._send_smtp_email(email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Failed to send role change notification to {email}: {str(e)}")
            return False
    
    def _generate_status_change_email_html(
        self, 
        full_name: str, 
        is_active: bool, 
        changed_by: str
    ) -> str:
        """Generate HTML content for status change email."""
        status_text = "activated" if is_active else "deactivated"
        status_color = "#10b981" if is_active else "#ef4444"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Account {status_text.title()} - CompliAI</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }}
                .status-change {{ background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid {status_color}; }}
                .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🛡️ CompliAI</div>
                    <h1>Account {status_text.title()}</h1>
                </div>
                
                <p>Hi {full_name},</p>
                
                <p>Your CompliAI account has been {status_text} by {changed_by}.</p>
                
                <div class="status-change">
                    <h3>Account Status Change:</h3>
                    <p><strong>Status:</strong> {status_text.title()}</p>
                    <p><small>This change is effective immediately.</small></p>
                </div>
                
                {"<p>You can now log in to CompliAI and access your account.</p>" if is_active else "<p>You will no longer be able to access CompliAI until your account is reactivated.</p>"}
                
                {"<p style='text-align: center;'><a href='" + settings.frontend_url + "/login' class='button'>Login to CompliAI</a></p>" if is_active else ""}
                
                <p>If you have any questions about this change, please contact your administrator.</p>
                
                <div class="footer">
                    <p>Best regards,<br>The CompliAI Team</p>
                    <p><small>This email was sent from CompliAI.</small></p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _generate_status_change_email_text(
        self, 
        full_name: str, 
        is_active: bool, 
        changed_by: str
    ) -> str:
        """Generate plain text content for status change email."""
        status_text = "activated" if is_active else "deactivated"
        
        return f"""
Account {status_text.title()} - CompliAI

Hi {full_name},

Your CompliAI account has been {status_text} by {changed_by}.

Account Status Change:
Status: {status_text.title()}
This change is effective immediately.

{"You can now log in to CompliAI and access your account." if is_active else "You will no longer be able to access CompliAI until your account is reactivated."}

{"Login URL: " + settings.frontend_url + "/login" if is_active else ""}

If you have any questions about this change, please contact your administrator.

Best regards,
The CompliAI Team

This email was sent from CompliAI.
        """
    
    async def send_status_change_notification(
        self, 
        email: str, 
        full_name: str, 
        status: str,
        changed_by: str
    ) -> bool:
        """
        Send notification about account status change.
        
        Args:
            email: Recipient email address
            full_name: Recipient full name
            status: New account status ('active' or 'inactive')
            changed_by: Name of the admin who made the change
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            status_text = "activated" if status == "active" else "deactivated"
            
            if not self.enabled:
                logger.info(f"Email service disabled. Would send status change notification to {email}")
                logger.info(f"Status change for {full_name}: Account {status_text} by {changed_by}")
                return True
            
            # Generate email content
            html_content = self._generate_status_change_email_html(full_name, status, changed_by)
            text_content = self._generate_status_change_email_text(full_name, status, changed_by)
            subject = f"Account {status_text.title()} - CompliAI"
            
            # Send email
            return await self._send_smtp_email(email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Failed to send status change notification to {email}: {str(e)}")
            return False

    def _generate_status_change_email_html(self, user_name: str, status: str, admin_name: str) -> str:
        """Generate HTML content for status change notification email."""
        status_message = "activated" if status == "active" else "deactivated"
        status_color = "#10b981" if status == "active" else "#f59e0b"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: {status_color}; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f8f9fa; }}
                .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
                .status-badge {{ background-color: {status_color}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; display: inline-block; }}
                .message {{ margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Account Status Update</h1>
                </div>
                <div class="content">
                    <p>Dear {user_name},</p>
                    
                    <div class="message">
                        <p>Your account status has been <strong>{status_message}</strong> by {admin_name}.</p>
                        
                        <p>Current Status: <span class="status-badge">{status.upper()}</span></p>
                    </div>
                    
                    <p>If you have any questions about this change, please contact your administrator.</p>
                    
                    <p>Best regards,<br>The CompliAI Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message from CompliAI.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _generate_status_change_email_text(self, user_name: str, status: str, admin_name: str) -> str:
        """Generate plain text content for status change notification email."""
        status_message = "activated" if status == "active" else "deactivated"
        
        return f"""
Dear {user_name},

Your account status has been {status_message} by {admin_name}.

Your current status: {status.upper()}

If you have any questions about this change, please contact your administrator.

Best regards,
The CompliAI Team

---
This is an automated message from CompliAI.
        """

    async def send_removal_notification(self,
                                      email: str,
                                      user_name: str,
                                      admin_name: str):
        """Send notification when a user is removed from the team."""
        try:
            if not self.enabled:
                logger.info(f"Email service disabled. Would send removal notification to {email}")
                logger.info(f"Removal notification for {user_name}: Removed by {admin_name}")
                return True
            
            subject = "Team Access Removed - CompliAI"
            html_content = self._generate_removal_email_html(
                user_name, admin_name
            )
            text_content = self._generate_removal_email_text(
                user_name, admin_name
            )
            
            await self._send_smtp_email(
                to_email=email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            logger.info(f"Removal notification sent to: {email}")
        except Exception as e:
            logger.error(f"Failed to send removal notification to {email}: {str(e)}")
            raise

    def _generate_removal_email_html(self, user_name: str, admin_name: str) -> str:
        """Generate HTML content for removal notification email."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #dc3545; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f8f9fa; }}
                .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
                .message {{ margin: 15px 0; }}
                .important {{ color: #dc3545; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Team Access Removed</h1>
                </div>
                <div class="content">
                    <p>Dear {user_name},</p>
                    
                    <div class="message">
                        <p>Your access to the CompliAI platform has been removed by {admin_name}.</p>
                        
                        <p class="important">This means you will no longer be able to:</p>
                        <ul>
                            <li>Access the CompliAI platform</li>
                            <li>View compliance documents</li>
                            <li>Use the chat and audit features</li>
                            <li>Participate in team activities</li>
                        </ul>
                    </div>
                    
                    <p>If you believe this was done in error or have questions about this change, please contact your administrator.</p>
                    
                    <p>Thank you for your time with CompliAI.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message from CompliAI.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _generate_removal_email_text(self, user_name: str, admin_name: str) -> str:
        """Generate plain text content for removal notification email."""
        return f"""
Dear {user_name},

Your access to the CompliAI platform has been removed by {admin_name}.

This means you will no longer be able to:
- Access the CompliAI platform
- View compliance documents
- Use the chat and audit features
- Participate in team activities

If you believe this was done in error or have questions about this change, please contact your administrator.

Thank you for your time with CompliAI.

---
This is an automated message from CompliAI.
        """

# Global email service instance
email_service = EmailService()
