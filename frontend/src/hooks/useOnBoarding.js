// useOnBoarding.js

import { useEffect, useRef, useState } from "react";

export default function useOnboarding() {
  // ======================
  // FORM
  // ======================

  const [motherTongue, setMotherTongue] = useState(false);
  const [englishUsage, setEnglishUsage] = useState("");

  // ======================
  // MICROPHONE TEST
  // ======================

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const VOICE_THRESHOLD = 20;
  const [micLevel, setMicLevel] = useState(0);
  const [micDetected, setMicDetected] = useState(false);

  const [maxMicLevel, setMaxMicLevel] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // ======================
  // SYSTEM CHECK
  // ======================

  const [deviceType, setDeviceType] = useState("");
  const [browserName, setBrowserName] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");

  const [micAvailable, setMicAvailable] = useState(null);

  const [micPermissionGranted, setMicPermissionGranted] = useState(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(null);

  const [mediaRecorderSupported, setMediaRecorderSupported] = useState(null);
  const [webAudioSupported, setWebAudioSupported] = useState(null);

  const [speechRecognitionSupported, setSpeechRecognitionSupported] =
    useState(null);

  const [speechSynthesisSupported, setSpeechSynthesisSupported] =
    useState(null);

  const [systemReady, setSystemReady] = useState(false);

  // ======================
  // MIC and AUDIO CONFIRM FROM USER
  // ======================
  const [voiceConfirmed, setVoiceConfirmed] = useState(null);
  const [speakerConfirmed, setSpeakerConfirmed] = useState(null);
  const [voiceTestPassed, setVoiceTestPassed] = useState(false);

  // ======================
  // SYSTEM CHECK
  // ======================

  const runSystemCheck = async () => {
    const ua = navigator.userAgent;

    // Device
    if (/Mobi|Android|iPhone|iPad/i.test(ua)) {
      setDeviceType("Mobile");
    } else {
      setDeviceType("Desktop");
    }

    // Browser
    if (ua.includes("Edg")) {
      setBrowserName("Microsoft Edge");
    } else if (ua.includes("Chrome")) {
      setBrowserName("Google Chrome");
    } else if (ua.includes("Firefox")) {
      setBrowserName("Firefox");
    } else if (ua.includes("Safari")) {
      setBrowserName("Safari");
    } else {
      setBrowserName("Unknown");
    }

    // OS
    if (ua.includes("Windows")) {
      setOperatingSystem("Windows");
    } else if (ua.includes("Mac")) {
      setOperatingSystem("macOS");
    } else if (ua.includes("Android")) {
      setOperatingSystem("Android");
    } else if (ua.includes("iPhone") || ua.includes("iPad")) {
      setOperatingSystem("iOS");
    } else if (ua.includes("Linux")) {
      setOperatingSystem("Linux");
    } else {
      setOperatingSystem("Unknown");
    }

    // Browser Support
    setMediaRecorderSupported(!!window.MediaRecorder);

    setWebAudioSupported(!!(window.AudioContext || window.webkitAudioContext));

    setSpeechRecognitionSupported(
      !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    );

    setSpeechSynthesisSupported(!!window.speechSynthesis);

    // Mic Permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setMicPermissionGranted(true);
      setMicPermissionDenied(false);

      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setMicPermissionGranted(false);
      setMicPermissionDenied(true);
    }

    // Mic Available
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const hasMic = devices.some((device) => device.kind === "audioinput");

      setMicAvailable(hasMic);
    } catch {
      setMicAvailable(false);
    }

    setSystemReady(true);
  };

  // ======================
  // VoiceTestPassed
  // ======================
  useEffect(() => {
    if (maxMicLevel > VOICE_THRESHOLD) {
      setVoiceConfirmed(true);
    } else {
      setVoiceConfirmed(false);
    }
  }, [maxMicLevel]);

  useEffect(() => {
    setVoiceTestPassed(voiceConfirmed === true && speakerConfirmed === true);
  }, [voiceConfirmed, speakerConfirmed]);

  //   console.log("voiceConfirmed", voiceConfirmed);
  //   console.log("speakerConfirmed", speakerConfirmed);

  // ======================
  // RECORDING
  // ======================

  const startMicLevelMonitor = (stream) => {
    // Stop monitor sebelumnya jika ada
    cancelAnimationFrame(animationFrameRef.current);

    audioContextRef.current?.close().catch(() => {});

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    const audioContext = new AudioContext();

    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);

    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;

    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const value = (dataArray[i] - 128) / 128;
        sum += value * value;
      }

      const rms = Math.sqrt(sum / dataArray.length);

      const level = Math.min(rms * 250, 100);

      setMicLevel(level);

      setMaxMicLevel((prev) => (level > prev ? level : prev));

      setMicDetected(level > VOICE_THRESHOLD);

      animationFrameRef.current = requestAnimationFrame(update);
    };

    update();
  };

  const startRecording = async () => {
    try {
      setMaxMicLevel(0);
      // Bersihkan audio lama
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }

      // Stop stream lama
      streamRef.current?.getTracks().forEach((track) => track.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      startMicLevelMonitor(stream);

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(blob);

        setAudioURL(url);

        streamRef.current?.getTracks().forEach((track) => track.stop());

        cancelAnimationFrame(animationFrameRef.current);

        audioContextRef.current?.close().catch(() => {});

        setMicLevel(0);
        setMicDetected(false);
      };

      mediaRecorder.start();

      setIsRecording(true);
    } catch (err) {
      console.error(err);

      alert("Unable to access microphone.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  const recordAgain = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());

    setAudioURL(null);
    setMicLevel(0);
    setMicDetected(false);
    setMaxMicLevel(0);

    setVoiceConfirmed(null);
    setSpeakerConfirmed(null);
    setVoiceTestPassed(false);

    startRecording();
  };

  // ======================
  // CLEANUP
  // ======================

  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }

      cancelAnimationFrame(animationFrameRef.current);

      audioContextRef.current?.close().catch(() => {});

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // ======================
  // LANGUAGES
  // ======================
  const languages = [
    { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
    { code: "jv", flag: "🇮🇩", label: "Bahasa Jawa" },
    { code: "su", flag: "🇮🇩", label: "Bahasa Sunda" },
    { code: "mad", flag: "🇮🇩", label: "Bahasa Madura" },
    { code: "min", flag: "🇮🇩", label: "Bahasa Minangkabau" },
    { code: "bug", flag: "🇮🇩", label: "Bahasa Bugis" },
    { code: "ban", flag: "🇮🇩", label: "Bahasa Banjar" },
    { code: "ace", flag: "🇮🇩", label: "Bahasa Aceh" },
    { code: "bal", flag: "🇮🇩", label: "Bahasa Bali" },
    { code: "sas", flag: "🇮🇩", label: "Bahasa Sasak" },
    { code: "day", flag: "🇮🇩", label: "Bahasa Dayak" },
    { code: "btk", flag: "🇮🇩", label: "Bahasa Batak" },
    { code: "pap", flag: "🇮🇩", label: "Bahasa Papua" },
    { code: "other", flag: "🌍", label: "Other" },
  ];

  // ======================
  // RETURN
  // ======================

  return {
    // Form
    motherTongue,
    setMotherTongue,
    englishUsage,
    setEnglishUsage,

    // System Check
    deviceType,
    browserName,
    operatingSystem,

    micAvailable,
    micPermissionGranted,
    micPermissionDenied,

    mediaRecorderSupported,
    webAudioSupported,

    speechRecognitionSupported,
    speechSynthesisSupported,

    systemReady,
    runSystemCheck,

    // Recorder
    isRecording,
    audioURL,

    micLevel,
    micDetected,
    maxMicLevel,

    startRecording,
    stopRecording,
    recordAgain,

    // Bahasa
    languages,

    // Confirm mic dan speaker dari user
    speakerConfirmed,
    setSpeakerConfirmed,
    voiceConfirmed,
    setVoiceConfirmed,
    voiceTestPassed,
    setVoiceTestPassed,

    VOICE_THRESHOLD,
  };
}
