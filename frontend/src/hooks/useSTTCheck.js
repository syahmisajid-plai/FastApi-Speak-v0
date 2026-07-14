// hooks/useSTTCheck.js

import { useRef, useState } from "react";
import { linkBackend } from "../config";

export default function useSTTCheck() {
  // =====================================================
  // MICROPHONE
  // =====================================================

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [audioDetected, setAudioDetected] = useState(false);

  // =====================================================
  // GOOGLE STT
  // =====================================================

  const [googleRunning, setGoogleRunning] = useState(false);
  const [googleTranscript, setGoogleTranscript] = useState("");
  const [googlePassed, setGooglePassed] = useState(false);

  // =====================================================
  // WHISPER STT
  // =====================================================

  const [whisperRunning, setWhisperRunning] = useState(false);
  const [whisperTranscript, setWhisperTranscript] = useState("");
  const [whisperPassed, setWhisperPassed] = useState(false);

  // =====================================================
  // REFS
  // =====================================================

  const streamRef = useRef(null);

  const recognitionRef = useRef(null);

  const recorderRef = useRef(null);

  const chunksRef = useRef([]);

  // =====================================================
  // CHECK MICROPHONE
  // =====================================================

  const checkMicrophone = async () => {
    setPermissionGranted(false);
    setAudioDetected(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      setPermissionGranted(true);

      const detected = await detectVoice(stream);

      setAudioDetected(detected);

      return detected;
    } catch (err) {
      console.error("Microphone Error:", err);

      setPermissionGranted(false);
      setAudioDetected(false);

      return false;
    }
  };

  // =====================================================
  // DETECT VOICE
  // =====================================================

  const detectVoice = (stream) =>
    new Promise((resolve) => {
      const ctx = new AudioContext();

      const analyser = ctx.createAnalyser();

      analyser.fftSize = 512;

      const source = ctx.createMediaStreamSource(stream);

      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      let detected = false;

      const start = Date.now();

      function loop() {
        analyser.getByteFrequencyData(data);

        const volume = data.reduce((a, b) => a + b, 0);

        if (volume > 100) {
          detected = true;
        }

        if (Date.now() - start > 1500) {
          ctx.close();

          resolve(detected);

          return;
        }

        requestAnimationFrame(loop);
      }

      loop();
    });

  // =====================================================
  // GOOGLE STT
  // =====================================================

  const startGoogleCheck = () => {
    setGoogleTranscript("");
    setGooglePassed(false);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Google STT Started");
      setGoogleRunning(true);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;

      console.log("Google:", text);

      setGoogleTranscript(text);
      setGooglePassed(true);
    };

    recognition.onerror = (event) => {
      console.error("Google STT Error:", event.error);

      setGoogleRunning(false);
    };

    recognition.onend = () => {
      console.log("Google STT End");

      setGoogleRunning(false);
    };

    recognition.start();
  };

  // =====================================================
  // STOP GOOGLE
  // =====================================================

  const stopGoogleCheck = () => {
    recognitionRef.current?.stop();
  };

  // =====================================================
  // WHISPER STT
  // =====================================================

  const startWhisperCheck = () => {
    if (!streamRef.current) {
      console.warn("Run checkMicrophone() first.");
      return;
    }

    setWhisperTranscript("");
    setWhisperPassed(false);
    setWhisperRunning(true);

    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : undefined;

    const recorder = new MediaRecorder(
      streamRef.current,
      mimeType ? { mimeType } : undefined,
    );

    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onerror = (err) => {
      console.error("Whisper Recorder Error:", err);
      setWhisperRunning(false);
    };

    recorder.onstop = async () => {
      setWhisperRunning(false);

      try {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType,
        });

        if (blob.size < 500) {
          console.warn("Audio too short.");
          return;
        }

        const formData = new FormData();

        formData.append("file", blob, "audio.webm");

        const res = await fetch(`${linkBackend}/transcribe`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        const text = (data.text || "").trim();

        setWhisperTranscript(text);

        if (text.length > 0) {
          setWhisperPassed(true);
        }
      } catch (err) {
        console.error("Whisper Upload Error:", err);
      }
    };

    recorder.start();

    console.log("🎤 Whisper Recording Started");
  };

  // =====================================================
  // STOP WHISPER
  // =====================================================

  const stopWhisperCheck = () => {
    const recorder = recorderRef.current;

    if (!recorder) return;

    try {
      if (recorder.state === "recording") {
        recorder.requestData();
        recorder.stop();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // CLEANUP
  // =====================================================

  const cleanup = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}

    try {
      recorderRef.current?.stop();
    } catch {}

    streamRef.current?.getTracks().forEach((track) => track.stop());

    streamRef.current = null;
    recognitionRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  };

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // microphone
    permissionGranted,
    audioDetected,

    // google
    googleRunning,
    googleTranscript,
    googlePassed,

    // whisper
    whisperRunning,
    whisperTranscript,
    whisperPassed,

    // actions
    checkMicrophone,

    startGoogleCheck,
    stopGoogleCheck,

    startWhisperCheck,
    stopWhisperCheck,

    cleanup,
  };
}
