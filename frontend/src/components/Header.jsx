import { useState, useEffect } from "react";
import DailySummaryViewer from "./DailySummaryViewer";

export default function Header({
  mode,
  isScrolled,
  dailyStory,
  user,
  onLogout,

  streakDaily,
  fetchStreakDaily,
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const [showSummaryDaily, setShowSummaryDaily] = useState(false);

  // =========================
  // FETCH STREAK ONLY FOR DAILY MODE
  // =========================
  useEffect(() => {
    if (mode !== "dailyStory") return;
    if (!user?.id) return;

    console.log("🚀 Fetch streak (dailyStory mode only)");
    fetchStreakDaily();
  }, [mode, user?.id]);

  // =========================
  // DEBUG
  // =========================
  useEffect(() => {
    if (mode === "dailyStory") {
      console.log("🔥 streakDaily:", streakDaily);
    }
  }, [streakDaily, mode]);

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

  let unlockNext = true;

  return (
    <>
      <header
        className={`sticky top-0 z-50 flex flex-col gap-2 px-4 py-3 
        border-b border-white/10 backdrop-blur-md ${bgStyle}`}
      >
        {/* HEADER ROW */}
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div>
            <h2 className="text-lg font-semibold text-white">SpeakEasy</h2>
            <p className="text-xs text-gray-300">Practice your speaking</p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* SUMMARY ONLY DAILY */}
            {mode === "dailyStory" && (
              <button
                onClick={() => setShowSummaryDaily(true)}
                className="
                  px-3! py-1.5!
                  rounded-full
                  bg-white/10!
                  text-xs text-white
                  hover:bg-white/20
                  transition
                  flex items-center gap-1
                "
              >
                📖 Open<span className="hidden sm:inline">Diary</span>
              </button>
            )}

            {/* 🔥 STREAK ONLY DAILY STORY */}
            {mode === "dailyStory" && (
              <div className="flex items-center gap-2">
                {/* 🔥 CURRENT */}
                <div
                  className="
                    px-2 py-1 rounded-full
                    bg-orange-500/10 text-orange-400 text-xs
                    flex items-center gap-1
                  "
                >
                  🔥 <span>{streakDaily?.current ?? 0}</span>
                </div>

                {/* 🏆 LONGEST (ALWAYS VISIBLE BUT COMPACT ON MOBILE) */}
                <div
                  className="
                    px-2 py-1 rounded-full
                    bg-yellow-500/10 text-yellow-400 text-xs
                    flex items-center gap-1
                  "
                >
                  🏆
                  <span className="hidden sm:inline">
                    {streakDaily?.longest ?? 0}
                  </span>
                  {/* mobile version */}
                  <span className="sm:hidden">{streakDaily?.longest ?? 0}</span>
                </div>
              </div>
            )}

            {/* USER */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-sm font-semibold hover:bg-white/20 transition"
                >
                  {user.username?.charAt(0).toUpperCase()}
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-3 py-2 text-gray-300 border-b border-white/10 truncate">
                      {user.username}
                    </div>

                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DAILY STORY PROGRESS ONLY DAILY MODE */}
        {mode === "dailyStory" && isScrolled && (
          <div className="flex justify-between items-center px-1">
            {phases.map((phase) => {
              const done = dailyStory?.[phase.key];

              const isUnlocked = unlockNext;
              if (!done && unlockNext) unlockNext = false;

              return (
                <div
                  key={phase.key}
                  className="relative flex flex-col items-center text-[10px] w-full"
                >
                  <div
                    className={`w-7 h-7 mt-2 flex items-center justify-center rounded-full
                    ${
                      done
                        ? "bg-green-400 text-black"
                        : "bg-white/10 text-gray-300"
                    }`}
                  >
                    {phase.emoji}
                  </div>

                  <span
                    className={`mt-1 ${done ? "text-gray-200" : "text-gray-400"}`}
                  >
                    {phase.label}
                  </span>

                  {!isUnlocked && !done && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg mx-2">
                      🔒
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* MODAL ONLY DAILY MODE */}
      {mode === "dailyStory" && showSummaryDaily && (
        <div
          onClick={() => setShowSummaryDaily(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md px-4"
          >
            <button
              onClick={() => setShowSummaryDaily(false)}
              className="absolute -top-10 right-4 text-white text-sm"
            >
              ✕
            </button>

            <DailySummaryViewer userId={user?.id} />
          </div>
        </div>
      )}
    </>
  );
}
