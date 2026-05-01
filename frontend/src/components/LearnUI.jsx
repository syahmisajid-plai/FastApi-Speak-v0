import { useState } from "react";
import VocabUI from "./VocabUI";
import SentenceUI from "./SentenceUI";

export default function LearnUI({ vocabProps }) {
  const [started, setStarted] = useState(false);

  const [showVocab, setShowVocab] = useState(false);
  const [showSentence, setShowSentence] = useState(false);

  return (
    <section className="mx-4 mt-36 transition-all duration-500">
      <div className="relative">
        {/* ================= QUICK UI ================= */}
        <div
          className={`text-white border border-white/10 backdrop-blur-xl rounded-3xl p-6 
          bg-linear-to-b from-slate-900/80 to-indigo-900/60 
          shadow-lg shadow-black/30 flex flex-col justify-center
          transition-all duration-300 ease-out
          ${
            showVocab || showSentence
              ? "opacity-0 scale-[0.98] translate-y-1"
              : "opacity-100 scale-100"
          }`}
        >
          {/* BEFORE */}
          <div
            className={`transition-all duration-500 ${
              started
                ? "opacity-0 -translate-y-3 pointer-events-none absolute"
                : "opacity-100 translate-y-0"
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-white/10 flex items-center justify-center text-2xl mb-4 border border-white/10">
                🧠
              </div>

              <p className="text-sm font-semibold tracking-wide">Learn Mode</p>

              <p className="text-xs text-white/60 mt-1">
                Let's learn new words & sentence
              </p>
            </div>

            <button
              onClick={() => setStarted(true)}
              className="mt-5 w-full py-2.5! rounded-xl 
              bg-gradient-to-r from-indigo-500 to-indigo-600 
              text-white text-sm font-medium 
              active:scale-[0.98] transition-all duration-200
              shadow-md shadow-indigo-900/40"
            >
              Start Practice
            </button>
          </div>

          {/* AFTER */}
          <div
            className={`transition-all duration-500 ${
              started
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3 pointer-events-none absolute"
            }`}
          >
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-white/10 flex items-center justify-center text-base border border-white/10">
                🧠
              </div>

              <div className="leading-tight">
                <p className="text-sm font-semibold">
                  Let's Learn Something New
                </p>
                <p className="text-xs text-white/60">Choose what to practice</p>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="grid grid-cols-2 gap-3">
              {/* WORDS */}
              <button
                onClick={() => {
                  setShowSentence(false);
                  setShowVocab(true);
                }}
                className="bg-white/5 rounded-xl p-4 text-center 
                hover:bg-white/10 transition border border-white/10
                active:scale-[0.98]"
              >
                <div className="text-2xl mb-2">🧩</div>
                <p className="text-sm font-medium">Words</p>
                <p className="text-[10px] text-white/50 mt-1">Learn vocab</p>
              </button>

              {/* SENTENCE */}
              <button
                onClick={() => {
                  setShowVocab(false);
                  setShowSentence(true);
                }}
                className="bg-gradient-to-br from-indigo-500/10 to-white/5 
                rounded-xl p-4 text-center 
                hover:scale-[1.02] transition border border-indigo-500/20
                active:scale-[0.98]"
              >
                <div className="text-2xl mb-2">💬</div>
                <p className="text-sm font-medium">Sentence</p>
                <p className="text-[10px] text-white/50 mt-1">Learn Sentence</p>
              </button>
            </div>
          </div>
        </div>

        {/* ================= VOCAB UI (OVERLAY) ================= */}
        <div
          className={`absolute inset-0 transition-all duration-300 ease-out ${
            showVocab
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <VocabUI {...vocabProps} />
        </div>
      </div>

      {/* ================= SENTENCE UI (OVERLAY) ================= */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out ${
          showSentence
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <SentenceUI />
      </div>
    </section>
  );
}
