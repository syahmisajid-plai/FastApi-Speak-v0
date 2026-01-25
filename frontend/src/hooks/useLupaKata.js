import { useState, useRef } from "react";

export default function useLupaKata({
  stopMainRecording,
  resumeMainRecording,
  setChatHistory,
  onLupaKataResult,
}) {
  const [isLupaKataActive, setIsLupaKataActive] = useState(false);
  const [isProcessingLupaKata, setIsProcessingLupaKata] = useState(false);
  const [lupaKataHeardText, setLupaKataHeardText] = useState("");

  const wasRecordingRef = useRef(false);

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

    if (wasRecordingRef.current) {
      wasRecordingRef.current = false;
      resumeMainRecording?.();
    }
  };

  /* ================= WHISPER ================= */
  const sendAudioToWhisper = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, "lupakata.webm");

    const res = await fetch(
      "https://fastapi-speak-v0-production.up.railway.app/api/stt-whisper",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) {
      setIsProcessingLupaKata(false);
      setIsLupaKataActive(false);
      return;
    }

    const data = await res.json();
    if (!data.text) return;

    setLupaKataHeardText(data.text);

    setTimeout(() => translateLupaKata(data.text), 800);
  };

  /* ================= START ================= */
  const startLupaKata = async (isMainRecording) => {
    if (isLupaKataActive) return; // 🛑 GUARD

    setLupaKataHeardText("");

    if (isMainRecording) {
      wasRecordingRef.current = true;
      stopMainRecording?.();
    }

    setIsLupaKataActive(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 4000);

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunks, { type: "audio/webm" });
      if (!blob.size) return;

      setIsProcessingLupaKata(true);
      await sendAudioToWhisper(blob);
    };
  };

  return {
    isLupaKataActive,
    isProcessingLupaKata,
    lupaKataHeardText,
    startLupaKata,
  };
}
