import { useEffect, useRef, useState } from "react";
import { linkBackend } from "../config";

export default function useLupaKata({
  setChatHistory,
  onLupaKataResult,
  isSpeaking,
}) {
  const [isLupaKataActive, setIsLupaKataActive] = useState(false);
  const [lupaKataHeardText, setLupaKataHeardText] = useState("");

  const finalTextRef = useRef("");

  const recognitionRef = useRef(null);

  // ⬇️ TAMBAHKAN INI
  const wasRecordingBeforeLupaKataRef = useRef(false);
  const resumeMainRecordingRef = useRef(null);
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ================= TRANSLATE ================= */
  const translateLupaKata = async (indoText) => {
    try {
      const res = await fetch(`${linkBackend}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: indoText,
          source_lang: "id",
          target_lang: "en",
        }),
      });

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
    delayCloseLupaKata();
  };

  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const tryResumeRecording = () => {
    if (isSpeakingRef.current) {
      console.log("⛔ Masih speaking, tunda resume");
      return;
    }

    console.log("✅ Langsung resume (no need wait effect)");
    resumeMainRecordingRef.current?.();

    wasRecordingBeforeLupaKataRef.current = false;
  };

  useEffect(() => {
    if (!isSpeaking && wasRecordingBeforeLupaKataRef.current) {
      console.log("🎯 isSpeaking false → auto resume");

      resumeMainRecordingRef.current?.();
      wasRecordingBeforeLupaKataRef.current = false;
    }
  }, [isSpeaking]);

  /* ================= START ================= */
  const startLupaKata = (
    isMainRecording,
    pauseMainRecording,
    resumeMainRecording,
  ) => {
    if (!SpeechRecognition) return;

    // simpan status main recording
    wasRecordingBeforeLupaKataRef.current = isMainRecording;
    resumeMainRecordingRef.current = resumeMainRecording;

    if (isMainRecording && pauseMainRecording) {
      pauseMainRecording(); // ⬅️ pause main recording
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = true;
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
      delayCloseLupaKata();
      setLupaKataHeardText("");
      // Resume main recording kalau error
      tryResumeRecording();
    };

    recognition.onend = () => {
      if (wasRecordingBeforeLupaKataRef.current) {
        tryResumeRecording();
        // wasRecordingBeforeLupaKataRef.current = false;
      }
    };

    recognitionRef.current = recognition;
    setIsLupaKataActive(true);
    recognition.start();
  };

  /* ================= Delay ================= */
  const delayCloseLupaKata = () => {
    setTimeout(() => {
      setIsLupaKataActive(false);
    }, 2000); // ⬅️ extra 2 detik
  };

  /* ================= STOP ================= */
  const stopLupaKata = () => {
    recognitionRef.current?.stop();

    if (lupaKataHeardText.trim()) {
      translateLupaKata(lupaKataHeardText);
    } else {
      delayCloseLupaKata();
      setLupaKataHeardText("");
    }

    // ⚠️ Hanya resume main recording kalau sebelumnya record aktif
    if (wasRecordingBeforeLupaKataRef.current) {
      tryResumeRecording();
      // wasRecordingBeforeLupaKataRef.current = false;
    }
  };

  /* ================= TOGGLE ================= */
  const toggleLupaKata = (
    isMainRecording,
    pauseMainRecording,
    resumeMainRecording,
  ) => {
    if (!isLupaKataActive) {
      startLupaKata(isMainRecording, pauseMainRecording, resumeMainRecording);
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
