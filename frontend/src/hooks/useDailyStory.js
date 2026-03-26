import { useState } from "react";
import { linkBackend } from "../config";

export default function useDailyStory(sessionIdRef, userIdRef) {
  const [dailyStory, setDailyStory] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
  });

  const toggleDailyPhase = (phase) => {
    setDailyStory((prev) => ({
      ...prev,
      [phase]: !prev[phase],
    }));
  };

  const markPhaseComplete = (phase) => {
    setDailyStory((prev) => ({
      ...prev,
      [phase]: true,
    }));
  };

  const completedCount = Object.values(dailyStory).filter(Boolean).length;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // YYYY-MM-DD

  const generateSummary = async () => {
    try {
      const payload = {
        user_name: sessionIdRef.current,
        user_id: userIdRef.current,
        story_date: today,
      };

      console.log("📤 Sending summary payload:", payload); // ✅ log payload

      const res = await fetch(`${linkBackend}/daily-story/summary/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: sessionIdRef.current,
          user_id: userIdRef.current,
          story_date: today,
        }),
      });

      const data = await res.json();
      console.log("📊 Summary response:", data);

      return data;
    } catch (err) {
      console.error("❌ Generate summary error:", err);
      return { status: "error", message: err.message };
    }
  };

  return {
    dailyStory,
    toggleDailyPhase,
    markPhaseComplete,
    completedCount,

    generateSummary,
  };
}
