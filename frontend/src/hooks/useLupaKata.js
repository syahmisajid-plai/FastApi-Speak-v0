import { useEffect, useRef, useState } from "react";
import { linkBackend } from "../config";

export default function useLupaKata({
  setChatHistory,
  onLupaKataResult,
  isSpeaking,
  userIdRef,
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
      const userId = userIdRef?.current;
      const res = await fetch(`${linkBackend}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: indoText,
          source_lang: "id",
          target_lang: "en",
          user_id: userId,
        }),
      });

      const data = await res.json();

      setChatHistory((prev) => [
        ...prev.filter((c) => !(c.sender === "Helper" && c.type === "prompt")),
        {
          sender: "Helper",
          type: "result",
          indo: data.source, // ✅ FIX
          english: data.translated, // ✅ FIXX

          history_id: data.history_id,
          is_favorite: false,
        },
      ]);

      if (data.translated) {
        onLupaKataResult?.(data.translated);
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
    if (!isSpeakingRef.current) {
      console.log("⛔ Masih speaking, tunda resume");
      return;
    } else {
      console.log("⛔ ============ ULULULULU ============");
    }

    console.log("⏳ Delay 0.5 detik sebelum resume");

    setTimeout(() => {
      console.log("✅ Resume setelah delay");
      resumeMainRecordingRef.current?.();
      wasRecordingBeforeLupaKataRef.current = false;
    }, 500);
  };

  useEffect(() => {
    if (!isSpeaking && wasRecordingBeforeLupaKataRef.current) {
      console.log("🎯 isSpeaking false → auto resume (delay 0.5s)");

      const timeout = setTimeout(() => {
        resumeMainRecordingRef.current?.();
        wasRecordingBeforeLupaKataRef.current = false;
        console.log("✅ Auto resume setelah delay");
      }, 500);

      return () => clearTimeout(timeout); // cleanup biar aman
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

    const text = lupaKataHeardText.trim();

    // 🔥 1. LANGSUNG UPDATE UI (INI KUNCI)
    setLupaKataHeardText("");
    setIsLupaKataActive(false); // ⬅️ langsung close, JANGAN delay

    // 🔥 2. BARU PROSES TRANSLATE
    if (text) {
      translateLupaKata(text);
    }

    // 🔥 3. Resume recording
    if (wasRecordingBeforeLupaKataRef.current) {
      tryResumeRecording();
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
