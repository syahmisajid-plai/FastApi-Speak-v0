export default function Header({ streak, mode, isScrolled, dailyStory }) {
  const isComplete = streak.chat_count >= 10;

  const phases = [
    { key: "morning", label: "Morning", emoji: "🌅" },
    { key: "afternoon", label: "Afternoon", emoji: "☀️" },
    { key: "evening", label: "Evening", emoji: "🌆" },
    { key: "night", label: "Night", emoji: "🌙" },
  ];

  const bgStyle =
    mode === "dailyStory"
      ? "bg-white/5"
      : mode === "roleplay"
        ? "bg-indigo-700/40"
        : "bg-slate-900/70";

  // ==============================
  // LOCK LOGIC (SAMA SEPERTI INDICATOR)
  // ==============================

  let unlockNext = true;

  return (
    <header
      className={`sticky top-0 z-50 flex flex-col gap-2 px-4 py-3 
      border-b border-white/10 backdrop-blur-md ${bgStyle}`}
    >
      {/* ROW ATAS */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            SpeakEasy
          </h2>
          <p className="text-xs text-gray-300">Practice your speaking</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">
            🔥 {streak.current_streak}
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
            🏆 {streak.longest_streak}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  isComplete ? "bg-green-400" : "bg-blue-400"
                }`}
                style={{
                  width: `${Math.min(streak.chat_count * 10, 100)}%`,
                }}
              />
            </div>
            <span>{isComplete ? "Done" : `${streak.chat_count}/10`}</span>
          </div>
        </div>
      </div>

      {/* 🔥 DAILY STORY PHASES (WITH SEQUENTIAL LOCK) */}
      {mode === "dailyStory" && isScrolled && (
        <div className="flex justify-between items-center px-1">
          {phases.map((phase) => {
            const done = dailyStory?.[phase.key];

            // =========================
            // LOCK SYSTEM (SEQUENTIAL)
            // =========================
            const isUnlocked = unlockNext;

            if (!done && unlockNext) unlockNext = false;

            return (
              <div
                key={phase.key}
                className="relative flex flex-col items-center text-[10px] w-full"
              >
                {/* ICON */}
                <div
                  className={`w-8 h-8 mt-2 flex items-center justify-center rounded-full transition-all
                  ${
                    done
                      ? "bg-green-400 text-black"
                      : "bg-white/10 text-gray-300"
                  }`}
                >
                  {phase.emoji}
                </div>

                {/* LABEL */}
                <span
                  className={`mt-1 ${done ? "text-gray-200" : "text-gray-400"}`}
                >
                  {phase.label}
                </span>

                {/* 🔒 OVERLAY (SAMA SEPERTI INDICATOR) */}
                {!isUnlocked && !done && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg mx-4">
                    🔒
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
}
