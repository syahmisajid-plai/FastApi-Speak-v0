// hooks/useAudio.js
import { useState } from "react";
import { linkBackend } from "../config";

export default function useAudioVocab(user_id) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // WORD AUDIO
  // =========================
  const getWordAudioUrl = async (word) => {
    setLoading(true);
    setError(null);

    console.log("[WORD TTS REQUEST] word:", word);

    try {
      const res = await fetch(
        `${linkBackend}/audio/word/${encodeURIComponent(word)}?user_id=${user_id}`,
      );

      console.log("[WORD TTS RESPONSE STATUS]:", res.status);

      const data = await res.json();
      console.log("[WORD TTS RESPONSE]:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to get word audio");
      }

      return data.audio_url;
    } catch (err) {
      console.error("[WORD TTS ERROR]:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SENTENCE AUDIO
  // =========================
  const getSentenceAudioUrl = async (text) => {
    setLoading(true);
    setError(null);

    console.log("[SENTENCE TTS REQUEST] text:", text);

    try {
      const res = await fetch(
        `${linkBackend}/audio/sentence?text=${encodeURIComponent(text)}&user_id=${user_id}`,
      );

      console.log("[SENTENCE TTS RESPONSE STATUS]:", res.status);

      const data = await res.json();
      console.log("[SENTENCE TTS RESPONSE]:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to get sentence audio");
      }

      return data.audio_url;
    } catch (err) {
      console.error("[SENTENCE TTS ERROR]:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PLAY WORD
  // =========================
  const playWord = async (word) => {
    const url = await getWordAudioUrl(word);
    if (!url) return;

    const audio = new Audio(url);
    audio.play();
  };

  // =========================
  // PLAY SENTENCE
  // =========================
  const playSentence = async (text) => {
    const url = await getSentenceAudioUrl(text);
    if (!url) return;

    const audio = new Audio(url);
    audio.play();
  };

  return {
    getWordAudioUrl,
    getSentenceAudioUrl,
    playWord,
    playSentence,
    loading,
    error,
  };
}
