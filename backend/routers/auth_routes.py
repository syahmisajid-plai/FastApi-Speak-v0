# routers/auth_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import bcrypt

from db import get_user_for_login

router = APIRouter(prefix="/auth", tags=["auth"])


# -----------------------------
# SCHEMA (Pydantic)
# -----------------------------
class LoginRequest(BaseModel):
    username: str
    password: str


# -----------------------------
# LOGIN ENDPOINT
# -----------------------------
@router.post("/login")
def login(payload: LoginRequest):

    print("\n🔐 [LOGIN REQUEST]")
    print("➡️ Username/Email:", payload.username)

    username_or_email = payload.username
    password = payload.password

    # -----------------------------
    # GET USER FROM DB
    # -----------------------------
    print("📡 Fetching user from DB...")

    user = get_user_for_login(username_or_email)

    print("📥 DB result:", user)

    if not user:
        print("❌ User not found")
        raise HTTPException(status_code=401, detail="User not found")

    # -----------------------------
    # VERIFY PASSWORD
    # -----------------------------
    print("🔍 Verifying password...")

    is_valid = bcrypt.checkpw(
        password.encode("utf-8"),
        user["password_hash"].encode("utf-8")
    )

    print("🔑 Password valid:", is_valid)

    if not is_valid:
        print("❌ Wrong password")
        raise HTTPException(status_code=401, detail="Wrong password")

    # -----------------------------
    # SUCCESS
    # -----------------------------
    print("✅ Login success for user:", user["username"])

    return {
        "success": True,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "avatar_id":user["avatar_id"],
        }
    }