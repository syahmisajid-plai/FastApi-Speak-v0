import { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import ChatSection from "./components/ChatSection";
import BottomActions from "./components/BottomActions";
import AudioUnlockOverlay from "./components/AudioUnlockOverlay";
// import RoleplayToggle from "./components/RoleplayToggle";
import RoleplayToggle from "./components/RoleplayToggleSwipe";
import RoleplaySummaryCard from "./components/RoleplaySummaryCard";
import Testcard_swipe from "./components/testcard_swipe";
import "./App.css";

import useLupaKata from "./hooks/useLupaKata";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import useAudioPermission from "./hooks/useAudioPermission";
import useIdle from "./hooks/useIdle";

// import useTTS from "./hooks/useTTS";
import useTTS_Google from "./hooks/useTTS_Google";
import useSuggestions from "./hooks/useSuggestions";
import useEruda from "./hooks/useEruda";
import useBackendPing from "./hooks/useBackendPing";
import { streamChat } from "./services/chatService";

import { linkBackend } from "./config";

import { normalizeForTTS } from "./utils/ttsUtils";

export default function SpeakingApp() {
  // ================== STATE ==================
  const [isRecording, setIsRecording] = useState(false); // 🔴 Status perekaman
  const [chatHistory, setChatHistory] = useState([]); // 🔴 Riwayat chat
  const [showSuggestions, setShowSuggestions] = useState(false); // 🔴 Tampilkan saran
  const [showOverlay, setShowOverlay] = useState(true); // 🔑 SATU-SATUNYA GATE
  const [selectedScenario, setSelectedScenario] = useState(null);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null); // Bisa berisi info skor, highlights, AI response, dll

  useEffect(() => {
    scenarioRef.current = selectedScenario;
  }, [selectedScenario]);

  // ================== REF ==================
  const bottomRef = useRef(null); // 🔵 Scroll ke bawah chat
  const recognitionRef = useRef(null); // 🔵 Referensi untuk SpeechRecognition
  const shouldSendOnEndRef = useRef(false); // 🔵 Flag untuk mengirim teks otomatis
  const scenarioRef = useRef(null);

  // ================== AUDIO PERMISSION ==================
  const {
    micReady,
    micError,
    speakerReady,
    speakerError,
    requestAudioPermission,
  } = useAudioPermission(); // 🎤 Hook audio permission

  // ================== HOOKS ==================
  const { speakText, isSpeaking, forceStop } = useTTS_Google(); // 🗣️ Text-to-Speech
  const { suggestions, fetchSuggestions } = useSuggestions(chatHistory); // 💡 Saran dari chat history
  const { isIdle, resetIdle } = useIdle(15000); // ⏱️ Deteksi idle user (15 detik)

  // ================== DEV TOOL ==================
  useEruda(); // 🛠️ Console dev tool untuk mobile

  // ================== Unlock Screen ==================
  const handleUnlock = async () => {
    await requestAudioPermission();
  };

  // ================== BACKEND ==================
  useBackendPing(); // 🔗 Check backend connection

  // ================== SESSION ==================
  const [sessionId, setSessionId] = useState("ninda"); // 🆔 Sekarang bisa diedit

  // ================== SEND TEXT TO BACKEND ==================
  const sendTextToBackend = async (text) => {
    await streamChat({
      text,
      sessionId: sessionIdRef.current,
      scenarioId: scenarioRef.current?.id ?? 0,

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

      onStreamEnd: async (finalText, meta) => {
        // Update AI final message
        setChatHistory((prev) =>
          prev.map((c) =>
            c.sender === "AI-temp" ? { sender: "AI", message: finalText } : c,
          ),
        );

        speakText(finalText);
        updateStreak().catch(() => {});
        fetchStreak();

        // Hanya Roleplay >0 yang auto-clear
        if (meta?.completed && scenarioRef.current?.id > 0) {
          console.log("🏁 Roleplay finished → Show summary");

          const totalTurns =
            chatHistory.filter((c) => c.sender === "You").length + 1;

          setSummaryData({
            totalTurns,
            lastMessage: finalText,
            duration: "5m 12s",
          });

          setShowSummary(true);

          // Clear frontend history & reset scenario
          setChatHistory([]);
          setSelectedScenario(null);

          // Clear backend roleplay history
          try {
            await fetch(`${linkBackend}/roleplay/clear`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: sessionIdRef.current,
                scenario_id: scenarioRef.current.id,
              }),
            });
            console.log("🧹 Backend roleplay history cleared");
          } catch (err) {
            console.error("❌ Failed to clear backend roleplay history", err);
          }
        }
      },
    });
  };

  // ===== clearAllHistory =====
  const clearAllHistory = async () => {
    const confirmClear = window.confirm(
      "Hapus SEMUA chat history user ini? (main + semua roleplay)",
    );

    if (!confirmClear) return;

    try {
      await fetch(`${linkBackend}/history/clear-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
        }),
      });

      setChatHistory([]); // reset UI
      console.log("🧹 ALL history cleared");
    } catch (err) {
      console.error("Failed clear all history", err);
    }
  };

  // ================== Update Streak ==================

  const updateStreak = async () => {
    try {
      await fetch(`${linkBackend}/user/update-streak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
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
      const res = await fetch(`${linkBackend}/user/streak/${sessionId}`);
      const data = await res.json();
      setStreak(data);
    } catch (err) {
      console.error("Failed to fetch streak:", err);
    }
  };

  const sessionIdRef = useRef(sessionId);

  useEffect(() => {
    sessionIdRef.current = sessionId;
    setChatHistory([]); // reset chat history saat ganti session
    fetchStreak();
  }, [sessionId]); // ✅ Update saat sessionId berubah

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

  const startRecording = () => {
    console.log("🎤 Mic button pressed");

    // 🔴 1. Paksa stop TTS
    forceStop();

    // 🔥 2. iOS release delay kecil
    setTimeout(() => {
      rawStartRecording();
    }, 180); // 150–200ms sweet spot
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // =
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

          {/* SUMMARY CARD */}
          {showSummary && summaryData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <RoleplaySummaryCard
                data={summaryData}
                onClose={async () => {
                  setShowSummary(false); // sembunyikan card
                  setChatHistory([]); // reset chat
                  setSelectedScenario(null); // keluar roleplay

                  // clear backend history
                  await fetch(`${linkBackend}/roleplay/clear`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      session_id: sessionIdRef.current,
                      scenario_id: scenarioRef.current?.id ?? 0,
                    }),
                  });
                }}
              />
            </div>
          )}

          <div className="relative">
            {/* konten lain */}

            {/* 🧹 CLEAR BUTTON */}
            <button
              onClick={clearAllHistory}
              title="Clear all history"
              className="
                absolute 
                bottom-2 right-2 
                text-[10px]
                bg-red-500/80 hover:bg-red-600
                px-2 py-1
                rounded-md
                shadow-md
    "
            >
              🧹
            </button>
          </div>

          <RoleplayToggle
            key={selectedScenario?.id ?? "main"} // 🔥 force remount saat keluar
            selectedScenario={selectedScenario} // 🔥 controlled component
            onScenarioSelect={async (scenario) => {
              const prevScenario = scenarioRef.current;

              try {
                // 🧹 1️⃣ Jika keluar roleplay
                if (scenario === null && prevScenario) {
                  await fetch(`${linkBackend}/roleplay/clear`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      session_id: sessionIdRef.current,
                      scenario_id: prevScenario.id,
                    }),
                  });

                  console.log("🧹 Roleplay cleared");
                }

                // ⭐ 2️⃣ Jika masuk roleplay baru
                if (scenario) {
                  await fetch(`${linkBackend}/roleplay/start`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      session_id: sessionIdRef.current,
                      scenario_id: scenario.id,
                    }),
                  });

                  console.log("🎯 Roleplay started:", scenario.name);
                }

                // 🧼 3️⃣ RESET UI STATE
                setChatHistory([]); // bersihkan chat
                setSelectedScenario(scenario ?? null); // reset scenario
              } catch (err) {
                console.error("❌ Roleplay error:", err);
              }
            }}
          />

          {/* SESSION ID INPUT */}
          <div className="flex items-center space-x-2 text-white">
            <label htmlFor="sessionId">Session ID:</label>
            <select
              id="sessionId"
              className="p-1 rounded text-white bg-gray-700"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            >
              <option value="ninda">ninda</option>
              <option value="syahmi">syahmi</option>
            </select>
          </div>

          <ChatSection
            lupaKata={lupaKata}
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
              openLupaKata: () => lupaKata.toggleLupaKata(isRecording),
              isLupaKataActive: lupaKata.isLupaKataActive,
              lupaKataResult: lupaKata.lupaKataResult,
            }}
          />

          <div className="mb-48" />
        </div>
      </div>

      {/* 🧱 OVERLAY — DI ATAS MAIN APP */}
      {showOverlay && (
        <AudioUnlockOverlay
          onUnlock={handleUnlock}
          onFinish={() => setShowOverlay(false)}
        />
      )}
    </>
  );
}
