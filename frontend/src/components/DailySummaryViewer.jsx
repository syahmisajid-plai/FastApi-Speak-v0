import { useEffect, useState } from "react";

export default function DailySummaryViewer({ userId }) {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (date) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/daily-story/summary?user_id=${userId}&story_date=${date}`,
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
    <div className="max-w-xl mx-auto p-4 text-white bg-amber-950">
      {/* HEADER */}
      <div className="space-y-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          📖 Daily Diary
        </h1>

        {/* DATE NAV */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
          <button
            onClick={() => changeDate(-1)}
            className="px-3 py-1 rounded-lg hover:bg-white/10 transition"
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
            "
          />

          <button
            onClick={() => changeDate(1)}
            className="px-3 py-1 rounded-lg hover:bg-white/10 transition"
          >
            ▶
          </button>
        </div>

        {/* FORMATTED DATE */}
        <div className="text-sm text-white/60">{formatDate(selectedDate)}</div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-sm text-white/60 animate-pulse">
          Loading your diary...
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {phases.map((phase) => {
            const text = summary[phase.key];
            if (!text) return null;

            return (
              <div key={phase.key} className="space-y-2">
                {/* TITLE */}
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                  <span>{phase.emoji}</span>
                  <span>{phase.label}</span>
                </div>

                {/* TEXT */}
                <p className="text-sm leading-relaxed text-white/90">{text}</p>

                {/* DIVIDER */}
                <div className="h-px bg-white/10 mt-3" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-white/50 italic">
          No diary found for this date.
        </div>
      )}
    </div>
  );
}
