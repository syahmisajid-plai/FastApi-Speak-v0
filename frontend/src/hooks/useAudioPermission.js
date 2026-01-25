import { useState, useCallback } from "react";

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
      const utterance = new SpeechSynthesisUtterance("Speaker enabled");
      utterance.lang = "en-US";

      const voices = speechSynthesis.getVoices();
      const voice =
        voices.find((v) => v.name === "Google US English") || voices[0];
      utterance.voice = voice;

      speechSynthesis.speak(utterance);
      setSpeakerReady(true);
      console.log("🔊 Speaker enabled");
    } catch (err) {
      console.error("❌ Speaker error", err);
      setSpeakerError("Speaker access is required to play sound.");
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
