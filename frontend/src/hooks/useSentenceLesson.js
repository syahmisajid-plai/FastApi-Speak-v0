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

      console.log("📦 API Response:", json);

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

  // 🔥 MARK COMPLETED + NEXT
  const completeLesson = useCallback(async () => {
    if (!userId || !lesson) return;

    try {
      await fetch(`${linkBackend}/sentence-lessons/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          lesson_id: lesson.id,
        }),
      });

      console.log("✅ Lesson completed:", lesson.id);

      // 🔥 ambil lesson berikutnya
      await fetchLesson();
    } catch (err) {
      console.log("❌ Complete lesson error:", err);
    }
  }, [userId, lesson, fetchLesson]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return {
    lesson,
    loading,
    refetch: fetchLesson,
    completeLesson, // 🔥 NEW
  };
}
