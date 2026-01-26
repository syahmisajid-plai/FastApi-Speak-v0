import sqlite3

conn = sqlite3.connect("chat_history.db")
cursor = conn.cursor()

cursor.execute(
    """
CREATE TABLE IF NOT EXISTS user_streak (
    user_id TEXT PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE
)
"""
)

conn.commit()
conn.close()

print("✅ user_streak table ready")
