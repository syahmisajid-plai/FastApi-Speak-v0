import { useState, useMemo } from "react";

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
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-base font-medium">{selected.title}</h3>

            <p className="text-sm text-white/50 mt-2">Continue this lesson?</p>

            {/* Progress */}
            <div className="mt-4 rounded-lg bg-slate-800/50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Completed</span>
                <span>
                  {chapterStats?.completed ?? 0}/{chapterStats?.total ?? 0}
                </span>
              </div>

              <div className="flex justify-between text-sm mt-1">
                <span className="text-white/60">Remaining</span>
                <span>{chapterStats?.remaining ?? 0}</span>
              </div>
            </div>

            <button
              onClick={() => onStart?.(selected.id)}
              className="mt-4 w-full py-2! rounded-lg bg-white! text-black font-medium! hover:bg-white/90!"
            >
              Start
            </button>

            <button
              onClick={() => setSelected(null)}
              className="mt-2 w-full text-md! text-white/40! hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
