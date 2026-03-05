import { useState } from "react";
import { linkBackend } from "../config";

export default function useStreak(sessionId) {
  const [streak, setStreak] = useState({
    current_streak: 0,
    longest_streak: 0,
    chat_count: 0,
  });

  const updateStreak = async () => {
    try {
      await fetch(`${linkBackend}/user/update-streak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch (err) {
      console.error("Failed update streak", err);
    }
  };

  const fetchStreak = async () => {
    try {
      const res = await fetch(`${linkBackend}/user/streak/${sessionId}`);
      const data = await res.json();
      setStreak(data);
    } catch (err) {
      console.error("Failed to fetch streak:", err);
    }
  };

  return {
    streak,
    updateStreak,
    fetchStreak,
  };
}
