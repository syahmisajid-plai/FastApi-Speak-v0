// import { div } from "framer-motion/m";
import { useState } from "react";

export default function SentenceUI({
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

  const variations = [
    "I might have other plans.",
    "I’ll get back to you.",
    "Sounds fun, but I’m not sure yet.",
  ];

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
      {step >= 0 && (
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
      {step >= 1 && (
        <section className="space-y-4">
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

          <h2 className="text-xl font-bold">💡 Natural Expressions</h2>

          <div className="space-y-2">
            {idealAnswers.map((ans, i) => (
              <div key={i} className="bg-green-100 p-3 rounded text-black">
                {ans}
              </div>
            ))}
          </div>

          {step === 1 && (
            <button onClick={nextStep} className="btn mt-4">
              Practice →
            </button>
          )}
        </section>
      )}

      {/* ================= STEP 2: SHADOWING ================= */}
      {step >= 2 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">🔁 Repeat After AI</h2>

          {idealAnswers.map((ans, i) => (
            <div key={i} className="space-y-1 mb-4">
              <p className="font-semibold">{ans}</p>

              <div className="flex gap-2">
                <button className="btn-small">▶ Play</button>
                <button className="btn-small">🎤 Record</button>
              </div>
            </div>
          ))}

          {step === 2 && (
            <button onClick={nextStep} className="btn mt-4">
              Next →
            </button>
          )}
        </section>
      )}

      {/* ================= STEP 3: VARIATIONS ================= */}
      {step >= 3 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">🔄 Variations</h2>

          {variations.map((v, i) => (
            <div key={i} className="bg-blue-100 text-black p-3 rounded">
              {v}
            </div>
          ))}

          {step === 3 && (
            <button onClick={nextStep} className="btn mt-4">
              Final Challenge →
            </button>
          )}
        </section>
      )}

      {/* ================= STEP 4: QUICK RESPONSE ================= */}
      {step >= 4 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">⚡ Quick Response</h2>

          <p className="text-white/70">{context}</p>

          <textarea
            className="w-full p-3 border rounded text-black"
            placeholder="Respond quickly..."
          />

          {step === 4 && <button className="btn mt-4 w-full">Finish</button>}
        </section>
      )}
    </div>
  );
}
