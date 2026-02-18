# routers/streak.py
from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3
import psycopg2
import os
from datetime import date, timedelta

from streak import update_streak

router = APIRouter()
DATABASE_URL = os.getenv("DATABASE_URL")


# -----------------------------
# MODELS
# -----------------------------
class UpdateStreakRequest(BaseModel):
    session_id: str


# -----------------------------
# ROUTES
# -----------------------------
@router.get("/user/streak/{session_id}")
def get_streak(session_id: str):
    if DATABASE_URL:
        conn = psycopg2.connect(DATABASE_URL)
    else:
        conn = sqlite3.connect("chat_history.db")

    cursor = conn.cursor()

    cursor.execute(
        (
            "SELECT current_streak, longest_streak, chat_count FROM user_streak WHERE user_id=%s"
            if DATABASE_URL
            else "SELECT current_streak, longest_streak, chat_count FROM user_streak WHERE user_id=?"
        ),
        (session_id,),
    )

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "chat_count": 0,
        }

    return {
        "current_streak": row[0],
        "longest_streak": row[1],
        "chat_count": row[2],
    }


@router.post("/user/update-streak")
def update_user_streak(req: UpdateStreakRequest):
    print("🔥 UPDATE STREAK:", req.session_id)
    update_streak(req.session_id)
    return {"status": "ok"}
