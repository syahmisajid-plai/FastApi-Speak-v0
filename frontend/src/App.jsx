import { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import Topic from "./components/Topic";
import ChatSection from "./components/ChatSection";
import RecordingSection from "./components/RecordingSection";
import SuggestionSection from "./components/SuggestionSection";
import ControlSection from "./components/ControlSection";
import "./App.css";

import api from "./api"; // ⬅️ pakai axios instance

export default function SpeakingApp() {
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/api/ping");
        console.log("✅ Backend connected:", response.data);
      } catch (error) {
        console.error("❌ Backend NOT connected:", error);
      }
    };

    checkBackend();
  }, []);

  useEffect(() => {
    // Hanya pasang Eruda jika di browser (client-side)
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.eruda.init();
        console.log("🛠️ Eruda Loaded! Klik ikon gear di kanan bawah.");
      };
    }
  }, []);

  // const wasRecordingBeforeLupaKataRef = useRef(false);
  const isPausedForLupaKataRef = useRef(false);

  const [isIdle, setIsIdle] = useState(true);
  const idleTimerRef = useRef(null);

  const IDLE_TIMEOUT = 15000; // 5 detik tanpa interaksi

  const resetIdle = () => {
    if (isRecording || isLupaKataActive) return;

    setIsIdle(false);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, IDLE_TIMEOUT);
  };

  const [isLupaKataActive, setIsLupaKataActive] = useState(false);
  // const [lupaKataResult, setLupaKataResult] = useState(null);
  // const lupaKataRecognitionRef = useRef(null);

  const translateLupaKata = async (indoText) => {
    try {
      const res = await fetch(
        "https://fastapi-speak-v0-production.up.railway.app/translate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: indoText,
            source_lang: "id",
            target_lang: "en",
          }),
        },
      );

      const data = await res.json();

      setChatHistory((prev) => [
        ...prev.filter((c) => !(c.sender === "Helper" && c.type === "prompt")),
        {
          sender: "Helper",
          type: "result",
          indo: data.indo,
          english: data.english,
        },
      ]);

      // 🔊 Autoplay hasil terjemahan
      if (data.english) {
        const utterance = new SpeechSynthesisUtterance(data.english);
        utterance.lang = "en-US";

        // Pilih voice tertentu, misal Google US English
        const voices = speechSynthesis.getVoices(); // <-- sini
        const voice =
          voices.find((v) => v.name === "Google US English") || voices[0];
        utterance.voice = voice;

        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("❌ Translate error:", err);
    }

    setIsLupaKataActive(false);

    // ▶️ RESUME SpeechRecognition jika tadi pause
    if (isPausedForLupaKataRef.current) {
      isPausedForLupaKataRef.current = false;
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  // const lupaKataHasResultRef = useRef(false);

  const sendAudioToWhisper = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, "lupakata.webm");

    const res = await fetch(
      "https://fastapi-speak-v0-production.up.railway.app/api/stt-whisper",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Whisper API error:", text);
      return;
    }

    const data = await res.json();

    if (!data.text) {
      console.error("❌ Empty transcription");
      return;
    }

    translateLupaKata(data.text);
  };

  const startLupaKata = async () => {
    console.log("▶️ startLupaKata (recording)");

    // ⛔ PAUSE SpeechRecognition utama
    if (isRecording) {
      isPausedForLupaKataRef.current = true;
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setIsLupaKataActive(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 4000); // ⏱️ 3–5 detik

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunks, { type: "audio/webm" });

      console.log("🎧 Audio size:", blob.size);

      if (blob.size === 0) {
        console.error("❌ Audio kosong");
        return;
      }

      await sendAudioToWhisper(blob);
    };
  };

  const [micReady, setMicReady] = useState(false);
  const [micError, setMicError] = useState(null);
  const [speakerReady, setSpeakerReady] = useState(false);
  const [speakerError, setSpeakerError] = useState(null);
  const [isCanceled, setIsCanceled] = useState(false);

  const toggleSuggestion = () => {
    resetIdle();
    if (!showSuggestions) fetchSuggestions();
    setShowSuggestions(!showSuggestions);
  };

  const requestAudioPermission = async () => {
    try {
      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicReady(true);
      setMicError(null);
      console.log("🎤 Microphone permission granted");
    } catch (err) {
      console.error("❌ Microphone permission denied", err);
      setMicError("Microphone access is required to use this feature.");
      return; // stop jika mic gagal
    }

    try {
      // Request speaker (AudioContext)
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      await audioCtx.resume();
      setSpeakerReady(true);
      setSpeakerError(null);
      console.log("🔊 Speaker permission granted");
    } catch (err) {
      console.error("❌ Speaker permission denied", err);
      setSpeakerError("Speaker access is required to play sound.");
    }
  };

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognitionRef = useRef(null);

  const transcriptRef = useRef("");
  const [liveTranscript, setLiveTranscript] = useState("");

  // --- UseEffect untuk pause liveTranscript selama Lupa Kata ---
  // useEffect(() => {
  //   if (isLupaKataActive) return; // jangan update liveTranscript selama Lupa Kata
  //   setLiveTranscript(transcriptRef.current);
  // }, [liveTranscript, isLupaKataActive]);

  const startRecording = () => {
    resetIdle();
    transcriptRef.current = "";
    setLiveTranscript("");
    setIsCanceled(false);
    recognitionRef.current?.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsCanceled(false);
    recognitionRef.current?.stop();
  };

  const cancelRecording = () => {
    resetIdle();
    setIsCanceled(true);
    transcriptRef.current = "";
    setLiveTranscript("");
    recognitionRef.current?.stop();
  };

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      if (isCanceled || isLupaKataActive) return;

      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcriptRef.current += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setLiveTranscript(transcriptRef.current + interim);
    };

    recognition.onend = () => {
      console.log("🟥 ONEND FIRED");
      console.log("paused?", isPausedForLupaKataRef.current);
      // console.log("canceled?", isCanceledRef.current);
      console.log("raw transcript:", transcriptRef.current);
      // jika sedang pause karena Lupa Kata, jangan kirim transcript
      if (isPausedForLupaKataRef.current) {
        console.log(
          "⏸ Recording paused for Lupa Kata, transcript tidak dikirim",
        );
        return; // keluar saja
      }

      const finalText = normalizeText(transcriptRef.current);
      console.log("🟨 FINAL TEXT:", finalText);

      setLiveTranscript(""); // kosongkan liveTranscript

      if (!isCanceled && finalText) sendTextToBackend(finalText);

      transcriptRef.current = "";
      setIsCanceled(false);
      setIsRecording(false);

      resetIdle();
    };

    recognition.onerror = (event) => {
      console.error("STT error:", event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizeForTTS = (text) =>
    text
      .replace(/\s+/g, " ")
      .replace(/\n+/g, ". ")
      // .replace(/([!?])+/g, ",") // 🔥 ubah ! dan ? jadi titik
      // .replace(/\.\s*\./g, ".")
      .trim();

  const splitSentences = (text) => text.match(/[^.!?]+[.!?]+/g) || [text];

  const waitForVoices = () =>
    new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) return resolve(voices);
      speechSynthesis.onvoiceschanged = () =>
        resolve(speechSynthesis.getVoices());
    });

  const speakText = async (text) => {
    if (!text) return;

    // pastikan voices sudah siap
    const voices = await waitForVoices();
    const voice =
      voices.find((v) => v.name === "Google US English") || voices[0];

    await waitForVoices();

    const sentences = splitSentences(normalizeForTTS(text));
    speechSynthesis.cancel();

    const speakNext = () => {
      if (!sentences.length) return;

      const u = new SpeechSynthesisUtterance(sentences.shift());
      u.lang = voice.lang; // ambil dari voice
      u.voice = voice;
      u.rate = 0.95;
      u.onend = speakNext;

      speechSynthesis.speak(u);
    };

    speakNext();
  };

  const SESSION_ID = "user-123"; // HARUS konsisten

  const sendTextToBackend = async (text) => {
    console.log("🚀 SEND TO AI:", text);

    // 1️⃣ tampilkan user message
    setChatHistory((prev) => [...prev, { sender: "You", message: text }]);

    // 2️⃣ POST streaming ke backend
    const res = await fetch(
      "https://fastapi-speak-v0-production.up.railway.app/stream_answer",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: SESSION_ID,
          input: text,
        }),
      },
    );

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let aiText = "";

    // 3️⃣ baca stream token demi token
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      aiText += chunk.replace(/^data:\s*/gm, "");

      setChatHistory((prev) => {
        const withoutTemp = prev.filter((c) => c.sender !== "AI-temp");
        return [...withoutTemp, { sender: "AI-temp", message: aiText }];
      });
    }

    // 4️⃣ finalisasi pesan AI
    setChatHistory((prev) =>
      prev.map((c) =>
        c.sender === "AI-temp" ? { sender: "AI", message: aiText } : c,
      ),
    );

    // 5️⃣ TTS DIPANGGIL SEKALI (SETELAH STREAM SELESAI)
    speakText(normalizeForTTS(aiText));
  };

  const [chatHistory, setChatHistory] = useState([]);

  // const suggestions = [
  //   "I really enjoyed the local food during my holiday.",
  //   "The weather was perfect for outdoor activities.",
  //   "I visited some amazing historical sites.",
  // ];

  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [suggestions, setSuggestions] = useState([]);

  const bottomRef = useRef(null);

  // ⬅️ fungsi fetchSuggestions diletakkan di sini
  const fetchSuggestions = async () => {
    const lastUser = [...chatHistory].reverse().find((c) => c.sender === "You");
    const lastAI = [...chatHistory].reverse().find((c) => c.sender === "AI");

    // pastikan minimal ada salah satu
    if (!lastUser && !lastAI) return;

    try {
      const res = await fetch(
        "https://fastapi-speak-v0-production.up.railway.app/suggestions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            last_user_message: lastUser?.message || "",
            last_ai_reply: lastAI?.message || "",
          }),
        },
      );

      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  useEffect(() => {
    if (isRecording) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isRecording]);

  return (
    <div className="min-h-screen lg:w-full flex justify-center bg-linear-to-b from-slate-900 to-blue-950 p-4">
      <div
        className="w-full max-w-md space-y-6 flex flex-col"
        onClick={resetIdle}
        onWheel={resetIdle}
      >
        <Header />
        <Topic />
        <ChatSection
          chatHistory={chatHistory}
          liveTranscript={liveTranscript}
          bottomRef={bottomRef}
        />

        <div className="fixed bottom-20 lg:bottom-20 left-0 lg:w-full px-4 space-y-4">
          {isRecording && <RecordingSection />}
          {showSuggestions && (
            <SuggestionSection
              suggestions={suggestions}
              playAudio={playAudio}
            />
          )}

          <ControlSection
            isRecording={isRecording}
            micReady={micReady}
            startRecording={startRecording}
            stopRecording={stopRecording}
            cancelRecording={cancelRecording}
            requestAudioPermission={requestAudioPermission}
            toggleSuggestion={toggleSuggestion}
            isIdle={isIdle}
            openLupaKata={startLupaKata}
            speakerReady={speakerReady}
          />
        </div>

        <div className="mb-48"></div>
      </div>

      {/* ⚠️ STYLE TIDAK DIUBAH */}
      <style>
        {`
          @keyframes wave {
            0%, 100% { height: 0.25rem; }
            50% { height: 1.5rem; }
          }
          .animate-wave {
            animation: wave 1s infinite ease-in-out;
          }
          .delay-200 { animation-delay: 0.2s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-600 { animation-delay: 0.6s; }
          .delay-800 { animation-delay: 0.8s; }
        `}
      </style>
    </div>
  );
}
