import { useEffect, useRef, useState } from "react";

export default function useSpeechRecognition({
  recognitionRef,
  setIsRecording,
  shouldSendOnEndRef,
  onFinalResult,
  onResetIdle,
  isLupaKataActive,
  isSpeaking,
}) {
  const transcriptRef = useRef("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isCanceled, setIsCanceled] = useState(false);

  const lastInterimRef = useRef("");
  const isListeningRef = useRef(false);
  const lastStopTimeRef = useRef(null);
  const isPausedForLupaKataRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  const pausedBufferRef = useRef("");
  const wasPausedForLupaKataRef = useRef(false);
  const wasRecordingBeforeLupaKataRef = useRef(false);
  const ignoreNextOnEndRef = useRef(false);
  const setPausedUI = (text) => setLiveTranscript(text); // atau callback dari parent

  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const tryStartRecording = () => {
    if (isListeningRef.current) {
      console.log("⚠️ Already listening, skip start");
      return;
    }

    if (isSpeakingRef.current) {
      console.log("⛔ Masih speaking, tunda start");
      return;
    }

    console.log("⏳ Delay 0.5 detik sebelum start STT");

    setTimeout(() => {
      // double check lagi setelah delay
      if (isListeningRef.current || isSpeakingRef.current) {
        console.log("⚠️ Skip start karena state berubah saat delay");
        return;
      }

      try {
        recognitionRef.current?.start();
        isListeningRef.current = true;
        setIsRecording(true);

        console.log("🚀 STT started setelah delay");
      } catch (err) {
        console.error("❌ Error starting STT:", err);
      }
    }, 400);
  };

  useEffect(() => {
    let timeoutId;

    if (
      !isSpeaking &&
      wasRecordingBeforeLupaKataRef.current &&
      !isListeningRef.current
    ) {
      console.log("🎯 TTS selesai, tunggu 0.5 detik sebelum start STT");

      timeoutId = setTimeout(() => {
        // double check biar aman dari race condition
        if (!isSpeakingRef.current && !isListeningRef.current) {
          console.log("🚀 Delay selesai, mulai STT");
          tryStartRecording();
          wasRecordingBeforeLupaKataRef.current = false;
        } else {
          console.log("⚠️ Skip start karena state berubah saat delay");
        }
      }, 500); // 0.5 detik
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSpeaking]);

  const normalizeText = (text) =>
    text
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const getSpeechRecognition = () =>
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const startRecording = () => {
    const SpeechRecognition = getSpeechRecognition();

    console.log("=== START RECORDING CALLED ===");
    console.log("isListeningRef:", isListeningRef.current);
    console.log("lastStopTime:", lastStopTimeRef.current);
    console.log(
      "time since last stop:",
      lastStopTimeRef.current
        ? Date.now() - lastStopTimeRef.current
        : "never stopped",
    );

    if (!SpeechRecognition) {
      console.log("❌ SpeechRecognition not supported");
      return;
    }

    if (isLupaKataActive) {
      console.log("❌ Blocked by isLupaKataActive");
      return;
    }

    try {
      onResetIdle?.();
      transcriptRef.current = "";
      lastInterimRef.current = "";
      setLiveTranscript("");
      setIsCanceled(false);
      shouldSendOnEndRef.current = true;

      tryStartRecording();

      console.log("✅ recognition.start() called");
    } catch (err) {
      console.error("🔥 START ERROR:", err);
    }
  };

  const stopRecording = () => {
    console.log("=== STOP RECORDING CALLED ===");
    console.log("isListeningRef:", isListeningRef.current);

    if (isLupaKataActive) {
      console.log("❌ Blocked by isLupaKataActive");
      return;
    }

    shouldSendOnEndRef.current = true;

    setTimeout(() => {
      try {
        recognitionRef.current?.stop();
        console.log("✅ recognition.stop() called");
      } catch (err) {
        console.error("🔥 STOP ERROR:", err);
      }
    }, 300);
  };

  const pauseRecording = () => {
    if (isListeningRef.current) {
      try {
        ignoreNextOnEndRef.current = true;
        recognitionRef.current?.stop();
        isListeningRef.current = false;
        lastStopTimeRef.current = Date.now();
        isPausedForLupaKataRef.current = true; // 🔑 tandai pause sementara
        shouldSendOnEndRef.current = false; // ⚠️ jangan kirim hasil saat pause

        pausedBufferRef.current =
          transcriptRef.current + lastInterimRef.current;
        // ❌ jangan reset liveTranscript di sini
      } catch (err) {
        console.error("❌ Pause error:", err);
      }
    }
  };

  const resumeRecording = () => {
    if (!isListeningRef.current && !isLupaKataActive) {
      try {
        tryStartRecording();
        isPausedForLupaKataRef.current = false; // clear flag
        shouldSendOnEndRef.current = true; // aktifkan kembali pengiriman
        // ✅ liveTranscript tetap ada
      } catch (err) {
        console.error("❌ Resume error:", err);
      }
    }
  };

  const cancelRecording = () => {
    console.log("=== CANCEL RECORDING ===");

    onResetIdle?.();
    shouldSendOnEndRef.current = false;
    setIsCanceled(true);
    transcriptRef.current = "";
    setLiveTranscript("");

    try {
      recognitionRef.current?.stop();
      console.log("✅ recognition.stop() called (cancel)");
    } catch (err) {
      console.error("🔥 CANCEL STOP ERROR:", err);
    }
  };

  useEffect(() => {
    if (isLupaKataActive) {
      console.log("⏸ Paused for LupaKata");

      wasRecordingBeforeLupaKataRef.current = isListeningRef.current;

      isPausedForLupaKataRef.current = true;
      wasPausedForLupaKataRef.current = true; // tandai pause
      setIsPaused(true);
      shouldSendOnEndRef.current = false;
    } else {
      if (wasPausedForLupaKataRef.current) {
        console.log("▶ Resumed from LupaKata pause");
        isPausedForLupaKataRef.current = false;
        setIsPaused(false);

        setPausedUI?.(pausedBufferRef.current);
        pausedBufferRef.current = "";

        // ⚡ Hanya resume jika sebelumnya pause
        if (!isListeningRef.current && wasRecordingBeforeLupaKataRef.current) {
          try {
            tryStartRecording();
            console.log("✅ SpeechRecognition resumed after LupaKata send");

            // wasRecordingBeforeLupaKataRef.current = false;
          } catch (err) {
            console.error("❌ Error resuming SpeechRecognition:", err);
          }
        }

        wasPausedForLupaKataRef.current = false; // reset flag
      }
    }
  }, [isLupaKataActive]);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition || recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      console.log("🎤 STT onstart fired");
    };

    recognition.onresult = (event) => {
      console.log("📝 STT onresult fired");
      if (isCanceled || isLupaKataActive) return;

      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcriptRef.current += t + " ";
        } else {
          interim += t;
        }
      }

      lastInterimRef.current = interim;
      setLiveTranscript(transcriptRef.current + interim);
    };

    recognition.onend = () => {
      console.log("🔚 STT onend fired");

      if (ignoreNextOnEndRef.current) {
        console.log("⏭ Ignoring onend (pause)");
        ignoreNextOnEndRef.current = false;
        return;
      }

      isListeningRef.current = false;
      recognitionRef.current = null; // 🔥 WAJIB
      lastStopTimeRef.current = Date.now();

      if (isCanceled) return;

      const finalText = normalizeText(
        transcriptRef.current + lastInterimRef.current,
      );

      // ⚠️ Jangan kirim apapun kalau pause untuk Lupa Kata / tombol lain aktif
      if (!isPausedForLupaKataRef.current) {
        if (shouldSendOnEndRef.current && finalText) {
          console.log("📤 Sending final result:", finalText);
          onFinalResult?.(finalText);
          shouldSendOnEndRef.current = false;
        }

        transcriptRef.current = "";
        lastInterimRef.current = "";
        setLiveTranscript("");
        setIsRecording(false);
        onResetIdle?.();
      } else {
        console.log(
          "⏸ Paused for Lupa Kata / tombol lain, live transcript tetap ada, tidak dikirim",
        );
        // ⚠️ jangan reset transcript, jangan kirim
      }
    };

    recognition.onerror = (e) => {
      console.error("🔥 STT error event:", e.error);
      console.log("isListeningRef at error:", isListeningRef.current);
    };

    recognitionRef.current = recognition;
  }, [isLupaKataActive]);

  return {
    liveTranscript,
    startRecording,
    stopRecording,
    cancelRecording,
    pauseRecording, // ⬅️ baru
    resumeRecording, // ⬅️ baru
  };
}
