// ================== REACT CORE ==================
import { useEffect, useState, useRef } from "react";

// ================== UI COMPONENTS ==================
import Header from "./components/Header";
import ChatSection from "./components/ChatSection";
import BottomActions from "./components/BottomActions";
import AudioUnlockOverlay from "./components/AudioUnlockOverlay";
import RoleplayToggle from "./components/RoleplayToggleSwipe";
import RoleplaySummaryCard from "./components/RoleplaySummaryCard";
import DailyStoryIndicator from "./components/DailyStoryIndicator";
import Testcard_swipe from "./components/testcard_swipe";
import ModeSelector from "./components/ModeSelector";

// ================== STYLES ==================
import "./App.css";

// ================== CORE HOOKS ==================
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import useAudioPermission from "./hooks/useAudioPermission";
import useMicController from "./hooks/useMicController";

// ================== FEATURE HOOKS ==================
import useLupaKata from "./hooks/useLupaKata";
import useSuggestions from "./hooks/useSuggestions";
import useIdle from "./hooks/useIdle";
import useConversationEngine from "./hooks/useConversationEngine";
import useRoleplay from "./hooks/useRoleplay";
import useDailyStory from "./hooks/useDailyStory";
import useHistoryManager from "./hooks/useHistoryManager";
import useStreak from "./hooks/useStreak";

// ================== AUDIO ==================
import useTTS_Google from "./hooks/useTTS_Google";
import useMicMonitor from "./utils/useMicMonitor";
import { detectPhase } from "./utils/detectPhase";

// ================== DEV / DEBUG ==================
import useEruda from "./hooks/useEruda";
import useBackendPing from "./hooks/useBackendPing";

// ================== UTILITIES ==================
import { normalizeForTTS } from "./utils/ttsUtils";
import { linkBackend } from "./config";

export default function SpeakingApp() {
  /*
========================================================
                SPEAKING APP (MAIN APP)
--------------------------------------------------------
Orchestrator utama aplikasi speaking AI.

Flow utama aplikasi:

User Speech
   ↓
SpeechRecognition (STT)
   ↓
ConversationEngine (AI Response)
   ↓
Text To Speech (TTS)
   ↓
Chat UI Update

Feature tambahan:
- Roleplay scenario
- Daily story
- Suggestion helper
- Lupa kata helper
- Idle detection
========================================================
*/

  // ================== UI STATE ==================
  const [isRecording, setIsRecording] = useState(false); // 🔴 Status perekaman
  const [showSuggestions, setShowSuggestions] = useState(false); // 🔴 Tampilkan saran
  const [showOverlay, setShowOverlay] = useState(true); // 🔑 SATU-SATUNYA GATE

  // ================== Set Mode ==================
  const [mode, setMode] = useState("freeTalk");
  const modeRef = useRef(mode);
  // freeTalk | dailyStory | roleplay

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // ================== SESSION MANAGEMENT ==================
  const [sessionId, setSessionId] = useState("ninda");
  const sessionIdRef = useRef(sessionId);

  // ================== CHAT STATE ==================
  const [chatHistory, setChatHistory] = useState([]);

  // ================== ROLEPLAY CONTEXT ==================
  const scenarioRef = useRef(null);

  // ================== DAILY STORY ==================
  const { dailyStory, toggleDailyPhase, markPhaseComplete, completedCount } =
    useDailyStory();
  const currentPhase = detectPhase();

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

  // ================== Check Mic ==================
  const { volume, showPopup } = useMicMonitor();

  // ================== HOOKS ==================
  const { speakText, isSpeaking, forceStop } = useTTS_Google(); // 🗣️ Text-to-Speech

  // ================== RolePlay ==================
  const {
    selectedScenario,
    selectScenario,
    showSummary,
    summaryData,
    closeSummary,
    handleRoleplayCompleted,
  } = useRoleplay({
    sessionIdRef,
    scenarioRef,
    chatHistory,
    setChatHistory,
  });

  // ================== SEND TEXT TO BACKEND ==================
  const { sendTextToBackend } = useConversationEngine({
    sessionIdRef,
    scenarioRef,
    modeRef, // ⭐ tambah ini
    setChatHistory,
    speakText,
    onRoleplayCompleted: handleRoleplayCompleted,
  });

  // ================== SUGGESTIONS ==================
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

  // ===== clearAllHistory =====
  const { clearAllHistory } = useHistoryManager({
    sessionIdRef,
    setChatHistory,
    selectScenario,
  });

  // ================== Update Streak ==================
  const { streak, updateStreak, fetchStreak } = useStreak(sessionId);

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

  const { startRecording } = useMicController({
    rawStartRecording,
    forceStop,
  });
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

          <div className="text-white">
            <p>Mic Volume: {volume}</p>

            {showPopup && (
              <div className="fixed top-5 right-5 bg-red-500 text-white px-4 py-3 rounded shadow-lg">
                ⚠️ Mikrofon tidak terdeteksi suara!
              </div>
            )}
          </div>

          {/* SUMMARY CARD */}
          {showSummary && summaryData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <RoleplaySummaryCard data={summaryData} onClose={closeSummary} />
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

          {mode === "dailyStory" && (
            <DailyStoryIndicator
              dailyStory={dailyStory}
              onToggle={toggleDailyPhase}
            />
          )}

          {mode !== "dailyStory" && (
            <RoleplayToggle
              key={selectedScenario?.id ?? "main"}
              selectedScenario={selectedScenario}
              onScenarioSelect={selectScenario}
            />
          )}

          <ModeSelector mode={mode} setMode={setMode} />

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
              isSpeaking, // ✅ TAMBAHKAN
              forceStop, // ✅ TAMBAHKAN
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
