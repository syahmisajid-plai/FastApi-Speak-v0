# db.py
import os
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor

from psycopg2.extras import Json


import time
# from langchain_community.chat_message_histories import SQLChatMessageHistory

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

    if DATABASE_URL:
        print("Init for PostgreSQL")
        cursor.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
    else:
        print("Init for SQLite")
        # SQLite tidak perlu extension ini
        pass
    
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
            user_id UUID NOT NULL,
            story_date DATE,

            morning_completed INTEGER DEFAULT 0,
            afternoon_completed INTEGER DEFAULT 0,
            evening_completed INTEGER DEFAULT 0,
            night_completed INTEGER DEFAULT 0,

            PRIMARY KEY (user_id, story_date),

            CONSTRAINT fk_user
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
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

    # -----------------------------
    # NEW: USER
    # -----------------------------
    if DATABASE_URL:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,

                username VARCHAR(100),
                full_name VARCHAR(255),
                avatar_url TEXT,

                language_level VARCHAR(50),

                last_active_at TIMESTAMP,

                preferred_language VARCHAR(10) DEFAULT 'en',
                daily_reminder_time TIME,
                notification_enabled BOOLEAN DEFAULT TRUE,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

    if DATABASE_URL:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_story_summary (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                story_date DATE NOT NULL,

                morning_summary TEXT,
                afternoon_summary TEXT,
                evening_summary TEXT,
                night_summary TEXT,

                key_points JSONB,
                vocab_used JSONB,
                mistakes JSONB,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT unique_user_story_date UNIQUE (user_id, story_date)
            );
        """)

    # # -----------------------------
    # # NEW: Message Store
    # # -----------------------------
    # cursor.execute(
    #     """
    #     CREATE TABLE IF NOT EXISTS message_store (
    #         id SERIAL PRIMARY KEY,
    #         user_id UUID NOT NULL,
    #         session_id TEXT,
    #         message TEXT,

    #         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    #         CONSTRAINT fk_message_user
    #             FOREIGN KEY (user_id)
    #             REFERENCES users(id)
    #             ON DELETE CASCADE
    #     )
    #     """
    # )

    # =========================
    # VOCAB TABLE
    # =========================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vocab (
            id INTEGER PRIMARY KEY,
            word TEXT NOT NULL UNIQUE,
            meaning TEXT NOT NULL,
            type TEXT NOT NULL,
            level TEXT NOT NULL
        )
    """)

    # =========================
    # VOCAB EXAMPLES TABLE
    # =========================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vocab_examples (
            id SERIAL PRIMARY KEY,
            vocab_id INTEGER NOT NULL,
            example TEXT NOT NULL,
            translation TEXT,
            FOREIGN KEY (vocab_id) REFERENCES vocab (id) ON DELETE CASCADE
        )
    """)

    # =========================
    # USER COMPLETED VOCAB TABLE
    # =========================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_completed_vocab (
            user_id TEXT NOT NULL,
            vocab_id INTEGER NOT NULL,
            status TEXT DEFAULT 'completed',

            PRIMARY KEY (user_id, vocab_id),
            FOREIGN KEY (vocab_id) REFERENCES vocab (id) ON DELETE CASCADE
        )
    """)

    # -----------------------------
    # NEW: Translation History
    # -----------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS translation_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID REFERENCES users(id) ON DELETE CASCADE,

        source_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,

        source_lang VARCHAR(10),
        target_lang VARCHAR(10),
            
        is_favorite BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # -----------------------------
    # NEW: USAGE LOGS (OPENAI + TTS)
    # -----------------------------
    # cursor.execute("""
    #     CREATE TABLE IF NOT EXISTS usage_logs (
    #         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    #         user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    #         service TEXT NOT NULL,
    #         endpoint TEXT NOT NULL,

    #         tokens_input INTEGER DEFAULT 0,
    #         tokens_output INTEGER DEFAULT 0,
    #         characters INTEGER DEFAULT 0,
    #         duration_seconds FLOAT,

    #         cost FLOAT NOT NULL,

    #         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    #     );
    # """)

    # -----------------------------
    # NEW: History Messages
    # -----------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversation_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        session_id TEXT NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,

        mode TEXT NOT NULL,              -- freetalk / daily / roleplay / vocab
        role TEXT NOT NULL,              -- user / assistant / system

        message TEXT NOT NULL,

        metadata JSONB DEFAULT '{}'::jsonb,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # -----------------------------
    # API USAGE LOGS (Monitoring Cost & Usage)
    # -----------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS api_usage_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id TEXT,

        endpoint TEXT,
        feature TEXT,
        method TEXT,

        status_code INT,
        duration_ms INT,

        tokens_input INT DEFAULT 0,
        tokens_output INT DEFAULT 0,

        characters INT DEFAULT 0,

        stt_cost FLOAT DEFAULT 0,
        llm_cost FLOAT DEFAULT 0,
        tts_cost FLOAT DEFAULT 0,

        total_cost FLOAT DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # -----------------------------
    # SENTENCE LESSONS (Core Learning System)
    # -----------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sentence_lessons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                   
        context TEXT NOT NULL,
        context_id TEXT,

        partner_utterance TEXT NOT NULL,

        key_expression TEXT NOT NULL,
        pattern_display TEXT NOT NULL,
                   
        insight TEXT,

        alternatives JSONB DEFAULT '[]'::jsonb,

        keywords JSONB DEFAULT '[]'::jsonb,

        function_type TEXT,
        tags JSONB DEFAULT '[]'::jsonb,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # -----------------------------
    # USER LESSON PROGRESS (Per Lesson Tracking)
    # -----------------------------
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID NOT NULL REFERENCES sentence_lessons(id) ON DELETE CASCADE,

        is_completed BOOLEAN DEFAULT FALSE,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(user_id, lesson_id)
    );
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


