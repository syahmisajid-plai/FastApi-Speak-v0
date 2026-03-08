from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3
import psycopg2
import os

import json

router = APIRouter()

DATABASE_URL = os.getenv("DATABASE_URL")


class ClearAllUserHistoryRequest(BaseModel):
    session_id: str


def safe_content(raw):
    try:
        return json.loads(raw)["data"]["content"]
    except:
        return ""  # fallback jika kosong atau invalid


@router.get("/history")
def get_history(session_id: str):

    if DATABASE_URL:
        conn = psycopg2.connect(DATABASE_URL)
    else:
        conn = sqlite3.connect("chat_history.db")

    cursor = conn.cursor()

    cursor.execute(
        "SELECT message FROM message_store WHERE session_id=%s ORDER BY id ASC",
        (session_id,),
    )

    rows = cursor.fetchall()
    conn.close()

    history = []

    for r in rows:
        try:
            data = json.loads(r[0])
            role = data.get("type", "ai")
            content = data.get("data", {}).get("content", "")

            history.append({"role": role, "content": content})

        except Exception as e:
            print("Parse error:", e)

    return history


@router.post("/history/clear-all")
def clear_all_user_history(req: ClearAllUserHistoryRequest):
    user_prefix = f"{req.session_id}"

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
