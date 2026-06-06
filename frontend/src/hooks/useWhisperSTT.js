// hooks/useWhisperSTT.js
import { useState, useRef, useEffect } from "react";
import { linkBackend } from "../config";

export default function useWhisperSTT({
  recognitionRef,
  setIsRecording,
  shouldSendOnEndRef,
  onFinalResult,
  onResetIdle,
  isLupaKataActive,
  isSpeaking,
}) {
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isCanceled, setIsCanceled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const animationRef = useRef(null);

  const isRecordingRef = useRef(false);
  const isProcessingRef = useRef(false);

  const pausedBufferRef = useRef("");
  const wasRecordingBeforeLupaKataRef = useRef(false);
  const ignoreFlushRef = useRef(false);

  const isSpeakingRef = useRef(isSpeaking);

  const isManualStopRef = useRef(false);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const SILENCE_MS = 1200;

  // ================= NORMALIZE =================
  const normalizeText = (text) =>
    text.toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();

  // ================= VAD =================
  const startVAD = (stream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.fftSize);

    const detect = () => {
      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += Math.abs(data[i] - 128);
      }

      const avg = sum / data.length;
      const isSilent = avg < 6;

      if (isSilent) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            flushChunk();
          }, SILENCE_MS);
        }
      } else {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      animationRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  // ================= UPLOAD =================
  const sendToBackend = async (blob) => {
    try {
      setIsRecording?.(true);

      const formData = new FormData();
      formData.append("file", blob, "audio.webm");

      const res = await fetch(`${linkBackend}/transcribe`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const text = data.text || "";

      if (!text) return;

      setLiveTranscript((prev) => prev + " " + text);
      setCurrentTranscript(text);

      if (shouldSendOnEndRef.current && !ignoreFlushRef.current) {
        const finalText = normalizeText(text);
        onFinalResult?.(finalText);
        shouldSendOnEndRef.current = false;
      }
    } catch (err) {
      console.error("Whisper error:", err);
    }
  };

    const handleStop = async (rec) => {
    console.log("=== RECORDER ONSTOP FIRED ===");

    if (isProcessingRef.current) {
        console.log("⚠️ Already processing skip");
        return;
    }

    isProcessingRef.current = true;

    const blob = new Blob(chunksRef.current, {
        type: rec.mimeType,
    });

    console.log("📦 Blob size:", blob.size);

    chunksRef.current = [];

    await sendToBackend(blob);

    isProcessingRef.current = false;

    console.log("=== PROCESS DONE ===");
    };

  // ================= RECORDER =================
    const createRecorder = (stream) => {
    const mimeType = MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
    )
        ? "audio/webm;codecs=opus"
        : undefined;

    const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
    );

    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
        chunksRef.current.push(e.data);
        }
    };

    // 🔥 IMPORTANT: NO REFERENCE TO OLD RECORDER
    recorder.onstop = () => handleStop(recorder);

    console.log("🎬 Recorder CREATED (stable handler)");

    recorder.start();
    };

  // ================= FLUSH =================
    const flushChunk = () => {
    console.log("=== VAD FLUSH ===");

    if (isProcessingRef.current) return;

    // ❌ jangan send kalau bukan manual stop
    if (!isManualStopRef.current) {
        console.log("⏭ Skip flush (live mode only)");
        const rec = recorderRef.current;
        if (rec?.state === "recording") rec.stop();
        return;
    }

    const rec = recorderRef.current;
    if (rec?.state === "recording") rec.stop();
    };

  // ================= START =================
    const startRecording = async () => {
    isManualStopRef.current = false; // 🔥 penting
    console.log("=== WHISPER START ===");

    if (isRecordingRef.current) return;

    try {
        shouldSendOnEndRef.current = true;   // 🔥 FIX UTAMA
        ignoreFlushRef.current = false;      // 🔥 FIX UTAMA

        const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        });

        streamRef.current = stream;
        chunksRef.current = [];

        createRecorder(stream);
        startVAD(stream);

        isRecordingRef.current = true;
        setIsRecording?.(true);

        console.log("🚀 WHISPER STARTED OK");
    } catch (err) {
        console.error(err);
    }
    };

  // ================= STOP =================
    const stopRecording = () => {
    console.log("🛑 MANUAL STOP");

    isManualStopRef.current = true;

    const rec = recorderRef.current;

    if (rec?.state === "recording") {
        rec.requestData?.();
        rec.stop();
    }

    isRecordingRef.current = false;
    setIsRecording?.(false);
    };

  // ================= CANCEL =================
    const cancelRecording = () => {
    console.log("=== WHISPER CANCEL RECORDING ===");

    ignoreFlushRef.current = true;

    console.log("🧨 Stopping recording for cancel...");
    stopRecording();

    setLiveTranscript("");
    setCurrentTranscript("");

    setIsCanceled(true);
    shouldSendOnEndRef.current = false;

    console.log("🧹 Transcript cleared (cancel)");
    onResetIdle?.();

    console.log("❌ WHISPER CANCEL DONE");
    };

  // ================= PAUSE =================
    const pauseRecording = () => {
    console.log("=== WHISPER PAUSE ===");

    wasRecordingBeforeLupaKataRef.current = isRecordingRef.current;

    ignoreFlushRef.current = true;

    console.log("⏸ Stopping recorder for pause...");
    recorderRef.current?.stop();

    isRecordingRef.current = false;
    setIsPaused(true);

    console.log("⏸ WHISPER PAUSED");
    };

  // ================= RESUME =================
    const resumeRecording = () => {
    console.log("=== WHISPER RESUME ===");

    if (!streamRef.current) {
        console.log("❌ No stream available for resume");
        return;
    }

    ignoreFlushRef.current = false;

    console.log("🎬 Recreating recorder...");
    createRecorder(streamRef.current);

    setIsPaused(false);
    isRecordingRef.current = true;

    console.log("🚀 WHISPER RESUMED");
    };

  // ================= LUPA KATA EFFECT =================
  useEffect(() => {
    if (isLupaKataActive) {
      pauseRecording();
    } else {
      if (wasRecordingBeforeLupaKataRef.current) {
        resumeRecording();
      }
    }
  }, [isLupaKataActive]);

  // ================= CLEANUP =================
  useEffect(() => {
    return () => stopRecording();
  }, []);

  return {
    liveTranscript,
    currentTranscript,
    isPaused,

    startRecording,
    stopRecording,
    cancelRecording,
    pauseRecording,
    resumeRecording,
  };
}