def get_random_scenario(category):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            SELECT * FROM scenarios
            WHERE LOWER(category) = LOWER(%s)
            ORDER BY RANDOM()
            LIMIT 1
            """,
            (category,),
        )
    else:
        cursor.execute(
            """
            SELECT * FROM scenarios
            WHERE LOWER(category) = LOWER(?)
            ORDER BY RANDOM()
            LIMIT 1
            """,
            (category,),
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

# def get_session_history(session_id: str):
#     if DATABASE_URL:
#         conn = DATABASE_URL
#     else:
#         conn = "sqlite:///chat_history.db"

#     return SQLChatMessageHistory(session_id=session_id, connection_string=conn)


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


def create_daily_story_session(session_key, user_id, story_date):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            INSERT INTO daily_story_sessions (session_key, user_id, story_date)
            VALUES (%s, %s, %s)
            ON CONFLICT DO NOTHING
            """,
            (session_key, user_id, story_date),
        )
    else:
        cursor.execute(
            """
            INSERT OR IGNORE INTO daily_story_sessions (session_key, user_id, story_date)
            VALUES (?, ?, ?)
            """,
            (session_key, user_id, story_date),
        )

    conn.commit()
    conn.close()


def get_daily_story_session(session_key, user_id, story_date):
    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:
        cursor.execute(
            """
            SELECT * FROM daily_story_sessions
            WHERE session_key=%s AND user_id=%s AND story_date=%s
            """,
            (session_key, user_id, story_date),
        )
    else:
        cursor.execute(
            """
            SELECT * FROM daily_story_sessions
            WHERE session_key=? AND user_id=? AND story_date=?
            """,
            (session_key, user_id, story_date),
        )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "user_id": row[0],
        "story_date": row[1],
        "morning_completed": row[2],
        "afternoon_completed": row[3],
        "evening_completed": row[4],
        "night_completed": row[5],
        "session_key": row[6],
    }


def complete_daily_story_phase(session_key, user_id, story_date, phase):
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
            WHERE session_key=%s AND user_id=%s AND story_date=%s
            """,
            (session_key, user_id, story_date),
        )
    else:
        cursor.execute(
            f"""
            UPDATE daily_story_sessions
            SET {column}=1
            WHERE session_key=? AND user_id=? AND story_date=?
            """,
            (session_key, user_id, story_date),
        )

    conn.commit()
    conn.close()

def get_daily_session(user_id, story_date):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM daily_story_sessions
        WHERE user_id = %s
        AND story_date = %s
    """, (user_id, story_date))

    row = cursor.fetchone()

    if not row:
        return None

    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))

