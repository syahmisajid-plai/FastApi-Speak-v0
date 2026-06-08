import { useState } from "react";

export default function FreeTalkUI({ started, setStarted }) {
  return (
    <section
      className={`mx-4 transition-all duration-500 ${
        started ? "mt-4" : "mt-36"
      }`}
    >
      <div
        className={`text-white backdrop-blur-xl transition-all duration-500
        ${
          started
            ? `
              border border-white/10
              rounded-2xl
              px-4 py-3
              bg-slate-900/70
            `
            : `
              border border-white/10
              rounded-3xl
              p-6
              bg-slate-900/70
              text-center
              shadow-lg shadow-black/20
            `
        }`}
      >
        <div
          className={`transition-all duration-500 ${
            started
              ? "flex items-center gap-3"
              : "flex flex-col items-center"
          }`}
        >
          {/* ICON */}
          <div
            className={`flex items-center justify-center shrink-0 transition-all duration-500
            ${
              started
                ? "w-10 h-10 rounded-xl bg-white/10 text-base"
                : "w-14 h-14 rounded-2xl bg-white/10 text-2xl mb-4"
            }`}
          >
            🎙️
          </div>

          {/* TEXT */}
          <div className={`${started ? "leading-tight" : ""}`}>
            <p
              className={`font-semibold tracking-wide transition-all duration-500 ${
                started ? "text-sm mt-1" : "text-base"
              }`}
            >
              {started ? "Free Talk" : "Free Talk Mode"}
            </p>

            <p
              className={`text-white/60 transition-all duration-500 ${
                started ? "text-xs" : "text-xs mt-1"
              }`}
            >
              {started
                ? "Talk freely 🎙️ AI will respond"
                : "Speak naturally with AI"}
            </p>

            {!started && (
              <p className="text-[10px] text-white/35 uppercase tracking-[0.2em] mt-3">
                Natural • Instant • Voice
              </p>
            )}
          </div>
        </div>

        {/* BUTTON */}
        {!started && (
          <button
            onClick={() => setStarted(true)}
            className="
              mt-5
              w-full
              py-2.5!
              rounded-xl
              bg-white!
              text-black
              text-base!
              font-medium
              transition
              hover:bg-white/90
              active:scale-[0.98]
            "
          >
            Start Talking
          </button>
        )}
      </div>
    </section>
  );
}