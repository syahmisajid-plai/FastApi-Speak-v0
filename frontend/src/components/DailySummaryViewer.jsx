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

  // 👉 Navigation tanggal
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

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Daily Diary</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="px-2 py-1 text-sm border rounded-md"
          >
            ◀
          </button>

          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
          />

          <button
            onClick={() => changeDate(1)}
            className="px-2 py-1 text-sm border rounded-md"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Tanggal */}
      <div className="text-sm text-gray-500">{formatDate(selectedDate)}</div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : summary ? (
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          {summary.morning_summary && <p>{summary.morning_summary}</p>}

          {summary.afternoon_summary && <p>{summary.afternoon_summary}</p>}

          {summary.evening_summary && <p>{summary.evening_summary}</p>}

          {summary.night_summary && <p>{summary.night_summary}</p>}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No diary found for this date.</p>
      )}
    </div>
  );
}
