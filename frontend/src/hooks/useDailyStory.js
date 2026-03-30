import { useState } from "react";
import { linkBackend } from "../config";

export default function useDailyStory(sessionIdRef, userIdRef, userId) {
  const [dailyStory, setDailyStory] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
  });

  // console.log("userIdRef: ", userIdRef);

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

  // ✅ NEW: state streak
  const [streakDaily, setStreakDaily] = useState({
    current: 0,
    longest: 0,
    total_days: 0,
    last_date: null,
    today_done: false,
    status: "broken",
  });

  // =========================
  // ✅ FETCH STREAK
  // =========================
  const fetchStreakDaily = async () => {
    try {
      console.log("📤 Fetching streak...");
      console.log("👤 userIdRef:", userId);

      const url = `${linkBackend}/daily-story/streak?user_id=${userId}`;
      console.log("🌐 URL:", url);

      const res = await fetch(url);

      console.log("📡 Response status:", res.status);
      console.log("📡 Response ok:", res.ok);

      const text = await res.text();
      console.log("📦 RAW RESPONSE TEXT:", text);

      const data = JSON.parse(text);
      console.log("🔥 Parsed JSON:", data);

      if (data.status === "success") {
        setStreakDaily({
          current: data.current_streak,
          longest: data.longest_streak,
          total_days: data.total_active_days,
          last_date: data.last_active_date,
          today_done: data.streak_today_done,
          status: data.streak_status,
        });
      }

      return data;
    } catch (err) {
      console.error("❌ Fetch streak error:", err);
      return { status: "error", message: err.message };
    }
  };

  return {
    dailyStory,
    toggleDailyPhase,
    markPhaseComplete,
    completedCount,

    // ✅ expose streak
    streakDaily,
    fetchStreakDaily,

    generateSummary,
  };
}
