import { useState } from "react";

export default function GamesUI() {
  const [started, setStarted] = useState(false);
  
  const games = [
    {
      id: 1,
      icon: "🎯",
      name: "Translate Rush",
      players: "Solo",
      desc: "Translate words as fast as possible",
      locked: false,
    },
    {
      id: 2,
      icon: "⚔️",
      name: "Vocabulary Battle",
      players: "1v1",
      desc: "Take turns naming words from a category",
      locked: true,
    },
    {
      id: 3,
      icon: "⚡",
      name: "Fast Translate Battle",
      players: "1v1",
      desc: "Race to translate before your opponent",
      locked: false,
    },
    {
      id: 4,
      icon: "🔥",
      name: "Survival Vocabulary",
      players: "2-10",
      desc: "Last player standing wins",
      locked: false,
    },
    {
      id: 5,
      icon: "🧩",
      name: "Describe & Guess",
      players: "2v2",
      desc: "Describe words and help your teammate guess",
      locked: false,
    },
    {
      id: 6,
      icon: "🕵️",
      name: "English Among Us",
      players: "4-10",
      desc: "Find the spy through English conversation",
      locked: false,
    },
  ];

  return (
    <section
      className={`mx-4 transition-all duration-500 ${
        started ? "mt-4" : "mt-36"
      }`}
    >
      {/* HEADER CARD */}
      <div
        className={`text-white backdrop-blur-xl transition-all duration-500
        ${
          started
            ? `
              border border-emerald-500/20
              rounded-2xl
              px-4 py-3
              bg-linear-to-b from-slate-900/80 to-emerald-950/60
              shadow-lg shadow-emerald-950/20
            `
            : `
              border border-emerald-500/20
              rounded-3xl
              p-6
              text-center
              bg-linear-to-b from-slate-900/80 to-emerald-900/60
              shadow-lg shadow-emerald-950/30
            `
        }`}
      >
        <div
          className={`transition-all duration-500 ${
            started
              ? "flex items-center gap-3"
              : "flex flex-col items-center"
          }`}
        >
          {/* ICON */}
          <div
            className={`flex items-center justify-center shrink-0 transition-all duration-500
            ${
              started
                ? "w-10 h-10 rounded-xl bg-white/10 text-base"
                : "w-14 h-14 rounded-2xl bg-white/10 text-2xl mb-4"
            }`}
          >
            🎮
          </div>

          {/* TEXT */}
          <div className={`${started ? "leading-tight" : ""}`}>
            <p
              className={`font-semibold tracking-wide transition-all duration-500 ${
                started ? "text-sm mt-1" : "text-base"
              }`}
            >
              {started ? "Games" : "Speaking Games"}
            </p>

            <p
              className={`text-white/60 transition-all duration-500 ${
                started ? "text-xs" : "text-xs mt-1"
              }`}
            >
              {started
                ? "Choose a game and start playing"
                : "Practice English through fun multiplayer games"}
            </p>

            {!started && (
              <p className="text-[10px] text-white/35 uppercase tracking-[0.2em] mt-3">
                Multiplayer • Competition
              </p>
            )}
          </div>
        </div>

        {/* START BUTTON */}
        {!started && (
          <button
            onClick={() => setStarted(true)}
            className="
              mt-5
              w-full
              py-2.5!
              rounded-xl
              bg-linear-to-r
              from-emerald-500
              to-green-500
              text-white
              text-base!
              font-semibold
              transition-all
              duration-200
              hover:from-emerald-400
              hover:to-green-400
              hover:shadow-lg
              hover:shadow-emerald-500/20
              active:scale-[0.98]
            "
          >
            🎮 Start Games
          </button>
        )}
      </div>

      {/* GAMES GRID */}
      {started && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {games.map((game) => (
          <button
            key={game.id}
            disabled={game.locked}
            className={`
              relative
              overflow-hidden
              text-left
              rounded-2xl
              border border-white/10
              backdrop-blur-xl
              p-4!
              text-white
              transition
              active:scale-[0.98]

              ${
                game.locked
                  ? "bg-white/5! opacity-60 cursor-not-allowed"
                  : "bg-white/5! hover:bg-white/10"
              }
            `}
          >
            {game.locked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-4xl mb-2">
                  🔒
                </div>

                <div className="text-xs font-semibold tracking-wider uppercase text-white">
                  Learn Lvl 3
                </div>
              </div>
            )}

            <div className="flex items-start justify-between mb-2">
              <div className="text-2xl">
                {game.icon}
              </div>

              <span
                className="
                  text-[10px]
                  px-2 py-1
                  rounded-full
                  bg-white/10
                  text-white/70
                "
              >
                {game.players}
              </span>
            </div>

            <p className="font-medium text-sm">
              {game.name}
            </p>

            <p className="text-[11px] text-white/50 mt-1">
              {game.desc}
            </p>
          </button>
          ))}
        </div>
      )}
    </section>
  );
}