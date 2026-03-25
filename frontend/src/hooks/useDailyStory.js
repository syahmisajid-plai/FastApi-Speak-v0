import { useState } from "react";

export default function useDailyStory(userId) {
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

  const generateSummary = async () => {
    try {
      const res = await fetch(`${linkBackend}/summary/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          story_date: new Date().toISOString().split("T")[0],
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
