import { useEffect, useState } from "react";
import { linkBackend } from "../config";

export default function DailySummaryViewer({ userId }) {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (date) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${linkBackend}/daily-story/summary?user_id=${userId}&story_date=${date}`,
      );

      const data = await res.json();

      if (data.status === "success") {
        setSummary(data.data);
      } else {
        setSummary(null);
      }
    } catch (err) {
      console.error(err);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  const changeDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const phases = [
    { key: "morning_summary", label: "Morning", emoji: "🌅" },
    { key: "afternoon_summary", label: "Afternoon", emoji: "🌤" },
    { key: "evening_summary", label: "Evening", emoji: "🌆" },
    { key: "night_summary", label: "Night", emoji: "🌙" },
  ];

  return (
    <div
      className="
      relative
      max-w-xl mx-auto p-5
      text-white
      
      bg-gradient-to-br 
      from-[#1e1b2e] 
      via-[#111827] 
      to-[#020617]
      
      rounded-3xl
      overflow-hidden
    "
    >
      {/* 🌟 GLOW BACKGROUND */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />

      {/* CONTENT WRAPPER */}
      <div className="relative z-10">
        {/* HEADER */}
        <div className="space-y-5 mb-7">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            📖 <span>Daily Diary</span>
          </h2>

          {/* DATE NAV */}
          <div
            className="
            flex items-center justify-between
            bg-white/5
            backdrop-blur-xl
            rounded-2xl
            px-3 py-2
            border border-white/10
          "
          >
            <button
              onClick={() => changeDate(-1)}
              className="
              px-3 py-1 rounded-lg
              hover:bg-white/10
              active:scale-95
              transition
            "
            >
              ◀
            </button>

            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="
              bg-transparent 
              text-center 
              text-sm 
              outline-none
              text-white/80
            "
            />

            <button
              onClick={() => changeDate(1)}
              className="
              px-3 py-1 rounded-lg
              hover:bg-white/10
              active:scale-95
              transition
            "
            >
              ▶
            </button>
          </div>

          {/* FORMATTED DATE */}
          <div className="text-sm text-white/50 tracking-wide">
            {formatDate(selectedDate)}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="text-sm text-white/40 animate-pulse">
            Writing your story...
          </div>
        ) : summary ? (
          <div className="space-y-7">
            {phases.map((phase) => {
              const text = summary[phase.key];
              if (!text) return null;

              return (
                <div key={phase.key} className="space-y-3">
                  {/* TITLE */}
                  <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-widest">
                    <span className="text-base">{phase.emoji}</span>
                    <span>{phase.label}</span>
                  </div>

                  {/* TEXT */}
                  <p
                    className="
                    text-sm
                    leading-relaxed
                    text-white/90
                  "
                  >
                    {text}
                  </p>

                  {/* DIVIDER */}
                  <div className="h-px bg-white/5 mt-2" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-white/40 italic">
            No story recorded for this day.
          </div>
        )}
      </div>
    </div>
  );
}