def get_summary(user_id, story_date):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM daily_story_summary
        WHERE user_id = %s
        AND story_date = %s
    """, (user_id, story_date))

    row = cursor.fetchone()

    if not row:
        return None

    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))

import json

# def get_human_messages(session_prefix):
#     conn = get_db_connection()
#     cursor = conn.cursor()

#     cursor.execute(
#         """
#         SELECT message, session_id 
#         FROM message_store 
#         WHERE session_id LIKE %s
#         ORDER BY id ASC
#         """,
#         (session_prefix + "%",),
#     )


#     rows = cursor.fetchall()
#     conn.close()

#     human_messages = []

#     for r in rows:
#         try:
#             data = json.loads(r[0])
#             if data.get("type") != "human":
#                 continue  # skip AI messages

#             content = data.get("data", {}).get("content", "")

#             session_id = r[1]
#             # ambil phase dari session_id
#             parts = session_id.split("_")
#             phase = parts[-1] if len(parts) > 0 else None

#             human_messages.append({
#                 "type": "human",
#                 "data": {"content": content},
#                 "phase": phase,
#             })

#         except Exception as e:
#             print("Parse error:", e)

#     return human_messages

def get_human_messages(session_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT message, metadata
        FROM conversation_messages
        WHERE session_id LIKE %s
        AND role = 'user'
        ORDER BY created_at DESC
        LIMIT 20
        """,
        (session_id + "%",),
    )

    rows = cursor.fetchall()
    conn.close()

    rows = rows[::-1]  # balik ke urutan normal (old → new)

    human_messages = []

    for message, metadata in rows:
        try:
            phase = metadata.get("phase") if isinstance(metadata, dict) else None

            human_messages.append({
                "role": "user",
                "content": message,
                "phase": phase,
            })

        except Exception as e:
            print("Parse error:", e)

    return human_messages

def save_summary(user_id, story_date, summaries):
    """
    Save daily story summaries (per phase) to DB.

    summaries format:
    {
        "morning": "...",
        "afternoon": "...",
        "evening": "...",
        "night": "..."
    }
    """

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO daily_story_summary (
            user_id,
            story_date,
            morning_summary,
            afternoon_summary,
            evening_summary,
            night_summary
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (user_id, story_date)
        DO UPDATE SET
            morning_summary = EXCLUDED.morning_summary,
            afternoon_summary = EXCLUDED.afternoon_summary,
            evening_summary = EXCLUDED.evening_summary,
            night_summary = EXCLUDED.night_summary,
            updated_at = CURRENT_TIMESTAMP
    """, (
        user_id,
        story_date,
        summaries.get("morning"),
        summaries.get("afternoon"),
        summaries.get("evening"),
        summaries.get("night")
    ))

    conn.commit()

# def get_daily_history(session_prefix):
#     conn = get_db_connection()
#     cursor = conn.cursor()

#     cursor.execute(
#         """
#         SELECT message, session_id 
#         FROM message_store 
#         WHERE session_id LIKE %s
#         ORDER BY id ASC
#         """,
#         (session_prefix + "%",),
#     )


#     rows = cursor.fetchall()
#     conn.close()

#     history = []

#     for r in rows:
#         try:
#             data = json.loads(r[0])
#             role = data.get("type", "ai")
#             content = data.get("data", {}).get("content", "")

#             session_id = r[1]

#             # 🔥 ambil phase dari session_id
#             parts = session_id.split("_")
#             phase = parts[-1] if len(parts) > 0 else None

#             history.append({
#                 "role": role,
#                 "content": content,
#                 "phase": phase,  # ✅ INI YANG PENTING
#             })

#         except Exception as e:
#             print("Parse error:", e)

#     return history

def get_daily_history(session_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT role, message, metadata
        FROM conversation_messages
        WHERE session_id LIKE %s
        ORDER BY created_at ASC
        """,
        (session_id + "%",),
    )

    rows = cursor.fetchall()
    conn.close()

    history = []

    for role, message, metadata in rows:
        try:
            phase = metadata.get("phase") if metadata else None
            alternative = metadata.get("alternative") if metadata else None

            history.append({
                "role": role,
                "content": message,
                "phase": phase,
                "alternative":alternative,
            })

        except Exception as e:
            print("Parse error:", e)

    return history

def get_summary(user_id, story_date):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            morning_summary,
            afternoon_summary,
            evening_summary,
            night_summary
        FROM daily_story_summary
        WHERE user_id = %s AND story_date = %s
    """, (user_id, story_date))

    row = cursor.fetchone()

    if not row:
        return None

    return {
        "morning_summary": row[0],
        "afternoon_summary": row[1],
        "evening_summary": row[2],
        "night_summary": row[3],
    }

