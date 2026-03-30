import { useEffect, useState } from "react";
import { linkBackend } from "../config";

export default function DailySummaryViewer({ userId }) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [selectedDate, setSelectedDate] = useState(today);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState(new Set());
  const [weekOffset, setWeekOffset] = useState(0);

  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());

  // ================= FETCH SUMMARY =================
  const fetchSummary = async (date) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${linkBackend}/daily-story/summary?user_id=${userId}&story_date=${date}`,
      );

      const data = await res.json();

      setSummary(data.status === "success" ? data.data : null);
    } catch (err) {
      console.error(err);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH AVAILABLE DATES =================
  const fetchAvailableDates = async () => {
    try {
      const res = await fetch(
        `${linkBackend}/daily-story/available-dates?user_id=${userId}`,
      );

      const data = await res.json();
      setAvailableDates(new Set(data.dates || []));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  // ================= TIMEZONE SAFE FORMAT =================
  const formatLocalDate = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  // ================= GET MONDAY =================
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 Minggu
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  // ================= GENERATE WEEK =================
  const generateWeek = () => {
    const monday = getMonday(currentWeekDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(formatLocalDate(d));
    }

    return days;
  };

  const days = generateWeek();

  // ================= HELPERS =================
  const isActive = (date) => date === selectedDate;
  const hasData = (date) => availableDates.has(date);
  const isToday = (date) => date === today;

  const formatShort = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
    });

  const formatWeekday = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
    });

  const getMonthLabel = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const getWeekRangeLabel = (days) => {
    if (!days.length) return "";

    const first = new Date(days[0]);
    const last = new Date(days[6]);

    const format = (d) =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(d);

    return `${format(first)} – ${format(last)}`;
  };

  const phases = [
    { key: "morning_summary", label: "Morning", emoji: "🌅" },
    { key: "afternoon_summary", label: "Afternoon", emoji: "🌤" },
    { key: "evening_summary", label: "Evening", emoji: "🌆" },
    { key: "night_summary", label: "Night", emoji: "🌙" },
  ];

  return (
    <div className="relative max-w-xl mx-auto p-5 text-white bg-gradient-to-br from-[#1e1b2e] via-[#111827] to-[#020617] rounded-3xl overflow-hidden">
      {/* HEADER */}
      <div className="mb-3">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          📔 Daily Diary
        </h2>

        {/* 🌙 MONTH + WEEK INFO */}
        <div className="mt-1 text-xs text-white/50 flex items-center justify-between">
          <span>{getMonthLabel(days[3])}</span>
          <span>{getWeekRangeLabel(days)}</span>
        </div>
      </div>

      {/* ================= WEEK NAV ================= */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const d = new Date(currentWeekDate);
            d.setDate(d.getDate() - 7);
            setCurrentWeekDate(d);
          }}
        >
          ◀ Week
        </button>

        <button
          onClick={() => {
            setCurrentWeekDate(new Date());
            setSelectedDate(today);
          }}
        >
          Today
        </button>

        <button
          onClick={() => {
            const d = new Date(currentWeekDate);
            d.setDate(d.getDate() + 7);
            setCurrentWeekDate(d);
          }}
        >
          Week ▶
        </button>
      </div>

      {/* ================= DATE STRIP ================= */}
      <div className="flex justify-between gap-2 mb-6">
        {days.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`
              relative flex flex-col items-center justify-center
              px-3! py-2! rounded-xl transition

              ${
                isActive(date)
                  ? "bg-white! text-black shadow-lg"
                  : hasData(date)
                    ? "bg-green-500/15! text-green-300 ring-1 ring-green-400/40"
                    : "bg-white/5! hover:bg-white/10"
              }

              ${isToday(date) ? "ring-1 ring-blue-400/50" : ""}
            `}
          >
            <span className="text-[10px] opacity-70">
              {formatWeekday(date)}
            </span>

            <span className="text-sm font-semibold">{formatShort(date)}</span>

            {/* 🔥 DATA INDICATOR */}
            {hasData(date) && (
              <>
                <div className="absolute inset-0 rounded-xl bg-green-400/10 blur-md" />
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* ================= CONTENT ================= */}
      {loading ? (
        <div className="text-sm text-white/40 animate-pulse">
          Writing your story...
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {phases.map((phase) => {
            const text = summary[phase.key];
            if (!text) return null;

            return (
              <div key={phase.key}>
                <div className="flex items-center gap-2 text-white/60 text-xs uppercase">
                  <span>{phase.emoji}</span>
                  <span>{phase.label}</span>
                </div>

                <p className="text-sm text-white/90 mt-1 leading-relaxed">
                  {text}
                </p>

                <div className="h-px bg-white/5 mt-3" />
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
  );
}
