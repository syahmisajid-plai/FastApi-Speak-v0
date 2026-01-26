import sqlite3
from datetime import date, timedelta

DB_PATH = "chat_history.db"
MIN_CHAT_FOR_STREAK = 5


def update_streak(user_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    today = date.today().isoformat()

    cursor.execute(
        """
        SELECT current_streak, longest_streak, chat_count, last_activity_date
        FROM user_streak
        WHERE user_id=?
        """,
        (user_id,),
    )
    row = cursor.fetchone()

    if row is None:
        cursor.execute(
            """
            INSERT INTO user_streak
            (user_id, current_streak, longest_streak, last_activity_date, chat_count)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, 0, 0, today, 1),
        )
    else:
        current, longest, chat_count, last_date = row

        # ganti hari
        if last_date != today:
            if date.fromisoformat(today) - date.fromisoformat(last_date) > timedelta(
                days=1
            ):
                current = 0
            chat_count = 0  # reset progress harian

        # 🚫 kalau hari ini streak sudah didapat (chat_count == 0 & last_date == today)
        if last_date == today and chat_count == 0:
            # jangan nambah progress lagi
            pass
        else:
            chat_count += 1

        # naik streak hanya kalau:
        # - baru hari ini
        # - chat_count >= 5
        if chat_count >= MIN_CHAT_FOR_STREAK and last_date != today:
            current += 1
            longest = max(longest, current)
            chat_count = 0  # tandai streak hari ini sudah diambil

        cursor.execute(
            """
            UPDATE user_streak
            SET current_streak=?, longest_streak=?, last_activity_date=?, chat_count=?
            WHERE user_id=?
            """,
            (current, longest, today, chat_count, user_id),
        )

    conn.commit()
    conn.close()
