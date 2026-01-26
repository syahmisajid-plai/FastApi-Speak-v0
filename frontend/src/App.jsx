import { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import Topic from "./components/Topic";
import ChatSection from "./components/ChatSection";
import BottomActions from "./components/BottomActions";
import AudioUnlockOverlay from "./components/AudioUnlockOverlay";
import "./App.css";

import useLupaKata from "./hooks/useLupaKata";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import useAudioPermission from "./hooks/useAudioPermission";
import useIdle from "./hooks/useIdle";

import useTTS from "./hooks/useTTS";
import useSuggestions from "./hooks/useSuggestions";
import useEruda from "./hooks/useEruda";
import useBackendPing from "./hooks/useBackendPing";
import { streamChat } from "./services/chatService";

import { normalizeForTTS } from "./utils/ttsUtils";

export default function SpeakingApp() {
  // ================== STATE ==================
  const [isRecording, setIsRecording] = useState(false); // 🔴 Status perekaman
  const [chatHistory, setChatHistory] = useState([]); // 🔴 Riwayat chat
  const [showSuggestions, setShowSuggestions] = useState(false); // 🔴 Tampilkan saran
  const [showOverlay, setShowOverlay] = useState(true); // 🔑 SATU-SATUNYA GATE

  // ================== REF ==================
  const bottomRef = useRef(null); // 🔵 Scroll ke bawah chat
  const recognitionRef = useRef(null); // 🔵 Referensi untuk SpeechRecognition
  const shouldSendOnEndRef = useRef(false); // 🔵 Flag untuk mengirim teks otomatis

  // ================== AUDIO PERMISSION ==================
  const {
    micReady,
    micError,
    speakerReady,
    speakerError,
    requestAudioPermission,
  } = useAudioPermission(); // 🎤 Hook audio permission

  // ================== HOOKS ==================
  const { speakText } = useTTS(); // 🗣️ Text-to-Speech
  const { suggestions, fetchSuggestions } = useSuggestions(chatHistory); // 💡 Saran dari chat history
  const { isIdle, resetIdle } = useIdle(15000); // ⏱️ Deteksi idle user (15 detik)

  // ================== DEV TOOL ==================
  useEruda(); // 🛠️ Console dev tool untuk mobile

  // ================== Unlock Screen ==================
  const handleUnlock = async () => {
    await requestAudioPermission();

    // ⏳ tunggu animasi overlay selesai
    setTimeout(() => {
      setShowOverlay(false);
    }, 700);
  };

  // ================== BACKEND ==================
  useBackendPing(); // 🔗 Check backend connection

  const SESSION_ID = "user-123"; // 🆔 Session harus konsisten

  // ================== SEND TEXT TO BACKEND ==================
  const sendTextToBackend = async (text) => {
    await streamChat({
      text,
      sessionId: SESSION_ID,

      // ===== Saat user mengirim pesan =====
      onUserMessage: (msg) => {
        setChatHistory((prev) => [...prev, { sender: "You", message: msg }]);
      },

      // ===== Saat AI streaming jawaban =====
      onStreamUpdate: (aiText) => {
        setChatHistory((prev) => {
          const withoutTemp = prev.filter((c) => c.sender !== "AI-temp");
          return [...withoutTemp, { sender: "AI-temp", message: aiText }];
        });
      },

      // ===== Saat AI selesai streaming =====
      onStreamEnd: (finalText) => {
        setChatHistory((prev) =>
          prev.map((c) =>
            c.sender === "AI-temp" ? { sender: "AI", message: finalText } : c,
          ),
        );

        speakText(normalizeForTTS(finalText)); // 🗣️ AI speak

        fetchStreak();
      },
    });
  };

  // ================== Update Streak ==================

  const updateStreak = async () => {
    try {
      await fetch("http://localhost:8000/user/update-streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID }),
      });
    } catch (err) {
      console.error("Failed update streak", err);
    }
  };

  const [streak, setStreak] = useState({
    current_streak: 0,
    longest_streak: 0,
    chat_count: 0,
  });

  const fetchStreak = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/user/streak/${SESSION_ID}`,
      );
      const data = await res.json();
      setStreak(data);
    } catch (err) {
      console.error("Failed to fetch streak:", err);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  // ================== 1️⃣ LUPA KATA ==================
  const lupaKata = useLupaKata({
    stopMainRecording: () => {
      shouldSendOnEndRef.current = false;
      recognitionRef.current?.abort();
      setIsRecording(false);
    },

    setChatHistory, // update riwayat chat langsung

    onLupaKataResult: speakText, // ✅ Hasil lupa kata langsung dibacakan
  });

  // ================== 2️⃣ SPEECH RECOGNITION ==================
  const speech = useSpeechRecognition({
    recognitionRef,
    setIsRecording,
    shouldSendOnEndRef,
    onFinalResult: sendTextToBackend, // Hasil final dikirim ke backend
    onResetIdle: resetIdle, // Reset idle jika user bicara
    isLupaKataActive: lupaKata.isLupaKataActive, // Jangan rekam utama saat lupa kata aktif
  });

  // ================== DESTRUCTURING SPEECH ==================
  const {
    liveTranscript,
    startRecording: rawStartRecording,
    stopRecording,
    cancelRecording,
  } = speech;

  const startRecording = async () => {
    await updateStreak(); // 🔥 streak naik di sini
    rawStartRecording(); // 🎤 mulai rekam
  };

  // ================== TOGGLE SUGGESTION ==================
  const toggleSuggestion = () => {
    resetIdle();
    if (!showSuggestions) fetchSuggestions();
    setShowSuggestions(!showSuggestions);
  };

  // ================== AUTO SCROLL ==================
  useEffect(() => {
    if (isRecording) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isRecording]);

  return (
    <>
      {/* 🔥 MAIN APP — SELALU RENDER */}
      <div className="min-h-screen lg:w-full flex justify-center bg-linear-to-b from-slate-900 to-blue-950 p-4">
        <div
          className="w-full max-w-md space-y-6 flex flex-col"
          onClick={resetIdle}
          onWheel={resetIdle}
        >
          <Header streak={streak} />

          <Topic />

          <ChatSection
            chatHistory={chatHistory}
            liveTranscript={liveTranscript}
            bottomRef={bottomRef}
          />

          <BottomActions
            isRecording={isRecording}
            showSuggestions={showSuggestions}
            suggestions={suggestions}
            speakText={speakText}
            lupaKata={lupaKata}
            controlProps={{
              isRecording,
              micReady,
              speakerReady,
              requestAudioPermission,
              startRecording,
              stopRecording,
              cancelRecording,
              toggleSuggestion,
              isIdle,
              openLupaKata: () => lupaKata.startLupaKata(isRecording),
              isLupaKataActive: lupaKata.isLupaKataActive,
              lupaKataResult: lupaKata.lupaKataResult,
            }}
          />

          <div className="mb-48" />
        </div>
      </div>

      {/* 🧱 OVERLAY — DI ATAS MAIN APP */}
      {showOverlay && <AudioUnlockOverlay onUnlock={handleUnlock} />}
    </>
  );
}
