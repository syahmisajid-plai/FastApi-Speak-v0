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

    username_or_email = payload.username
    password = payload.password


    user = get_user_for_login(username_or_email)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # -----------------------------
    # VERIFY PASSWORD
    # -----------------------------
    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password_hash"].encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Wrong password")

    # -----------------------------
    # SUCCESS RESPONSE
    # -----------------------------
    return {
        "success": True,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }