import { useState, useEffect, useCallback } from "react";
import { linkBackend } from "../config";

export default function useSentenceLesson(userId, sentenceType) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // console.log("sentenceType ====== ", sentenceType);

  // 🔥 CHANGED: now full objects, not IDs
  const [completedLessons, setCompletedLessons] = useState([]);

  const fetchCompletedLessons = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `${linkBackend}/sentence-lessons/completed-lessons/${userId}`,
      );

      const json = await res.json();

      if (json.success) {
        setCompletedLessons(json.completed_lessons || []);
      } else {
        setCompletedLessons([]);
      }
    } catch (err) {
      console.log("❌ Fetch completed lessons error:", err);
      setCompletedLessons([]);
    }
  }, [userId]);

  const fetchLesson = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${linkBackend}/sentence-lessons/next/${userId}?function_type=${sentenceType}`,
      );

      const json = await res.json();

      if (json.success) {
        setLesson(json.data);
        // console.log("📦  Lessons Response:", lesson);
      } else {
        setLesson(null);
      }
    } catch (err) {
      console.log("❌ Fetch lesson error:", err);
      setLesson(null);
    } finally {
      setLoading(false);
    }
  }, [userId, sentenceType]);

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

      // 🔥 refresh both
      await fetchCompletedLessons();
      await fetchLesson();
    } catch (err) {
      console.log("❌ Complete lesson error:", err);
    }
  }, [userId, lesson, fetchLesson, fetchCompletedLessons]);

  useEffect(() => {
    fetchCompletedLessons();
    fetchLesson();
  }, [fetchCompletedLessons, fetchLesson]);

  return {
    lesson,
    loading,

    // 🔥 now FULL DATA, not IDs
    completedLessons,

    refetch: fetchLesson,
    completeLesson,
  };
}
