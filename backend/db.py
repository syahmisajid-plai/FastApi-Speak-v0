import os
import sqlite3
import psycopg2
import time
from langchain_community.chat_message_histories import SQLChatMessageHistory

DATABASE_URL = os.getenv("DATABASE_URL")


def init_db():
    max_attempts = 5
    attempt = 0
    while attempt < max_attempts:
        try:
            if DATABASE_URL:
                print("🚀 Using PostgreSQL")
                conn = psycopg2.connect(DATABASE_URL)
            else:
                print("💻 Using SQLite")
                conn = sqlite3.connect("chat_history.db")
            break
        except psycopg2.OperationalError as e:
            print(f"Database not ready, retrying... ({attempt+1}/{max_attempts})", e)
            attempt += 1
            time.sleep(5)
    else:
        raise Exception("Cannot connect to the database")

    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_streak (
            user_id TEXT PRIMARY KEY,
            current_streak INTEGER,
            longest_streak INTEGER,
            last_activity_date TEXT,
            chat_count INTEGER
        )
        """
    )

    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS roleplay_sessions (
        session_key TEXT PRIMARY KEY,
        scenario_id INTEGER,
        goal TEXT,
        target_turn INTEGER,
        current_turn INTEGER,
        status TEXT,
        summary_sent INTEGER
    )
    """
    )

    conn.commit()
    conn.close()


def get_session_history(session_id: str):
    if DATABASE_URL:
        conn = DATABASE_URL
    else:
        conn = "sqlite:///chat_history.db"

    return SQLChatMessageHistory(session_id=session_id, connection_string=conn)


def get_db_connection():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    else:
        return sqlite3.connect("chat_history.db")


def create_roleplay_session(session_key, scenario_id, goal, target_turn):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        # PostgreSQL
        cursor.execute(
            """
            INSERT INTO roleplay_sessions
            (session_key, scenario_id, goal, target_turn, current_turn, status, summary_sent)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (session_key)
            DO UPDATE SET
                scenario_id = EXCLUDED.scenario_id,
                goal = EXCLUDED.goal,
                target_turn = EXCLUDED.target_turn,
                current_turn = 0,
                status = 'ongoing',
                summary_sent = 0
            """,
            (session_key, scenario_id, goal, target_turn, 0, "ongoing", 0),
        )
    else:
        # SQLite
        cursor.execute(
            """
            INSERT OR REPLACE INTO roleplay_sessions
            (session_key, scenario_id, goal, target_turn, current_turn, status, summary_sent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (session_key, scenario_id, goal, target_turn, 0, "ongoing", 0),
        )

    conn.commit()
    conn.close()


def get_roleplay_session(session_key):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            "SELECT * FROM roleplay_sessions WHERE session_key=%s",
            (session_key,),
        )
    else:
        cursor.execute(
            "SELECT * FROM roleplay_sessions WHERE session_key=?",
            (session_key,),
        )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "session_key": row[0],
        "scenario_id": row[1],
        "goal": row[2],
        "target_turn": row[3],
        "current_turn": row[4],
        "status": row[5],
        "summary_sent": row[6],
    }


def increment_turn(session_key):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            UPDATE roleplay_sessions
            SET current_turn = current_turn + 1
            WHERE session_key=%s
            """,
            (session_key,),
        )
    else:
        cursor.execute(
            """
            UPDATE roleplay_sessions
            SET current_turn = current_turn + 1
            WHERE session_key=?
            """,
            (session_key,),
        )

    conn.commit()
    conn.close()
