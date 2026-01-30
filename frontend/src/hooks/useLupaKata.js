import { useState, useRef, useEffect } from "react";

export default function useLupaKata({
  stopMainRecording,
  setChatHistory,
  onLupaKataResult,
}) {
  const [isLupaKataActive, setIsLupaKataActive] = useState(false);
  const [isProcessingLupaKata, setIsProcessingLupaKata] = useState(false);
  const [lupaKataHeardText, setLupaKataHeardText] = useState("");

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

    setIsProcessingLupaKata(false);
    setIsLupaKataActive(false);
  };

  /* ================= START LUPA KATA ================= */
  const startLupaKata = async (isMainRecording) => {
    if (isLupaKataActive) return;

    setLupaKataHeardText("");

    if (isMainRecording) {
      stopMainRecording?.();
    }

    if (!SpeechRecognition) {
      alert("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalText = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += t;
        } else {
          interim += t;
        }
      }

      setLupaKataHeardText(finalText + interim);
    };

    recognition.onend = () => {
      if (!finalText.trim()) {
        setIsLupaKataActive(false);
        return;
      }

      setIsProcessingLupaKata(true);
      translateLupaKata(finalText);
    };

    recognition.onerror = (e) => {
      console.error("LupaKata STT error:", e.error);
      setIsLupaKataActive(false);
    };

    recognitionRef.current = recognition;
    setIsLupaKataActive(true);
    recognition.start();
  };

  return {
    isLupaKataActive,
    isProcessingLupaKata,
    lupaKataHeardText,
    startLupaKata,
  };
}
