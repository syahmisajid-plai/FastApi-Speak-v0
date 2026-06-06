import { useState, useRef, useEffect } from "react";
import { linkBackend } from "../config";

export default function WhisperSTTSimple() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  // 🔥 LOCK penting biar gak overlap upload + restart
  const isProcessingRef = useRef(false);

  // VAD
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
            console.log("🤫 silence → flush");

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

  // ================= START =================
  const startRecording = async () => {
    console.log("🎤 START");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    streamRef.current = stream;
    chunksRef.current = [];

    createRecorder(stream);

    setIsRecording(true);
    startVAD(stream);
  };

  // ================= CREATE RECORDER =================
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
      console.log("⏹ chunk ready");

      // 🔥 LOCK upload
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

      // ================= SAFE RESTART =================
      if (!streamRef.current) return;

      const stream = streamRef.current;

      const mimeType = MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      )
        ? "audio/webm;codecs=opus"
        : undefined;

      const newRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorderRef.current = newRecorder;

      newRecorder.ondataavailable = recorder.ondataavailable;
      newRecorder.onstop = recorder.onstop;

      // 🔥 tunggu 1 tick biar state benar-benar idle
      setTimeout(() => {
        if (newRecorder.state === "inactive") {
          newRecorder.start();
          console.log("🔁 restarted");
        }
      }, 0);
    };

    recorder.start();
    console.log("🔴 recording started");
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
    console.log("🛑 STOP");

    // stop VAD loop dulu
    cancelAnimationFrame(animationRef.current);
    clearTimeout(silenceTimerRef.current);

    // stop recorder (ini trigger onstop)
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }

    // ⚠️ JANGAN langsung stop stream di sini
    setTimeout(() => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }, 300);

    setIsRecording(false);
  };

  useEffect(() => {
    return () => stopRecording();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h3>Whisper STT - Stable VAD</h3>

      <button
        onClick={startRecording}
        disabled={isRecording || loading}
      >
        🎤 Start
      </button>

      <button onClick={stopRecording} disabled={!isRecording}>
        🛑 Stop
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>Result:</strong>
        <p>{text || "-"}</p>
      </div>
    </div>
  );
}