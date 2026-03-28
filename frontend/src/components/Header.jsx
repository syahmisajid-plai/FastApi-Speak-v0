export default function Header({ streak, mode }) {
  const isComplete = streak.chat_count >= 10;

  const bgStyle =
    mode === "dailyStory"
      ? "bg-white/5"
      : mode === "roleplay"
        ? "bg-indigo-700/40"
        : "bg-slate-900/70";

  return (
    <header
      className={`mt-20 sticky top-0 z-50 flex items-center justify-between px-4 py-3 
      border-b border-white/10 backdrop-blur-md ${bgStyle}`}
    >
      {/* LEFT */}
      <div>
        <h2 className="text-lg font-semibold text-white tracking-tight">
          SpeakEasy
        </h2>
        <p className="text-xs text-gray-300">Practice your speaking</p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* 🔥 */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">
          🔥 {streak.current_streak}
        </div>

        {/* 🏆 */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
          🏆 {streak.longest_streak}
        </div>

        {/* 📊 */}
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
    </header>
  );
}
