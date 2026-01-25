import {
  normalizeForTTS,
  splitSentences,
  waitForVoices,
} from "../utils/ttsUtils";

export default function useTTS({ speakerReady }) {
  const speakText = async (text) => {
    if (!text || !speakerReady) return;

    const voices = await waitForVoices();
    const voice =
      voices.find((v) => v.name === "Google US English") || voices[0];

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const sentences = splitSentences(normalizeForTTS(text));

    const speakNext = () => {
      if (!sentences.length) return;
      const utterance = new SpeechSynthesisUtterance(sentences.shift());
      utterance.lang = voice.lang;
      utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.onend = speakNext;
      speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  return { speakText };
}
