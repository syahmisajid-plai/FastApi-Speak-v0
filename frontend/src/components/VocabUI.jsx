import { useEffect, useState } from "react";
import useAudioVocab from "../hooks/useAudioVocab";

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
  showDice,
  startRecording,
  stopRecording,
  isRecording,
  liveTranscript,
  examples, // optional (kalau mau debug / progress)
  startSession,

  user_id,
}) {
  if (!vocab) return null;

  // useEffect(() => {
  //   if (!started) return;

  //   if (phase === "guidedPractice" && example) {
  //     playAudio(example);
  //   }
  // }, [phase, example, started]);

  const [started, setStarted] = useState(false);

  // AUDIO
  const { playAudio, loading } = useAudioVocab(user_id);
  useEffect(() => {
    if (!started || !vocab) return;

    if (phase === "wordIntro") {
      playAudio(vocab.word);
    }
  }, [phase, vocab, started]);

  useEffect(() => {
    console.log("🔥 PHASE UPDATED:", phase);
  }, [phase]);

  const canSpeak = phase === "guidedPractice" || phase === "makeSentence";

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

  return (
    <section className="mx-4 mt-36 transition-all duration-500">
      <div
        className={`text-white border border-white/10 backdrop-blur-xl rounded-3xl p-6 text-center 
        bg-linear-to-b from-slate-900/80 to-indigo-900/60 
        shadow-lg shadow-black/30 flex flex-col justify-center
        ${showDice ? "h-70" : "min-h-60"}`}
      >
        {/* ================= BEFORE START ================= */}
        {!started && (
          <div>
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-2xl 
                      bg-gradient-to-br from-indigo-500/20 to-white/10 
                      flex items-center justify-center text-2xl mb-4 
                      border border-white/10"
              >
                🧠
              </div>

              <p className="text-sm font-semibold tracking-wide">Vocab Mode</p>

              <p className="text-xs text-white/60 mt-1">
                Learn new words step by step
              </p>
            </div>

            <button
              onClick={() => {
                setStarted(true);
                startSession();
              }}
              className="mt-5 w-full py-2.5! rounded-xl 
                 bg-gradient-to-r from-indigo-500 to-indigo-600 
                 hover:from-indigo-400 hover:to-indigo-500
                 text-white text-sm font-medium 
                 active:scale-[0.98] transition-all duration-200
                 shadow-md shadow-indigo-900/40"
            >
              Learn New Words
            </button>
          </div>
        )}

        {/* ================= AFTER START ================= */}
        {started && (
          <div className="flex justify-center items-start">
            <div className="w-full max-w-md text-white px-4 space-y-6 animate-fade-in">
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
                    <div className="flex justify-between text-xs text-white/50 mb-6">
                      <span className="uppercase tracking-wide">{phase}</span>
                      <span className="italic">{vocab.word}</span>
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
                                onClick={() => playAudio(vocab.word)}
                                className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20"
                              >
                                🔊 Play
                              </button>
                            </div>

                            {/* MEANING */}
                            <p className="text-sm text-white/60 italic">
                              {vocab.meaning}
                            </p>

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

                          <Button
                            onClick={() => {
                              setPhase("guidedPractice");

                              setTimeout(() => {
                                startRecording();
                              }, 100);
                            }}
                          >
                            Mulai Practice →
                          </Button>
                        </div>
                      )}

                      {/* SPEAKING PHASE */}
                      {(phase === "guidedPractice" ||
                        phase === "makeSentence") && (
                        <div className="flex flex-col items-center gap-6 animate-pop">
                          {/* HEADER */}
                          <h3 className="font-semibold text-center text-lg text-white/90">
                            {phase === "guidedPractice"
                              ? "📖 Ucapkan Kalimat Ini"
                              : "✍️ Buat Kalimat Sendiri"}
                          </h3>

                          {/* TARGET CARD */}
                          <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            {phase === "guidedPractice" ? (
                              <div className="space-y-2">
                                {/* English */}
                                <p className="text-sm text-indigo-200 leading-relaxed">
                                  {example}
                                </p>

                                {/* Indonesian */}
                                {translation && (
                                  <p className="text-xs text-white/50 italic">
                                    {translation}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xl font-bold text-indigo-300">
                                {vocab.word}
                              </p>
                            )}
                          </div>

                          {/* MIC BUTTON */}
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={() =>
                                isRecording ? stopRecording() : startRecording()
                              }
                              disabled={!canSpeak}
                              className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl 
                              transition-all duration-300 shadow-lg border border-white/10
                              ${
                                isRecording
                                  ? "bg-indigo-500/30! text-indigo-300 scale-110 animate-pulse"
                                  : "bg-white/5! text-white/80 hover:bg-white/10 hover:scale-105"
                              } ${!canSpeak ? "opacity-30" : ""}`}
                            >
                              {isRecording ? "⏹" : "🎤"}
                            </button>

                            <p className="text-xs text-white/50 text-center">
                              {isRecording
                                ? "Mendengarkan..."
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

                          <Button onClick={next}>Kata Berikutnya →</Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
