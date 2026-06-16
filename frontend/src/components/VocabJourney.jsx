// components/VocabJourney.jsx
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";

const mapPoints = [
  { x: 60, y: 120 },
  { x: 160, y: 80 },
  { x: 260, y: 140 },
  { x: 180, y: 220 },
  { x: 80, y: 260 },
  { x: 220, y: 320 },
];

const categoryStyle = {
  people: {
    icon: "🏘️",
    color: "text-amber-300",
    name: "Village",
  },
  education: {
    icon: "🏛️",
    color: "text-emerald-300",
    name: "Academy",
  },
  communication: {
    icon: "🗼",
    color: "text-sky-300",
    name: "Signal Tower",
  },
};

const unitIcons = ["⛵", "🏘️", "🌲", "🏰", "🏔️", "👑"];

export default function IslandMapJourney({
  chapters = [],
  onStart,
  onSelect,
  chapterStats,
  openChapterModal,
}) {
  // const [chapterStats, setChapterStats] = useState({
  //   total: 6,
  //   completed: 1,
  //   remaining: 5,
  //   units: [
  //     { unit: 1, completed: 10, total: 10 }, // ✅ DONE (chapter 1)
  //     { unit: 2, completed: 10, total: 10 },
  //     { unit: 3, completed: 0, total: 10 },
  //     { unit: 4, completed: 0, total: 10 },
  //     { unit: 5, completed: 0, total: 10 },
  //     { unit: 6, completed: 0, total: 10 },
  //   ],
  // });

  const [selected, setSelected] = useState(null);

  const [startIndex, setStartIndex] = useState(0);
  const PAGE_SIZE = 6;

  const currentPage = Math.floor(startIndex / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(chapters.length / PAGE_SIZE);

  const enriched = useMemo(() => {
    const units = chapterStats?.units || [];

    const firstCurrent = chapters.findIndex((_, i) => {
      const unit = units[i];
      const completed = unit?.completed ?? 0;
      const total = unit?.total ?? 0;

      return total > 0 && completed < total;
    });

    const safeCurrent = firstCurrent === -1 ? 0 : firstCurrent;

    const pageChapters = chapters.slice(startIndex, startIndex + PAGE_SIZE);
    const pageUnits = units.slice(startIndex, startIndex + PAGE_SIZE);

    return pageChapters.map((ch, i) => {
      const globalIndex = startIndex + i;

      const unit = pageUnits[i];
      const completed = unit?.completed ?? 0;
      const total = unit?.total ?? 0;

      const isDone = total > 0 && completed === total;

      let status = "locked";

      if (globalIndex < safeCurrent) {
        status = "done";
      } else if (globalIndex === safeCurrent) {
        status = "current";
      }

      return {
        ...ch,
        status,
        category: ch.category || "education",
      };
    });
  }, [chapters, chapterStats, startIndex]);

  const getNodeStyle = (status) => {
    switch (status) {
      case "done":
        return "bg-emerald-500/90 border-emerald-300/50 shadow-[0_0_12px_rgba(16,185,129,0.35)]";

      case "current":
        return "bg-gradient-to-br from-sky-400 to-indigo-500 border-white/20 shadow-[0_0_18px_rgba(59,130,246,0.6)] animate-pulse-soft ring-2 ring-sky-300/40";

      default:
        return "bg-slate-600/30 border-slate-400/30 opacity-60";
    }
  };

  const unitRows = [];

  for (let i = 0; i < chapterStats?.units?.length; i += 4) {
    unitRows.push(chapterStats.units.slice(i, i + 4));
  }
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-500/5 text-white">
      {/* HEADER */}
      <div className="text-center pt-8 pb-4">
        <h2 className="text-xl font-semibold">Learning Path</h2>
        <p className="text-white/40 text-sm mt-1">
          Progress through your chapters
        </p>
      </div>

      {/* MAP HEADER */}
      <div className="flex justify-center mb-2">
        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 backdrop-blur-md">
          Page {currentPage} / {totalPages}
        </div>
      </div>

      {/* MAP */}
      <div className="relative w-full h-[380px]">
        <div className="absolute inset-0 " />

        {/* subtle path */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="
              M 60 120
              C 120 40, 200 40, 160 80
              S 300 120, 260 140
              S 120 200, 180 220
              S 40 300, 80 260
              S 300 340, 220 320
            "
            stroke="rgba(148,163,184,0.15)"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* NODES */}
        {enriched.map((ch, i) => {
          const pos = mapPoints[i];
          const cat = categoryStyle[ch.category];

          return (
            <div
              key={ch.id || i}
              onClick={async () => {
                if (ch.status === "locked") return;

                await openChapterModal?.(ch.id);
                setSelected(ch);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: pos.x, top: pos.y }}
            >
              {/* current subtle glow */}
              {/* {ch.status === "current" && (
                <div className="absolute inset-0 rounded-lg bg-sky-400/20 blur-md animate-pulse" />
              )} */}

              {/* node */}
              <div
                className={`
                  w-10 h-10 rounded-lg
                  border
                  flex items-center justify-center
                  transition
                  relative
                  ${getNodeStyle(ch.status)}
                `}
              >
                <span className={`relative text-sm ${cat.color} inline-block`}>
                  {ch.status === "current" && (
                    <span className="absolute inset-0 rounded-full bg-sky-300 blur-md animate-pulse scale-200" />
                  )}

                  <span className="relative z-10 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
                    {ch.status === "locked" ? "🔒" : cat.icon}
                  </span>
                </span>
              </div>

              {/* label */}
              <div className="text-[10px] text-center mt-2 text-white/50 w-20 -ml-2">
                {ch.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Button Next & Prev */}
      <div className="flex justify-between py-2 px-6">
        <button
          onClick={() => setStartIndex((prev) => Math.max(prev - PAGE_SIZE, 0))}
          disabled={startIndex === 0}
          className="px-3! py-1! rounded bg-white/10! disabled:opacity-30"
        >
          ← Prev
        </button>

        <button
          onClick={() =>
            setStartIndex((prev) => {
              const next = prev + PAGE_SIZE;
              const maxStart =
                Math.floor((chapters.length - 1) / PAGE_SIZE) * PAGE_SIZE;
              return Math.min(next, maxStart);
            })
          }
          disabled={startIndex + PAGE_SIZE >= chapters.length}
          className="px-3! py-1! rounded bg-white/10! disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      {/* MODAL */}
      {selected &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 text-white"
            onClick={() => setSelected(null)}
          >
            <div
              className="
          bg-slate-900
          border border-white/10
          rounded-2xl
          p-5
          w-full
          max-w-md
          max-h-[85vh]
          overflow-y-auto
          shadow-2xl
        "
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="text-center">
                <div className="text-3xl mb-2">🗺️</div>

                <h3 className="text-lg font-semibold">{selected.title}</h3>

                <p className="text-sm text-white/50 mt-1">
                  Continue your learning journey
                </p>
              </div>

              {/* CHAPTER PROGRESS */}
              <div className="mt-5 rounded-xl bg-slate-800/50 p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Progress</span>

                  <span>
                    {chapterStats?.completed ?? 0}/{chapterStats?.total ?? 0}
                  </span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${
                        chapterStats?.total
                          ? (chapterStats.completed / chapterStats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-white/40 mt-2">
                  <span>{chapterStats?.completed ?? 0} mastered</span>

                  <span>{chapterStats?.remaining ?? 0} remaining</span>
                </div>
              </div>

              {/* JOURNEY */}
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4 text-center">
                  Journey Path
                </p>

                <div className="space-y-6">
                  {unitRows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex items-center justify-between"
                    >
                      {row.map((unit, index) => {
                        const isCompleted =
                          unit.total > 0 && unit.completed === unit.total;

                        const progress =
                          unit.total > 0 ? unit.completed / unit.total : 0;

                        const isCurrent = progress > 0 && !isCompleted;

                        return (
                          <div
                            key={unit.unit}
                            className="flex items-center flex-1"
                          >
                            <div className="flex flex-col items-center min-w-[56px]">
                              <div className="relative">
                                {isCurrent && (
                                  <div className="absolute inset-0 rounded-full bg-sky-400/30 blur-md animate-pulse" />
                                )}

                                <div
                                  className={`
                                    relative
                                    w-11 h-11 rounded-full border
                                    flex items-center justify-center text-lg
                                    transition-all duration-300
                                    ${
                                      isCompleted
                                        ? "bg-emerald-500 border-emerald-400"
                                        : isCurrent
                                          ? "bg-sky-500 border-sky-400 shadow-lg shadow-sky-500/30"
                                          : "bg-slate-800 border-slate-700"
                                    }
                                  `}
                                >
                                  {isCompleted
                                    ? "✓"
                                    : unitIcons[
                                        (rowIndex * 4 + index) %
                                          unitIcons.length
                                      ]}
                                </div>
                              </div>

                              <span className="text-[10px] text-white/70 mt-1">
                                Unit {unit.unit}
                              </span>

                              <span className="text-[10px] text-white/40">
                                {unit.completed}/{unit.total}
                              </span>
                            </div>

                            {index < row.length - 1 && (
                              <div
                                className={`
                            flex-1 h-[2px] mx-2
                            ${
                              isCompleted ? "bg-emerald-500/50" : "bg-slate-700"
                            }
                          `}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex gap-2">
                {selected.status === "current" ? (
                  <>
                    <button
                      onClick={() => setSelected(null)}
                      className="
                        flex-1 py-2! rounded-xl
                        bg-white/5!
                        border border-white/10
                        hover:bg-white/10
                        transition
                      "
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => onStart?.(selected.id)}
                      className="
                        flex-1 py-2! rounded-xl
                        bg-indigo-500!
                        hover:bg-indigo-400
                        font-medium
                        transition
                      "
                    >
                      Continue
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelected(null)}
                    className="
                      flex-1 py-2! rounded-xl
                      bg-white/5!
                      border border-white/10
                      hover:bg-white/10
                      transition
                    "
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
