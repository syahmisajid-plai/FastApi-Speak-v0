import { useState } from "react";
import VocabUI from "./VocabUI";
import SentenceUI from "./SentenceUI";

import VocabJourney from "./VocabJourney";

export default function LearnUI({
  vocabProps,
  sentenceProps,
  modeLearn,
  setModeLearn,
}) {
  const [started, setStarted] = useState(false);

  const phase = vocabProps.phase;
  // console.log("LearnUI phase:", phase);

  const vocabStage = vocabProps.vocabStage;
  const setVocabStage = vocabProps.setVocabStage;
  // console.log("LearnUI vocabStage:", vocabStage);

  // const startSession = vocabProps.startSession;

  const chapterList = vocabProps.chapterList;
  const goToJourney = vocabProps.goToJourney;

  // const [showVocab, setShowVocab] = useState(false);
  // const [showSentence, setShowSentence] = useState(false);
  // idle | vocab | sentence

  return (
    <section
      className={`mx-4 transition-all duration-500 ${
        phase === "verifyMeaning" || vocabStage === "journey"
          ? "mt-8 md:mt-0"
          : phase === "guidedPractice" || phase === "makeSentence"
            ? "mt-16 md:mt-4"
            : "mt-36 md:mt-12"
      } ${modeLearn === "sentence" ? "min-h-128" : ""}`}
    >
      <div className="relative">
        {/* ================= QUICK UI ================= */}
        <div
          className={`text-white border border-white/10 backdrop-blur-xl rounded-3xl p-6 
          bg-linear-to-b from-slate-900/80 to-indigo-900/60 
          shadow-lg shadow-black/30 flex flex-col justify-center
          transition-all duration-300 ease-out
          ${
            modeLearn !== "idle"
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
                Build vocabulary and speaking skills
              </p>

              <p className="text-[10px] text-white/35 uppercase tracking-[0.2em] mt-3">
                Vocabulary • Sentences • Practice
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
                  setModeLearn("vocab");
                  setVocabStage("journey");
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
                onClick={() => setModeLearn("sentence")}
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
            modeLearn === "vocab"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {/* {modeLearn === "vocab" && <VocabUI {...vocabProps} />} */}
          {/* {modeLearn === "vocab" && <VocabJourney/>} */}

          {modeLearn === "vocab" && vocabStage === "journey" && (
            <VocabJourney
              chapters={chapterList}
              onStart={(chapterId) => {
                goToJourney(chapterId);
              }}
            />
          )}

          {modeLearn === "vocab" && vocabStage === "session" && (
            <VocabUI {...vocabProps} />
          )}
        </div>
      </div>

      {/* ================= SENTENCE UI (OVERLAY) ================= */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out ${
          modeLearn === "sentence"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {modeLearn === "sentence" && <SentenceUI {...sentenceProps} />}
      </div>
      <div className="mt-24"></div>
    </section>
  );
}
