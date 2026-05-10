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
import DailySummaryViewer from "./components/DailySummaryViewer";
import FreeTalkUI from "./components/FreeTalkUI";
import VocabUI from "./components/VocabUI";
import LoginOverlay from "./components/LoginOverlay";
import VocabList from "./components/VocabList";
import ComingSoon from "./components/ComingSoon";
import OverlayFeedback from "./components/OverlayFeedback";
import LearnUI from "./components/LearnUI";

import AndroidSTTTest from "./components/AndroidSTTTest";

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
// import useGrammarCheck from "./hooks/useGrammarCheck";
import useVocabEngine from "./hooks/useVocabEngine";
import useTranslationHistory from "./hooks/useTranslationHistory";
import useSentenceLesson from "./hooks/useSentenceLesson";

// ================== AUDIO ==================
import useTTS_Google from "./hooks/useTTS_Google";
import useMicMonitor from "./utils/useMicMonitor";
import { getCurrentPhaseFromProgress } from "./utils/detectPhase";

// ================== DEV / DEBUG ==================
import useEruda from "./hooks/useEruda";
import useBackendPing from "./hooks/useBackendPing";

// ================== UTILITIES ==================
import { normalizeForTTS } from "./utils/ttsUtils";
import { linkBackend } from "./config";

// ================== SERVICES ==================
import { getUser, saveUser, logout } from "./services/authService";

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
  const [showDiary, setShowDiary] = useState(false);
  const [roleplayModalOpen, setRoleplayModalOpen] = useState(false);

  const [freeTalkStarted, setFreeTalkStarted] = useState(false);
  const [dailyStarted, setDailyStarted] = useState(false);
  const [rolePlayStarted, setRolePlayStarted] = useState(false);

  const [activeChecklist, setActiveChecklist] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);

  const [showVocab, setShowVocab] = useState(false);

  // ================== Tambahkan state ==================
  const [pendingMode, setPendingMode] = useState(null);
  const [showModeConfirm, setShowModeConfirm] = useState(false);

  const [activePhase, setActivePhase] = useState("morning");

  const [expanded, setExpanded] = useState(false);

  // ================== Set Mode ==================
  const [mode, setMode] = useState("freeTalk");
  const modeRef = useRef(mode);
  // freeTalk | dailyStory | roleplay | vocab

  const [modeLearn, setModeLearn] = useState("idle");

  // ================== STATE Daily Greeting ==================
  const greetingSentRef = useRef(false);

  // ================== Reset ==================
  const resetAppState = () => {
    setMode("freeTalk");
    setChatHistory([]);
    setFreeTalkStarted(false);
    setDailyStarted(false);
    setRolePlayStarted(false);
    setRoleplayModalOpen(false);
    setShowSuggestions(false);
    setShowDiary(false);
    setShowContext(false);
    setShowModeConfirm(false);
    setPendingMode(null);
  };

  // ================== Login & Logout ==================
  useEffect(() => {
    const savedUser = getUser();

    if (savedUser) {
      console.log("🔁 Auto login:", savedUser);

      setUser(savedUser);
      setSessionId(savedUser.username);
      setShowLogin(false);
    }
  }, []);

  const handleLogout = () => {
    logout();
    resetAppState(true);
    setUser(null);
    setSessionId(null);
    setShowLogin(true);
  };

  // ================== SESSION MANAGEMENT ==================
  const [sessionId, setSessionId] = useState("sam");
  const sessionIdRef = useRef(sessionId);

  const userId = user?.id;
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const audioDailyStartRef = useRef(null);
  const audioFreetalkStartRef = useRef(null);

  // ================== Vocab ==================
  const {
    vocab,
    example, // 🔥 single example for UI
    translation,
    examples, // optional (kalau mau debug/list)
    exampleIndex, // 🔥 untuk UI progress
    phase,
    feedback,
    handleSpeech,
    next,
    setPhase,
    progress,
    showDice,
    startSession,
    completedCountVocab,
    skipbutton,
  } = useVocabEngine(userIdRef);

  // showVocab List
  useEffect(() => {
    document.body.style.overflow = showVocab ? "hidden" : "auto";
  }, [showVocab]);

  // ================== Sentence Lesson ==================
  const {
    lesson,
    loading: loadingSentence,
    completedLessons,
    refetch,
    completeLesson,
  } = useSentenceLesson(userId);

  // ================== Lock Daily ==================
  const [timeAllowed, setTimeAllowed] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setTimeAllowed(hour != 15 || hour < 6);
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const isDailyLocked = mode === "dailyStory" && !timeAllowed;

  // ==================== CEK setIsDailyEmpty ====================
  const [isDailyEmpty, setIsDailyEmpty] = useState(null);

  useEffect(() => {
    if (mode !== "dailyStory") return;

    checkIsDailyEmpty(sessionIdRef.current).then(setIsDailyEmpty);
  }, [mode, sessionId]);

  useEffect(() => {
    console.log("🔥 activePhase updated:", activePhase);
  }, [activePhase]);

  // ================== CHAT STATE ==================
  const [chatHistory, setChatHistory] = useState([]);

  // ================== Set IsScrolled ==================
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20); // threshold bebas
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ================== ROLEPLAY CONTEXT ==================
  const scenarioRef = useRef(null);

  // ================== DAILY STORY ==================
  // Di dalam component
  const [progressData, setProgressData] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
  });

  const {
    dailyStory,
    toggleDailyPhase,
    markPhaseComplete,
    completedCount,

    streakDaily,
    fetchStreakDaily,

    generateSummary,
    loadDailyHistory,
    checkIsDailyEmpty,
    fetchDailyProgress,
    initDailySession,
    nextPhaseRequest,
  } = useDailyStory(
    sessionIdRef,
    userIdRef,
    userId,
    activePhase,
    setActivePhase,
    setChatHistory,
    setProgressData,
  );
  const currentPhase = getCurrentPhaseFromProgress();

  const [readyToContinue, setReadyToContinue] = useState(false);
  const [currentStoryPhase, setCurrentStoryPhase] = useState(null);

  useEffect(() => {
    if (mode !== "dailyStory") return;

    let isActive = true;

    fetchDailyProgress(sessionId, userId).then(() => {
      if (!isActive) return;
    });

    return () => {
      isActive = false;
    };
  }, [mode, sessionId, userId]);

  // nanti di render:
  const allDailyComplete = Object.values(progressData).every((v) => v === true);

  // ================== REF ==================
  const bottomRef = useRef(null); // 🔵 Scroll ke bawah chat
  const recognitionRef = useRef(null); // 🔵 Referensi untuk SpeechRecognition
  const shouldSendOnEndRef = useRef(false); // 🔵 Flag untuk mengirim teks otomatis

  // ================== PopUp Change Mode ==================
  const resetModeState = () => {
    setFreeTalkStarted(false);
    setDailyStarted(false);
    setRolePlayStarted(false);

    // optional tapi disarankan
    setReadyToContinue(false);
  };

  const handleModeChange = (newMode) => {
    if (chatHistory.length > 0) {
      setPendingMode(newMode);
      setShowModeConfirm(true);
      return;
    }

    resetModeState();
    setMode(newMode);

    if (newMode === "roleplay") {
      setRoleplayModalOpen(true);
    }
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
  const { speakText, isSpeaking, forceStop } = useTTS_Google(userIdRef, mode); // 🗣️ Text-to-Speech

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
    sendInitialMessage,
  } = useRoleplay({
    sessionIdRef,
    scenarioRef,
    chatHistory,
    setChatHistory,
    userId,
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

  // console.log("======================= userId =======================", userId);

  useEffect(() => {
    modeRef.current = mode;
    console.log("🧠 modeRef updated:", mode);
  }, [mode]);

  // const { checkGrammar, result, loading, error } = useGrammarCheck();

  // useEffect(() => {
  //   checkGrammar("We was happy last night.");
  // }, []);

  // useEffect(() => {
  //   if (!result) return;

  //   console.log("=== RESULT ===");
  //   console.log(result);
  // }, [result]);

  // ================== SEND TEXT TO BACKEND ==================
  const { sendTextToBackend } = useConversationEngine({
    sessionIdRef,
    userIdRef,
    scenarioRef,
    modeRef,
    setChatHistory,
    speakText,

    // grammarResult: result, // 🔥 TAMBAHKAN INI

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

  // ================== Sapaan Pertama Daily / Load History Daily ==================
  useEffect(() => {
    if (mode !== "dailyStory") return;
    if (!dailyStarted) return;
    if (isDailyLocked) return;

    let isActive = true;

    initDailySession({ sessionId, userId }).then((result) => {
      if (!isActive) return;

      if (result.type === "EMPTY") {
        setChatHistory((prev) => {
          const last = prev[prev.length - 1];

          if (last?.type === "phase" && last.phase === "morning") {
            return prev;
          }

          return [
            ...prev,
            { type: "phase", phase: "morning" },
            {
              type: "chat",
              sender: "AI",
              message:
                "Time to share your story today 😊. How did your morning start?",
            },
          ];
        });

        // 🔊 tetap di parent
        audioDailyStartRef.current?.play().catch(console.error);
      }

      if (result.type === "HAS_DATA") {
        loadDailyHistory(sessionIdRef.current);
      }
    });

    return () => {
      isActive = false;
    };
  }, [mode, sessionId, dailyStarted, isDailyLocked]);

  // ================== Sapaan Freetalk ==================
  useEffect(() => {
    if (mode !== "freeTalk") return;
    if (!freeTalkStarted) return;

    setChatHistory((prev) => {
      // 🔥 GUARD: cegah duplicate greeting
      const alreadyExists = prev.some(
        (msg) =>
          msg.sender === "AI" &&
          msg.message.includes("I’m here if you feel like talking"),
      );

      if (alreadyExists) return prev;

      return [
        ...prev,
        {
          type: "chat",
          sender: "AI",
          message:
            "Hey 👋 I’m here if you feel like talking 😊 Anything you want to chat about?",
        },
      ];
    });

    // 🎵 Mainkan audio
    audioFreetalkStartRef.current?.play().catch(console.error);
  }, [mode, freeTalkStarted]);

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
    setChatHistory, // update riwayat chat langsung

    onLupaKataResult: speakText, // ✅ Hasil lupa kata langsung dibacakan
    isSpeaking,

    userIdRef,
  });

  const [overlayFavoritTranslated, setOverlayFavoritTranslated] =
    useState(null);

  const { data, toggleFavorite } = useTranslationHistory(userId);

  const handleToggleFavorite = (id, currentValue) => {
    toggleFavorite(id, currentValue);

    setChatHistory((prev) =>
      prev.map((c) =>
        c.history_id === id ? { ...c, is_favorite: !currentValue } : c,
      ),
    );

    // 🔥 overlay feedback
    setOverlayFavoritTranslated(
      !currentValue ? "⭐ Added to Favorites" : "☆ Removed from Favorites",
    );

    setTimeout(() => setOverlayFavoritTranslated(null), 1200);
  };

  // ================== 2️⃣ SPEECH RECOGNITION ==================
  const speech = useSpeechRecognition({
    recognitionRef,
    setIsRecording,
    shouldSendOnEndRef,
    onFinalResult: async (text) => {
      if (!text) return;

      if (modeRef.current === "vocab") {
        console.log("🧠 Vocab mode → handle locally");
        handleSpeech(text); // 🔥 kirim ke vocab engine
        return;
      }

      // let grammarData = null;

      // if (modeRef.current === "dailyStory") {
      //   grammarData = await checkGrammar(text);
      // }

      // sendTextToBackend(text, grammarData); // ✅ kirim ke engine

      sendTextToBackend(text);
    },
    onResetIdle: resetIdle, // Reset idle jika user bicara
    isLupaKataActive: lupaKata.isLupaKataActive, // Jangan rekam utama saat lupa kata aktif
    isSpeaking,
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

    // ✅ kalau sudah terakhir → return null
    if (index === phaseOrder.length - 1) {
      return null;
    }

    return phaseOrder[index + 1];
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
              : mode === "vocab"
                ? "bg-linear-to-b from-slate-900 to-indigo-950"
                : mode === "ielts"
                  ? "bg-linear-to-b from-rose-300 to-rose-500"
                  : "bg-linear-to-b from-slate-900 to-blue-950"
        }`}
      >
        <div
          className="w-full max-w-md flex flex-col space-y-4 sm:space-y-6 mb-16"
          onClick={resetIdle}
          onWheel={resetIdle}
        >
          <Header
            streak={streak}
            mode={mode}
            isScrolled={isScrolled}
            dailyStory={dailyStory}
            user={user}
            onLogout={handleLogout}
            streakDaily={streakDaily}
            fetchStreakDaily={fetchStreakDaily}
            activeChecklist={activeChecklist}
            onOpenVocab={() => setShowVocab(true)}
            completedCountVocab={completedCountVocab}
            completedLessons={completedLessons}
            modeLearn={modeLearn}
          />

          <OverlayFeedback message={overlayFavoritTranslated} />

          {/* VOCAB LIST */}
          {showVocab && (
            <VocabList
              onClose={() => setShowVocab(false)}
              userId={userIdRef.current}
            />
          )}

          {mode === "testMicAndoid" &&
            user?.id === "21121b45-6987-432c-a2cd-fda17eabbd2b" && (
              <div className="text-white">
                <p>Mic Volume: {volume}</p>
                <AndroidSTTTest />
                {/* <p>
                Is Speaking:{" "}
                <span
                  className={isSpeaking ? "text-green-400" : "text-red-400"}
                >
                  {isSpeaking ? "true" : "false"}
                </span>
              </p>
              <p>
                IsKataActive:{" "}
                <span
                  className={
                    lupaKata.isLupaKataActive
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {lupaKata.isLupaKataActive ? "true" : "false"}
                </span>
              </p>
              {showPopup && (
                <div className="fixed top-5 right-5 bg-red-500 text-white px-4 py-3 rounded shadow-lg">
                  ⚠️ Mikrofon tidak terdeteksi suara!
                </div>
              )} */}
              </div>
            )}
          {/* Login Overlay */}
          {showLogin && (
            <LoginOverlay
              onClose={() => setShowLogin(false)}
              onLoginSuccess={(userData) => {
                setUser(userData);
                setSessionId(userData.username);

                saveUser(userData); // 🔥 dari authService

                setShowLogin(false);
              }}
            />
          )}
          {/* ================== DEBUG: Open Diary Daily Story ================== */}
          {/* <div className="w-full flex justify-center mb-2">
            <button
              onClick={() => setShowDiary(true)}
              className="
                bg-blue-500/90! hover:bg-blue-600!
                text-white text-sm
                px-4! py-2!
                rounded-lg
                shadow-md
                transition
                active:scale-95
              "
            >
              📖 Open Diary
            </button>
          </div> */}
          {/* ================== DEBUG: GENERATE SUMMARY ================== */}
          {/* <div className="w-full flex justify-center mb-4">
            <button
              onClick={async () => {
                console.log("📝 Generating summary...");
                const summary = await generateSummary();
                console.log("✅ Summary generated:", summary);
              }}
              className="bg-green-500! hover:bg-green-600! text-white font-semibold px-4! py-2! rounded-md"
            >
              Generate Summary
            </button>
          </div> */}
          {/* 🔊 Audio untuk greeting daily */}
          <audio
            ref={audioDailyStartRef}
            src="/src/assets/sound/daily_start.mp3"
            preload="auto"
          />
          <audio
            ref={audioFreetalkStartRef}
            src="/src/assets/sound/freetalk_start.mp3"
            preload="auto"
          />
          {/* <div className="text-white">
            <p>Mic Volume: {volume}</p>

            {showPopup && (
              <div className="fixed top-5 right-5 bg-red-500 text-white px-4 py-3 rounded shadow-lg">
                ⚠️ Mikrofon tidak terdeteksi suara!
              </div>
            )}
          </div> */}
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
          {/* <div className="relative">
            konten lain

            🧹 CLEAR BUTTON
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
          </div> */}
          {mode === "dailyStory" && (
            <DailyStoryIndicator
              progressData={progressData}
              isDailyLocked={isDailyLocked}
              started={dailyStarted}
              setStarted={setDailyStarted}
              isDailyEmpty={isDailyEmpty}
            />
          )}
          {mode === "dailyStory" &&
            readyToContinue &&
            (() => {
              const next = getNextPhase(currentStoryPhase);
              const isLastPhase = !next;

              return (
                <div className="fixed bottom-48 left-1/2 -translate-x-1/2 w-full max-w-md px-3 z-40 flex flex-col">
                  {/* MAIN TRIGGER */}
                  <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className={`
                    w-10 h-10
                    rounded-full
                    bg-gradient-to-r from-emerald-400 to-green-600
                    text-white
                    shadow-lg shadow-emerald-500/30
                    flex items-center justify-center
                    transition-all duration-300 ease-out
                    hover:scale-110 active:scale-95
                    ${expanded ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"}
                  `}
                  >
                    <span className="text-lg">➜</span>
                  </button>
                  {/* EXPANDED BUTTON */}
                  <div
                    className={`
                      transition-all duration-300 origin-bottom
                      ${expanded ? "scale-100 opacity-100 mt-2" : "scale-95 opacity-0 pointer-events-none"}
                    `}
                  >
                    <button
                      className="
                      
                      group
                      bg-gradient-to-r from-emerald-500 to-green-600
                      text-white
                      rounded-xl
                      py-2! px-4!
                      shadow-md
                      active:scale-95
                      transition-all duration-200
                      flex items-center justify-between
                      text-sm
                    "
                      onClick={async () => {
                        const data = await nextPhaseRequest(sessionId, userId);
                        if (!data) return;

                        const currentPhase = activePhase;
                        const nextPhase = getNextPhase(currentPhase);

                        // 🔥 update phase
                        setActivePhase(nextPhase);

                        // 🔥 reset UI
                        setExpanded(false);
                        setReadyToContinue(false);

                        // 🔥 update chat (SATU setState saja)
                        setChatHistory((prev) => {
                          const last = prev[prev.length - 1];
                          const updated = [...prev];

                          // prevent duplicate divider
                          if (
                            !(
                              last?.type === "phase" && last.phase === nextPhase
                            )
                          ) {
                            updated.push({
                              type: "phase",
                              phase: nextPhase,
                            });
                          }

                          updated.push({
                            type: "ai",
                            phase: nextPhase,
                            message:
                              data?.ai_message ||
                              `Hello, Good ${nextPhase}! How’s your ${nextPhase} going?`,
                            timestamp: Date.now(),
                          });

                          return updated;
                        });

                        // 🔥 update progress
                        markPhaseComplete(currentPhase);

                        setProgressData((prev) => {
                          const updated = {
                            ...prev,
                            [currentPhase]: true,
                          };

                          if (Object.values(updated).every(Boolean)) {
                            console.log("🎉 All phases completed!");
                          }

                          return updated;
                        });

                        // 🔥 summary
                        if (isLastPhase) {
                          console.log("🎉 STORY FINISHED → GENERATING SUMMARY");

                          const summary = await generateSummary();
                          console.log("📊 FINAL SUMMARY:", summary);
                        }
                      }}
                    >
                      {/* LEFT */}
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {isLastPhase ? "🎉" : "🚀"}
                        </div>

                        <div className="flex flex-col text-left">
                          <span className="text-xs opacity-80">
                            Phase {currentStoryPhase} complete
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
                </div>
              );
            })()}
          {/* SESSION ID INPUT */}
          {/* <div className="flex items-center space-x-2 text-white">
            <label htmlFor="sessionId">Session ID:</label>
            <select
              id="sessionId"
              className="p-1 rounded text-white bg-gray-700"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            >
              <option value="sam">sam</option>
              <option value="syifa">syifa</option>
              <option value="test">test</option>
              <option value="test2">test2</option>
              <option value="test3">test3</option>
              <option value="test4">test4</option>
              <option value="test5">test5</option>
              <option value="test6">test6</option>
              <option value="test7">test7</option>
            </select>
          </div> */}
          {mode === "freeTalk" && (
            <FreeTalkUI
              started={freeTalkStarted}
              setStarted={setFreeTalkStarted}
            />
          )}
          {mode === "roleplay" && (
            <RoleplayToggle
              started={rolePlayStarted}
              setStarted={setRolePlayStarted}
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
              sendInitialMessage={sendInitialMessage}
              activeChecklist={activeChecklist}
              setActiveChecklist={setActiveChecklist}
            />
          )}
          {/* {mode === "vocab" && (
            <VocabUI
              vocab={vocab}
              example={example}
              translation={translation}
              examples={examples}
              exampleIndex={exampleIndex} // 🔥 untuk UI progress
              phase={phase}
              feedback={feedback}
              next={next}
              setPhase={setPhase}
              progress={progress}
              showDice={showDice}
              startSession={startSession}
              // 🔥 TAMBAHAN
              startRecording={startRecording}
              stopRecording={stopRecording}
              isRecording={isRecording}
              liveTranscript={liveTranscript}
              user_id={userId}
              skipbutton={skipbutton}
            />
          )} */}

          {mode === "vocab" && (
            <LearnUI
              vocabProps={{
                vocab: vocab,
                example: example,
                translation: translation,
                examples: examples,
                exampleIndex: exampleIndex, // 🔥 untuk UI progress
                phase: phase,
                feedback: feedback,
                next: next,
                setPhase: setPhase,
                progress: progress,
                showDice: showDice,
                startSession: startSession,
                // 🔥 TAMBAHAN
                startRecording: startRecording,
                stopRecording: stopRecording,
                isRecording: isRecording,
                liveTranscript: liveTranscript,
                user_id: userId,
                skipbutton: skipbutton,
              }}
              sentenceProps={{
                lesson: lesson,
                loading: loadingSentence,
                refetch: refetch,
                completeLesson: completeLesson,

                // 🔥 Recording
                startRecording: startRecording,
                stopRecording: stopRecording,
                isRecording: isRecording,
                liveTranscript: liveTranscript,
              }}
              modeLearn={modeLearn}
              setModeLearn={setModeLearn}
            />
          )}

          {/* {mode === "vocab" && <LearnUI />} */}

          <ModeSelector
            user_id={userId}
            mode={mode}
            setMode={handleModeChange}
          />
          {showModeConfirm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div
                className="
              bg-white/10 
              backdrop-blur-xl 
              border border-white/20
              text-white 
              rounded-2xl 
              p-6 
              w-[320px] 
              text-center 
              space-y-5 
              shadow-2xl
            "
              >
                {/* ICON */}
                <div className="text-4xl">⚠️</div>

                {/* TITLE */}
                <h2 className="text-lg font-semibold">Change Mode?</h2>

                {/* DESCRIPTION */}
                <p className="text-sm text-white/70 leading-relaxed">
                  Your current chat will be cleared when switching modes.
                  <br />
                  Do you want to continue?
                </p>

                {/* BUTTONS */}
                <div className="flex gap-3 pt-2">
                  {/* CANCEL */}
                  <button
                    className="
                      flex-1
                      py-2.5!
                      rounded-xl
                      bg-white/10!
                      hover:bg-white/20
                      text-white/80
                      font-medium
                      transition-all
                      active:scale-95
                    "
                    onClick={() => {
                      setShowModeConfirm(false);
                      setPendingMode(null);
                    }}
                  >
                    Cancel
                  </button>

                  {/* CONFIRM */}
                  <button
                    className="
                      flex-1
                      py-2.5!
                      rounded-xl
                      bg-gradient-to-r
                      from-red-500
                      to-rose-500
                      hover:from-red-600
                      hover:to-rose-600
                      text-white
                      font-semibold
                      shadow-lg
                      transition-all
                      active:scale-95
                    "
                    onClick={() => {
                      setMode(pendingMode);
                      setChatHistory([]);
                      setPendingMode(null);
                      setShowModeConfirm(false);
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          {mode !== "vocab" && (
            <ChatSection
              lupaKata={lupaKata}
              chatHistory={chatHistory}
              liveTranscript={liveTranscript}
              bottomRef={bottomRef}
              disabled={allDailyComplete}
              mode={mode}
              data={data}
              toggleFavorite={handleToggleFavorite}
            />
          )}
          {((mode === "freeTalk" && freeTalkStarted) ||
            (mode === "dailyStory" && dailyStarted) ||
            (mode === "roleplay" && rolePlayStarted)) && (
            <BottomActions
              isRecording={isRecording}
              showSuggestions={showSuggestions}
              suggestions={suggestions}
              speakText={speakText}
              lupaKata={lupaKata}
              isSpeaking={isSpeaking}
              controlProps={{
                isRecording,
                isSpeaking,
                forceStop,
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
                    isRecording,
                    speech.pauseRecording,
                    speech.resumeRecording,
                  ),
                isLupaKataActive: lupaKata.isLupaKataActive,
                lupaKataResult: lupaKata.lupaKataResult,
                isDailyLocked,
              }}
            />
          )}
          <div className="mb-48" />
        </div>
      </div>

      {mode === "ielts" && <ComingSoon />}

      {/* Overlay untuk daily complete */}
      {mode === "dailyStory" && allDailyComplete && (
        <div className="fixed inset-0 z-25 bg-black/70 flex flex-col items-center justify-center text-center p-4 rounded-xl">
          <h2 className="text-white text-lg font-bold mb-2">
            🎉 Daily hari ini sudah complete!
          </h2>
          <p className="text-gray-200 text-sm mb-4">
            Terima kasih telah menyelesaikan semua phase hari ini.
          </p>
          <button
            onClick={() => setShowDiary(true)}
            className="bg-blue-500! hover:bg-blue-600! text-white px-4! py-2! rounded-md shadow-md"
          >
            Lihat Summary
          </button>
        </div>
      )}

      {/* Tombol record */}
      {/* <button
        disabled={allDailyComplete} // 🔒 tombol record juga disable
        onClick={() => startRecording()}
        className={`mt-4 px-4 py-2 rounded-md shadow-md text-white ${
          allDailyComplete
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        🎤 Record
      </button> */}

      {/* 🧱 OVERLAY — DI ATAS MAIN APP */}
      {showOverlay && (
        <AudioUnlockOverlay
          onUnlock={handleUnlock}
          onFinish={() => setShowOverlay(false)}
        />
      )}

      {/* 🧱 OVERLAY — showDiary */}
      {showDiary && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/60 backdrop-blur-sm
            flex items-center justify-center
            p-4
          "
          onClick={() => setShowDiary(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              relative

              w-10/12
              md:w-full max-w-md
              
              max-h-8/12
              md:max-h-[90vh] overflow-x-hidden
              
              bg-gradient-to-br
              from-[#1e1b2e]
              via-[#111827]
              to-[#020617]
              
              border border-white/10
              rounded-3xl
              p-5
              
              shadow-2xl
              text-white
              
              animate-fade-in
            "
          >
            {/* 🌟 Glow background */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />

            {/* CONTENT */}
            <div className="relative z-10">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  📖 <span>Daily Diary</span>
                </h2>

                <button
                  onClick={() => setShowDiary(false)}
                  className="
                    text-white/60!
                    hover:text-white 
                    transition
                    text-lg
                  "
                >
                  ✕
                </button>
              </div>

              {/* CONTENT */}
              <DailySummaryViewer userId={userId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
