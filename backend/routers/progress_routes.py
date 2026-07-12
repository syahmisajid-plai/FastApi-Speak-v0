from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import (
    get_user_progress,
    add_user_xp,
)

router = APIRouter(prefix="/progress", tags=["progress"])


# -----------------------------
# SCHEMA (Pydantic)
# -----------------------------
class UpdateProgressRequest(BaseModel):
    user_id: str
    level: int
    xp: int
    title_level: int


# -----------------------------
# GET USER PROGRESS
# -----------------------------
@router.get("/{user_id}")
def get_progress(user_id: str):

    print("\n📊 [GET USER PROGRESS]")
    print("➡️ User ID:", user_id)

    progress = get_user_progress(user_id)

    print("📥 DB Result:", progress)

    if not progress:
        print("❌ Progress not found")
        raise HTTPException(
            status_code=404,
            detail="User progress not found"
        )

    print("✅ Progress loaded")

    return {
        "success": True,
        "progress": progress
    }


# -----------------------------
# ADD USER XP
# -----------------------------
@router.put("/")
def update_progress(payload: UpdateProgressRequest):

    print("\n📈 [ADD USER XP]")
    print("➡️ User ID:", payload.user_id)
    print("➡️ XP Gain:", payload.xp_gain)


    progress = add_user_xp(
        user_id=payload.user_id,
        xp_gain=payload.xp_gain
    )


    print("✅ XP Added")
    print("➡️ New Progress:", progress)


    return {
        "success": True,
        "progress": progress
    }