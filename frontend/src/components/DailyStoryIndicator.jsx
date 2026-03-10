import { useEffect, useState } from "react";

const DailyStoryIndicator = ({ dailyStory, isDailyLocked }) => {
  const phases = [
    { key: "morning", label: "Morning", emoji: "🌅" },
    { key: "afternoon", label: "Afternoon", emoji: "☀️" },
    { key: "evening", label: "Evening", emoji: "🌆" },
    { key: "night", label: "Night", emoji: "🌙" },
  ];

  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setTime(formatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const completedCount = phases.filter((p) => dailyStory[p.key]).length;
  const progress = (completedCount / phases.length) * 100;

  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  // -----------------------------
  // LOGIKA UNLOCK NEXT
  // -----------------------------
  let unlockNext = true; // fase pertama selalu unlock

  return (
    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium opacity-90">Daily Story</span>
          <span className="text-[11px] opacity-60">
            {completedCount}/4 completed
          </span>
        </div>
        <div className="flex flex-col items-end text-right leading-tight">
          <span className="text-[11px] opacity-70">{todayDate}</span>
          <div className="text-sm font-mono bg-white/10 px-2 py-1 rounded-md mt-1">
            {time}
          </div>
        </div>
      </div>
      {/* Progress */}
      <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-bl-400 to-bl-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Phase Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {phases.map((p) => {
          const done = dailyStory[p.key];
          const isUnlocked = unlockNext; // fase berikutnya hanya unlock jika unlockNext = true

          if (!done && unlockNext) unlockNext = false; // setelah fase pertama yang belum selesai, fase berikutnya tetap terkunci

          return (
            <div
              key={p.key}
              className={`
              relative flex flex-col items-center justify-center
              rounded-xl py-3
              transition-all
              ${done ? "bg-green-500/80 shadow-lg" : "bg-white/5"}
            `}
            >
              <div className="text-lg">
                {p.emoji} {done && "✅"}
              </div>
              <div className="text-xs mt-1 ">{p.label}</div>

              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                  <span className="text-white text-xl">🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isDailyLocked && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl z-20">
          <div className="text-3xl mb-2">🔒</div>
          <div className="text-sm font-medium">Daily Story Locked</div>
          <div className="text-xs opacity-70 mt-1">Available 16:00 – 02:00</div>
        </div>
      )}
    </div>
  );
};

export default DailyStoryIndicator;
