// utils/ttsUtils.js
export const normalizeForTTS = (text) =>
  text.replace(/\s+/g, " ").replace(/\n+/g, ". ").trim();

export const splitSentences = (text) => text.match(/[^.!?]+[.!?]+/g) || [text];

export const waitForVoices = () =>
  new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    speechSynthesis.onvoiceschanged = () =>
      resolve(speechSynthesis.getVoices());
  });
