import {
  normalizeForTTS,
  splitSentences,
  waitForVoices,
} from "../utils/ttsUtils";

export default function useTTS() {
  const speakText = async (text) => {
    console.log("🔊 speakText called:", {
      text,
      textLength: text?.length,
    });

    if (!text) {
      console.warn("⛔ speakText aborted", {
        reason: !text ? "NO_TEXT" : "SPEAKER_NOT_READY",
      });
      return;
    }

    // 🔥 HARD RESET (WAJIB)
    speechSynthesis.cancel();
    await new Promise((r) => setTimeout(r, 120));

    const voices = await waitForVoices();
    if (!voices.length) {
      console.warn("❌ No TTS voices available");
      return;
    }

    const voice =
      voices.find((v) => v.name === "Google US English") || voices[0];

    const sentences = splitSentences(normalizeForTTS(text));

    const speakNext = () => {
      if (!sentences.length) return;

      const utterance = new SpeechSynthesisUtterance(sentences.shift());
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.95;

      utterance.onerror = (e) => {
        console.error("🟥 TTS error:", e);
      };

      utterance.onend = () => {
        // ⏱️ beri napas kecil antar kalimat
        setTimeout(speakNext, 80);
      };

      speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  return { speakText };
}
