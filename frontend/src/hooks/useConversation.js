// hooks/useConversation.js

import { useState } from "react";
import { linkBackend } from "../config";

export default function useConversation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [topics, setTopics] = useState([]);
  const [conversation, setConversation] = useState(null);

  const [conversationStage, setConversationStage] = useState("idle");

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

      console.log("CONVERSATION TOPICS:", result);

      setTopics(result.topics || []);

      return result.topics;
    } catch (err) {
      console.error(err);

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

      console.log("CONVERSATION:", result);

      setConversation(result.conversation);

      return result.conversation;
    } catch (err) {
      console.error(err);

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
  };
}
