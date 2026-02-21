import { useEffect, useRef, useState } from "react";

export default function useSpeechRecognition({
  recognitionRef,
  setIsRecording,
  shouldSendOnEndRef,
  onFinalResult,
  onResetIdle,
  isLupaKataActive,
}) {
  const transcriptRef = useRef("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isCanceled, setIsCanceled] = useState(false);

  const lastInterimRef = useRef("");
  const isListeningRef = useRef(false);
  const lastStopTimeRef = useRef(null);

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

      recognitionRef.current?.start();

      isListeningRef.current = true;
      setIsRecording(true);

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
      console.log(
        "time between stop and onend:",
        lastStopTimeRef.current
          ? Date.now() - lastStopTimeRef.current
          : "unknown",
      );

      isListeningRef.current = false;
      lastStopTimeRef.current = Date.now();

      if (isCanceled) return;

      const finalText = normalizeText(
        transcriptRef.current + lastInterimRef.current,
      );

      if (shouldSendOnEndRef.current && finalText) {
        console.log("📤 Sending final result:", finalText);
        onFinalResult?.(finalText);
        shouldSendOnEndRef.current = false;
      }

      transcriptRef.current = "";
      lastInterimRef.current = "";
      setLiveTranscript("");
      setIsCanceled(false);
      setIsRecording(false);
      onResetIdle?.();
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
  };
}
