import { getNextPhase } from "../utils/dailyStoryFlow";

export default function DailyStoryContinue({
  readyToContinue,
  currentStoryPhase,
  activePhase,

  expanded,
  setExpanded,

  sessionId,
  userId,

  setActivePhase,
  setReadyToContinue,
  setChatHistory,
  setProgressData,

  nextPhaseRequest,
  markPhaseComplete,
  generateSummary,
}) {
  if (!readyToContinue) return null;

  const next = getNextPhase(currentStoryPhase);
  const isLastPhase = !next;

  const handleContinue = async () => {
    const data = await nextPhaseRequest(sessionId, userId);

    if (!data) return;

    const currentPhase = activePhase;
    const nextPhase = getNextPhase(currentPhase);

    // 🔥 update phase
    setActivePhase(nextPhase);

    // 🔥 reset UI
    setExpanded(false);
    setReadyToContinue(false);

    // 🔥 update chat
    setChatHistory((prev) => {
      const last = prev[prev.length - 1];
      const updated = [...prev];

      // prevent duplicate divider
      if (!(last?.type === "phase" && last.phase === nextPhase)) {
        updated.push({
          type: "phase",
          phase: nextPhase,
        });
      }

      updated.push({
        type: "ai",
        phase: nextPhase,
        message:
          data?.ai_message ||
          `Hello, Good ${nextPhase}! How’s your ${nextPhase} going?`,
        timestamp: Date.now(),
      });

      return updated;
    });

    // 🔥 update progress
    markPhaseComplete(currentPhase);

    setProgressData((prev) => {
      const updated = {
        ...prev,
        [currentPhase]: true,
      };

      if (Object.values(updated).every(Boolean)) {
        console.log("🎉 All phases completed!");
      }

      return updated;
    });

    // 🔥 summary
    if (isLastPhase) {
      console.log("🎉 STORY FINISHED → GENERATING SUMMARY");

      const summary = await generateSummary();

      console.log("📊 FINAL SUMMARY:", summary);
    }
  };

  return (
    <div className="fixed bottom-48 left-1/2 -translate-x-1/2 w-full max-w-md px-3 z-40 flex flex-col">
      {/* MAIN TRIGGER */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`
          w-10 h-10
          rounded-full
          bg-gradient-to-r from-emerald-400 to-green-600
          text-white
          shadow-lg shadow-emerald-500/30
          flex items-center justify-center
          transition-all duration-300 ease-out
          hover:scale-110 active:scale-95
          ${
            expanded
              ? "scale-0 opacity-0 pointer-events-none"
              : "scale-100 opacity-100"
          }
        `}
      >
        <span className="text-lg">➜</span>
      </button>

      {/* EXPANDED BUTTON */}
      <div
        className={`
          transition-all duration-300 origin-bottom
          ${
            expanded
              ? "scale-100 opacity-100 mt-2"
              : "scale-95 opacity-0 pointer-events-none"
          }
        `}
      >
        <button
          className="
            group
            bg-gradient-to-r from-emerald-500 to-green-600
            text-white
            rounded-xl
            py-2! px-4!
            shadow-md
            active:scale-95
            transition-all duration-200
            flex items-center justify-between
            text-sm
          "
          onClick={handleContinue}
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {isLastPhase ? "🎉" : "🚀"}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs opacity-80">
                Phase {currentStoryPhase} complete
              </span>

              <span className="font-semibold text-base leading-tight">
                {isLastPhase ? "Finish Story" : "Continue Story"}
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="text-xl group-active:translate-x-1 transition">
            →
          </div>
        </button>
      </div>
    </div>
  );
}