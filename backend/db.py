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
    conn.commit()
    conn.close()


def get_session_history(session_id: str):
    if DATABASE_URL:
        conn = DATABASE_URL
    else:
        conn = "sqlite:///chat_history.db"

    return SQLChatMessageHistory(session_id=session_id, connection_string=conn)
