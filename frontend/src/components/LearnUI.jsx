import { useState } from "react";
import VocabUI from "./VocabUI";
import SentenceUI from "./SentenceUI";
import SentenceChoice from "./SentenceChoice";

import VocabJourney from "./VocabJourney";

import ConversationChoice from "./ConversationChoice";
import ConversationUI from "./ConversationUI";

export default function LearnUI({
  vocabProps,
  sentenceProps,
  modeLearn,
  setModeLearn,
}) {
  const [started, setStarted] = useState(false);
  const [startingJourney, setStartingJourney] = useState(false);

  const phase = vocabProps.phase;
  // console.log("LearnUI phase:", phase);

  const vocabStage = vocabProps.vocabStage;
  const setVocabStage = vocabProps.setVocabStage;
  // console.log("LearnUI vocabStage:", vocabStage);

  // const startSession = vocabProps.startSession;

  // ======== Vocab ========
  const chapterList = vocabProps.chapterList;
  const goToJourney = vocabProps.goToJourney;

  const chapterStats = vocabProps.chapterStats;
  const openChapterModal = vocabProps.openChapterModal;

  const chapterProgressMap = vocabProps.chapterProgressMap;
  const loadingVocab = vocabProps.loading;
  const showNextButton = vocabProps.showNextButton;

  // ======== Sentence ========
  const sentenceType = sentenceProps.sentenceType;
  const setSentenceType = sentenceProps.setSentenceType;
  const loadingSentence = sentenceProps.loading;

  const [localSentenceStage, setLocalSentenceStage] = useState("idle");
  const sentenceStage = sentenceProps?.sentenceStage ?? localSentenceStage;
  const setSentenceStage =
    sentenceProps?.setSentenceStage ?? setLocalSentenceStage;

  // ======== Conversation ========
  const [conversationStage, setConversationStage] = useState("idle");
  // idle || choice || session

  // const [showVocab, setShowVocab] = useState(false);
  // const [showSentence, setShowSentence] = useState(false);
  // idle | vocab | sentence

  // console.log("sentenceStage == ", sentenceStage);

  return (
    <section
      className={`mx-4 transition-all duration-500 ${
        phase === "verifyMeaning" ||
        vocabStage === "journey" ||
        showNextButton === true
          ? "mt-8 md:mt-0 md:mb-96"
          : phase === "guidedPractice" ||
              phase === "makeSentence" ||
              phase === "showMeaning"
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
              disabled={loadingVocab || loadingSentence}
              className="mt-5 w-full py-2.5! rounded-xl
                bg-gradient-to-r from-indigo-500 to-indigo-600
                text-white text-sm! font-medium
                flex items-center justify-center gap-2
                disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingVocab || loadingSentence ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M22 12a10 10 0 0 1-10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  Preparing your practice...
                </>
              ) : (
                "Start Practice"
              )}
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
            <div className="space-y-3">
              {/* VOCABULARY */}
              <button
                onClick={() => {
                  setModeLearn("vocab");
                  setVocabStage("journey");
                }}
                className="group w-full rounded-2xl border border-white/10
                bg-gradient-to-br from-indigo-500/10 to-white/5
                p-2! hover:border-indigo-400/40 hover:bg-white/10
                transition-all duration-300 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl
                      bg-indigo-500/20 border border-indigo-400/20
                      flex items-center justify-center text-2xl"
                    >
                      📚
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">
                        Vocabulary
                      </p>

                      <p className="text-xs text-white/50 mt-1">
                        Master essential English words
                      </p>
                    </div>
                  </div>

                  <span className="text-white/30 text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>

              {/* EXPRESSIONS */}
              <button
                onClick={() => {
                  setModeLearn("sentence");
                  setSentenceStage("choice");
                }}
                className="group w-full rounded-2xl border border-white/10
                          bg-gradient-to-br from-emerald-500/10 to-white/5
                          p-2! hover:border-emerald-400/40 hover:bg-white/10
                          transition-all duration-300 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl
                        bg-emerald-500/20 border border-emerald-400/20
                        flex items-center justify-center text-2xl"
                    >
                      💬
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">
                        Expressions
                      </p>

                      <p className="text-xs text-white/50 mt-1">
                        Learn natural everyday expressions
                      </p>
                    </div>
                  </div>

                  <span className="text-white/30 text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>

              {/* CONVERSATIONS */}
              <button
                onClick={() => {
                  setModeLearn("conversation");
                  setConversationStage("choice");
                }}
                className="group w-full rounded-2xl border border-white/10
                    bg-gradient-to-br from-orange-500/10 to-white/5
                    p-2! hover:border-orange-400/40 hover:bg-white/10
                    transition-all duration-300 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl
                        bg-orange-500/20 border border-orange-400/20
                        flex items-center justify-center text-2xl"
                    >
                      🎧
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">
                        Conversations
                      </p>

                      <p className="text-xs text-white/50 mt-1">
                        Learn through real dialogues
                      </p>
                    </div>
                  </div>

                  <span className="text-white/30 text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
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
                setStartingJourney(true);
                goToJourney(chapterId);
              }}
              startingJourney={startingJourney}
              chapterStats={chapterStats}
              openChapterModal={openChapterModal}
              chapterProgressMap={chapterProgressMap}
              setModeLearn={setModeLearn}
              setVocabStage={setVocabStage}
            />
          )}

          {modeLearn === "vocab" && vocabStage === "session" && (
            <VocabUI {...vocabProps} setStartingJourney={setStartingJourney} />
          )}
        </div>
      </div>

      {/* ================= SENTENCE UI ================= */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out ${
          modeLearn === "sentence"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* CHOICE */}
        {modeLearn === "sentence" && sentenceStage === "choice" && (
          <SentenceChoice
            setModeLearn={setModeLearn}
            setSentenceStage={setSentenceStage}
            onSelect={(type) => {
              setSentenceType(type);
              setSentenceStage("session");
            }}
          />
        )}

        {/* SESSION */}
        {modeLearn === "sentence" && sentenceStage === "session" && (
          <SentenceUI
            {...sentenceProps}
            sentenceStage={sentenceStage}
            setModeLearn={setModeLearn}
          />
        )}
      </div>

      {/* ================= CONVERSATION UI ================= */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out px-6 ${
          modeLearn === "conversation"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* CHOICE */}
        {modeLearn === "conversation" && conversationStage === "choice" && (
          <ConversationChoice
            setModeLearn={setModeLearn}
            setConversationStage={setConversationStage}
            onSelect={(conversationId) => {
              // setConversationId(conversationId);
              setConversationStage("session");
            }}
          />
        )}

        {/* SESSION */}
        {modeLearn === "conversation" && conversationStage === "session" && (
          <ConversationUI
            setModeLearn={setModeLearn}
            setConversationStage={setConversationStage}
          />
        )}
      </div>

      <div className="mt-24"></div>
    </section>
  );
}
