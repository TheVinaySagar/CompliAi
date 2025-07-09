from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from config import settings
from models.user_models import TokenPayload

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
