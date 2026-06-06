// hooks/useWhisperSTT.js
import { useState, useRef, useEffect } from "react";
import { linkBackend } from "../config";

// Stable VAD + Whisper STT
export function useWhisperSTT() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const isProcessingRef = useRef(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const animationRef = useRef(null);

  const SILENCE_MS = 1200;

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

  // ================= RECORDER =================
  const createRecorder = (stream) => {
    const mimeType = MediaRecorder.isTypeSupported(
      "audio/webm;codecs=opus"
    )
      ? "audio/webm;codecs=opus"
      : undefined;

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType,
      });

      chunksRef.current = [];

      const formData = new FormData();
      formData.append("file", blob, "audio.webm");

      try {
        setLoading(true);

        const res = await fetch(`${linkBackend}/transcribe`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        setText((prev) => prev + " " + (data.text || ""));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        isProcessingRef.current = false;
      }

      if (!streamRef.current) return;

      const stream = streamRef.current;

      const newRecorder = new MediaRecorder(stream);

      recorderRef.current = newRecorder;

      newRecorder.ondataavailable = recorder.ondataavailable;
      newRecorder.onstop = recorder.onstop;

      setTimeout(() => {
        if (newRecorder.state === "inactive") {
          newRecorder.start();
        }
      }, 0);
    };

    recorder.start();
  };

  // ================= START =================
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    streamRef.current = stream;
    chunksRef.current = [];

    createRecorder(stream);
    startVAD(stream);

    setIsRecording(true);
  };

  // ================= FLUSH =================
  const flushChunk = () => {
    if (isProcessingRef.current) return;

    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state !== "recording") return;

    recorder.stop();
  };

  // ================= STOP =================
  const stopRecording = () => {
    cancelAnimationFrame(animationRef.current);
    clearTimeout(silenceTimerRef.current);

    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }

    setTimeout(() => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }, 300);

    setIsRecording(false);
  };

  useEffect(() => {
    return () => stopRecording();
  }, []);

  return {
    text,
    loading,
    isRecording,
    startRecording,
    stopRecording,
  };
}