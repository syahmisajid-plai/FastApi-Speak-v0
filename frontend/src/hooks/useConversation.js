// hooks/useConversation.js

import { useState } from "react";
import { linkBackend } from "../config";

export default function useConversation(userIdRef, updateUserProgress) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [topics, setTopics] = useState([]);
  const [conversation, setConversation] = useState(null);

  const [conversationStage, setConversationStage] = useState("idle");

  const [feedback, setFeedback] = useState(null);

  // =============================
  // GET ALL CONVERSATION TOPICS
  // =============================
  const getConversationTopics = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${linkBackend}/conversation/topics`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      // console.log("CONVERSATION TOPICS:", result);

      setTopics(result.topics || []);

      return result.topics;
    } catch (err) {
      // console.error(err);

      setTopics([]);
      setError(err.message || "Failed to fetch conversation topics");

      return [];
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // GET CONVERSATION DETAIL
  // =============================
  const getConversation = async (topicId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${linkBackend}/conversation/topics/${topicId}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      // console.log("CONVERSATION:", result);

      setConversation(result.conversation);

      return result.conversation;
    } catch (err) {
      // console.error(err);

      setConversation(null);
      setError(err.message || "Failed to fetch conversation");

      return null;
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // RESET
  // =============================
  const clearConversation = () => {
    setConversation(null);
  };

  // =============================
  // CHECK ANSWER
  // =============================
  const checkAnswer = (targetSentence, transcript) => {
    if (!transcript.trim()) {
      setFeedback(null);
      return;
    }

    const normalize = (text) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const expected = normalize(targetSentence);
    const spoken = normalize(transcript);

    // Levenshtein Distance
    const levenshtein = (a, b) => {
      const matrix = Array.from({ length: a.length + 1 }, () =>
        Array(b.length + 1).fill(0),
      );

      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;

          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost,
          );
        }
      }

      return matrix[a.length][b.length];
    };

    const distance = levenshtein(expected, spoken);

    const maxLength = Math.max(expected.length, spoken.length);

    const score = Math.round(((maxLength - distance) / maxLength) * 100);

    let message = "";

    if (score >= 95) {
      message = "Excellent!";
    } else if (score >= 85) {
      message = "Very good!";
    } else if (score >= 70) {
      message = "Good. Try to be more accurate.";
    } else if (score >= 50) {
      message = "Almost there. Try again.";
    } else {
      message = "Try again.";
    }

    setFeedback({
      score,
      correct: score >= 95,
      message,
    });
  };

  // =============================
  // RESET FEEDBACK
  // =============================
  const resetFeedback = () => {
    setFeedback(null);
  };

  // =============================
  // FINISH CONVERSATION
  // =============================
  const finishConversation = async () => {
    setConversation(null);
    setFeedback(null);
    setConversationStage("choice");

    const userId = userIdRef?.current;

    await updateUserProgress({
      user_id: userId,
      xp_gain: 15,
    });
  };

  return {
    loading,
    error,

    topics,
    conversation,

    getConversationTopics,
    getConversation,

    clearConversation,

    conversationStage,
    setConversationStage,

    feedback,

    checkAnswer,
    resetFeedback,

    finishConversation,
  };
}
