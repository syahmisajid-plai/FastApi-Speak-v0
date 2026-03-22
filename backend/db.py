# db.py
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

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS daily_story_sessions (
            session_key TEXT,
            story_date TEXT,
            morning_completed INTEGER DEFAULT 0,
            afternoon_completed INTEGER DEFAULT 0,
            evening_completed INTEGER DEFAULT 0,
            night_completed INTEGER DEFAULT 0,
            PRIMARY KEY (session_key, story_date)
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS scenarios (
            id SERIAL PRIMARY KEY,
            category TEXT,
            theme TEXT,
            difficulty TEXT,
            user_role TEXT,
            ai_role TEXT,
            situation TEXT,
            goal TEXT,
            target_turn INTEGER
        )
    """
    )

    # -----------------------------
    # SCENARIO CHECKLIST (UPDATED)
    # -----------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scenario_checklist (
            id SERIAL PRIMARY KEY,
            scenario_id INTEGER,
            step_key TEXT,
            description TEXT,
            step_order INTEGER,
            context_key TEXT
        )
    """)

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS scenario_checklist_keywords (
        id SERIAL PRIMARY KEY,
        scenario_id INT NOT NULL,
        step_key VARCHAR(50) NOT NULL,
        keyword VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """
    )

    # -----------------------------
    # NEW: SCENARIO CONTEXTS
    # -----------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scenario_contexts (
            id SERIAL PRIMARY KEY,
            scenario_id INTEGER NOT NULL,
            context_key TEXT NOT NULL,
            context_type TEXT,
            context_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)


    conn.commit()
    conn.close()


# {}

def get_keywords_by_scenario(scenario_id):
    conn = get_db_connection()  # sesuaikan dengan punyamu
    cur = conn.cursor()

    query = """
    SELECT step_key, keyword
    FROM scenario_checklist_keywords
    WHERE scenario_id = %s
    """

    cur.execute(query, (scenario_id,))
    rows = cur.fetchall()

    # mapping ke list of dict
    result = [
        {"step_key": row[0], "keyword": row[1]}
        for row in rows
    ]

    cur.close()
    conn.close()

    return result


def get_random_scenario(difficulty):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            SELECT * FROM scenarios
            WHERE LOWER(difficulty)=%s
            ORDER BY RANDOM()
            LIMIT 1
            """,
            (difficulty,),
        )
    else:
        cursor.execute(
            """
            SELECT * FROM scenarios
            WHERE LOWER(difficulty)=?
            ORDER BY RANDOM()
            LIMIT 1
            """,
            (difficulty,),
        )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row[0],
        "category": row[1],
        "theme": row[2],
        "difficulty": row[3],
        "user_role": row[4],
        "ai_role": row[5],
        "situation": row[6],
        "goal": row[7],
        "target_turn": row[8],
    }


def get_scenario_checklist(scenario_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            SELECT step_key, description, step_order, context_key
            FROM scenario_checklist
            WHERE scenario_id=%s
            ORDER BY step_order
            """,
            (scenario_id,),
        )
    else:
        cursor.execute(
            """
            SELECT step_key, description, step_order, context_key
            FROM scenario_checklist
            WHERE scenario_id=?
            ORDER BY step_order
            """,
            (scenario_id,),
        )

    rows = cursor.fetchall()
    conn.close()

    return [
    {
        "step_key": r[0],
        "description": r[1],
        "step_order": r[2],
        "context_key": r[3],  # 🔥 INI KUNCI
    }
    for r in rows
]


def get_scenario(scenario_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            SELECT * FROM scenarios
            WHERE id=%s
            """,
            (scenario_id,),
        )
    else:
        cursor.execute(
            """
            SELECT * FROM scenarios
            WHERE id=?
            """,
            (scenario_id,),
        )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row[0],
        "category": row[1],
        "theme": row[2],
        "difficulty": row[3],
        "user_role": row[4],
        "ai_role": row[5],
        "situation": row[6],
        "goal": row[7],
        "target_turn": row[8],
    }

import json


def get_contexts_by_scenario(scenario_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Detect placeholder (PostgreSQL vs SQLite)
    placeholder = "%s" if "psycopg2" in str(type(conn)) else "?"

    query = f"""
        SELECT context_key, context_type, context_data
        FROM scenario_contexts
        WHERE scenario_id = {placeholder}
    """

    cursor.execute(query, (scenario_id,))
    rows = cursor.fetchall()

    conn.close()

    results = []

    for row in rows:
        context_key = row[0]
        context_type = row[1]
        raw_data = row[2]

        # Parse JSON safely
        parsed_data = None
        if raw_data:
            try:
                parsed_data = json.loads(raw_data)
            except Exception:
                parsed_data = raw_data  # fallback kalau bukan JSON valid

        results.append({
            "context_key": context_key,
            "context_type": context_type,
            "context_data": parsed_data,
        })

    return results

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


def complete_roleplay(session_key):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            UPDATE roleplay_sessions
            SET status='completed'
            WHERE session_key=%s
            """,
            (session_key,),
        )
    else:
        cursor.execute(
            """
            UPDATE roleplay_sessions
            SET status='completed'
            WHERE session_key=?
            """,
            (session_key,),
        )

    conn.commit()
    conn.close()


def create_daily_story_session(session_key, story_date):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            INSERT INTO daily_story_sessions (session_key, story_date)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
            """,
            (session_key, story_date),
        )
    else:
        cursor.execute(
            """
            INSERT OR IGNORE INTO daily_story_sessions (session_key, story_date)
            VALUES (?, ?)
            """,
            (session_key, story_date),
        )

    conn.commit()
    conn.close()


def get_daily_story_session(session_key, story_date):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            SELECT * FROM daily_story_sessions
            WHERE session_key=%s AND story_date=%s
            """,
            (session_key, story_date),
        )
    else:
        cursor.execute(
            """
            SELECT * FROM daily_story_sessions
            WHERE session_key=? AND story_date=?
            """,
            (session_key, story_date),
        )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "session_key": row[0],
        "story_date": row[1],
        "morning_completed": row[2],
        "afternoon_completed": row[3],
        "evening_completed": row[4],
        "night_completed": row[5],
    }


def complete_daily_story_phase(session_key, story_date, phase):
    conn = get_db_connection()
    cursor = conn.cursor()

    column_map = {
        "morning": "morning_completed",
        "afternoon": "afternoon_completed",
        "evening": "evening_completed",
        "night": "night_completed",
    }

    column = column_map.get(phase)
    if not column:
        conn.close()
        return

    if DATABASE_URL:
        cursor.execute(
            f"""
            UPDATE daily_story_sessions
            SET {column}=1
            WHERE session_key=%s AND story_date=%s
            """,
            (session_key, story_date),
        )
    else:
        cursor.execute(
            f"""
            UPDATE daily_story_sessions
            SET {column}=1
            WHERE session_key=? AND story_date=?
            """,
            (session_key, story_date),
        )

    conn.commit()
    conn.close()
