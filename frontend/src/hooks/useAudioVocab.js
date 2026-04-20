// hooks/useAudioVocab.js
import { useState } from "react";
import { linkBackend } from "../config";

export default function useAudioVocab(user_id) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAudioUrl = async (word) => {
    setLoading(true);
    setError(null);

    console.log("[TTS AUDIO VOCAB REQUEST] word:", word);
    console.log(
      "[TTS AUDIO VOCAB REQUEST] url:",
      `${linkBackend}/audio/${word}`,
    );

    try {
      const res = await fetch(
        `${linkBackend}/audio/${word}?user_id=${user_id}`,
      );

      console.log("[TTS RESPONSE STATUS]:", res.status);

      const data = await res.json();
      console.log("[TTS AUDIO VOCAB RESPONSE DATA]:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to get audio");
      }

      return data.audio_url;
    } catch (err) {
      console.error("[TTS AUDIO VOCAB ERROR]:", err);
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
