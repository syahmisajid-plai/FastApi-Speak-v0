// import { div } from "framer-motion/m";
import { useState } from "react";

export default function SentenceUI({
  lesson,
  loading,
  refetch,

  startRecording,
  stopRecording,
  liveTranscript,
}) {
  const [step, setStep] = useState(0);

  const [mode, setMode] = useState("idle");
  // idle | recording | review

  const [finalTranscript, setFinalTranscript] = useState("");

  const context =
    "Your friend invites you to a party, but you are not sure you want to go.";

  const idealAnswers = [
    "I’m not sure I can make it.",
    "Let me think about it.",
  ];

  const alternative = [
    "I’m not sure I can come.",
    "I’m not sure about that.",
    "I’m not sure if I’m free.",
  ];

  const pattern_display = "I’m not sure...";

  // const shortenSentence = (sentence) => {
  //   return sentence.split(" ").slice(0, 3).join(" ") + "...";
  // };

  // const shortened = idealAnswers
  //   .slice(0, 2)
  //   .map((ans) => shortenSentence(ans))
  //   .join('" or "');

  const questionShadowing = "Hey, I’m having a party. Want to come?";

  const getFeedback = () => {
    if (!finalTranscript) return "";

    const userText = finalTranscript.toLowerCase();

    const patterns = ["not sure", "let me think"];

    const isUsingTarget = patterns.some((p) => userText.includes(p));

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
    <div className="p-6 max-w-xl mx-auto space-y-10 mt-32 text-white">
      {/* ================= STEP 0: SPEAKING ================= */}
      {(step === 0 || step === 1) && (
        <section className="space-y-6">
          {/* CONTEXT */}
          <div>
            <h2 className="text-xl font-bold mb-2">🎬 Situation</h2>
            <p className="bg-gray-100 p-4 rounded text-black">{context}</p>
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
              I’m not sure I can make it.
            </p>
          </div>

          {/* ================= PATTERN (SECONDARY) ================= */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs text-white/50 uppercase tracking-wide">
              Pattern
            </p>

            <p className="text-base font-medium text-white">
              I’m not sure + something
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
            💡 Instead of saying <span className="italic">“No”</span> directly,
            native speakers often soften their response to sound more polite.
          </div>

          {/* ================= ACTION ================= */}
          <button
            onClick={nextStep}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-3 font-medium transition"
          >
            ✅ Next Sentence →
          </button>
        </section>
      )}
    </div>
  );
}
