import { useRef, useState } from "react";
import { linkBackend } from "../config";

export default function useTTS_Google() {
  const audioCache = useRef(new Map());
  const currentAudioRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cleanupAudio = (audio) => {
    if (!audio) {
      console.log("🧹 cleanupAudio called but no audio");
      return;
    }

    console.log("🧹 cleanupAudio START");
    console.log("   paused:", audio.paused);
    console.log("   currentTime:", audio.currentTime);
    console.log("   readyState:", audio.readyState);
    console.log("   networkState:", audio.networkState);
    console.log("   src exists:", !!audio.src);

    try {
      audio.pause();
      audio.currentTime = 0;

      // 🔥 Important for iOS release
      audio.src = "";
      audio.load();

      console.log("🧹 cleanupAudio DONE");
    } catch (err) {
      console.error("❌ cleanupAudio error:", err);
    }
  };

  const speakText = async (text) => {
    if (!text) return;

    console.log("🔊 speakText called");
    console.log("Current speaking state:", isSpeaking);
    console.log("Existing audio ref:", currentAudioRef.current);

    try {
      let audio;

      if (audioCache.current.has(text)) {
        console.log("♻️ Using cached audio");
        audio = audioCache.current.get(text);
      } else {
        console.log("🌐 Fetching new TTS audio");

        const res = await fetch(`${linkBackend}/tts-stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        console.log("🎵 Created blob URL:", url);

        audio = new Audio(url);
        audioCache.current.set(text, audio);
      }

      currentAudioRef.current = audio;
      setIsSpeaking(true);

      console.log("▶️ About to play audio");
      console.log("   paused:", audio.paused);
      console.log("   readyState:", audio.readyState);

      audio.onplay = () => {
        console.log("🎧 audio onplay fired");
      };

      audio.onended = () => {
        console.log("🔚 audio onended fired");
        cleanupAudio(audio);
        currentAudioRef.current = null;
        setIsSpeaking(false);
      };

      audio.onerror = (e) => {
        console.error("🔥 audio error:", e);
      };

      audio.onpause = () => {
        console.log("⏸ audio paused");
      };

      await audio.play();

      console.log("✅ audio.play resolved");
    } catch (err) {
      console.error("❌ speakText error:", err);
      setIsSpeaking(false);
    }
  };

  const forceStop = () => {
    console.log("🛑 forceStop called");
    console.log("Current audio ref:", currentAudioRef.current);

    if (!currentAudioRef.current) {
      console.log("⚠️ No active audio to stop");
      return;
    }

    cleanupAudio(currentAudioRef.current);

    currentAudioRef.current = null;
    setIsSpeaking(false);

    console.log("🛑 forceStop finished");
  };

  return { speakText, isSpeaking, forceStop };
}
