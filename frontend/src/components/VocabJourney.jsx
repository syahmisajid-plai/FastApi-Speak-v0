import { useState } from "react";

const chapters = [
  { id: 1, title: "Me & People", status: "done" },
  { id: 2, title: "Daily Life", status: "current" },
  { id: 3, title: "Identity", status: "locked" },
  { id: 4, title: "Society", status: "locked" },
  { id: 5, title: "Work World", status: "locked" },
  { id: 6, title: "Advanced Talk", status: "locked" },
];

// 🎯 fixed “map coordinates” (ini yang bikin tidak list-like)
const mapPoints = [
  { x: 60, y: 120 },
  { x: 160, y: 80 },
  { x: 260, y: 140 },
  { x: 180, y: 220 },
  { x: 80, y: 260 },
  { x: 220, y: 320 },
];

export default function IslandMapJourney({ onStart }) {
  const [selected, setSelected] = useState(null);

  const getIslandStyle = (status) => {
    switch (status) {
      case "done":
        return "bg-emerald-400 shadow-emerald-400/40";
      case "current":
        return "bg-indigo-400 shadow-indigo-400/60 animate-pulse";
      default:
        return "bg-white/10 opacity-40";
    }
  };

  return (
    <div className=" bg-slate-950 text-white overflow-hidden">

      {/* HEADER */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-2xl font-bold">Adventure Map</h1>
        <p className="text-white/50 text-sm">
          Explore your learning world
        </p>
      </div>

      {/* MAP AREA */}
      <div className="relative w-full h-[400px]">

        {/* 🌊 BACKGROUND SEA EFFECT */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />

        {/* 🌊 SVG PATH (the “road between islands”) */}
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
            stroke="rgba(99,102,241,0.25)"
            strokeWidth="3"
            fill="none"
          />
        </svg>

        {/* 🏝 ISLAND NODES */}
        {chapters.map((ch, i) => {
          const pos = mapPoints[i];

          return (
            <div
              key={ch.id}
              onClick={() => setSelected(ch)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: pos.x,
                top: pos.y,
              }}
            >
              {/* island */}
              <div
                className={`
                  w-14 h-14 rounded-full border border-white/10
                  flex items-center justify-center
                  transition-all duration-300
                  ${getIslandStyle(ch.status)}
                `}
              >
                🏝️
              </div>

              {/* label */}
              <div className="text-[10px] text-center mt-2 text-white/70 w-20 -ml-3">
                {ch.title}
              </div>

              {/* current glow ring */}
              {ch.status === "current" && (
                <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400/30" />
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold">
              {selected.title}
            </h3>

            <p className="text-sm text-white/60 mt-2">
              Ready to explore this island?
            </p>

            <button
              onClick={onStart}
              className="mt-4 w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600"
            >
              Start Journey →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}