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

  const wasRecordingBeforeLupaKataRef = useRef(false);
  const isPausedForLupaKataRef = useRef(false);

  const [speakerReady, setSpeakerReady] = useState(false);

  const requestSpeakerPermission = () => {
    // buat dummy utterance untuk "mengaktifkan" speaker
    const utterance = new SpeechSynthesisUtterance("Speaker enabled");
    utterance.lang = "en-US";

    const voices = speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.name === "Google US English") || voices[0];
    utterance.voice = voice;

    speechSynthesis.speak(utterance);
    setSpeakerReady(true);
    console.log("🔊 Speaker enabled");
  };

  const [isIdle, setIsIdle] = useState(true);
  const idleTimerRef = useRef(null);

  const IDLE_TIMEOUT = 15000; // 5 detik tanpa interaksi

  const resetIdle = () => {
    if (isRecording) return; // ⬅️ tambahan ini

    setIsIdle(false);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, IDLE_TIMEOUT);
  };

  const [isLupaKataActive, setIsLupaKataActive] = useState(false);
  const [lupaKataResult, setLupaKataResult] = useState(null);
  const lupaKataRecognitionRef = useRef(null);

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
        }
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

      setIsLupaKataActive(false);

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
  };

  const lupaKataHasResultRef = useRef(false);

  const startLupaKata = () => {
    // simpan status recording saat ini
    wasRecordingBeforeLupaKataRef.current = isRecording;

    // kalau sedang recording, pause STT utama
    if (isRecording) {
      isPausedForLupaKataRef.current = true;
      recognitionRef.current?.stop(); // hentikan STT utama sementara
      setIsRecording(false);
    }

    setIsCanceled(true);
    setIsLupaKataActive(true);
    setLupaKataResult(null);
    setChatHistory((prev) => [
      ...prev.filter((c) => !(c.sender === "Helper" && c.type === "prompt")),
      {
        sender: "Helper",
        message: "🎤 Ucapkan dalam Bahasa Indonesia ya…",
        type: "prompt",
      },
    ]);

    lupaKataHasResultRef.current = false;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (!result.isFinal) return;
      const text = result[0].transcript?.trim();
      if (!text) return;
      lupaKataHasResultRef.current = true;
      translateLupaKata(text);
    };

    recognition.onend = () => {
      if (!lupaKataHasResultRef.current) {
        setChatHistory((prev) => [
          ...prev.filter(
            (c) => !(c.sender === "Helper" && c.type === "prompt")
          ),
          {
            sender: "Helper",
            type: "result",
            indo: "—",
            english: "❗ Tidak terdengar. Coba ucapkan lagi ya.",
          },
        ]);
      }
      setIsLupaKataActive(false);

      // resume main recording jika sebelumnya sedang merekam
      if (wasRecordingBeforeLupaKataRef.current) {
        // setTimeout(() => {
        //   isPausedForLupaKataRef.current = false; // reset pause
        //   recognitionRef.current?.start(); // lanjutkan recording
        //   setIsRecording(true);
        // }, 300);
        isPausedForLupaKataRef.current = false;
        recognitionRef.current?.start();
        setIsRecording(true);
      }
    };

    setTimeout(() => {
      recognition.start();
    }, 300);

    lupaKataRecognitionRef.current = recognition;
  };

  const [micReady, setMicReady] = useState(false);
  const [micError, setMicError] = useState(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const toggleSuggestion = () => {
    resetIdle();
    if (!showSuggestions) fetchSuggestions();
    setShowSuggestions(!showSuggestions);
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // hentikan stream, kita hanya butuh permission-nya
      stream.getTracks().forEach((track) => track.stop());

      setMicReady(true);
      setMicError(null);
      console.log("🎤 Microphone permission granted");
    } catch (err) {
      console.error("❌ Microphone permission denied", err);
      setMicError("Microphone access is required to record voice.");
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
      // jika sedang pause karena Lupa Kata, jangan kirim transcript
      if (isPausedForLupaKataRef.current) {
        console.log(
          "⏸ Recording paused for Lupa Kata, transcript tidak dikirim"
        );
        return; // keluar saja
      }

      const finalText = normalizeText(transcriptRef.current);

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

  const sendTextToBackend = (text) => {
    // 1️⃣ tampilkan user dulu
    setChatHistory((prev) => [...prev, { sender: "You", message: text }]);

    // 2️⃣ buka EventSource ke endpoint streaming GET
    const source = new EventSource(
      `https://fastapi-speak-v0-production.up.railway.app/stream_answer?query=${encodeURIComponent(
        text
      )}`
    );

    let aiText = "";

    source.onmessage = (event) => {
      // setiap potongan AI dikirim, update aiText
      aiText += event.data;

      // live update chat, gunakan AI-temp
      setChatHistory((prev) => {
        const withoutAI = prev.filter((c) => c.sender !== "AI-temp");
        return [...withoutAI, { sender: "AI-temp", message: aiText }];
      });
    };

    source.onerror = () => {
      // streaming selesai → ubah AI-temp jadi AI final
      resetIdle();

      setChatHistory((prev) =>
        prev.map((c) =>
          c.sender === "AI-temp" ? { sender: "AI", message: aiText } : c
        )
      );

      // TTS baru diputar setelah semua jawaban selesai
      if (aiText) {
        const getVoices = () => {
          return new Promise((resolve) => {
            let voices = speechSynthesis.getVoices();
            if (voices.length) {
              resolve(voices);
              return;
            }
            speechSynthesis.onvoiceschanged = () => {
              voices = speechSynthesis.getVoices();
              resolve(voices);
            };
          });
        };

        const speakWithVoice = async (
          text,
          voiceName = "Google US English"
        ) => {
          const voices = await getVoices();
          const voice = voices.find((v) => v.name === voiceName) || voices[0];

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = voice.lang; // language is taken from the voice
          utterance.voice = voice;

          speechSynthesis.speak(utterance);
        };

        // Example: use "Google US English" or "Alex"
        speakWithVoice(aiText, "Google US English");
      }

      source.close();
    };
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
        }
      );

      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    // Pilih voice tertentu, misal Google US English
    const voices = speechSynthesis.getVoices(); // <-- sini
    const voice =
      voices.find((v) => v.name === "Google US English") || voices[0];
    utterance.voice = voice;
    speechSynthesis.speak(utterance);
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
            requestMicPermission={requestMicPermission}
            toggleSuggestion={toggleSuggestion}
            isIdle={isIdle}
            openLupaKata={startLupaKata}
            requestSpeakerPermission={requestSpeakerPermission}
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
