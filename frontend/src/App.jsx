// App.jsx
// ================== REACT CORE ==================
import { useEffect, useState, useRef } from "react";

// ================== UI COMPONENTS ==================
import Header from "./components/Header";
import ChatSection from "./components/ChatSection";
import BottomActions from "./components/BottomActions";
import AudioUnlockOverlay from "./components/AudioUnlockOverlay";
// import RoleplayToggle from "./components/RoleplayToggleSwipe";
import RoleplaySummaryCard from "./components/RoleplaySummaryCard";
// import DailyStoryIndicator from "./components/DailyStoryIndicator";
import Testcard_swipe from "./components/testcard_swipe";
import ModeSelector from "./components/ModeSelector";
import ModeConfirmModal from "./components/ModeConfirmModal";
import ContextRenderer from "./components/ContextRenderer";
import DailySummaryViewer from "./components/DailySummaryViewer";
import FreeTalkUI from "./components/FreeTalkUI";
import VocabUI from "./components/VocabUI";
import LoginOverlay from "./components/LoginOverlay";
import VocabList from "./components/VocabList";
import ComingSoonIELTS from "./components/ComingSoonIELTS";
import ComingSoonScenarios from "./components/ComingSoonScenarios";
import ComingSoonMultiplayerGames from "./components/ComingSoonMultiplayerGames";
import OverlayFeedback from "./components/OverlayFeedback";
import LearnUI from "./components/LearnUI";
import DailyStoryContinue from "./components/DailyStoryContinue";

import ScenariosUI from "./components/ScenariosUI";
import SmartCallUI from "./components/SmartCallUI";

import AndroidSTTTest from "./components/AndroidSTTTest";

import UpdateBanner from "./components/UpdateBanner";

import GamesUI from "./components/GamesUI";
import PWADebug from "./components/PWADebug";

import XpRewardPopup from "./components/XpRewardPopup";
import OnBoarding from "./components/OnBoarding";

// ================== STYLES ==================
import "./App.css";

// ================== CORE HOOKS ==================
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import useAudioPermission from "./hooks/useAudioPermission";
import useMicController from "./hooks/useMicController";

import useWhisperSTT from "./hooks/useWhisperSTT";
import useSTTManager from "./hooks/useSTTManager";

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
import { useCheckUpdate } from "./hooks/useCheckUpdate";

import useChecklistRoleplay from "./hooks/useChecklistRoleplay";
import useUserProgress from "./hooks/useUserProgress";

import useUser from "./hooks/useUser";

