import { useState, useRef } from "react";

export default function useLupaKata({
  stopMainRecording,
  setChatHistory,
  onLupaKataResult,
}) {
  const [isLupaKataActive, setIsLupaKataActive] = useState(false);
  const [lupaKataHeardText, setLupaKataHeardText] = useState("");

  const finalTextRef = useRef("");

  const recognitionRef = useRef(null);
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ================= TRANSLATE ================= */
  const translateLupaKata = async (indoText) => {
    try {
      const res = await fetch(
        "https://fastapi-speak-v0-production.up.railway.app/translate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: indoText,
            source_lang: "id",
            target_lang: "en",
          }),
        },
      );

      const data = await res.json();

      setChatHistory((prev) => [
        ...prev.filter((c) => !(c.sender === "Helper" && c.type === "prompt")),
        {
          sender: "Helper",
          type: "result",
          indo: data.indo,
          english: data.english,
        },
      ]);

      if (data.english) {
        onLupaKataResult?.(data.english);
      }
    } catch (err) {
      console.error("❌ Translate error:", err);
    }

    // clear setelah kirim
    setLupaKataHeardText("");
    setIsLupaKataActive(false);
  };

  /* ================= START ================= */
  const startLupaKata = (isMainRecording) => {
    if (!SpeechRecognition) {
      alert("SpeechRecognition not supported");
      return;
    }

    if (isMainRecording) {
      stopMainRecording?.();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = true; // 🔑 jangan auto-end
    recognition.interimResults = true;

    finalTextRef.current = "";

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTextRef.current += t + " ";
        } else {
          interim += t;
        }
      }

      setLupaKataHeardText(finalTextRef.current + interim);
    };

    recognition.onerror = (e) => {
      console.error("LupaKata STT error:", e.error);
      setIsLupaKataActive(false);
      setLupaKataHeardText("");
    };

    recognitionRef.current = recognition;
    setIsLupaKataActive(true);
    recognition.start();
  };

  /* ================= STOP ================= */
  const stopLupaKata = () => {
    recognitionRef.current?.stop();

    if (lupaKataHeardText.trim()) {
      translateLupaKata(lupaKataHeardText);
    } else {
      setIsLupaKataActive(false);
      setLupaKataHeardText("");
    }
  };

  /* ================= TOGGLE ================= */
  const toggleLupaKata = (isMainRecording) => {
    if (!isLupaKataActive) {
      startLupaKata(isMainRecording);
    } else {
      stopLupaKata();
    }
  };

  return {
    isLupaKataActive,
    lupaKataHeardText,
    toggleLupaKata, // ⬅️ INI dipakai tombol
  };
}