def get_available_dates(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT story_date
        FROM daily_story_summary
        WHERE user_id = %s
        ORDER BY story_date DESC
    """, (user_id,))

    rows = cursor.fetchall()

    return [row[0].strftime("%Y-%m-%d") for row in rows]

def get_user_for_login(username_or_email: str):

    conn = get_db_connection()

    # 🔥 DETECT DB TYPE
    if DATABASE_URL:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()

    query = """
        SELECT
            id,
            email,
            username,
            password_hash
        FROM users
        WHERE email = %s OR username = %s
        LIMIT 1;
    """

    cursor.execute(query, (username_or_email, username_or_email))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    # 🔥 NORMALIZE OUTPUT (biar selalu dict)
    if user and not isinstance(user, dict):
        user = {
            "id": user[0],
            "email": user[1],
            "username": user[2],
            "password_hash": user[3],
        }

    return user


def get_all_vocab():
    conn = get_db_connection()
    cursor = conn.cursor()

    # =========================
    # JOIN vocab + examples + translation
    # =========================
    cursor.execute("""
        SELECT 
            v.id,
            v.word,
            v.meaning,
            v.type,
            v.level,
            ve.example,
            ve.translation
        FROM vocab v
        LEFT JOIN vocab_examples ve
        ON v.id = ve.vocab_id
        ORDER BY v.id;
    """)

    rows = cursor.fetchall()
    conn.close()

    # =========================
    # transform ke format JSON
    # =========================
    vocab_map = {}

    for row in rows:
        vocab_id = row[0]

        if vocab_id not in vocab_map:
            vocab_map[vocab_id] = {
                "id": vocab_id,
                "word": row[1],
                "meaning": row[2],
                "type": row[3],
                "level": row[4],
                "examples": []
            }

        example = row[5]
        translation = row[6]

        if example:
            vocab_map[vocab_id]["examples"].append({
                "en": example,
                "id": translation if translation else ""
            })

    return list(vocab_map.values())

def mark_vocab(user_id: str, vocab_id: int, status: str = "completed"):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO user_completed_vocab (user_id, vocab_id, status)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, vocab_id)
            DO UPDATE SET status = EXCLUDED.status
        """, (user_id, vocab_id, status))

        conn.commit()

        return {
            "user_id": user_id,
            "vocab_id": vocab_id,
            "status": status
        }

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        conn.close()

def get_completed_vocab_ids(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT vocab_id, status
            FROM user_completed_vocab
            WHERE user_id = %s
        """, (user_id,))

        rows = cursor.fetchall()

        return [
            {
                "vocab_id": r[0],
                "status": r[1]
            }
            for r in rows
        ]

    finally:
        conn.close()

# =========================
# save_translation_history
# =========================
def save_translation_history(
    user_id: str,
    source_text: str,
    translated_text: str,
    source_lang: str,
    target_lang: str
):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO translation_history (
                user_id,
                source_text,
                translated_text,
                source_lang,
                target_lang
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            user_id,
            source_text,
            translated_text,
            source_lang,
            target_lang,
        ))

        row = cursor.fetchone()
        conn.commit()

        return row[0]

    except Exception as e:
        conn.rollback()
        print("❌ SAVE TRANSLATION ERROR:", e)
        return None

    finally:
        cursor.close()
        conn.close()


def get_translation_history(user_id: str, limit: int = 20, offset: int = 0):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                id,
                source_text,
                translated_text,
                is_favorite,
                created_at
            FROM translation_history
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s;
        """, (user_id, limit, offset))

        rows = cursor.fetchall()

        return [
            {
                "id": r[0],
                "source_text": r[1],
                "translated_text": r[2],
                "is_favorite": r[3],
                "created_at": r[4],
            }
            for r in rows
        ]

    finally:
        cursor.close()
        conn.close()


