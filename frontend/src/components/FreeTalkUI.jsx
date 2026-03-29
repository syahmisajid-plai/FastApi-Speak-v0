import { useState } from "react";

export default function FreeTalkUI({ started, setStarted }) {
  return (
    <section
      className={`mx-4 transition-all duration-500 ${
        started ? "mt-4" : "mt-36"
      }`}
    >
      <div
        className={`text-white border border-white/10 backdrop-blur-md transition-all duration-500
        ${
          started
            ? "rounded-2xl px-4 py-3 bg-slate-900/70"
            : "rounded-3xl p-6 bg-slate-900/70 text-center"
        }`}
      >
        <div
          className={`transition-all duration-500 ${
            started ? "flex items-center gap-3" : "flex flex-col items-center"
          }`}
        >
          {/* ICON */}
          <div
            className={`flex items-center justify-center shrink-0 transition-all duration-500
            ${
              started
                ? "w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-base"
                : "w-14 h-14 rounded-2xl bg-white/10 text-2xl mb-4"
            }`}
          >
            {started ? "💬" : "🎙️"}
          </div>

          {/* TEXT */}
          <div className={`${started ? "leading-tight" : ""}`}>
            <p className="text-sm font-semibold">
              {started ? "Free Talk" : "Free Talk Mode"}
            </p>

            <p className="text-xs text-white/60">
              {started
                ? "Talk freely 🎙️ AI will respond"
                : "Speak anything, AI will respond naturally"}
            </p>
          </div>
        </div>

        {/* BUTTON */}
        {!started && (
          <button
            onClick={() => setStarted(true)}
            className="mt-4 w-full py-2.5! rounded-xl bg-white! text-black text-sm font-medium active:scale-[0.98] transition"
          >
            Start Talking
          </button>
        )}
      </div>
    </section>
  );
}
