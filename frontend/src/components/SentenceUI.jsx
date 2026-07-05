// import { div } from "framer-motion/m";
import { useState, useEffect } from "react";

import clickAudioFile from "../assets/sound/universfield-level-up-191997.mp3";
import nextAudioFile from "../assets/sound/freesound_community-button-pressed-38129.mp3";
import openMicFile from "../assets/sound/universfield-level-up-191997.mp3";

export default function SentenceUI({
  lesson,
  loading,
  refetch,
  completeLesson,

  setModeLearn,
  sentenceStage,

  startRecording,
  stopRecording,
  liveTranscript,
}) {
  const [step, setStep] = useState(0);

  const clickAudio = new Audio(clickAudioFile);
  const nextAudio = new Audio(nextAudioFile);
  const openMicAudio = new Audio(openMicFile);

  // console.log("====== lesson =======", lesson);
  const function_type = lesson?.function_type;

  const [mode, setMode] = useState("idle");
  // idle | recording | review

  const [finalTranscript, setFinalTranscript] = useState("");

  // loading minimal 2 detik
  const [showLoading, setShowLoading] = useState(true);

  const [showID, setShowID] = useState(false);

  const [hasStarted, setHasStarted] = useState(false);

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
        step === 0 || step === 1 ? "mt-20" : step === 3 ? "mt-28" : "mt-32"
      } text-white`}
    >
      {/* ================= STEP 0: SPEAKING ================= */}
      {(step === 0 || step === 1) && (
        <section className="space-y-6">
          {/* CONTEXT */}
          <div>
            <h2 className="text-xl font-bold mb-2">🎬 Situation</h2>

            <div
              className="
                bg-gradient-to-br
                from-white/10
                to-indigo-500/10
                border border-white/10
                backdrop-blur-xl
                rounded-2xl
                space-y-3
                p-4
                text-white
                shadow-[0_0_30px_rgba(99,102,241,0.15)]
              "
            >
              <div className="flex items-center justify-between">
                {function_type && (
                  <span
                    className="
        inline-flex items-center
        px-3 py-1
        rounded-full
        text-xs font-medium
        bg-purple-500/20
        border border-purple-400/30
        text-purple-200
      "
                  >
                    🎯 Function: {function_type}
                  </span>
                )}

                <button
                  onClick={() => {
                    setModeLearn("idle");
                    sentenceStage("idle");
                  }}
                  className="
      inline-flex items-center
      px-3! py-1!
      rounded-full
      text-xs font-medium
      bg-white/5!
      border border-white/10
      text-white/70
      hover:text-white
      hover:bg-white/10!
      transition-all
    "
                >
                  ← Back
                </button>
              </div>

              <p>{context}</p>

              {/* toggle chip */}
              {context_id && (
                <>
                  <button
                    onClick={() => {
                      clickAudio.currentTime = 0;
                      clickAudio.play().catch(() => {});

                      setShowID((prev) => !prev);
                    }}
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

                  {/* TRANSLATION */}
                  <div
                    className={`
                      transition-all duration-300 overflow-hidden
                      ${
                        showID
                          ? "max-h-40 opacity-100 translate-y-0"
                          : "max-h-0 opacity-0 -translate-y-1"
                      }
                    `}
                  >
                    <div
                      className="
                        rounded-2xl
                        bg-black/20
                        border border-white/[0.05]
                        px-4 py-3
                      "
                    >
                      <p className="text-sm italic leading-6 text-white/55">
                        {context_id}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {step === 0 && !hasStarted && (
            <div className="space-y-6">
              {/* READY CARD */}
              <div
                className="
                  bg-gradient-to-br
                  from-indigo-500/10
                  to-purple-500/10
                  border border-white/10
                  rounded-3xl
                  p-6
                  text-center
                  backdrop-blur-xl
                "
              >
                <div className="text-5xl mb-4">🎯</div>

                <h2 className="text-2xl font-bold mb-2">Ready to Respond?</h2>

                <p className="text-white/70 text-sm leading-relaxed">
                  Imagine you're in this situation. Think about what you would
                  naturally say in English.
                </p>

                <button
                  onClick={() => {
                    nextAudio.currentTime = 0;
                    nextAudio.play().catch(() => {});

                    setHasStarted(true);
                  }}
                  className="
                    mt-6 px-6! py-3! rounded-2xl
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    text-white font-semibold
                    hover:scale-105
                    transition-all
                  "
                >
                  🚀 Let's Try
                </button>
              </div>
            </div>
          )}
          {step === 0 && hasStarted && (
            <div
              className="
                  bg-gradient-to-br
                  from-indigo-500/10
                  to-purple-500/10
                  border border-white/10
                  rounded-3xl
                  p-6
                  text-center
                  backdrop-blur-xl
                "
            >
              <h2 className="text-xl font-bold mb-2">🧠 What would you say?</h2>
              {/* INSTRUCTION */}
              <div>
                <p className="text-sm text-white/70 bg-white/5 p-3 rounded-xl">
                  Speak naturally based on the situation above.
                </p>
              </div>

              {/* MIC BUTTON */}

              {/* RECORDING UI */}
              {mode !== "review" && (
                <div className="flex flex-col items-center gap-3 mt-8">
                  <button
                    onClick={() => {
                      openMicAudio.currentTime = 0;
                      openMicAudio.play().catch(() => {});

                      handleMicClick();
                    }}
                    className="
                      relative w-24 h-24 rounded-full
                      flex items-center justify-center
                      text-base!
                      transition-all duration-300
                      border border-white/10
                      bg-white/5 hover:bg-white/10
                      text-white
                      active:scale-95
                    "
                  >
                    <span
                      className={`
                        absolute inset-0 rounded-full border
                        ${
                          mode === "recording"
                            ? "border-indigo-400/60 animate-ping"
                            : "border-white/10"
                        }
                      `}
                    />

                    <span
                      className={`
                        absolute inset-[-6px] rounded-full border
                        ${mode === "recording" ? "border-indigo-400/30" : "border-white/5"}
                      `}
                    />

                    <span className="relative z-10">
                      {mode === "idle" && "🎤"}
                      {mode === "recording" && "⏹"}
                    </span>
                  </button>
                  <p className="text-xs text-white/50">
                    {mode === "recording"
                      ? "Listening... tap to stop"
                      : "Tap to start speaking"}
                  </p>
                </div>
              )}

              {mode === "review" && (
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      nextAudio.currentTime = 0;
                      nextAudio.play().catch(() => {});

                      handleMicClick();
                    }}
                    className="
                      px-5! py-3! rounded-2xl
                      border border-white/10
                      bg-white/5! hover:bg-white/10!
                      text-white
                      transition-all
                    "
                  >
                    🔁 Try Again
                  </button>

                  <button
                    onClick={() => {
                      nextAudio.currentTime = 0;
                      nextAudio.play().catch(() => {});

                      handleSubmit();
                    }}
                    className="
                      px-5! py-3! rounded-2xl
                      bg-gradient-to-r
                      from-indigo-500
                      to-purple-600
                      text-white
                      font-medium
                      hover:scale-105
                      transition-all
                    "
                  >
                    ✅ Submit
                  </button>
                </div>
              )}

              {/* LIVE / FINAL TRANSCRIPT */}
              {(liveTranscript || finalTranscript) && (
                <div className="text-center space-y-2">
                  <p className="text-xs text-white/50">Your answer:</p>

                  <p className="text-sm italic text-white/80">
                    "{mode === "review" ? finalTranscript : liveTranscript}"
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ================= STEP 1: NATURAL EXPRESSIONS ================= */}
      {step === 1 && (
        <section
          className="
                  bg-gradient-to-br
                  from-indigo-500/10
                  to-purple-500/10
                  border border-white/10
                  rounded-3xl
                  px-6
                  pb-6
                  text-center
                  backdrop-blur-xl
                  space-y-4
                "
        >
          <div>
            {finalTranscript && (
              <div className="flex justify-center text-center mt-4">
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

            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  nextAudio.currentTime = 0;
                  nextAudio.play().catch(() => {});

                  nextStep();
                }}
                className="
                px-5!
                py-3!
                w-full
                mx-auto
                rounded-2xl
                bg-white/5!
                border
                border-white/10
                backdrop-blur-md
                text-white
                font-medium
                shadow-lg
                hover:bg-white/10!
                hover:border-purple-400/30!
                transition-all
                duration-200
                flex
                items-center
                justify-center
                gap-2
              "
              >
                <span>Try in Conversation</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= STEP 2: Try It in Conversation ================= */}
      {step === 2 && (
        <section
          className="
                  bg-gradient-to-br
                  from-indigo-500/10
                  to-purple-500/10
                  border border-white/10
                  rounded-3xl
                  px-6
                  py-8
                  
                  backdrop-blur-xl
                  space-y-4
                "
        >
          {/* SYSTEM BUBBLE */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🔁 Try It in Conversation</h2>

            <button
              onClick={() => {
                setModeLearn("idle");
                sentenceStage("idle");
              }}
              className="
                inline-flex items-center gap-1
                px-3!py-1!
                rounded-full
                text-xs font-medium
                bg-white/5!
                border border-white/10
                text-white/80
                hover:text-white
                hover:bg-white/10!
                transition-all
              "
            >
              ← Back
            </button>
          </div>

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
            {mode !== "review" && (
              <div className="flex flex-col items-center gap-3 mt-4">
                <button
                  onClick={() => {
                    openMicAudio.currentTime = 0;
                    openMicAudio.play().catch(() => {});

                    handleMicClick();
                  }}
                  className="
          relative w-24 h-24 rounded-full
          flex items-center justify-center
          text-base!
          transition-all duration-300
          border border-white/10
          bg-white/5 hover:bg-white/10
          text-white
          active:scale-95
        "
                >
                  {/* OUTER RING */}
                  <span
                    className={`
            absolute inset-0 rounded-full border
            ${
              mode === "recording"
                ? "border-indigo-400/60 animate-ping"
                : "border-white/10"
            }
          `}
                  />

                  {/* SECOND RING */}
                  <span
                    className={`
            absolute inset-[-6px] rounded-full border
            ${mode === "recording" ? "border-indigo-400/30" : "border-white/5"}
          `}
                  />

                  {/* ICON */}
                  <span className="relative z-10">
                    {mode === "idle" && "🎤"}
                    {mode === "recording" && "⏹"}
                  </span>
                </button>

                {/* LABEL */}
                <p className="text-xs text-white/50">
                  {mode === "recording"
                    ? "Listening... tap to stop"
                    : "Tap to start speaking"}
                </p>
              </div>
            )}

            {/* REVIEW BUTTONS */}
            {mode === "review" && (
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => {
                    nextAudio.currentTime = 0;
                    nextAudio.play().catch(() => {});

                    handleMicClick();
                  }}
                  className="
                    px-5! py-3! rounded-2xl
                    border border-white/10
                    bg-white/5! hover:bg-white/10!
                    text-white
                    transition-all
                  "
                >
                  🔁 Try Again
                </button>

                <button
                  onClick={() => {
                    nextAudio.currentTime = 0;
                    nextAudio.play().catch(() => {});

                    nextStep();
                  }}
                  className="
          px-5! py-3! rounded-2xl
          bg-gradient-to-r
          from-indigo-500
          to-purple-600
          text-white
          font-medium
          hover:scale-105
          transition-all
        "
                >
                  ✅ Next →
                </button>
              </div>
            )}
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
              nextAudio.currentTime = 0;
              nextAudio.play().catch(() => {});
              await completeLesson();
              setMode("idle");
              setStep(0);
              setHasStarted(false);
            }}
            className="
              inline-flex
              items-center
              gap-2
              px-5!
              py-2.5!
              rounded-xl
              bg-blue-600!
              hover:bg-blue-700
              text-white
              font-semibold
              transition-all
              duration-200
              active:scale-95
              shadow
              hover:shadow-lg
            "
          >
            ✅ Next Sentence →
          </button>
        </section>
      )}
    </div>
  );
}
