import { useState, useCallback } from "react";

import speakerSound from "../assets/speaker_enable.mp3";

export default function useAudioPermission() {
  const [micReady, setMicReady] = useState(false);
  const [micError, setMicError] = useState(null);

  const [speakerReady, setSpeakerReady] = useState(false);
  const [speakerError, setSpeakerError] = useState(null);

  const requestAudioPermission = useCallback(async () => {
    // ================= Microphone =================
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // stop langsung biar ga kebuka terus
      setMicReady(true);
      setMicError(null);
      console.log("🎤 Microphone permission granted");
    } catch (err) {
      console.error("❌ Microphone permission denied", err);
      setMicError("Microphone access is required.");
      return;
    }

    // ================= Speaker =================
    try {
      const audio = new Audio(speakerSound);

      await audio.play(); // unlock audio system

      setSpeakerReady(true);
      setSpeakerError(null);

      console.log("🔊 Speaker enabled (audio test)");
    } catch (err) {
      console.error("❌ Speaker error", err);
      setSpeakerError("Speaker failed to play audio.");
    }
  }, []);

  return {
    micReady,
    micError,
    speakerReady,
    speakerError,
    requestAudioPermission,
  };
}
