import { useState } from "react";
import { linkBackend } from "../config";
import { getCurrentPhaseFromProgress } from "../utils/detectPhase";

export default function useDailyStory(
  sessionIdRef,
  userIdRef,
  userId,
  activePhase,
  setActivePhase,
  setChatHistory,
  setProgressData,
) {
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

  // ================== Load History ==================
  const loadDailyHistory = async (session) => {
    const sessionKey = `${session}_${userId}_daily_${today}`;

    try {
      const res = await fetch(
        `${linkBackend}/daily-story/history?session_id=${sessionKey}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const formatted = [];

      const phaseOrder = ["morning", "afternoon", "evening", "night"];

      // 🔥 ambil semua phase sampai activePhase
      const activeIndex = phaseOrder.indexOf(activePhase);
      const visiblePhases =
        activeIndex !== -1 ? phaseOrder.slice(0, activeIndex + 1) : phaseOrder; // fallback

      visiblePhases.forEach((phase) => {
        // divider phase (harus selalu pertama untuk setiap phase)
        formatted.push({
          type: "phase",
          phase,
        });

        // 🔥 ambil chat per phase
        const phaseMessages = (Array.isArray(data) ? data : []).filter(
          (msg) => msg.phase === phase,
        );

        // 🔥 MORNING SPECIAL CASE (HARUS SETELAH DIVIDER)
        if (phase === "morning") {
          formatted.push({
            type: "chat",
            sender: "AI",
            message:
              "Time to share your story today 😊. How did your morning start?",
          });
        }

        // 🔥 fallback greeting untuk phase lain
        if (phase !== "morning") {
          formatted.push({
            type: "chat",
            sender: "AI",
            message: `Hello, Good ${phase}! How’s your ${phase} going?`,
            isSystemGenerated: true,
          });
        }

        // 👉 render chat messages
        phaseMessages.forEach((msg) => {
          if (!msg.content) return;

          formatted.push({
            type: "chat",
            sender: msg.role === "human" ? "You" : "AI",
            message: msg.content,
          });
        });
      });

      setChatHistory(formatted);
    } catch (err) {
      console.error("Failed to load daily history:", err);
      setChatHistory([]);
    }
  };

  const checkIsDailyEmpty = async (session) => {
    const sessionKey = `${session}_${userId}_daily_${today}`;

    try {
      const res = await fetch(
        `${linkBackend}/daily-story/history?session_id=${sessionKey}`,
      );
      const data = await res.json();

      return !data || data.length === 0;
    } catch {
      return true;
    }
  };

  const fetchDailyProgress = async (sessionId, userId) => {
    try {
      const url = `${linkBackend}/daily-story/progress?session_id=${sessionId}&user_id=${userId}`;

      console.log("🌐 Fetching:", url);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      console.log("📥 Progress data:", data);

      // 🔥 set raw progress
      setProgressData(data);

      // 🔥 langsung set dailyStory (hindari loop!)
      setDailyStory(data);

      // 🔥 derive active phase
      const phase = getCurrentPhaseFromProgress(data);
      setActivePhase(phase);

      return data;
    } catch (err) {
      console.error("❌ Fetch progress error:", err);
      return null;
    }
  };

  const initDailySession = async ({ sessionId, userId }) => {
    const sessionKey = `${sessionId}_${userId}_daily_${today}`;
    console.log("sessionKey:", sessionKey);

    try {
      const res = await fetch(
        `${linkBackend}/daily-story/history?session_id=${sessionKey}`,
      );

      const data = await res.json();

      console.log("🔥 RAW DATA:", data);

      if (!data || data.length === 0) {
        // 🔥 return signal: perlu greeting
        return { type: "EMPTY" };
      }

      // 🔥 return signal: sudah ada chat
      return { type: "HAS_DATA" };
    } catch (err) {
      console.error(err);
      return { type: "ERROR" };
    }
  };

  const nextPhaseRequest = async (sessionId, userId) => {
    try {
      const res = await fetch(`${linkBackend}/daily-story/next_phase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      return data;
    } catch (err) {
      console.error("❌ Failed to move phase:", err);
      return null;
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
    loadDailyHistory,
    checkIsDailyEmpty,
    fetchDailyProgress,
    initDailySession,

    nextPhaseRequest,
  };
}
