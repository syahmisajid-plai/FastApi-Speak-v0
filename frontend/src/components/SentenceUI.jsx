// import { div } from "framer-motion/m";
import { useState, useEffect } from "react";

export default function SentenceUI({
  lesson,
  loading,
  refetch,
  completeLesson,

  startRecording,
  stopRecording,
  liveTranscript,
}) {
  const [step, setStep] = useState(0);

  const [mode, setMode] = useState("idle");
  // idle | recording | review

  const [finalTranscript, setFinalTranscript] = useState("");

  // loading minimal 2 detik
  const [showLoading, setShowLoading] = useState(true);

  const [showID, setShowID] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (lesson) {
      console.log("lesson:", lesson);
    }
  }, [lesson]);

  // const context =
  //   "Your friend invites you to a party, but you are not sure you want to go.";

  if (loading || showLoading) {
    return (
      <div className="flex items-start justify-center pt-64">
        <div
          className={`text-white border border-white/10 backdrop-blur-xl rounded-3xl p-8
        bg-linear-to-b from-slate-900/80 to-indigo-900/60
        shadow-lg shadow-black/30 flex flex-col justify-center items-center
        transition-all duration-300 ease-out
        w-10/12 max-w-md`}
        >
          <div className="animate-bounce text-6xl mb-5">🎧</div>

          <h2 className="text-2xl font-semibold animate-pulse text-center">
            Preparing your speaking lesson...
          </h2>

          <p className="text-gray-300 mt-3 text-sm text-center">
            Please wait a moment ✨
          </p>

          {/* loading dots */}
          <div className="flex gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-white animate-bounce" />
            <div
              className="w-2 h-2 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white text-center px-6">
        <div className="text-6xl mb-4 animate-pulse">📚</div>

        <h2 className="text-2xl font-semibold mb-2">Oops! No lesson found</h2>

        <p className="text-gray-300 max-w-md">
          We couldn't find any speaking lesson right now. Try refreshing or come
          back later 🚀
        </p>

        <button
          onClick={refetch}
          className="mt-6 px-5! py-2! rounded-xl bg-white! text-black font-medium hover:scale-105 transition"
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  const context = lesson.context;
  const context_id = lesson.context_id;
  const questionShadowing = lesson.partner_utterance;
  const idealAnswers = [lesson.key_expression]; // 🔥 utama
  const alternative = lesson.alternatives || [];
  const pattern_display = lesson.pattern_display;
  const insight = lesson.insight;
  const keywords = lesson.keywords || [];

  const patterns = keywords.length > 0 ? keywords : [pattern_display];

  const normalize = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // hapus tanda baca
      .replace(/\s+/g, " ") // rapihin spasi
      .trim();
  };

  const extractCore = (text) => {
    const cleaned = normalize(text);

    // ambil 2–3 kata pertama sebagai "inti"
    return cleaned.split(" ").slice(0, 3).join(" ");
  };

  const getFeedback = () => {
    if (!finalTranscript) return "";

    const userText = normalize(finalTranscript);

    const patterns_feedback = [
      lesson.key_expression,
      ...(lesson.alternatives || []),
    ];

    const cores = patterns_feedback.map(extractCore);

    const isUsingTarget = cores.some((core) => userText.includes(core));

    if (isUsingTarget) {
      return {
        type: "success",
        message: "✅ Nice! That sounds natural.",
      };
    }

    return {
      type: "hint",
      message: `💡 Try using "${pattern_display}" to sound more polite.`,
    };
  };

  const feedback = getFeedback();

  // const variations = [
  //   "I might have other plans.",
  //   "I’ll get back to you.",
  //   "Sounds fun, but I’m not sure yet.",
  // ];

  const nextStep = () => setStep((prev) => prev + 1);

  // ================= MIC FLOW =================
  const handleMicClick = () => {
    // 🟢 IDLE → RECORDING
    if (mode === "idle") {
      startRecording();
      setMode("recording");
      return;
    }

    // 🔴 RECORDING → REVIEW
    if (mode === "recording") {
      stopRecording();

      setFinalTranscript(liveTranscript);

      setTimeout(() => {
        setMode("review");
      }, 150);

      return;
    }

    // 🔁 REVIEW → TRY AGAIN (same button)
    if (mode === "review") {
      setFinalTranscript("");
      startRecording();
      setMode("recording");
    }
  };

  const handleSubmit = () => {
    setMode("idle");
    setStep(1);
  };

  return (
    <div
      className={`p-6 max-w-xl mx-auto space-y-10 ${
        step === 3 ? "mt-20" : "mt-32"
      } text-white`}
    >
      {/* ================= STEP 0: SPEAKING ================= */}
      {(step === 0 || step === 1) && (
        <section className="space-y-6">
          {/* CONTEXT */}
          <div>
            <h2 className="text-xl font-bold mb-2">🎬 Situation</h2>

            <div className="bg-gray-100 p-4 rounded space-y-3 text-black">
              <p>{context}</p>

              {/* toggle chip */}
              {context_id && (
                <>
                  <button
                    onClick={() => setShowID((prev) => !prev)}
                    className={`
                      text-xs px-3! py-1! rounded-full border transition-all duration-200
                      flex items-center gap-1 shadow-sm

                      ${
                        showID
                          ? "bg-indigo-500! text-white border-indigo-400 shadow-indigo-200/50"
                          : "bg-white/80! text-gray-700 border-gray-300 hover:bg-white!  shadow-sm"
                      }
                    `}
                  >
                    <span className="transition-transform duration-200">
                      {showID ? "🙈" : "🇮🇩"}
                    </span>

                    {showID ? "Hide meaning" : "Show meaning"}
                  </button>

                  <div className="border-t m-0"></div>

                  {/* INDONESIAN */}
                  {showID && (
                    <p className="text-sm text-gray-600 italic pt-2">
                      {context_id}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {step === 0 && (
            <div>
              {/* INSTRUCTION */}
              <div>
                <h2 className="text-xl font-bold mb-2">
                  🧠 What would you say?
                </h2>
                <p className="text-sm text-white/70 bg-white/5 p-3 rounded-xl">
                  Speak naturally based on the situation above.
                </p>
              </div>

              {/* MIC BUTTON */}

              <div className="flex flex-col items-center gap-3 mt-8">
                <button
                  onClick={handleMicClick}
                  className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center text-3xl
                  transition-all duration-300

                  /* base */
                  border border-white/10

                  /* idle */
                  bg-white/5 hover:bg-white/10 text-white

                  /* animation */
                  active:scale-95
                `}
                >
                  {/* 🔥 OUTER RING EFFECT */}
                  <span
                    className={`
                absolute inset-0 rounded-full border

                ${
                  mode === "recording"
                    ? "border-indigo-400/60 animate-ping"
                    : mode === "review"
                      ? "border-yellow-400/40"
                      : "border-white/10"
                }
              `}
                  />

                  {/* 🔥 SECOND RING (lebih halus, static glow) */}
                  <span
                    className={`
                absolute inset-[-6px] rounded-full border

                ${
                  mode === "recording"
                    ? "border-indigo-400/30"
                    : mode === "review"
                      ? "border-yellow-400/20"
                      : "border-white/5"
                }
              `}
                  />

                  {/* ICON */}
                  <span className="relative z-10">
                    {mode === "idle" && "🎤"}
                    {mode === "recording" && "⏹"}
                    {mode === "review" && "🔁"}
                  </span>
                </button>

                {/* LABEL */}
                <p className="text-xs text-white/50">
                  {mode === "recording"
                    ? "Listening... tap to stop"
                    : mode === "review"
                      ? "Try again or submit"
                      : "Tap to start speaking"}
                </p>
              </div>

              {/* LIVE / FINAL TRANSCRIPT */}
              {(liveTranscript || finalTranscript) && (
                <div className="text-center space-y-2">
                  <p className="text-xs text-white/50">Your answer:</p>

                  <p className="text-sm italic text-white/80">
                    "{mode === "review" ? finalTranscript : liveTranscript}"
                  </p>
                </div>
              )}

              {/* SUBMIT BUTTON (ONLY IN REVIEW) */}
              {mode === "review" && (
                <div className="flex justify-center mt-4">
                  <button onClick={handleSubmit} className="btn-small">
                    ✅ Submit Answer
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ================= STEP 1: NATURAL EXPRESSIONS ================= */}
      {step === 1 && (
        <section className="space-y-4">
          <div>
            {finalTranscript && (
              <div className="flex justify-center text-center">
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-2 space-y-2 backdrop-blur-md shadow-lg">
                  {/* LABEL */}
                  <p className="text-xs text-white/50 tracking-wide uppercase">
                    Your Answer
                  </p>

                  {/* TRANSCRIPT */}
                  <p className="text-sm italic text-white/90 leading-relaxed">
                    “{finalTranscript}”
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-6">
              <div className="w-1.5 h-6 bg-green-400 rounded-full" />
              <h2 className="text-lg font-semibold">Natural Expressions</h2>
            </div>

            <p className="text-xs text-white/60 mt-1 bg-white/5 px-3 py-2 rounded-lg inline-block">
              Your answer works, but here are some more natural ways native
              speakers might say it.
            </p>

            <div className="space-y-3 mt-4">
              {idealAnswers.map((ans, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-green-50 border border-green-200
                 shadow-md border border-green-300/50 
                 hover:shadow-green-400/50 hover:scale-[1.02] transition-transform duration-200 ease-in-out flex items-center gap-2"
                >
                  <p className="text-black font-medium">{ans}</p>
                </div>
              ))}
            </div>

            <button onClick={nextStep} className="btn mt-4">
              Try in Conversation →
            </button>
          </div>
        </section>
      )}

      {/* ================= STEP 2: Try It in Conversation ================= */}
      {step === 2 && (
        <section className="space-y-4">
          {/* SYSTEM BUBBLE */}
          <h2 className="text-xl font-bold">🔁 Try It in Conversation</h2>

          <div className="flex justify-start">
            <div
              className="
                  max-w-[75%] px-4 py-3 rounded-2xl
                  bg-white/10 border border-white/10
                  text-white text-sm
                  backdrop-blur-sm
                "
            >
              {questionShadowing}
            </div>
          </div>

          {/* TRANSCRIPT (USER BUBBLE STYLE) */}
          {(liveTranscript || finalTranscript) && (
            <div className="flex justify-end">
              <div
                className="
              max-w-[75%] px-4 py-3 rounded-2xl
              bg-indigo-500/80 text-white text-sm
            "
              >
                {mode === "review" ? finalTranscript : liveTranscript}
              </div>
            </div>
          )}

          <p className="text-xs text-white/50 bg-white/5 px-3 py-2 rounded-lg inline-block">
            💡Try using one of the natural expressions above.
          </p>

          {/* ================= OVERVIEW (GRID) ================= */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            {idealAnswers.map((ans, i) => (
              <div
                key={i}
                className="p-3 rounded-lg 
                bg-gradient-to-r from-green-100 via-green-200 to-green-100 
                shadow-sm border border-green-300/40
                text-black text-sm font-medium"
              >
                {ans}
              </div>
            ))}
          </div>

          {/* ================= CHAT STYLE ================= */}
          <div className="space-y-4">
            {/* MIC BUTTON */}
            <div className="flex flex-col items-center gap-3 mt-4">
              <button
                onClick={handleMicClick}
                className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center text-3xl
                  transition-all duration-300
                  border border-white/10
                  bg-white/5 hover:bg-white/10 text-white
                  active:scale-95
                `}
              >
                {/* OUTER RING */}
                <span
                  className={`
              absolute inset-0 rounded-full border
              ${
                mode === "recording"
                  ? "border-indigo-400/60 animate-ping"
                  : mode === "review"
                    ? "border-yellow-400/40"
                    : "border-white/10"
              }
            `}
                />

                {/* SECOND RING */}
                <span
                  className={`
              absolute inset-[-6px] rounded-full border
              ${
                mode === "recording"
                  ? "border-indigo-400/30"
                  : mode === "review"
                    ? "border-yellow-400/20"
                    : "border-white/5"
              }
            `}
                />

                {/* ICON */}
                <span className="relative z-10">
                  {mode === "idle" && "🎤"}
                  {mode === "recording" && "⏹"}
                  {mode === "review" && "🔁"}
                </span>
              </button>

              {/* LABEL */}
              <p className="text-xs text-white/50">
                {mode === "recording"
                  ? "Listening... tap to stop"
                  : mode === "review"
                    ? "Try again or submit"
                    : "Tap to start speaking"}
              </p>
            </div>
          </div>

          {/* feedback */}
          {mode === "review" && feedback && (
            <div
              className={`
                text-center mt-3 text-sm px-4 py-3 rounded-xl
                ${
                  feedback.type === "success"
                    ? "bg-green-500/10 border border-green-400/30 text-green-200"
                    : "bg-yellow-500/10 border border-yellow-400/30 text-yellow-200"
                }
              `}
            >
              {feedback.message}
            </div>
          )}

          {/* NEXT BUTTON */}
          {step === 2 && mode === "review" && (
            <div className="flex justify-center mt-4 text-md">
              <button onClick={nextStep} className="btn-small">
                See The Summary →
              </button>
            </div>
          )}
        </section>
      )}

      {/* ================= STEP 3: SUMMARY ================= */}
      {step === 3 && (
        <section className="space-y-6">
          {/* TITLE */}
          <h2 className="text-xl font-bold">✨ Wrap Up</h2>

          {/* ================= KEY EXPRESSION (PRIMARY) ================= */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-2 shadow-md">
            <p className="text-xs text-white/50 uppercase tracking-wide">
              Key Expression
            </p>

            <p className="text-lg font-semibold text-white">
              {lesson.key_expression}
            </p>
          </div>

          {/* ================= PATTERN (SECONDARY) ================= */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs text-white/50 uppercase tracking-wide">
              Pattern
            </p>

            <p className="text-base font-medium text-white">
              {pattern_display}
            </p>

            <p className="text-xs text-white/60">
              Use this structure to sound more polite when you're uncertain.
            </p>
          </div>

          {/* ================= VARIATIONS (PRACTICE) ================= */}
          <div className="space-y-2">
            <p className="text-sm text-white/60">Try using this pattern:</p>

            <div className="space-y-1 pl-2 border-l border-white/10">
              {alternative.map((text, index) => (
                <p key={index} className="text-sm text-white/80">
                  • {text}
                </p>
              ))}
            </div>
          </div>

          {/* ================= INSIGHT ================= */}
          <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-xl p-4 text-sm text-white/80 leading-relaxed">
            💡 {insight}
          </div>

          {/* ================= ACTION ================= */}
          <button
            onClick={async () => {
              await completeLesson();
              setStep(0);
            }}
          >
            ✅ Next Sentence →
          </button>
        </section>
      )}
    </div>
  );
}
