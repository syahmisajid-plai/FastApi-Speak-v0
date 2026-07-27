# routes/user.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import update_user_avatar

router = APIRouter(prefix="/user", tags=["user"])


class UpdateAvatarRequest(BaseModel):
    user_id: str
    avatar_id: int


@router.put("/avatar")
def update_avatar(payload: UpdateAvatarRequest):

    print("\n🖼 UPDATE AVATAR")
    print("User :", payload.user_id)
    print("Avatar :", payload.avatar_id)

    user = update_user_avatar(payload.user_id, payload.avatar_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "message": "Avatar updated successfully", "user": user}
