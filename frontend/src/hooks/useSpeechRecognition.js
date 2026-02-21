import { useRef, useState } from "react";

export default function useSpeechRecognition({
  recognitionRef,
  setIsRecording,
  shouldSendOnEndRef,
  onFinalResult,
  onResetIdle,
  isLupaKataActive,
}) {
  const transcriptRef = useRef("");
  const lastInterimRef = useRef("");
  const isListeningRef = useRef(false);
  const isCanceledRef = useRef(false);

  const [liveTranscript, setLiveTranscript] = useState("");

  const normalizeText = (text) =>
    text
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const getSpeechRecognition = () =>
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const attachHandlers = (recognition) => {
    recognition.onresult = (event) => {
      if (isCanceledRef.current || isLupaKataActive) return;

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
      if (isCanceledRef.current) {
        cleanup();
        return;
      }

      const finalText = normalizeText(
        transcriptRef.current + lastInterimRef.current,
      );

      if (shouldSendOnEndRef.current && finalText) {
        onFinalResult?.(finalText);
        shouldSendOnEndRef.current = false;
      }

      cleanup();
    };

    recognition.onerror = (e) => {
      console.error("STT error:", e.error);
      cleanup();
    };
  };

  const cleanup = () => {
    transcriptRef.current = "";
    lastInterimRef.current = "";
    setLiveTranscript("");
    setIsRecording(false);
    isListeningRef.current = false;
    isCanceledRef.current = false;
    recognitionRef.current = null;
    onResetIdle?.();
  };

  const startRecording = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition || isLupaKataActive) return;
    if (isListeningRef.current) return;

    onResetIdle?.();

    transcriptRef.current = "";
    lastInterimRef.current = "";
    setLiveTranscript("");

    isCanceledRef.current = false;
    shouldSendOnEndRef.current = true;

    // 🔥 CREATE NEW INSTANCE EVERY TIME
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    attachHandlers(recognition);

    recognitionRef.current = recognition;

    recognition.start();
    isListeningRef.current = true;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    if (!isListeningRef.current) return;

    shouldSendOnEndRef.current = true;
    recognitionRef.current.stop();
  };

  const cancelRecording = () => {
    if (!recognitionRef.current) return;

    shouldSendOnEndRef.current = false;
    isCanceledRef.current = true;

    recognitionRef.current.stop();
  };

  return {
    liveTranscript,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
