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
    if (!SpeechRecognition || isLupaKataActive) return;

    onResetIdle?.();
    transcriptRef.current = "";
    setLiveTranscript("");
    setIsCanceled(false);
    shouldSendOnEndRef.current = true;

    recognitionRef.current?.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (isLupaKataActive) return;
    shouldSendOnEndRef.current = true;
    recognitionRef.current?.stop();
  };

  const cancelRecording = () => {
    onResetIdle?.();
    shouldSendOnEndRef.current = false;
    setIsCanceled(true);
    transcriptRef.current = "";
    setLiveTranscript("");
    recognitionRef.current?.stop();
  };

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition || recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
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

      setLiveTranscript(transcriptRef.current + interim);
    };

    recognition.onend = () => {
      const finalText = normalizeText(transcriptRef.current);

      if (shouldSendOnEndRef.current && !isCanceled && finalText) {
        onFinalResult?.(finalText);
      }

      transcriptRef.current = "";
      setLiveTranscript("");
      setIsCanceled(false);
      setIsRecording(false);
      shouldSendOnEndRef.current = false;
      onResetIdle?.();
    };

    recognition.onerror = (e) => {
      console.error("STT error:", e.error);
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