def update_translation_favorite(history_id: str, is_favorite: bool):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE translation_history
            SET is_favorite = %s
            WHERE id = %s
            RETURNING id
        """, (is_favorite, history_id))

        result = cursor.fetchone()
        conn.commit()

        return result is not None

    except Exception as e:
        conn.rollback()
        print("Error:", e)
        return False

    finally:
        cursor.close()
        conn.close()

def save_message(session_id, user_id, mode, role, message, metadata=None):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO conversation_messages
        (session_id, user_id, mode, role, message, metadata)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (session_id, user_id, mode, role, message, Json(metadata or {})),
    )

    conn.commit()
    conn.close()

def get_messages(session_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT role, message
        FROM conversation_messages
        WHERE session_id = %s
        ORDER BY created_at DESC
        LIMIT 10
        """,
        (session_id,),
    )

    rows = cursor.fetchall()
    conn.close()

    return rows[::-1]  # balik urutan

def clear_session_messages(session_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM conversation_messages
        WHERE session_id = %s
        """,
        (session_id,),
    )

    conn.commit()
    conn.close()

def insert_api_log(data):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO api_usage_logs (
            user_id,
            session_id,
            endpoint,
            feature,
            method,
            status_code,
            duration_ms,
            tokens_input,
            tokens_output,
            characters,
            stt_cost,
            llm_cost,
            tts_cost,
            total_cost
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data.get("user_id"),
            data.get("session_id"),
            data.get("endpoint"),
            data.get("feature"),
            data.get("method"),
            data.get("status_code"),
            data.get("duration_ms"),

            data.get("tokens_input", 0),
            data.get("tokens_output", 0),

            data.get("characters", 0),

            data.get("stt_cost", 0),
            data.get("llm_cost", 0),
            data.get("tts_cost", 0),

            data.get("total_cost", 0),
        ),
    )

    conn.commit()
    conn.close()

def get_user_cost_summary(): 
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            u.id AS user_id,
            u.full_name,

            COALESCE(SUM(a.stt_cost), 0) AS stt_cost,
            COALESCE(SUM(a.llm_cost), 0) AS llm_cost,
            COALESCE(SUM(a.tts_cost), 0) AS tts_cost,
            COALESCE(SUM(a.total_cost), 0) AS total_cost

        FROM api_usage_logs a
        JOIN users u ON a.user_id = u.id

        GROUP BY u.id, u.full_name
        ORDER BY total_cost DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "user_id": r[0],
            "full_name": r[1],
            "stt_cost": r[2],
            "llm_cost": r[3],
            "tts_cost": r[4],
            "total_cost": r[5],
        }
        for r in rows
    ]

def get_random_uncompleted_lesson(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            sl.id,
            sl.context,
            sl.context_id,
            sl.partner_utterance,
            sl.key_expression,
            sl.pattern_display,
            sl.insight,
            sl.alternatives,
            sl.keywords,
            sl.function_type,
            sl.tags
        FROM sentence_lessons sl
        LEFT JOIN user_lesson_progress ulp
            ON sl.id = ulp.lesson_id
            AND ulp.user_id = %s
        WHERE 
            ulp.is_completed IS NULL
            OR ulp.is_completed = FALSE
        ORDER BY RANDOM()
        LIMIT 1
    """, (user_id,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row[0],
        "context": row[1],
        "partner_utterance": row[2],
        "key_expression": row[3],
        "pattern_display": row[4],
        "insight": row[5],
        "alternatives": row[6],
        "keywords": row[7],
        "function_type": row[8],
        "tags": row[9],
    }

def mark_lesson_completed(user_id, lesson_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed)
        VALUES (%s, %s, TRUE)
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET
            is_completed = TRUE,
            updated_at = CURRENT_TIMESTAMP
    """, (user_id, lesson_id))

    conn.commit()
    conn.close()

    return {
        "user_id": user_id,
        "lesson_id": lesson_id,
        "status": "completed"
    }

def get_completed_lesson_ids(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT lesson_id
        FROM user_lesson_progress
        WHERE user_id = %s
        AND is_completed = TRUE
    """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    return [r[0] for r in rows]