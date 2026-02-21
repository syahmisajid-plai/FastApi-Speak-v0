import { useRef, useState } from "react";
import { linkBackend } from "../config";

export default function useTTS_Google() {
  const audioCache = useRef(new Map());
  const currentAudioRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cleanupAudio = (audio) => {
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    // 🔥 penting untuk iOS release
    audio.src = "";
    audio.load();
  };

  const speakText = async (text) => {
    if (!text) return;

    try {
      let audio;

      if (audioCache.current.has(text)) {
        audio = audioCache.current.get(text);
      } else {
        const res = await fetch(`${linkBackend}/tts-stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        audio = new Audio(url);
        audioCache.current.set(text, audio);
      }

      currentAudioRef.current = audio;
      setIsSpeaking(true);

      audio.onended = () => {
        cleanupAudio(audio);
        currentAudioRef.current = null;
        setIsSpeaking(false);
      };

      await audio.play();
    } catch (err) {
      console.error("❌ speakText error:", err);
      setIsSpeaking(false);
    }
  };

  // 🔴 INI YANG KITA BUTUHKAN
  const forceStop = () => {
    if (!currentAudioRef.current) return;

    console.log("🔊 Force stopping TTS");

    cleanupAudio(currentAudioRef.current);
    currentAudioRef.current = null;
    setIsSpeaking(false);
  };

  return { speakText, isSpeaking, forceStop };
}
