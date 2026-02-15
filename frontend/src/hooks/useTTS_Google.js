import { useRef } from "react";
import { linkBackend } from "../config";

export default function useTTS_Google() {
  // Map untuk menyimpan audio per teks
  const audioCache = useRef(new Map());

  const speakText = async (text) => {
    if (!text) return;

    // Jika sudah ada di cache, langsung mainkan
    if (audioCache.current.has(text)) {
      audioCache.current.get(text).play();
      return;
    }

    try {
      // Request TTS dari backend
      const res = await fetch(`${linkBackend}/tts-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Cleanup object URL saat audio selesai
      audio.onended = () => URL.revokeObjectURL(audioUrl);

      // Simpan audio ke cache
      audioCache.current.set(text, audio);

      audio.play();
    } catch (err) {
      console.error("❌ speakText error:", err);
    }
  };

  return { speakText };
}
