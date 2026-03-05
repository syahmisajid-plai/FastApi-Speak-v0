import { useEffect, useState } from "react";

export default function DailyStoryIndicator({ dailyStory, onToggle }) {
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

    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const completed = phases.filter((p) => dailyStory[p.key]).length;
  const progress = (completed / phases.length) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium opacity-90">Daily Story</span>
          <span className="text-[11px] opacity-60">
            {completed}/4 completed
          </span>
        </div>

        {/* Clock */}
        <div className="text-sm font-mono bg-white/10 px-2 py-1 rounded-md">
          {time}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Phase buttons */}
      <div className="grid grid-cols-4 gap-2">
        {phases.map((p) => {
          const active = dailyStory[p.key];

          return (
            <button
              key={p.key}
              onClick={() => onToggle(p.key)}
              className={`
                flex flex-col items-center justify-center
                rounded-xl py-3
                transition-all duration-200
                ${
                  active
                    ? "bg-green-500/80 shadow-lg"
                    : "bg-white/5 hover:bg-white/15"
                }
              `}
            >
              <div className="text-lg">{p.emoji}</div>

              <div className="text-xs mt-1 opacity-80">{p.label}</div>

              <div className="text-[10px] mt-1 opacity-70">
                {active ? "Done" : "Pending"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
