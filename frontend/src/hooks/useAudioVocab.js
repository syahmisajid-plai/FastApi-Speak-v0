// hooks/useAudioVocab.js
import { useState } from "react";
import { linkBackend } from "../config";

export default function useAudioVocab() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAudioUrl = async (word) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${linkBackend}/audio/${word}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to get audio");
      }

      return data.audio_url;
    } catch (err) {
      console.error("Audio error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (word) => {
    const url = await getAudioUrl(word);

    if (!url) return;

    const audio = new Audio(url);
    audio.play();
  };

  return {
    getAudioUrl,
    playAudio,
    loading,
    error,
  };
}
