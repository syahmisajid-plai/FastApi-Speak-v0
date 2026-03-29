import { useState } from "react";

export default function Header({
  streak,
  mode,
  isScrolled,
  dailyStory,
  user,
  onLogout,
}) {
  const [openMenu, setOpenMenu] = useState(false);

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

  let unlockNext = true;

  return (
    <header
      className={`sticky top-0 z-50 flex flex-col gap-2 px-4 py-3 
      border-b border-white/10 backdrop-blur-md ${bgStyle}`}
    >
      {/* ROW ATAS */}
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            SpeakEasy
          </h2>
          <p className="text-xs text-gray-300">Practice your speaking</p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* 🔥 STREAK */}
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs">
              🔥 {streak.current_streak}
            </div>

            <div className="hidden sm:block px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">
              🏆 {streak.longest_streak}
            </div>
          </div>

          {/* USER AVATAR */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="
                  w-8 h-8
                  rounded-full
                  bg-white/10!
                  text-white
                  flex items-center justify-center
                  text-sm font-semibold
                  hover:bg-white/20
                  transition
                "
              >
                {user.username?.charAt(0).toUpperCase()}
              </button>

              {/* DROPDOWN */}
              {openMenu && (
                <div
                  className="
                    absolute right-0 mt-2
                    w-40
                    bg-black/80 backdrop-blur-md
                    border border-white/10
                    rounded-xl
                    shadow-lg
                    overflow-hidden
                  "
                >
                  <div className="px-3 py-2 text-md text-gray-300 border-b border-white/10 truncate">
                    {user.username}
                  </div>

                  <button
                    onClick={onLogout}
                    className="
                      w-full text-left
                      px-3! py-2!
                      text-sm text-red-400
                      hover:bg-red-500/10
                      transition
                    "
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 PROGRESS BAR (pisahin biar lega) */}
      <div className="flex items-center gap-2 text-xs text-gray-300">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${isComplete ? "bg-green-400" : "bg-blue-400"}`}
            style={{
              width: `${Math.min(streak.chat_count * 10, 100)}%`,
            }}
          />
        </div>
        <span>{isComplete ? "Done" : `${streak.chat_count}/10`}</span>
      </div>

      {/* DAILY STORY */}
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
  );
}
