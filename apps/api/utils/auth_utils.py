from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from config import settings
from models.user_models import TokenPayload
import secrets
import string

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_access_token(token: str) -> Optional[TokenPayload]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("user_id")
        email = payload.get("email")
        role = payload.get("role")
        exp = payload.get("exp")
        
        if user_id is None or email is None:
            return None
        
        return TokenPayload(user_id=user_id, email=email, role=role, exp=exp)
    
    except JWTError:
        return None

def create_token_for_user(user_id: str, email: str, role: str) -> str:
    """Create token for specific user"""
    data = {
        "user_id": user_id,
        "email": email,
        "role": role
    }
    return create_access_token(data)

def generate_random_password(length: int = 12) -> str:
    """
    Generate a secure random password.
    
    Args:
        length: Password length (default: 12)
        
    Returns:
        str: Randomly generated secure password
        
    The password will contain:
    - At least 2 uppercase letters
    - At least 2 lowercase letters  
    - At least 2 digits
    - At least 2 special characters
    - Total length as specified
    """
    if length < 8:
        raise ValueError("Password length must be at least 8 characters")
    
    # Define character sets
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Ensure password has at least 2 characters from each category
    password_chars = []
    password_chars.extend(secrets.choice(uppercase) for _ in range(2))
    password_chars.extend(secrets.choice(lowercase) for _ in range(2))
    password_chars.extend(secrets.choice(digits) for _ in range(2))
    password_chars.extend(secrets.choice(special_chars) for _ in range(2))
    
    # Fill remaining length with random characters from all sets
    all_chars = uppercase + lowercase + digits + special_chars
    remaining_length = length - len(password_chars)
    password_chars.extend(secrets.choice(all_chars) for _ in range(remaining_length))
    
    # Shuffle the password characters to avoid predictable patterns
    secrets.SystemRandom().shuffle(password_chars)
    
    return ''.join(password_chars)

def generate_simple_random_password(length: int = 10) -> str:
    """
    Generate a simpler random password (letters and numbers only).
    
    Args:
        length: Password length (default: 10)
        
    Returns:
        str: Randomly generated password with letters and numbers only
    """
    if length < 6:
        raise ValueError("Password length must be at least 6 characters")
    
    # Use only letters and numbers for simpler passwords
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))
