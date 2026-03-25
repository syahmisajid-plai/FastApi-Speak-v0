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
import ContextRenderer from "./components/ContextRenderer";

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
  const [roleplayModalOpen, setRoleplayModalOpen] = useState(false);

  const [pendingMode, setPendingMode] = useState(null);
  const [showModeConfirm, setShowModeConfirm] = useState(false);

  const [activePhase, setActivePhase] = useState("morning");

  // ================== Set Mode ==================
  const [mode, setMode] = useState("freeTalk");
  const modeRef = useRef(mode);
  // freeTalk | dailyStory | roleplay

  // ================== STATE Daily Greeting ==================
  const [dailyGreetingDone, setDailyGreetingDone] = useState(false);

  // ================== REF AUDIO ==================
  const audioDailyStartRef = useRef(null);

  // ================== Load History ==================
  const loadDailyHistory = async (session) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const sessionKey = `${session}_${userId}_daily_${today}_${activePhase}`;

    console.log("🔑 Loading daily history for sessionKey:", sessionKey);

    try {
      const res = await fetch(
        `${linkBackend}/history?session_id=${sessionKey}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const formatted = (Array.isArray(data) ? data : []).map((msg) => ({
        sender: msg.role === "human" ? "You" : "AI",
        message: msg.content, // ✅ sesuai ChatSection
      }));

      setChatHistory(formatted);
      console.log("📥 Daily history loaded:", data);
    } catch (err) {
      console.error("Failed to load daily history:", err);
      setChatHistory([]); // fallback agar .map() tetap aman
    }
  };

  // ================== Lock Daily ==================
  const [timeAllowed, setTimeAllowed] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setTimeAllowed(hour != 16 || hour < 6);
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const isDailyLocked = mode === "dailyStory" && !timeAllowed;

  // ================== Mode change effect ==================
  useEffect(() => {
    modeRef.current = mode;

    if (mode === "dailyStory") {
      loadDailyHistory(sessionIdRef.current); // load history sesuai session terbaru
    } else {
      setChatHistory([]); // reset untuk mode lain
    }

    // console.log("🔄 MODE CHANGED:", mode);
  }, [mode]);

  // ================== SESSION MANAGEMENT ==================
  const [sessionId, setSessionId] = useState("sam");
  const sessionIdRef = useRef(sessionId);

  const userMap = {
    sam: "21121b45-6987-432c-a2cd-fda17eabbd2b",
    syifa: "51c3476b-d6a9-4d82-8bf2-64bbf53f2e50",
  };

  const userId = userMap[sessionId];

  // ================== Daily Current ==================
  useEffect(() => {
    if (mode !== "dailyStory") return;

    fetch(
      `${linkBackend}/daily-story/progress?session_id=${sessionId}&user_id=${userId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        const phase = detectPhase(data); // atau backend kirim current_phase langsung
        setActivePhase(phase);
      });
  }, [mode, sessionId]);

  // ================== CHAT STATE ==================
  const [chatHistory, setChatHistory] = useState([]);

  // ================== ROLEPLAY CONTEXT ==================
  const scenarioRef = useRef(null);

  // ================== DAILY STORY ==================
  const {
    dailyStory,
    toggleDailyPhase,
    markPhaseComplete,
    completedCount,
    generateSummary,
  } = useDailyStory(userId);
  const currentPhase = detectPhase();

  const [readyToContinue, setReadyToContinue] = useState(false);
  const [currentStoryPhase, setCurrentStoryPhase] = useState(null);

  useEffect(() => {
    // ⭐ Fetch progress saat masuk dailyStory
    if (mode === "dailyStory") {
      fetch(
        `${linkBackend}/daily-story/progress?session_id=${sessionId}&user_id=${userId}`,
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("📥 Daily Story Progress fetched:", data);

          // tandai fase yang sudah lengkap
          for (const phase in data) {
            if (data[phase]) {
              markPhaseComplete(phase);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [mode, sessionId]);

  // ================== REF ==================
  const bottomRef = useRef(null); // 🔵 Scroll ke bawah chat
  const recognitionRef = useRef(null); // 🔵 Referensi untuk SpeechRecognition
  const shouldSendOnEndRef = useRef(false); // 🔵 Flag untuk mengirim teks otomatis

  // ================== PopUp Change Mode ==================
  const handleModeChange = (newMode) => {
    if (chatHistory.length > 0) {
      setPendingMode(newMode);
      setShowModeConfirm(true);
      return;
    }

    setMode(newMode);
  };
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
  // const [checklistProgress, setChecklistProgress] = useState({
  //   totalDone: 0,
  //   totalChecklist: 0,
  // });

  const [showContext, setShowContext] = useState(false);

  const {
    selectedScenario,
    isLoading,
    showSummary,
    summaryData,
    selectScenario,
    closeSummary,
    exitRoleplay,
    handleRoleplayCompleted, // ✅ TAMBAH
    pushNextStepToChat,
    activeContext,
  } = useRoleplay({
    sessionIdRef,
    scenarioRef,
    chatHistory,
    setChatHistory,
    // checklistProgress,
  });

  const maxTurn = selectedScenario?.target_turn ?? 0;

  const currentTurn = chatHistory.filter((msg) => msg.sender === "You").length;

  const handleChecklistFinished = (progress) => {
    handleRoleplayCompleted("Checklist completed", progress);
  };

  const handleChecklistUpdate = (updatedChecklist, currentStep) => {
    console.log("📍 CURRENT STEP:", currentStep);

    pushNextStepToChat(updatedChecklist);
  };

  useEffect(() => {
    if (activeContext) {
      setShowContext(true);
    }
  }, [activeContext]);

  // ================== SEND TEXT TO BACKEND ==================
  const { sendTextToBackend } = useConversationEngine({
    sessionIdRef,
    userId,
    scenarioRef,
    modeRef,
    setChatHistory,
    speakText,

    onRoleplayCompleted: handleRoleplayCompleted, // ✅ FIX

    // ⭐ TAMBAHKAN INI
    onPhaseCompleted: (phase) => {
      console.log("🌅 DAILY PHASE READY:", phase);

      setCurrentStoryPhase(phase);
      setReadyToContinue(true);
    },
  });

  // ================== Chat User Terakhir kali (untuk checklist roleplay) ==================
  const lastUserMessage = chatHistory
    .filter((msg) => msg.sender === "You")
    .slice(-1)[0]?.message;

  // ================== Sapaan Pertama Daily ==================
  useEffect(() => {
    if (mode !== "dailyStory") return; // ✅ hanya di mode dailyStory
    if (isDailyLocked) return;
    if (dailyGreetingDone) return; // ✅ pastikan hanya sekali

    const today = new Date().toISOString().split("T")[0];
    const sessionKey = `${sessionId}_${userId}_daily_${today}_${activePhase}`;

    console.log("🔄 Checking first daily greeting...", { sessionKey });

    fetch(`${linkBackend}/history?session_id=${sessionKey}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("📥 Daily history loaded:", data);

        if (data.length === 0) {
          console.log("🎉 No chat yet today → sending first greeting");

          setChatHistory((prev) => [
            ...prev,
            {
              sender: "AI",
              message:
                "Time to share your story today 😊. How did your morning start?",
              phase: "morning", // optional: tandai phase
            },
          ]);

          // 🎵 Mainkan audio
          audioDailyStartRef.current?.play().catch(console.error);
          setDailyGreetingDone(true);
        } else {
          console.log("⏭ Chat already exists today → skipping greeting");
          setDailyGreetingDone(true); // tetap tandai done supaya tidak repeat
        }
      })
      .catch(console.error);
  }, [mode, sessionId, dailyGreetingDone]);

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
    onFinalResult: (text) => {
      sendTextToBackend(text); // ✅ SEMUA MODE LEWAT SINI
    },
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

  // ================== KELUAR DARI MODE ROLEPLAY ==================

  useEffect(() => {
    if (mode !== "roleplay" && selectedScenario) {
      // ❌ Reset roleplay saat pindah mode selain roleplay
      setRoleplayModalOpen(false); // tutup modal
      exitRoleplay();
    }
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const phaseOrder = ["morning", "afternoon", "evening", "night"];

  const getNextPhase = (phase) => {
    if (!phase) return "morning";
    const index = phaseOrder.indexOf(phase);
    return phaseOrder[index + 1] || "night";
  };

  // const activePhase = getNextPhase(currentStoryPhase);

  // =
  return (
    <>
      {/* 🔥 MAIN APP — SELALU RENDER */}
      <div
        className={`min-h-screen lg:w-full flex justify-center p-4
        ${
          mode === "dailyStory"
            ? "bg-linear-to-b from-gray-800 to-gray-900"
            : mode === "roleplay"
              ? "bg-linear-to-b from-purple-400 to-indigo-600"
              : "bg-linear-to-b  from-slate-900 to-blue-950"
        }`}
      >
        <div
          className="w-full max-w-md flex flex-col space-y-4 sm:space-y-6 mb-16"
          onClick={resetIdle}
          onWheel={resetIdle}
        >
          <Header streak={streak} />

          {/* 🔊 Audio untuk greeting daily */}
          <audio
            ref={audioDailyStartRef}
            src="/src/assets/daily_start.mp3"
            preload="auto"
          />

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

          {showContext && activeContext && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="bg-white text-black rounded-xl p-5 w-[350px] max-h-[80vh] overflow-y-auto shadow-xl">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">📌 Situation Details</h2>
                  <button onClick={() => setShowContext(false)}>✖</button>
                </div>

                {/* CONTENT */}
                <ContextRenderer context={activeContext} />
              </div>
            </div>
          )}

          {/* 🔥 TAMBAHKAN DI SINI */}
          {mode === "roleplay" &&
            selectedScenario &&
            activeContext &&
            !showContext && (
              <button
                onClick={() => setShowContext(true)}
                className="
              text-sm
              fixed 
              bottom-65 
              right-4 
              z-40
              bg-blue-600! 
              text-white 
              px-4! py-3! 
              rounded-full 
              shadow-lg
              hover:scale-105
              active:scale-95
              transition
            "
              >
                📌
              </button>
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
              isDailyLocked={isDailyLocked}
            />
          )}

          {mode === "dailyStory" &&
            readyToContinue &&
            (() => {
              const next = getNextPhase(currentStoryPhase);
              const isLastPhase = !next;

              return (
                <div className="px-3 mt-4">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `${linkBackend}/daily-story/next_phase`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              session_id: sessionId,
                              user_id: userId,
                            }),
                          },
                        );

                        if (!res.ok) throw new Error(`HTTP ${res.status}`);

                        const data = await res.json();
                        console.log("PHASE MOVED:", data);
                        setActivePhase(detectPhase(data));

                        // ✅ tandai phase selesai
                        markPhaseComplete(currentStoryPhase);

                        // ✅ reset tombol
                        setReadyToContinue(false);

                        // 🎉 JIKA LAST PHASE → GENERATE SUMMARY
                        if (isLastPhase) {
                          console.log("🎉 STORY FINISHED → GENERATING SUMMARY");

                          const summary = await generateSummary();

                          console.log("📊 FINAL SUMMARY:", summary);

                          // optional UI:
                          // setSummaryData(summary)
                          // setShowSummary(true)
                        }
                      } catch (err) {
                        console.error("❌ Failed to move phase:", err);
                      }
                    }}
                    className="
          group
          w-full
          bg-gradient-to-r
          from-emerald-500
          to-green-600
          text-white
          rounded-2xl
          py-4
          px-4
          shadow-lg
          active:scale-95
          transition-all
          duration-200
          flex
          items-center
          justify-between
        "
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {isLastPhase ? "🎉" : "🚀"}
                      </div>

                      <div className="flex flex-col text-left">
                        <span className="text-xs opacity-80">
                          Phase {currentStoryPhase} complete
                          {!isLastPhase && ` → ${next}`}
                        </span>

                        <span className="font-semibold text-base leading-tight">
                          {isLastPhase ? "Finish Story" : "Continue Story"}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="text-xl group-active:translate-x-1 transition">
                      →
                    </div>
                  </button>
                </div>
              );
            })()}

          {mode !== "dailyStory" && (
            <RoleplayToggle
              selectedScenario={selectedScenario}
              onScenarioSelect={selectScenario}
              isOpen={roleplayModalOpen} // controlled
              setIsOpen={setRoleplayModalOpen} // controlled
              setMode={setMode} // <-- tambahkan ini
              lastUserMessage={lastUserMessage}
              onFinish={handleChecklistFinished}
              onChecklistUpdate={handleChecklistUpdate}
              currentTurn={currentTurn}
              maxTurn={maxTurn}
            />
          )}

          <ModeSelector
            mode={mode}
            setMode={(newMode) => {
              if (newMode === mode) return;
              setMode(newMode);

              if (newMode === "roleplay") setRoleplayModalOpen(true); // ✅ buka modal langsung
            }}
          />

          {showModeConfirm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white text-black rounded-xl p-6 w-[300px] text-center space-y-4">
                <h2 className="text-lg font-semibold">Change Mode?</h2>

                <p className="text-sm text-gray-600">
                  Chat history will be cleared. Continue?
                </p>

                <div className="flex justify-center gap-4 pt-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                    onClick={() => {
                      setShowModeConfirm(false);
                      setPendingMode(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 bg-red-500  rounded-lg"
                    onClick={() => {
                      setMode(pendingMode);
                      setChatHistory([]);
                      setPendingMode(null);
                      setShowModeConfirm(false);
                    }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SESSION ID INPUT */}
          <div className="flex items-center space-x-2 text-white">
            <label htmlFor="sessionId">Session ID:</label>
            <select
              id="sessionId"
              className="p-1 rounded text-white bg-gray-700"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            >
              <option value="sam">sam</option>
              <option value="syifa">syifa</option>
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
              openLupaKata: () =>
                lupaKata.toggleLupaKata(
                  isRecording, // main recording sedang aktif
                  speech.pauseRecording, // pause main recording sementara
                  speech.resumeRecording, // resume setelah selesai
                ),
              isLupaKataActive: lupaKata.isLupaKataActive,
              lupaKataResult: lupaKata.lupaKataResult,
              isDailyLocked,
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
