import { useState, useRef } from "react"; // ✅ tambahkan useRef
import api from "../api"; // axios instance

export default function ChatBubble({ chat }) {
  const [translated, setTranslated] = useState(null);
  const utteranceRef = useRef(null); // ref untuk menyimpan utterance

  const playAudio = (text) => {
    // ❗ Jika sedang ada suara, hentikan TTS
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      return; // berhenti di sini
    }

    const getVoices = () => {
      return new Promise((resolve) => {
        let voices = speechSynthesis.getVoices();
        if (voices.length) {
          resolve(voices);
          return;
        }
        speechSynthesis.onvoiceschanged = () => {
          voices = speechSynthesis.getVoices();
          resolve(voices);
        };
      });
    };

    const speakWithVoice = async (text, voiceName = "Google US English") => {
      const voices = await getVoices();
      const voice = voices.find((v) => v.name === voiceName) || voices[0];

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice.lang; // language is taken from the voice
      utterance.voice = voice;

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    };

    // Example: use "Google US English" or "Alex"
    speakWithVoice(text, "Google US English");
  };

  const toggleTranslate = async (text) => {
    if (translated) {
      // kalau sudah ada terjemahan, klik lagi untuk tutup
      setTranslated(null);
    } else {
      try {
        const res = await api.post("/api/translate", { text });
        setTranslated(res.data.translated);
      } catch (err) {
        console.error("Translate error:", err);
      }
    }
  };

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
