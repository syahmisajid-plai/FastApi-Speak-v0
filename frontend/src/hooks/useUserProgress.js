// hooks/useUserProgress.js

import { useState } from "react";
import { linkBackend } from "../config";

export const useUserProgress = ({ userIdRef }) => {
  const [progress, setProgress] = useState({
    level: 1,
    xp: 0,
    title_level: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  const updateUserProgress = async ({ user_id, xp_gain }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${linkBackend}/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          user_id,
          xp_gain,
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

      return result;
    } catch (err) {
      setError(err.message || "Failed to add user XP");

      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    // object progress
    progress,

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
};
