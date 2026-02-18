# backend/streak.py
import sqlite3
import os
import psycopg2
from datetime import date, timedelta

# -----------------------------
# CONFIG
# -----------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
DB_PATH = "chat_history.db"
MIN_CHAT_FOR_STREAK = 10


# -----------------------------
# HELPERS
# -----------------------------
def db_connect():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    else:
        return sqlite3.connect(DB_PATH)


def db_execute(cursor, query, params):
    if DATABASE_URL:
        query = query.replace("?", "%s")
    cursor.execute(query, params)


def update_streak(user_id: str):
    conn = db_connect()
    cursor = conn.cursor()

    today = date.today().isoformat()

    db_execute(
        cursor,
        """
        SELECT current_streak, longest_streak, chat_count, last_activity_date
        FROM user_streak
        WHERE user_id=?
    """,
        (user_id,),
    )
    row = cursor.fetchone()

    if row is None:
        db_execute(
            cursor,
            """
            INSERT INTO user_streak
            (user_id, current_streak, longest_streak, last_activity_date, chat_count)
            VALUES (?, ?, ?, ?, ?)
        """,
            (user_id, 0, 0, today, 1),
        )
        conn.commit()
        conn.close()
        return

    current, longest, chat_count, last_date = row
    last_date_obj = date.fromisoformat(last_date)
    today_obj = date.fromisoformat(today)

    if last_date != today:
        if today_obj - last_date_obj > timedelta(days=1):
            current = 0
        chat_count = 0

    chat_count += 1

    if chat_count == MIN_CHAT_FOR_STREAK:
        current += 1
        longest = max(longest, current)

    db_execute(
        cursor,
        """
        UPDATE user_streak
        SET current_streak=?, longest_streak=?, last_activity_date=?, chat_count=?
        WHERE user_id=?
    """,
        (current, longest, today, chat_count, user_id),
    )

    conn.commit()
    conn.close()
