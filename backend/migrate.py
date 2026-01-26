import sqlite3

conn = sqlite3.connect("chat_history.db")
cursor = conn.cursor()

cursor.execute("ALTER TABLE user_streak ADD COLUMN chat_count INTEGER DEFAULT 0;")

conn.commit()
conn.close()

print("✅ Column chat_count added successfully")
