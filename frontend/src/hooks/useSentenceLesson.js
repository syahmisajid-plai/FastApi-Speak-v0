import { useState, useEffect, useCallback } from "react";
import { linkBackend } from "../config";

export default function useSentenceLesson(userId) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLesson = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${linkBackend}/sentence-lessons/next/${userId}`);
      const json = await res.json();

      if (json.success) {
        setLesson(json.data);
      } else {
        setLesson(null);
      }
    } catch (err) {
      console.log("❌ Fetch lesson error:", err);
      setLesson(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // auto fetch saat pertama load / user berubah
  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return {
    lesson,
    loading,
    refetch: fetchLesson, // 🔥 untuk tombol "Next"
  };
}
