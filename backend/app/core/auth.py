from fastapi import Header, HTTPException
from app.core.supabase import supabase

def get_current_user(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = supabase.auth.get_claims(token)
        user_id = claims.get("claims", {}).get("sub")
        if not user_id:
            raise ValueError("No subject in JWT")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