import useConversation from "./hooks/useConversation";

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

  const [autoCorrection, setAutoCorrection] = useState(true);

  const [supportSTTWeb, setSupportSTTWeb] = useState(true);

  const [sentenceType, setSentenceType] = useState(null);

  const [xpReward, setXpReward] = useState(null);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(9);

  // ================== Tambahkan state ==================
  const [pendingMode, setPendingMode] = useState(null);
  const [showModeConfirm, setShowModeConfirm] = useState(false);

  const [activePhase, setActivePhase] = useState("morning");

  const [expanded, setExpanded] = useState(false);

  const [openMenu, setOpenMenu] = useState(false);

  // ================== Set Mode ==================
  const [mode, setMode] = useState("freeTalk");
  const modeRef = useRef(mode);
  // freeTalk | scenarios | learn

  useEffect(() => {
    modeRef.current = mode;
    console.log("🧠 modeRef updated:", mode);
  }, [mode]);

  // console.log("user", user);

  // console.log("🔑 showOverlay: ", showOverlay);

  const [modeLearn, setModeLearn] = useState("idle");

  const [modeScenario, setModeScenario] = useState("idle");
  const modeScenarioRef = useRef(modeScenario);

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
    setModeLearn("idle");
    setModeScenario("idle");
    setOpenMenu(false);
  };

  useEffect(() => {
    setModeLearn("idle");
    setModeScenario("idle");
  }, [mode]);

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

  // console.log("user", user);

  const handleLogout = () => {
    logout();
    resetAppState(true);
    setUser(null);
    setSessionId(null);
    setShowLogin(true);
  };

  // ================== Update Version Notif ==================
  const hasUpdate = useCheckUpdate();

  // ================== autoCorrectionRef ==================
  const autoCorrectionRef = useRef(autoCorrection);

  useEffect(() => {
    autoCorrectionRef.current = autoCorrection;
  }, [autoCorrection]);

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

  // ================== USER PROGRESS ==================
  const [showDailyLimitPopup, setShowDailyLimitPopup] = useState(false);

  const {
    level,
    xp,
    title_level,
    loading: progressLoading,
    error: progressError,
    fetchUserProgress,
    updateUserProgress,
  } = useUserProgress({
    userIdRef,

    onXpGain: (amount) => {
      setXpReward({
        key: Date.now(),
        type: "xp",
        amount,
        message: "Great Progress!",
      });
    },
    // onDailyLimitReached: () => {
    //   console.log("🔥 SHOW POPUP");
    //   setShowDailyLimitPopup(true);
    // },

    onDailyLimitReached: () => {
      setXpReward({
        key: Date.now(),
        type: "info",
        message: "Daily FreeTalk XP limit reached!",
      });
    },
  });

  // ================== User (Avatar) ==================
  const { updateUserAvatar } = useUser();

  useEffect(() => {
    if (user) {
      setSelectedAvatar(user.avatar_id ?? 0);
    }
  }, [user]);

  const handleSaveAvatar = async () => {
    const updatedUser = await updateUserAvatar({
      user_id: user.id,
      avatar_id: selectedAvatar,
    });

    if (!updatedUser) return;

    saveUser(updatedUser);

    setUser(updatedUser);
    setSessionId(updatedUser.username);

    setShowAvatarModal(false);
  };

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
    vocabStage,
    setVocabStage,
    startSession,
    goToJourney,
    completedCountVocab,
    skipbutton,
    resetVocab,
    GoBackJourney,

    chapterStats, // 👈 tambahkan ini
    openChapterModal, // 👈 kalau mau dipanggil dari UI

    totalChapterVocab,
    completedChapterVocab,
    remainingChapterVocab,
    currentChapter,
    activeChapterId,

    chapterList,

    chapterCompleted,
    goNextChapter,
    chapterProgressMap,

    setShowDice,

    meaningOptions,
    startPractice,
    startVerifyMeaning,
    verifyMeaningAnswer,
    continuePractice,

    isSkipped,
    setIsSkipped,

    loading: loadingVocab,
    showNextButton,
    goToNextExample,

    skipToGuidedPractice,
    showMeaningNextButton,
  } = useVocabEngine(userIdRef, updateUserProgress);

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
  } = useSentenceLesson(userId, sentenceType, updateUserProgress);

  // ================== Conversation Mode ==================
  const {
    loading: loadingConversation,
    error: errorConversation,

    topics: conversationTopics,
    conversation,

    getConversationTopics,
    getConversation,

    conversationStage,
    setConversationStage,

    feedback: feedbackConversation,
    resetFeedback: resetFeedbackConversation,

    checkAnswer: checkAnswerConversation,
    finishConversation,
  } = useConversation(userIdRef, updateUserProgress);

  useEffect(() => {
    getConversationTopics();
  }, []);

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

  const lastMessage = chatHistory.at(-1);

  const isWaitingForAI = lastMessage?.sender === "You";
  // console.log("aiMessageCount :", aiMessageCount);
  // console.log("userMessageCount :", userMessageCount);

  // console.log("isWaitingForAI :", isWaitingForAI);

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

  // ================== Handle Mode Change ==================
  const handleModeChange = (newMode) => {
    if (chatHistory.length > 0 || modeLearn !== "idle") {
      setPendingMode(newMode);
      setShowModeConfirm(true);
      setModeLearn("idle");
      return;
    }

    resetModeState();
    setMode(newMode);

    // 🔥 kalau masuk ke learn, mulai dari awal
    if (newMode === "learn") {
      resetVocab();
    }

    // if (newMode === "scenarios") {
    //   setRoleplayModalOpen(true);
    // }
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
  const { speakText, isSpeaking, forceStop, unlockAudio } = useTTS_Google(
    userIdRef,
    modeRef,
  ); // 🗣️ Text-to-Speech

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

    handleChecklistFinished,
    handleChecklistUpdate,

    totalDone,
  } = useRoleplay({
    sessionIdRef,
    scenarioRef,
    chatHistory,
    setChatHistory,
    userId,
    activeChecklist,
    // checklistProgress,
    isWaitingForAI,
  });

  const totalChecklist = activeChecklist?.length ?? 0;

  const maxTurn = selectedScenario?.target_turn ?? 0;

  const currentTurn = chatHistory.filter((msg) => msg.sender === "You").length;

  // ================== Checklist RolePlay ==================
  const {
    updateProgress: updateRoleplayProgress,
    attemptCount: roleplayAttemptCount,
    currentStep: roleplayCurrentStep,
    progress: roleplayProgress,
    finished: roleplayChecklistFinished,
    resetFinished: resetRoleplayChecklistFinished,
  } = useChecklistRoleplay({
    activeChecklist,
    setActiveChecklist,
    currentTurn,
    maxTurn,
    handleChecklistUpdate,
  });

  // console.log("roleplayChecklistFinished:", roleplayChecklistFinished);
  // const handleChecklistFinished = (progress) => {
  //   handleRoleplayCompleted("Checklist completed", progress);
  // };

  // const handleChecklistUpdate = (updatedChecklist, currentStep) => {
  //   console.log("📍 CURRENT STEP:", currentStep);

  //   pushNextStepToChat(updatedChecklist);
  // };

  useEffect(() => {
    if (activeContext) {
      setShowContext(true);
    }
  }, [activeContext]);

  // console.log("======================= userId =======================", userId);

  useEffect(() => {
    modeScenarioRef.current = modeScenario;
    console.log("🧠 modeScenarioRef updated:", modeScenario);
  }, [modeScenario]);

  // const { checkGrammar, result, loading, error } = useGrammarCheck();

  // useEffect(() => {
  //   checkGrammar("We was happy last night.");
  // }, []);

  // useEffect(() => {
  //   if (!result) return;

  //   console.log("=== RESULT ===");
  //   console.log(result);
  // }, [result]);

  useEffect(() => {
    console.log("🛠️ autoCorrectionRef changed:", autoCorrectionRef);
  }, [autoCorrectionRef]);

  // ================== SEND TEXT TO BACKEND ==================
  const {
    sendTextToBackend,
    sendStuckPrompt,
    roleplayChecklistFinishedLockedRef,
  } = useConversationEngine({
    sessionIdRef,
    userIdRef,
    scenarioRef,
    modeRef,
    modeScenarioRef,
    setChatHistory,
    speakText,
    unlockAudio,

    // grammarResult: result, // 🔥 TAMBAHKAN INI

    onRoleplayCompleted: handleRoleplayCompleted, // ✅ FIX

    // ⭐ TAMBAHKAN INI
    onPhaseCompleted: (phase) => {
      console.log("🌅 DAILY PHASE READY:", phase);

      setCurrentStoryPhase(phase);
      setReadyToContinue(true);
    },

    autoCorrectionRef,

    roleplayChecklistFinished: roleplayChecklistFinished,

    updateUserProgress,
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

    const timer = setTimeout(() => {
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

      // 🎵 Mainkan audio setelah 0.5 detik
      audioFreetalkStartRef.current?.play().catch(console.error);
    }, 500);

    // cleanup jika component berubah sebelum 0.5 detik selesai
    return () => clearTimeout(timer);
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
  const isBackendConnected = useBackendPing(); // 🔗 Check backend connection

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

  useEffect(() => {
    if (userIdRef.current) {
      fetchUserProgress(userIdRef.current);
    }
  }, [userIdRef.current]);
  // console.log("level :", level);
  // console.log("xp :", xp);
  // console.log("title_level :", title_level);

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
  const speech = useSTTManager({
    supportSTTWeb, // Set to false to use Whisper
    recognitionRef,
    setIsRecording,
    shouldSendOnEndRef,
    onFinalResult: async (text) => {
      if (!text) return;

      if (modeRef.current === "learn") {
        console.log("🧠 Learn mode → handle locally");
        handleSpeech(text); // 🔥 kirim ke vocab engine
        return;
      }

      console.log("🧠 Conversation mode → send to backend");
      console.log("📤 Final recognized text:", text);

      sendTextToBackend(text);
    },
    onResetIdle: resetIdle, // Reset idle jika user bicara
    isLupaKataActive: lupaKata.isLupaKataActive, // Jangan rekam utama saat lupa kata aktif
    isSpeaking,
  });

  // ================== DESTRUCTURING SPEECH ==================
  const {
    liveTranscript,
    currentTranscript,
    startRecording: rawStartRecording,
    stopRecording,
    cancelRecording,

    isTranscribing,
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
  // ========== DUMMY ==========
  const [debugKey, setDebugKey] = useState(0);

  const dummyUser = {
    onboarding_completed: true,
  };

  useEffect(() => {
    if (dummyUser && !dummyUser.onboarding_completed) {
      setMode("onBoarding");
    }
  }, [dummyUser]);
  // =
  return (
    <>
      {/* <button
        onClick={() => {
          setDebugKey((k) => k + 1);
          setXpReward({
            amount: 25,
            message: "Debug XP",
          });
        }}
        className="fixed top-45 right-5 z-[9999] bg-red-500 text-white px-4 py-2 rounded"
      >
        Show XP
      </button> */}

      <XpRewardPopup
        key={xpReward?.key}
        type={xpReward?.type}
        xp={xpReward?.amount}
        message={xpReward?.message}
        onClose={() => setXpReward(null)}
      />
      {/* 🔥 MAIN APP — SELALU RENDER */}
      <div
        className={`min-h-screen lg:w-full flex justify-center p-4
        ${
          mode === "smartcall"
            ? "bg-linear-to-b from-slate-900 to-cyan-950"
            : mode === "scenarios"
              ? "bg-linear-to-b from-purple-700 to-indigo-900"
              : mode === "learn"
                ? "bg-linear-to-b from-slate-900 to-indigo-950"
                : mode === "ielts"
                  ? "bg-linear-to-b from-rose-300 to-rose-500"
                  : mode === "games"
                    ? "bg-linear-to-b from-emerald-700 to-green-950"
                    : "bg-linear-to-b from-slate-900 to-blue-950"
        }`}
      >
        <div
          className={`w-full max-w-md flex flex-col space-y-4 sm:space-y-6 ${
            phase === "verifyMeaning" && mode === "learn"
              ? "md:mb-96 mb-24"
              : "md:mb-0 mb-16"
          }`}
          onClick={resetIdle}
          onWheel={resetIdle}
        >
          {mode !== "onBoarding" && user && (
            <Header
              streak={streak}
              mode={mode}
              modeLearn={modeLearn}
              modeScenario={modeScenario}
              isScrolled={isScrolled}
              dailyStory={dailyStory}
              user={user}
              setUser={setUser}
              onLogout={handleLogout}
              streakDaily={streakDaily}
              fetchStreakDaily={fetchStreakDaily}
              activeChecklist={activeChecklist}
              onOpenVocab={() => setShowVocab(true)}
              completedCountVocab={completedCountVocab}
              completedLessons={completedLessons}
              autoCorrection={autoCorrection}
              setAutoCorrection={setAutoCorrection}
              supportSTTWeb={supportSTTWeb}
              setSupportSTTWeb={setSupportSTTWeb}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              totalDone={totalDone}
              roleplayAttemptCount={roleplayAttemptCount}
              level={level}
              xp={xp}
              title_level={title_level}
              handleSaveAvatar={handleSaveAvatar}
              showAvatarModal={showAvatarModal}
              setShowAvatarModal={setShowAvatarModal}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
            />
          )}

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

          {/* 🔥 Not Yet Onboarding */}
          {mode === "onBoarding" && (
            <OnBoarding
              handleSaveAvatar={handleSaveAvatar}
              showAvatarModal={showAvatarModal}
              setShowAvatarModal={setShowAvatarModal}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
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
            <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80">
              <RoleplaySummaryCard
                setModeScenario={setModeScenario}
                setRoleplayModalOpen={setRoleplayModalOpen}
                setRolePlayStarted={setRolePlayStarted}
                data={summaryData}
                onClose={closeSummary}
                isWaitingForAI={isWaitingForAI}
                roleplayChecklistFinishedLockedRef={
                  roleplayChecklistFinishedLockedRef
                }
              />
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
          {/* 🔥 MODE */}
          {mode === "freeTalk" && user && (
            <FreeTalkUI
              started={freeTalkStarted}
              setStarted={setFreeTalkStarted}
              isRecording={isRecording}
              isSpeaking={isSpeaking}
              islupaKata={lupaKata.isLupaKataActive}
              sendStuckPrompt={sendStuckPrompt}
              openLupaKata={() =>
                lupaKata.toggleLupaKata(
                  isRecording,
                  speech.pauseRecording,
                  speech.resumeRecording,
                )
              }
              user={user}
            />
          )}
          {/* {mode === "scenarios" && <ComingSoonScenarios />} */}
          {mode === "scenarios" && (
            <ScenariosUI
              modeScenario={modeScenario}
              setModeScenario={setModeScenario}
              roleplayProps={{
                started: rolePlayStarted,
                setStarted: setRolePlayStarted,
                selectedScenario: selectedScenario,
                onScenarioSelect: selectScenario,
                isOpen: roleplayModalOpen,
                setIsOpen: setRoleplayModalOpen,
                setMode: setMode,
                lastUserMessage: lastUserMessage,
                onFinish: handleChecklistFinished,
                onChecklistUpdate: handleChecklistUpdate,
                currentTurn: currentTurn,
                maxTurn: maxTurn,
                sendInitialMessage: sendInitialMessage,
                activeChecklist: activeChecklist,
                setActiveChecklist: setActiveChecklist,

                activeContext,
                showContext,
                setShowContext,

                updateProgress: updateRoleplayProgress,
                attemptCount: roleplayAttemptCount,
                currentStep: roleplayCurrentStep,
                progress: roleplayProgress,
                finished: roleplayChecklistFinished,
                resetFinished: resetRoleplayChecklistFinished,

                isWaitingForAI,
              }}
              dailyStoryProps={{
                progressData,
                isDailyLocked,
                started: dailyStarted,
                setStarted: setDailyStarted,
                isDailyEmpty,

                readyToContinue,
                currentStoryPhase,
                activePhase,

                expanded,
                setExpanded,

                sessionId,
                userId,

                setActivePhase,
                setReadyToContinue,
                setChatHistory,
                setProgressData,

                nextPhaseRequest,
                markPhaseComplete,
                generateSummary,
              }}
            />
          )}
          {mode === "learn" && (
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

                startSession: startSession,
                vocabStage: vocabStage,
                setVocabStage: setVocabStage,
                goToJourney: goToJourney,

                chapterList: chapterList,

                chapterCompleted: chapterCompleted,
                goNextChapter: goNextChapter,
                resetVocab: resetVocab,
                GoBackJourney: GoBackJourney,
                showDice: showDice,
                setShowDice: setShowDice,

                chapterProgressMap: chapterProgressMap,

                chapterStats: chapterStats, // 👈 tambahkan ini
                openChapterModal: openChapterModal, // 👈 kalau mau dipanggil dari UI

                totalChapterVocab: totalChapterVocab,
                completedChapterVocab: completedChapterVocab,
                remainingChapterVocab: remainingChapterVocab,
                currentChapter: currentChapter,

                activeChapterId: activeChapterId,

                // 🔥 TAMBAHAN
                startRecording: startRecording,
                stopRecording: stopRecording,
                isRecording: isRecording,
                liveTranscript: liveTranscript,
                user_id: userId,
                // skipbutton: skipbutton,
                meaningOptions: meaningOptions,
                startPractice: startPractice,
                startVerifyMeaning: startVerifyMeaning,
                verifyMeaningAnswer: verifyMeaningAnswer,
                continuePractice: continuePractice,

                isSkipped: isSkipped,
                setIsSkipped: setIsSkipped,
                loading: loadingVocab,
                showNextButton: showNextButton,
                goToNextExample: goToNextExample,

                skipToGuidedPractice: skipToGuidedPractice,
                showMeaningNextButton: showMeaningNextButton,
                isTranscribing: isTranscribing,

                updateUserProgress: updateUserProgress,
              }}
              sentenceProps={{
                lesson: lesson,
                loading: loadingSentence,
                refetch: refetch,
                completeLesson: completeLesson,

                sentenceType: sentenceType,
                setSentenceType: setSentenceType,

                // 🔥 Recording
                startRecording: startRecording,
                stopRecording: stopRecording,
                isRecording: isRecording,
                liveTranscript: liveTranscript,
              }}
              conversationProps={{
                loading: loadingConversation,
                error: errorConversation,

                topics: conversationTopics,
                conversation,

                getConversationTopics,
                getConversation,

                conversationStage,
                setConversationStage,

                startRecording: startRecording,
                stopRecording: stopRecording,
                isRecording: isRecording,
                liveTranscript: liveTranscript,

                feedback: feedbackConversation,
                resetFeedback: resetFeedbackConversation,

                checkAnswer: checkAnswerConversation,
                finishConversation: finishConversation,
                supportSTTWeb: supportSTTWeb,
              }}
              modeLearn={modeLearn}
              setModeLearn={setModeLearn}
            />
          )}
          {mode === "smartcall" && (
            <SmartCallUI
              isRecording={isRecording}
              currentTranscript={currentTranscript}
              startRecording={startRecording}
              stopRecording={stopRecording}
              openLupaKata={() =>
                lupaKata.toggleLupaKata(
                  isRecording,
                  speech.pauseRecording,
                  speech.resumeRecording,
                )
              }
              isLupaKataActive={lupaKata.isLupaKataActive}
              lupaKata={lupaKata}
              user={user}
            />
          )}
          {mode === "games" && <GamesUI />}
          {/* {mode === "games" && <ComingSoonMultiplayerGames />} */}

          {/* {mode === "vocab" && <LearnUI />} */}
          {mode !== "onBoarding" && (
            <ModeSelector
              user_id={userId}
              mode={mode}
              setMode={handleModeChange}
              isRecording={isRecording}
              isLupaKataActive={lupaKata.isLupaKataActive}
              isWaitingForAI={isWaitingForAI}
              isSpeaking={isSpeaking}
              forceStop={forceStop}
            />
          )}

          <ModeConfirmModal
            open={showModeConfirm}
            onCancel={() => {
              setShowModeConfirm(false);
              setPendingMode(null);
            }}
            onContinue={() => {
              if (isSpeaking) forceStop();

              setMode(pendingMode);
              setChatHistory([]);
              setPendingMode(null);
              setShowModeConfirm(false);
            }}
          />
          {(mode === "freeTalk" || mode === "scenarios") && (
            <div className={mode === "freeTalk" ? "mt-21" : ""}>
              <ChatSection
                lupaKata={lupaKata}
                chatHistory={chatHistory}
                liveTranscript={liveTranscript}
                bottomRef={bottomRef}
                disabled={allDailyComplete}
                mode={mode}
                data={data}
                toggleFavorite={handleToggleFavorite}
                autoCorrectionRef={autoCorrectionRef}
                speakText={speakText}
                isTranscribing={isTranscribing}
                isRecording={isRecording}
              />
            </div>
          )}
          {((mode === "freeTalk" && freeTalkStarted) ||
            (modeScenario === "dailyStory" && dailyStarted) ||
            (modeScenario === "roleplay" && rolePlayStarted)) && (
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
                unlockAudio,
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
                isWaitingForAI,
              }}
            />
          )}
          <div className="mb-48" />
        </div>
      </div>

      <PWADebug />
      {mode === "ielts" && <ComingSoonIELTS />}

      {hasUpdate && <UpdateBanner onUpdate={() => window.location.reload()} />}

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
          onFinish={() => {
            console.log("5. setShowOverlay(false)");
            setShowOverlay(false);
          }}
          isBackendConnected={isBackendConnected}
          user={user}
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
