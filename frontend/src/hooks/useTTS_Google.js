import { useRef, useState } from "react";
import { linkBackend } from "../config";

export default function useTTS_Google() {
  const audioCache = useRef(new Map());
  const currentAudioRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const MUTE_TTS = false; // 👈 ganti false kalau mau hidupkan lagi

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

    console.group("🔊 [TTS] speakText START");
    console.log("📄 Text:", text);
    console.log("📊 isSpeaking:", isSpeaking);
    console.log("🎧 currentAudioRef:", currentAudioRef.current);

    const startTime = performance.now();

    try {
      let audio;
      let url;

      // =========================
      // CACHE CHECK
      // =========================
      if (audioCache.current.has(text)) {
        console.log("♻️ Cache HIT");

        url = audioCache.current.get(text);
        audio = new Audio(url);
      } else {
        console.log("🌐 Cache MISS → Fetching TTS...");

        const fetchStart = performance.now();

        const res = await fetch(`${linkBackend}/tts-stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        console.log("📡 Fetch status:", res.status);
        console.log("📡 Headers:", Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status}`);
        }

        const blob = await res.blob();

        console.log("📦 Blob size:", blob.size, "bytes");
        console.log("📦 Blob type:", blob.type);

        url = URL.createObjectURL(blob);

        console.log("🎵 Blob URL created:", url);

        audioCache.current.set(text, url);

        console.log(
          "⏱ Fetch duration:",
          (performance.now() - fetchStart).toFixed(2),
          "ms",
        );

        audio = new Audio(url);
      }

      // =========================
      // AUDIO SETUP
      // =========================
      currentAudioRef.current = audio;
      setIsSpeaking(true);

      console.log("🎧 Audio object created");
      console.log("   readyState:", audio.readyState);
      console.log("   networkState:", audio.networkState);

      audio.onloadedmetadata = () => {
        console.log("📀 Metadata loaded");
        console.log("   duration:", audio.duration);
      };

      audio.oncanplay = () => {
        console.log("▶️ Audio can play");
      };

      audio.onplay = () => {
        console.log("▶️ Playback started");
      };

      audio.onended = () => {
        console.log("🔚 Playback ended");

        cleanupAudio(audio);
        currentAudioRef.current = null;
        setIsSpeaking(false);

        console.log(
          "⏱ Total play duration:",
          (performance.now() - startTime).toFixed(2),
          "ms",
        );

        console.groupEnd();
      };

      audio.onerror = (e) => {
        console.error("🔥 AUDIO ERROR");
        console.error("Event:", e);
        console.error("Audio src:", audio.src);
        console.error("readyState:", audio.readyState);
        console.error("networkState:", audio.networkState);

        setIsSpeaking(false);
        console.groupEnd();
      };

      // =========================
      // PLAY
      // =========================
      if (MUTE_TTS) {
        console.warn("🔇 TTS MUTED → skip play()");
        console.groupEnd();
        return;
      }

      console.log("▶️ Calling audio.play()...");

      await audio.play();

      console.log("✅ audio.play() SUCCESS");
    } catch (err) {
      console.error("❌ TTS ERROR");
      console.error("Message:", err.message);
      console.error("Full error:", err);

      console.groupEnd();
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
