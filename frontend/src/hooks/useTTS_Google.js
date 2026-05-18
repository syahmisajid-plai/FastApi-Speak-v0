import { useRef, useState } from "react";
import { linkBackend } from "../config";

export default function useTTS_Google(userIdRef, mode) {
  const audioCache = useRef(new Map());
  const currentAudioRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const MUTE_TTS = false; // 👈 ganti false kalau mau hidupkan lagi

  const audioUnlockedRef = useRef(false);

    // 🔓 Unlock audio for iOS / mobile browsers
  const unlockAudio = async () => {
    if (audioUnlockedRef.current) {
      console.log("🔓 Audio already unlocked");
      return;
    }

    try {
      console.log("🔓 Unlocking audio...");

      const silentAudio = new Audio();

      // tiny silent wav
      silentAudio.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEA";

      silentAudio.playsInline = true;
      silentAudio.muted = true;

      await silentAudio.play();

      silentAudio.pause();
      silentAudio.currentTime = 0;

      audioUnlockedRef.current = true;

      console.log("✅ Audio unlocked");
    } catch (err) {
      console.error("❌ unlockAudio failed:", err);
    }
  };

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
      // audio.src = "";
      // audio.load();

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
        const cachedUrl = audioCache.current.get(text);

audio = new Audio(cachedUrl);
      } else {
        console.log("🌐 Fetching new TTS audio");

        const payload = {
          text,
          user_id: userIdRef.current,
          mode: mode,
        };

        console.log("📤 TTS PAYLOAD:", payload);
        console.log("📤 user_id type:", userIdRef.current);
        console.log("📤 mode:", mode);

        const res = await fetch(`${linkBackend}/tts-stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        console.log("🎵 Created blob URL:", url);

        audioCache.current.set(text, url);
        audio = new Audio(url);
      }

      if (currentAudioRef.current) {
        cleanupAudio(currentAudioRef.current);
      }

      audio.preload = "auto";
      audio.playsInline = true;

      currentAudioRef.current = audio;
      setIsSpeaking(true);

      audio.onended = () => {
        console.log("🔚 audio onended fired");
        cleanupAudio(audio);
        currentAudioRef.current = null;
        setIsSpeaking(false);
      };

      audio.onerror = (e) => {
        console.error("🔥 audio error:", e);
        setIsSpeaking(false);
      };

      // 🚫 MODE TEST: JANGAN PLAY AUDIO
      if (MUTE_TTS) {
        console.log("🔇 TTS MUTED (testing mode), skipping audio.play()");

        // simulasi audio selesai
        setTimeout(() => {
          audio.onended && audio.onended();
        }, 500);

        return;
      }

      console.log("▶️ About to play audio");
      await audio.play();
      console.log("✅ audio.play resolved");
    } catch (err) {
      console.error("❌ PLAY ERROR");
      console.error("name:", err.name);
      console.error("message:", err.message);
      console.error(err);
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

  return { speakText, isSpeaking, forceStop, unlockAudio };
}
