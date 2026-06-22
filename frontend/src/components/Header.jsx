import { useState, useEffect } from "react";
import DailySummaryViewer from "./DailySummaryViewer";
import TranslationHistoryModal from "./TranslationHistoryModal";
import CompletedLessonsModal from "./CompletedLessonsModal";

import UsageDashboard from "./UsageDashboard";

export default function Header({
  mode,
  isScrolled,
  dailyStory,
  user,
  onLogout,

  streakDaily,
  fetchStreakDaily,
  activeChecklist,
  onOpenVocab,
  completedCountVocab,
  completedLessons,

  modeLearn,
  modeScenario,

  autoCorrection,

  setAutoCorrection,

  supportSTTWeb,
  setSupportSTTWeb,

  openMenu,
  setOpenMenu,
}) {
  const [showSummaryDaily, setShowSummaryDaily] = useState(false);

  const [showHistory, setShowHistory] = useState(false);

  const [showStreakDetail, setShowStreakDetail] = useState(false);

  const [page, setPage] = useState(0);

  const [showCostDashboard, setShowCostDashboard] = useState(false);

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
        ? "bg-indigo-900/30"
        : mode === "vocab"
          ? "bg-slate-900/70"
          : mode === "ielts"
            ? "bg-rose-600/20"
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
            {/* {mode === "dailyStory" && (
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
            )} */}

            {/* 🔥 STREAK ONLY DAILY STORY (inside scenarios) */}
            {mode === "scenarios" && modeScenario === "daily_story" && (
              <div className="flex items-center gap-2">
                {/* 🔥 CURRENT */}
                <button
                  onClick={() => setShowStreakDetail((prev) => !prev)}
                  className="
                    px-2! py-1! rounded-full
                    bg-orange-500/10! text-orange-400 text-xs
                    flex items-center gap-1
                    hover:bg-orange-500/20! transition
                  "
                >
                  🔥 <span>{streakDaily?.current ?? 0}</span>
                </button>

                {showStreakDetail && (
                  <div
                    onClick={() => setShowStreakDetail(false)}
                    className="fixed inset-0 z-[999]"
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="
            absolute top-16 right-4
            bg-black/80 border border-white/10
            rounded-xl p-3 text-white text-xs w-40
          "
                    >
                      <div className="flex justify-between mb-1">
                        <span>🔥 Current</span>
                        <span>{streakDaily?.current ?? 0}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>🏆 Best</span>
                        <span>{streakDaily?.longest ?? 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === "learn" && (
              <div className="flex items-center gap-2">
                {/* MAIN VOCAB BUTTON */}
                {modeLearn === "vocab" && (
                  <button
                    onClick={onOpenVocab}
                    className="
                      px-3! py-1.5!
                      rounded-full
                      bg-blue-500/10!
                      text-xs text-blue-400
                      hover:bg-blue-500/20!
                      transition
                      flex items-center gap-1
                    "
                  >
                    📚 <span className="hidden sm:inline">Vocab</span>
                    <span className="ml-1 text-blue-300 font-medium">
                      {completedCountVocab ?? 0}
                    </span>
                  </button>
                )}

                {/* MAIN Sentece BUTTON */}
                {modeLearn === "sentence" && (
                  <CompletedLessonsModal completedLessons={completedLessons} />
                )}
              </div>
            )}

            {/* AUTO CORRECTION TOGGLE */}
            {(mode === "freeTalk" || mode === "scenarios") && (
              <button
                onClick={() => setAutoCorrection((prev) => !prev)}
                className={`
                    flex items-center gap-2
                    px-2.5! py-1.5!
                    rounded-full
                    transition
                    border
                    ${
                      autoCorrection
                        ? "bg-emerald-500/10! border-emerald-400/30 text-emerald-300"
                        : "bg-white/5! border-white/10 text-gray-400"
                    }
                  `}
              >
                <span className="text-[11px] font-medium">✍️ Correction</span>

                {/* SWITCH */}
                <div
                  className={`
                      w-9 h-5 rounded-full relative transition
                      ${autoCorrection ? "bg-emerald-400" : "bg-white/20"}
                    `}
                >
                  <div
                    className={`
                        absolute top-0.5
                        w-4 h-4 rounded-full bg-white transition-all
                        ${autoCorrection ? "left-4" : "left-0.5"}
                      `}
                  />
                </div>
              </button>
            )}

            {/* COST MONITORING DASHBOARD */}
            {user?.id === "21121b45-6987-432c-a2cd-fda17eabbd2b" &&
              mode === "freeTalk" && (
                <button
                  onClick={() => setShowCostDashboard(true)}
                  className="
                  px-3! py-1.5!
                  rounded-full
                  bg-green-500/10! text-green-400
                  text-xs
                  hover:bg-green-500/20!
                  transition
                "
                >
                  📊 <span className="hidden sm:inline">Usage</span>
                </button>
              )}

            {/* USER */}
            {user && (
              <div className="relative">
                {/* Avatar Button */}
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/10 
                            text-white flex items-center justify-center text-sm font-semibold
                            ring-1 ring-white/10 hover:ring-white/20 hover:scale-105 
                            transition-all duration-200"
                >
                  {user.username?.charAt(0).toUpperCase()}
                </button>

                {/* Dropdown */}
                {openMenu && (
                  <>
                    {/* overlay */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenMenu(false)}
                    />

                    <div
                      className="absolute right-0 mt-3 w-60 z-50
                                    bg-zinc-900/80 backdrop-blur-xl
                                    border border-white/10 rounded-2xl
                                    shadow-xl overflow-hidden
                                    animate-fadeIn"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="text-sm font-medium text-white truncate">
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-400">
                          Account settings
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {/* Translation History */}
                        <button
                          onClick={() => setShowHistory(true)}
                          className="w-full flex items-center gap-2 px-4! py-2.5! text-sm!
                                    text-white hover:bg-white/10 transition"
                        >
                          <span>🕘</span>
                          <span>Translation History</span>
                        </button>

                        {/* STT Toggle */}
                        <div className="px-4 py-3 border-t border-white/10">
                          <div className="text-[11px] text-gray-400 mb-2 uppercase tracking-wide">
                            Speech Recognition
                          </div>

                          <label className="flex items-center justify-between text-sm text-white cursor-pointer">
                            <span className="text-sm">
                              {supportSTTWeb ? "Web Speech API" : "Whisper"}
                            </span>

                            <input
                              type="checkbox"
                              checked={supportSTTWeb}
                              onChange={(e) =>
                                setSupportSTTWeb(e.target.checked)
                              }
                              className="accent-white cursor-pointer scale-90"
                            />
                          </label>
                        </div>

                        {/* Logout */}
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center gap-2 px-4! py-2.5! text-sm!
                                    text-red-400 hover:bg-red-500/10 transition"
                        >
                          <span>⎋</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DAILY STORY PROGRESS ONLY DAILY MODE */}
        {mode === "scenarios" &&
          modeScenario === "daily_story" &&
          isScrolled && (
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
            ${done ? "bg-green-400 text-black" : "bg-white/10 text-gray-300"}`}
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

        {/* ================= ROLEPLAY MODE ================= */}
        {mode === "scenarios" &&
          modeScenario === "roleplay" &&
          isScrolled &&
          activeChecklist && (
            <div className="px-1 mt-2">
              {/* HEADER */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-white/70 uppercase">
                  🎭 Roleplay Checklist
                </p>

                <p className="text-[10px] text-white/50">
                  {activeChecklist.filter((i) => i.done).length} /{" "}
                  {activeChecklist.length}
                </p>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-indigo-400 transition-all duration-300"
                  style={{
                    width: `${
                      (activeChecklist.filter((i) => i.done).length /
                        activeChecklist.length) *
                      100
                    }%`,
                  }}
                />
              </div>

              {/* CHECKLIST ITEMS */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activeChecklist.map((item, i) => (
                  <div
                    key={i}
                    className={`
            min-w-[140px] px-2 py-1 rounded-lg text-[10px]
            border transition flex items-center gap-1
            ${
              item.done
                ? "bg-green-500/10 border-green-400/30 text-green-300"
                : "bg-white/5 border-white/10 text-white/60"
            }
          `}
                  >
                    <span className="text-xs">{item.done ? "✔" : "⬜"}</span>
                    <span className="truncate">{item.text}</span>
                  </div>
                ))}
              </div>
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

      <TranslationHistoryModal
        show={showHistory}
        onClose={() => setShowHistory(false)}
        userId={user?.id}
      />

      {/* COST MONITORING DASHBOARD */}
      {showCostDashboard && (
        <div
          onClick={() => setShowCostDashboard(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl px-4"
          >
            <button
              onClick={() => setShowCostDashboard(false)}
              className="absolute -top-10 right-4 text-white text-sm"
            >
              ✕
            </button>

            <div className="bg-black/80 rounded-2xl p-4">
              <UsageDashboard />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
