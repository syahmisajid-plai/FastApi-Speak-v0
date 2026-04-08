import { useEffect, useState } from "react";

export default function VocabUI({
  vocab,
  example,
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
}) {
  if (!vocab) return null;

  const [started, setStarted] = useState(false);

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
    <div>
      {/* ================= BEFORE START ================= */}
      {!started && (
        <section className="mx-4 mt-36 transition-all duration-500">
          <div
            className="text-white border border-white/10 backdrop-blur-xl rounded-3xl p-6 text-center 
                  bg-gradient-to-b from-slate-900/80 to-indigo-900/60 
                  shadow-lg shadow-black/30"
          >
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
        </section>
      )}

      {/* ================= AFTER START ================= */}
      {started && (
        <div className="min-h-screen flex justify-center items-start pt-20">
          <div className="w-full max-w-md text-white px-4 space-y-6 animate-fade-in">
            {/* CARD */}
            <div
              className="bg-gradient-to-b from-slate-900 to-indigo-950 
              backdrop-blur-xl border border-white/20 
              rounded-3xl p-6 shadow-2xl min-h-[320px] flex flex-col"
            >
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
                        <h3 className="text-4xl font-extrabold text-indigo-300">
                          {vocab.word}
                        </h3>
                        <p className="text-sm text-white/70">{vocab.meaning}</p>

                        <Button
                          onClick={() => {
                            setPhase("guidedPractice");
                            startRecording();
                          }}
                        >
                          Mulai Practice →
                        </Button>
                      </div>
                    )}

                    {/* SPEAKING PHASE */}
                    {(phase === "guidedPractice" ||
                      phase === "makeSentence") && (
                      <div className="flex flex-col items-center space-y-4 animate-pop">
                        <h3 className="font-semibold text-center text-lg">
                          {phase === "guidedPractice"
                            ? "📖 Ucapkan Kalimat Ini"
                            : "✍️ Buat Kalimat Sendiri"}
                        </h3>

                        {phase === "guidedPractice" ? (
                          <div className="bg-white/5 p-4 rounded-lg text-sm text-center text-indigo-200">
                            {example}
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-indigo-300">
                            {vocab.word}
                          </div>
                        )}

                        {/* MIC BUTTON */}
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
                              : "bg-white/5! text-white/80 hover:bg-white/10! hover:scale-105"
                          } ${!canSpeak ? "opacity-30" : ""}`}
                        >
                          {isRecording ? "⏹" : "🎤"}
                        </button>

                        <p className="text-xs text-white/50 text-center">
                          {isRecording
                            ? "Sedang mendengarkan..."
                            : "Tap mic lalu mulai bicara"}
                        </p>

                        {liveTranscript && (
                          <p className="text-sm text-white/70 italic text-center">
                            "{liveTranscript}"
                          </p>
                        )}

                        {feedback && (
                          <p
                            className={`text-sm font-medium text-center ${
                              feedback.includes("Benar") ||
                              feedback.includes("Bagus") ||
                              feedback.includes("Lanjut")
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {feedback}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Completed */}
                    {phase === "completed" && (
                      <div className="text-center space-y-4 animate-pop">
                        <h3 className="text-lg font-semibold">🎉 Good Job!</h3>
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
  );
}
