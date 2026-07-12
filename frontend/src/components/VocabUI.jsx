// components/VocabUI.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import useAudioVocab from "../hooks/useAudioVocab";

import next_vocab from "../assets/sound/universfield-game-level-complete-143022.mp3";
import next_vocab1 from "../assets/sound/universfield-level-passed-143039.mp3";
import next_vocab2 from "../assets/sound/universfield-level-up-191997.mp3";

export default function VocabUI({
  vocab,
  example,
  translation,
  exampleIndex,
  phase,
  feedback,
  next,
  setPhase,
  progress,

  startRecording,
  stopRecording,
  isRecording,
  liveTranscript,
  examples, // optional (kalau mau debug / progress)
  startSession,

  totalChapterVocab,
  completedChapterVocab,
  remainingChapterVocab,
  currentChapter,

  user_id,
  // skipbutton,

  chapterCompleted,
  goNextChapter,
  resetVocab,
  GoBackJourney,

  setVocabStage,

  showDice,
  setShowDice,

  meaningOptions,
  startPractice,
  startVerifyMeaning,
  verifyMeaningAnswer,
  continuePractice,

  isSkipped,
  setIsSkipped,

  setStartingJourney,
  showNextButton,
  goToNextExample,

  skipToGuidedPractice,
  showMeaningNextButton,
  isTranscribing,

  updateUserProgress,
}) {
  // vocab = false;
  // console.log(showNextButton);
  // console.log(goToNextExample);
  // console.log(typeof goToNextExample);
  const [started, setStarted] = useState(false);

  // console.log("isTranscribing:", isTranscribing);
  // console.log("showMeaningNextButton:", showMeaningNextButton);

  const [showStarters, setShowStarters] = useState(false);
  const [currentStarter, setCurrentStarter] = useState("");

  const [isLoadingNext, setIsLoadingNext] = useState(false);

  const nextVocabAudio = useRef(null);

  useEffect(() => {
    nextVocabAudio.current = new Audio(next_vocab);

    return () => {
      if (nextVocabAudio.current) {
        nextVocabAudio.current.pause();
        nextVocabAudio.current.src = "";
        nextVocabAudio.current.load();
      }
    };
  }, []);

  // Auto Stop Recording when isTranscribing is done
  useEffect(() => {
    if (isRecording && !isTranscribing && liveTranscript.trim()) {
      const timer = setTimeout(() => {
        stopRecording();
      }, 500); // 1 detik delay

      return () => clearTimeout(timer);
    }
  }, [isTranscribing]);

  const createStarter = (sentence) => {
    if (!sentence) return "";

    const escapedWord = vocab.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return sentence.replace(new RegExp(`\\b${escapedWord}\\b`, "gi"), "_____");
  };

  const getRandomStarter = (current = "") => {
    if (!examples?.length) return "";

    const starters = examples.map((e) => createStarter(e.en)).filter(Boolean);

    if (starters.length === 0) return "";

    if (starters.length === 1) return starters[0];

    let next;

    do {
      next = starters[Math.floor(Math.random() * starters.length)];
    } while (next === current);

    return next;
  };

  useEffect(() => {
    setCurrentStarter(getRandomStarter());
    setShowStarters(false);
  }, [vocab?.id]);

  useEffect(() => {
    if (vocab) {
      const timer = setTimeout(() => {
        setStarted(true);
      }, 2000); // ⏱️ 2 detik

      return () => clearTimeout(timer);
    }
  }, [vocab]);

  // AUDIO
  const { playWord, playSentence, loading } = useAudioVocab(user_id);

  const [hasClickedReplay, setHasClickedReplay] = useState(false);

  useEffect(() => {
    if (feedback === "❌ Try again") {
      setHasClickedReplay(false);
    }
  }, [feedback]);

  // useEffect(() => {
  //   if (!started || !vocab) return;

  //   if (phase === "wordIntro") {
  //     playAudio(vocab.word);
  //   }
  // }, [phase, vocab, started]);

  useEffect(() => {
    console.log("🔥 PHASE UPDATED:", phase);
  }, [phase]);

  // AUTO PLAY
  // useEffect(() => {
  //   if (!started || !vocab) return;
  //   if (phase === "wordIntro") {
  //     playWord(vocab.word);
  //   }
  // }, [phase, vocab, started]);

  const canSpeak =
    phase === "showMeaning" ||
    phase === "guidedPractice" ||
    phase === "makeSentence";

  const phaseLabel = {
    wordIntro: "Learn",
    verifyMeaning: "Understand",
    showMeaning: "Review",
    guidedPractice: "Practice",
    makeSentence: "Create",
    completed: "Complete",
  };

  const Button = ({ children, onClick, disabled, variant = "primary" }) => {
    const base =
      "px-5! py-2! rounded-xl font-semibold shadow-lg transition-all duration-300";
    const styles =
      variant === "primary"
        ? "bg-indigo-500! hover:bg-indigo-600!"
        : "bg-green-500! hover:bg-green-600!";

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${styles} ${disabled ? "opacity-40" : ""}`}
      >
        {children}
      </button>
    );
  };

  const UNIT_SIZE = 10;

  const unit = Math.floor(completedChapterVocab / UNIT_SIZE) + 1;
  const unitProgress = completedChapterVocab % UNIT_SIZE;
  const isUnitComplete = completedChapterVocab > 0 && unitProgress === 0;
  const totalUnit = Math.ceil(totalChapterVocab / UNIT_SIZE);

  const [showUnitCongrats, setShowUnitCongrats] = useState(false);
  const [prevUnit, setPrevUnit] = useState(1);

  useEffect(() => {
    const currentUnit = Math.floor(completedChapterVocab / 10) + 1;

    if (currentUnit !== prevUnit && completedChapterVocab > 0) {
      setShowUnitCongrats(true);
      setPrevUnit(currentUnit);

      setTimeout(() => {
        setShowUnitCongrats(false);
      }, 2000);
    }
  }, [completedChapterVocab]);

  // console.log("chapterCompleted =", chapterCompleted);
  // console.log("started =", started);
  // console.log("vocab =", vocab);

  const isLastExample =
    phase === "guidedPractice" && exampleIndex === examples.length - 1;

  const FORCE_CHAPTER_COMPLETE = true;

  const [isPlayingSentence, setIsPlayingSentence] = useState(false);

  const handlePlaySentence = async () => {
    if (isPlayingSentence) return;

    try {
      setIsPlayingSentence(true);
      await playSentence(example);
    } finally {
      setIsPlayingSentence(false);
    }
  };

  const [isPlayingWord, setIsPlayingWord] = useState(false);

  const handlePlayWord = async (text) => {
    if (isPlayingWord) return;

    try {
      setIsPlayingWord(true);
      await playWord(text);
    } finally {
      setIsPlayingWord(false);
    }
  };

  return (
    <section className="mx-4 transition-all duration-500">
      <div
        className={`text-white border border-white/10 backdrop-blur-xl rounded-3xl p-6 text-center 
        bg-linear-to-b from-slate-900/80 to-indigo-900/60 
        shadow-lg shadow-black/30 flex flex-col justify-center
        ${showDice ? "h-70" : "min-h-60"}`}
      >
        {/* ================= BEFORE START ================= */}
        {!started && (
          <div className="flex flex-col items-center py-8">
            <div
              className="w-12 h-12 rounded-xl 
              bg-gradient-to-br from-indigo-500/20 to-white/10 
              flex items-center justify-center text-xl 
              border border-white/10 animate-pulse"
            >
              🧠
            </div>

            <p className="text-sm font-medium mt-4">
              Getting your words ready...
            </p>

            <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Preparing your practice
            </div>
          </div>
        )}

        {/* ================= AFTER START ================= */}
        {started && !chapterCompleted && vocab && (
          <div className="relative">
            {!showDice && (
              <button
                onClick={() => {
                  setVocabStage("journey");
                  setStartingJourney(false);
                }}
                className="
                  absolute -top-1 -left-4 z-20
                  flex items-center gap-2
                  px-2! py-1!
                  rounded-xl
                  bg-white/2!
                  hover:bg-white/10!
                  border border-white/10
                  text-white/70 hover:text-white
                  backdrop-blur-md
                  transition-all duration-200
                "
              >
                <span className="text-sm">←</span>
              </button>
            )}
            <div className="flex justify-center items-start">
              <div className="w-full max-w-md text-white px-4 space-y-6 animate-fade-in">
                {/* CONGRATS NEXT UNIT */}
                {showUnitCongrats && (
                  <div className="absolute inset-0 h-full flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-fadeIn">
                    <div className="text-center animate-bounceIn">
                      {/* ICON */}
                      <div className="text-5xl mb-3 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                        🎉
                      </div>

                      {/* TITLE */}
                      <h3 className="text-lg font-bold text-white animate-glow">
                        Unit Completed!
                      </h3>

                      {/* SUBTITLE */}
                      <p className="text-sm text-white/60 mt-1">
                        Moving to next unit...
                      </p>
                    </div>
                  </div>
                )}

                {/* CARD */}
                <div>
                  {/* 🎲 LOADING DICE (DI DALAM CARD) */}
                  {showDice ? (
                    <div className="flex flex-col items-center justify-center flex-1">
                      <div className="text-6xl animate-spin">🎲</div>
                      <p className="text-sm text-white/60 mt-10">
                        Shuffling your next word
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* TOP INFO */}
                      <div className="mb-6 flex items-start justify-between text-xs text-white/50">
                        {/* LEFT: CHAPTER */}
                        <div className="flex flex-col max-w-[70%] w-1/2 min-w-0">
                          <span className="block w-full text-left text-[9px] uppercase tracking-widest text-white/40 leading-snug">
                            📘 {currentChapter?.title || "Chapter"}
                          </span>
                        </div>

                        {/* RIGHT: WORD + PROGRESS */}
                        <div className="flex flex-col items-end gap-1">
                          {/* PROGRESS */}
                          <div className="text-[9px] text-indigo-300 font-medium tracking-wide">
                            📘 Unit {unit} of {totalUnit} · {unitProgress}/
                            {UNIT_SIZE}
                          </div>
                          {/* WORD */}
                          <div className="flex items-center gap-2 text-indigo-400">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span className="text-[9px] uppercase tracking-widest">
                              {vocab.word}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* PROGRESS */}
                      {phase === "guidedPractice" && (
                        <div className="text-xs text-white/40 mb-4">
                          Example {exampleIndex + 1} / {examples?.length}
                        </div>
                      )}

                      <div className="flex-1 flex flex-col justify-center space-y-6">
                        {/* SHOW WORD */}
                        {phase === "wordIntro" && (
                          <div className="text-center space-y-4 animate-pop">
                            <div className="text-center space-y-3 animate-pop">
                              {/* WORD */}
                              <div className="flex flex-col items-center gap-2">
                                <h3 className="text-4xl font-extrabold text-indigo-300 tracking-tight">
                                  {vocab.word}
                                </h3>

                                <button
                                  onClick={() => handlePlayWord(vocab.word)}
                                  disabled={isPlayingWord}
                                  className="
                                    text-xs!
                                    px-3!
                                    py-1!
                                    rounded-full
                                    bg-emerald-500/20!
                                    hover:bg-emerald-500/30!
                                    border border-emerald-500/20
                                    text-emerald-300
                                    active:scale-95
                                    transition-all
                                    duration-200
                                    disabled:opacity-70
                                  "
                                >
                                  {isPlayingWord
                                    ? "🔄 Loading..."
                                    : "🔊 Play Word"}
                                </button>
                              </div>

                              {/* MEANING */}
                              {/* <p className="text-sm text-white/60 italic">
                              {vocab.meaning}
                            </p> */}

                              {/* META BADGES */}
                              <div className="flex justify-center gap-2 pt-2">
                                <span
                                  className="px-3 py-1 text-xs rounded-full
                              bg-white/5 border border-white/10 text-white/70
                              backdrop-blur-md"
                                >
                                  {vocab.type}
                                </span>

                                <span
                                  className="px-3 py-1 text-xs rounded-full
                            bg-indigo-500/10 border border-indigo-400/20
                            text-indigo-300 backdrop-blur-md"
                                >
                                  Level {vocab.level}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 pt-3 flex-nowrap">
                              {/* SECONDARY ACTION */}
                              <button
                                onClick={() => (
                                  setIsSkipped(true),
                                  startVerifyMeaning()
                                )}
                                className="
                              text-xs! md:text-base! px-4! py-2! rounded-xl
                              bg-white/10! hover:bg-white/15! active:bg-white/20!
                              text-white/80 hover:text-white
                              border border-white/15 hover:border-white/25
                              shadow-sm hover:shadow
                              transition-all duration-200
                              whitespace-nowrap shrink-0
                              active:scale-[0.98]
                              "
                              >
                                ✓ I already know
                              </button>

                              {/* MAIN CTA */}
                              <button
                                onClick={() => {
                                  setIsSkipped(false);
                                  startPractice();
                                }}
                                className="
                              text-xs! md:text-base! px-4! py-2! rounded-xl
                              bg-green-500! hover:bg-green-600! active:bg-green-700!
                              text-white font-medium
                              border border-white/10
                              transition-all duration-200
                              whitespace-nowrap shrink-0
                              shadow-sm hover:shadow-md
                              active:scale-[0.98]
                            "
                              >
                                Start Practice →
                              </button>
                            </div>
                          </div>
                        )}

                        {phase === "verifyMeaning" && (
                          <div className="animate-pop">
                            <div className="text-center mb-8">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 mb-4">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-200/90">
                                  Meaning Check
                                </span>
                              </div>

                              <h3 className="text-white/70 text-sm font-medium mb-4">
                                What does this word mean?
                              </h3>

                              <p className="text-5xl font-black tracking-tight text-white">
                                {vocab.word}
                              </p>
                            </div>

                            <div className="space-y-3">
                              {meaningOptions.map((option, index) => (
                                <button
                                  key={`${option}-${index}`}
                                  onClick={() => verifyMeaningAnswer(option)}
                                  className="
                                  group w-full
                                  rounded-2xl
                                  border border-white/10
                                  bg-white/[0.04]!
                                  px-4! py-4!
                                  text-left
                                  transition-all duration-200

                                  hover:bg-white/[0.08]
                                  hover:border-indigo-400/30
                                  hover:-translate-y-0.5

                                  active:scale-[0.98]
                                "
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="
                                        w-8 h-8 rounded-full
                                        border border-white/10
                                        bg-white/5
                                        flex items-center justify-center
                                        text-xs font-bold
                                        text-white/60
                                        group-hover:text-indigo-300
                                        group-hover:border-indigo-400/30
                                        transition-all
                                      "
                                      >
                                        {String.fromCharCode(65 + index)}
                                      </div>

                                      <span className="text-sm font-medium text-white/85">
                                        {option}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {phase === "showMeaning" && (
                          <div className="text-center animate-pop">
                            {/* WORD */}
                            <div className="space-y-2">
                              <h3 className="text-4xl font-extrabold text-indigo-300">
                                {vocab.word}
                              </h3>

                              <button
                                onClick={() => handlePlayWord(vocab.word)}
                                disabled={isPlayingWord}
                                className="
                                    text-xs!
                                    px-3!
                                    py-1!
                                    rounded-full
                                    bg-emerald-500/20!
                                    hover:bg-emerald-500/30!
                                    border border-emerald-500/20
                                    text-emerald-300
                                    active:scale-95
                                    transition-all
                                    duration-200
                                    disabled:opacity-70
                                  "
                              >
                                {isPlayingWord
                                  ? "🔄 Loading..."
                                  : "🔊 Play Word"}
                              </button>
                            </div>

                            {/* MEANING */}
                            <div className="mt-5">
                              <p className="text-lg text-white/80 italic">
                                {vocab.meaning}
                              </p>
                            </div>

                            {/* TAG */}
                            <div className="flex justify-center gap-2 mt-4">
                              <span
                                className="
                              px-3 py-1 text-xs rounded-full
                              bg-white/5 border border-white/10
                              "
                              >
                                {vocab.type}
                              </span>

                              <span
                                className="
                              px-3 py-1 text-xs rounded-full
                              bg-indigo-500/10 border border-indigo-400/20
                              text-indigo-300
                              "
                              >
                                Level {vocab.level}
                              </span>
                            </div>

                            {/* <button
                              onClick={() => {
                                continuePractice();

                                // setTimeout(() => {
                                //   startRecording();
                                // }, 100);
                              }}
                              className="
                            px-5! py-2! rounded-xl
                            bg-green-500! hover:bg-green-600
                            "
                            >
                              Continue →
                            </button> */}

                            {/* MIC BUTTON */}
                            <div className="flex flex-col items-center gap-2 mt-8">
                              <button
                                onClick={() =>
                                  isRecording
                                    ? stopRecording()
                                    : startRecording()
                                }
                                disabled={!canSpeak}
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl
                                  transition-all duration-300 shadow-lg border border-white/10
                                  ${
                                    isRecording
                                      ? isTranscribing
                                        ? "bg-orange-500/30! text-orange-300 scale-110"
                                        : "bg-indigo-500/30! text-indigo-300 scale-110 animate-pulse"
                                      : "bg-white/5! text-white/80 hover:bg-white/10 hover:scale-105"
                                  }
                                  ${!canSpeak ? "opacity-30" : ""}
                                `}
                              >
                                {isRecording ? (
                                  isTranscribing ? (
                                    <div className="w-7 h-7 border-4 border-orange-300 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    "⏹"
                                  )
                                ) : (
                                  "🎤"
                                )}
                              </button>

                              <p className="text-xs text-white/50 text-center">
                                {isRecording
                                  ? "Mendengarkan..."
                                  : "Tap untuk mulai berbicara"}
                              </p>
                            </div>

                            {/* TRANSCRIPT */}
                            {liveTranscript && (
                              <div className="text-center mt-4">
                                <p className="text-sm text-white/60">
                                  Kamu berkata:
                                </p>
                                <p className="text-sm text-white/80 italic">
                                  "{liveTranscript}"
                                </p>
                              </div>
                            )}

                            {/* FEEDBACK */}
                            {feedback && (
                              <div
                                className={`text-sm font-medium text-center px-3 py-1 rounded-full mt-3
                              ${
                                feedback.includes("Benar") ||
                                feedback.includes("Bagus") ||
                                feedback.includes("Lanjut")
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-blue-500/10 text-blue-400"
                              }`}
                              >
                                {feedback}
                              </div>
                            )}

                            {/* NEXT BUTTON */}
                            {showMeaningNextButton && (
                              <div className="mt-5 flex justify-center animate-fadeIn">
                                <button
                                  onClick={skipToGuidedPractice}
                                  className="
                                    px-5! py-2!
                                    rounded-xl
                                    bg-indigo-500!
                                    hover:bg-indigo-600
                                    text-white
                                    transition-all
                                    duration-200
                                    active:scale-95
                                  "
                                >
                                  Next →
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* SPEAKING PHASE */}
                        {(phase === "guidedPractice" ||
                          phase === "makeSentence") && (
                          <div className="flex flex-col items-center gap-6 animate-pop">
                            {/* HEADER */}
                            <h3 className="font-semibold text-center text-lg text-white/90">
                              {phase === "guidedPractice" &&
                                !isLastExample &&
                                "📖 Ucapkan Kalimat Ini"}

                              {phase === "guidedPractice" &&
                                isLastExample &&
                                "💬 Ucapkan dalam Bahasa Inggris"}

                              {phase !== "guidedPractice" &&
                                "✍️ Buat Kalimat Sendiri"}
                            </h3>

                            {/* TARGET CARD */}
                            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                              {phase === "guidedPractice" ? (
                                <div className="space-y-2">
                                  {/* English */}
                                  {(!isLastExample ||
                                    feedback === "❌ Try again" ||
                                    feedback ===
                                      "❌ You can keep trying or skip.") && (
                                    <p className="text-sm text-indigo-200 leading-relaxed">
                                      {example}
                                    </p>
                                  )}

                                  {/* Indonesian */}
                                  {translation &&
                                    (isLastExample &&
                                    feedback !== "❌ Try again" &&
                                    feedback !==
                                      "❌ You can keep trying or skip." ? (
                                      <p className="text-lg text-indigo-200 leading-relaxed">
                                        {translation}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-white/50 italic">
                                        {translation}
                                      </p>
                                    ))}

                                  {(!isLastExample ||
                                    feedback === "❌ Try again" ||
                                    feedback ===
                                      "❌ You can keep trying or skip.") && (
                                    <button
                                      onClick={() => {
                                        setHasClickedReplay(true);
                                        handlePlaySentence();
                                      }}
                                      disabled={isPlayingSentence}
                                      className={`
                                        text-xs!
                                        px-3!
                                        py-1!
                                        rounded-full
                                        border
                                        active:scale-95
                                        transition-all
                                        duration-200
                                        mt-2
                                        disabled:opacity-70
                                       ${
                                         (feedback === "❌ Try again" ||
                                           feedback ===
                                             "You can keep trying or skip") &&
                                         !hasClickedReplay
                                           ? "bg-emerald-500/20! hover:bg-emerald-500/30! border-emerald-400 text-emerald-200 animate-pulse"
                                           : "bg-emerald-500/20! hover:bg-emerald-500/30! border-emerald-500/20 text-emerald-300"
                                       }
                                      `}
                                    >
                                      {isPlayingSentence
                                        ? "🔄 Loading..."
                                        : feedback === "❌ Try again" ||
                                            feedback ===
                                              "You can keep trying or skip"
                                          ? "🔊 Try Listening The Sentence"
                                          : "🔊 Play Sentence"}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <p className="text-3xl font-bold text-indigo-300">
                                    {vocab.word}
                                  </p>

                                  {!showStarters ? (
                                    <button
                                      onClick={() => setShowStarters(true)}
                                      className="text-sm text-indigo-300 hover:text-indigo-200 transition"
                                    >
                                      💡 Need an idea?
                                    </button>
                                  ) : (
                                    <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-3">
                                      <p className="text-[11px] uppercase tracking-widest text-indigo-300 mb-2">
                                        Sentence Starter
                                      </p>

                                      <p className="text-white/80">
                                        {currentStarter}
                                      </p>

                                      <button
                                        onClick={() =>
                                          setCurrentStarter(
                                            getRandomStarter(currentStarter),
                                          )
                                        }
                                        className="mt-3 text-xs text-indigo-300 hover:text-indigo-200"
                                      >
                                        🎲 Another idea
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* MIC BUTTON */}
                            <div className="flex flex-col items-center gap-2">
                              <button
                                onClick={() =>
                                  isRecording
                                    ? stopRecording()
                                    : startRecording()
                                }
                                disabled={!canSpeak}
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl
                                  transition-all duration-300 shadow-lg border border-white/10
                                  ${
                                    isRecording
                                      ? isTranscribing
                                        ? "bg-orange-500/30! text-orange-300 scale-110"
                                        : "bg-indigo-500/30! text-indigo-300 scale-110 animate-pulse"
                                      : "bg-white/5! text-white/80 hover:bg-white/10 hover:scale-105"
                                  }
                                  ${!canSpeak ? "opacity-30" : ""}
                                `}
                              >
                                {isRecording ? (
                                  isTranscribing ? (
                                    <div className="w-7 h-7 border-4 border-orange-300 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    "⏹"
                                  )
                                ) : (
                                  "🎤"
                                )}
                              </button>

                              <p className="text-xs text-white/50 text-center">
                                {isRecording
                                  ? isTranscribing
                                    ? "Memproses ucapan..."
                                    : "Mendengarkan..."
                                  : "Tap untuk mulai berbicara"}
                              </p>
                            </div>

                            {/* TRANSCRIPT */}
                            {liveTranscript && (
                              <div className="text-center">
                                <p className="text-sm text-white/60">
                                  Kamu berkata:
                                </p>
                                <p className="text-sm text-white/80 italic">
                                  "{liveTranscript}"
                                </p>
                              </div>
                            )}

                            {/* FEEDBACK */}
                            {feedback && (
                              <div
                                className={`text-sm font-medium text-center px-3 py-1 rounded-full
                              ${
                                feedback.includes("Benar") ||
                                feedback.includes("Bagus") ||
                                feedback.includes("Lanjut")
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-blue-500/10 text-blue-400"
                              }`}
                              >
                                {feedback}
                              </div>
                            )}

                            {/* NEXT BUTTON */}
                            {showNextButton && (
                              <button
                                onClick={goToNextExample}
                                className="
                                  px-5! py-2!
                                  rounded-xl
                                  bg-indigo-500!
                                  hover:bg-indigo-600!
                                  text-white
                                  font-medium
                                  transition-all
                                  duration-200
                                  active:scale-95
                                "
                              >
                                Next Example →
                              </button>
                            )}
                          </div>
                        )}

                        {/* Completed */}
                        {phase === "completed" && (
                          <div className="text-center space-y-4 animate-pop">
                            <h3 className="text-lg font-semibold">
                              🎉 Good Job!
                            </h3>
                            <p className="text-sm text-white/70">
                              Kamu sudah menyelesaikan latihan kata ini.
                            </p>

                            {feedback && (
                              <p className="text-green-400 font-medium">
                                {feedback}
                              </p>
                            )}

                            <Button
                              disabled={isLoadingNext}
                              onClick={() => {
                                if (nextVocabAudio.current) {
                                  nextVocabAudio.current.currentTime = 0;
                                  nextVocabAudio.current.play().catch(() => {});
                                }

                                setIsLoadingNext(true);

                                setTimeout(() => {
                                  next();
                                  setIsLoadingNext(false);
                                }, 100);

                                setShowDice(true);
                                next();
                              }}
                            >
                              {isLoadingNext
                                ? "Loading..."
                                : "Kata Berikutnya →"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {chapterCompleted && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className="text-6xl">🏆</div>

            <h2 className="text-2xl font-bold text-white">Chapter Complete!</h2>

            <p className="text-sm text-white/60">
              {completedChapterVocab} words mastered
            </p>

            <button
              onClick={() => {
                resetVocab();
                setVocabStage("journey");
              }}
              className="px-4! py-2! rounded-xl bg-white/10! hover:bg-white/20!"
            >
              Back to Journey
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
