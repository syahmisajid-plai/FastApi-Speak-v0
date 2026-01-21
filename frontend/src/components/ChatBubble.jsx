import { useState, useRef } from "react"; // ✅ tambahkan useRef
import api from "../api"; // axios instance

export default function ChatBubble({ chat }) {
  const [translated, setTranslated] = useState(null);
  const utteranceRef = useRef(null); // ref untuk menyimpan utterance

  const normalizeForTTS = (text) =>
    text
      .replace(/\s+/g, " ")
      .replace(/\n+/g, ". ")
      .replace(/([!?])+/g, ".")
      .trim();

  const playAudio = (text) => {
    if (!text) return;

    // ❗ stop suara sebelumnya
    speechSynthesis.cancel();

    const getVoices = () =>
      new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length) return resolve(voices);
        speechSynthesis.onvoiceschanged = () =>
          resolve(speechSynthesis.getVoices());
      });

    const speakWithVoice = async () => {
      const voices = await getVoices();
      const voice =
        voices.find((v) => v.name === "Google US English") || voices[0];

      const utterance = new SpeechSynthesisUtterance(normalizeForTTS(text));

      utterance.lang = voice.lang;
      utterance.voice = voice;
      utterance.rate = 0.95;

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    };

    speakWithVoice();
  };

  /* =====================================================
     🟢 HELPER / LUPA KATA (INLINE CHAT)
  ===================================================== */
  if (chat.sender === "Helper") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] p-3 rounded-lg bg-emerald-100 text-gray-900 shadow text-sm">
          {/* PROMPT */}
          {chat.type === "prompt" && (
            <div className="italic">{chat.message}</div>
          )}

          {/* RESULT */}
          {chat.type === "result" && (
            <div className="space-y-1">
              <div>🇮🇩 {chat.indo}</div>
              <div className="font-semibold">🇬🇧 {chat.english}</div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => playAudio(chat.english)}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  🔊 Play
                </button>

                <button
                  onClick={() => {
                    // opsional: masukkan ke chat sebagai user input
                    console.log("Use this:", chat.english);
                  }}
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  ➕ Pakai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        chat.sender === "You" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] p-3 rounded-lg relative ${
          chat.sender === "You"
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        }`}
      >
        {chat.message}

        {/* Tombol hanya untuk AI */}
        {chat.sender === "AI" && (
          <>
            <button
              onClick={() => playAudio(chat.message)}
              className="absolute bottom-1 right-1 text-xs bg-gray-300 px-2 py-0.5 rounded hover:bg-gray-400"
            >
              🔊
            </button>

            <button
              onClick={() => toggleTranslate(chat.message)}
              className="absolute top-1 right-1 text-xs bg-gray-300 px-2 py-0.5 rounded hover:bg-gray-400"
            >
              🌐
            </button>
          </>
        )}

        {/* Hasil terjemahan */}
        {translated && chat.sender === "AI" && (
          <div className="mt-2 text-xs italic text-green-700">{translated}</div>
        )}
      </div>
    </div>
  );
}
