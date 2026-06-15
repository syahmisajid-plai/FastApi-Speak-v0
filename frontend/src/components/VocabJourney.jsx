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
  const [selected, setSelected] = useState(null);

  const enriched = useMemo(() => {
    return chapters.slice(0, 6).map((ch, i) => {
      let status = "locked";
      if (i < 2) status = "done";
      else if (i === 2) status = "current";

      return {
        ...ch,
        status,
        category: ch.category || "education",
      };
    });
  }, [chapters]);

  const getNodeStyle = (status) => {
    switch (status) {
      case "done":
        return "bg-emerald-500/90 border-emerald-400/40";
      case "current":
        return "bg-slate-100 border-slate-300 animate-pulse-soft";
      default:
        return "bg-slate-800/40 border-slate-700 opacity-50";
    }
  };

  const unitRows = [];

  for (let i = 0; i < chapterStats?.units?.length; i += 4) {
    unitRows.push(chapterStats.units.slice(i, i + 4));
  }
  return (
    <div className="bg-slate-950 text-white">
      {/* HEADER */}
      <div className="text-center pt-8 pb-4">
        <h2 className="text-xl font-semibold">Learning Path</h2>
        <p className="text-white/40 text-sm mt-1">
          Progress through your chapters
        </p>
      </div>

      {/* MAP */}
      <div className="relative w-full h-[420px]">
        <div className="absolute inset-0 bg-slate-950" />

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
              {ch.status === "current" && (
                <div className="absolute inset-0 rounded-lg bg-white/20 blur-md animate-ping" />
              )}

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
                <span className={`text-sm ${cat.color}`}>
                  {ch.status === "locked" ? "🔒" : cat.icon}
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
                <button
                  onClick={() => setSelected(null)}
                  className="
              flex-1 py-2 rounded-xl
              bg-white/5
              border border-white/10
              hover:bg-white/10
              transition
            "
                >
                  Close
                </button>

                <button
                  onClick={() => onStart?.(selected.id)}
                  className="
              flex-1 py-2 rounded-xl
              bg-indigo-500
              hover:bg-indigo-400
              font-medium
              transition
            "
                >
                  Continue
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
