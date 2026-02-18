from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3
import psycopg2
import os

router = APIRouter()

DATABASE_URL = os.getenv("DATABASE_URL")


class ClearAllUserHistoryRequest(BaseModel):
    session_id: str


@router.post("/history/clear-all")
def clear_all_user_history(req: ClearAllUserHistoryRequest):
    user_prefix = f"{req.session_id}_"

    if DATABASE_URL:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM message_store WHERE session_id LIKE %s",
            (user_prefix + "%",),
        )

        deleted = cursor.rowcount
        conn.commit()
        conn.close()

    else:
        conn = sqlite3.connect("chat_history.db")
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM message_store WHERE session_id LIKE ?",
            (user_prefix + "%",),
        )

        deleted = cursor.rowcount
        conn.commit()
        conn.close()

    print(f"🧹 Cleared ALL history for user: {req.session_id} ({deleted} rows)")

    return {
        "status": "cleared",
        "deleted_rows": deleted,
        "user": req.session_id,
    }
