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

  const [micReady, setMicReady] = useState(false);
  const [micError, setMicError] = useState(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const toggleSuggestion = () => {
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

  const startRecording = () => {
    transcriptRef.current = "";
    setLiveTranscript("");
    setIsCanceled(false);
    recognitionRef.current?.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsCanceled(false);
    recognitionRef.current?.stop();
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelRecording = () => {
    setIsCanceled(true);
    transcriptRef.current = "";
    setLiveTranscript("");
    recognitionRef.current?.stop();
  };

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      if (isCanceled) return; // ⬅️ tambahkan ini

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
      const finalText = normalizeText(transcriptRef.current);
      setLiveTranscript("");

      if (!isCanceled && finalText) sendTextToBackend(finalText);

      transcriptRef.current = "";
      setIsCanceled(false);
      setIsRecording(false);
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
      `http://127.0.0.1:8000/stream_answer?query=${encodeURIComponent(text)}`
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
    const lastAI = [...chatHistory].reverse().find((c) => c.sender === "AI");
    if (!lastAI) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_ai_reply: lastAI.message }),
      });

      const data = await res.json();
      setSuggestions(data.suggestions); // update state
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isRecording) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isRecording]);

  return (
    <div className="min-h-screen w-11/12 lg:w-full flex justify-center bg-linear-to-b from-slate-900 to-blue-950 p-4">
      <div className="w-full max-w-md space-y-6 flex flex-col">
        <Header />
        <Topic />
        <ChatSection
          chatHistory={chatHistory}
          liveTranscript={liveTranscript}
          bottomRef={bottomRef}
        />

        <div className="fixed bottom-20 lg:bottom-20 left-0 w-11/12 lg:w-full px-4 space-y-4">
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
