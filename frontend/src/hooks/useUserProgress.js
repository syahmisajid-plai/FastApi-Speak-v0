// hooks/useUserProgress.js

import { useState, useRef, useEffect } from "react";
import { linkBackend } from "../config";

import correctAnswer2 from "../assets/sound/delon_boomkin-notification-correct-answer-447601.mp3";

export default function useUserProgress({ userIdRef, onXpGain }) {
  //   console.log("userIdRef :", userIdRef);
  const [progress, setProgress] = useState({
    level: 1,
    xp: 0,
    title_level: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const correctSound = useRef(null);

  useEffect(() => {
    correctSound.current = new Audio(correctAnswer2);

    return () => {
      if (correctSound.current) {
        correctSound.current.pause();
        correctSound.current.src = "";
        correctSound.current.load();
      }
    };
  }, []);

  // =============================
  // GET USER PROGRESS
  // =============================
  const fetchUserProgress = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${linkBackend}/progress/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      console.log("PROGRESS RESPONSE:", result);

      const userProgress = {
        level: result.progress?.level ?? 1,
        xp: result.progress?.xp ?? 0,
        title_level: result.progress?.title_level ?? 1,
      };

      setProgress(userProgress);

      return userProgress;
    } catch (err) {
      setError(err.message || "Failed to fetch user progress");

      return null;
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // ADD USER XP
  // =============================
  const updateUserProgress = async ({ user_id, xp_gain, mode = null }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${linkBackend}/progress/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          xp_gain,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      if (result.progress) {
        setProgress({
          level: result.progress.level ?? 1,
          xp: result.progress.xp ?? 0,
          title_level: result.progress.title_level ?? 1,
        });
      }

      // gunakan XP yang benar-benar diberikan backend
      const actualXp = result.progress?.xp_gain ?? 0;

      if (actualXp > 0) {
        if (correctSound.current) {
          correctSound.current.currentTime = 0;
          correctSound.current.play().catch(() => {});
        }

        onXpGain?.(actualXp);
      }

      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    // object progress
    // progress,

    // shortcut
    level: progress.level,
    xp: progress.xp,
    title_level: progress.title_level,

    // status
    loading,
    error,

    // functions
    fetchUserProgress,
    updateUserProgress,
  };
}
