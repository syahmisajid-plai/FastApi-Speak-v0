export default function ComingSoonMultiplayerGames() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* content */}
      <div className="relative z-50 flex flex-col items-center text-center px-8 py-10 max-w-sm">
        {/* icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-5xl mb-4">
          🎮
        </div>

        {/* title */}
        <h2 className="text-2xl font-semibold text-emerald-200">
          Multiplayer Games
        </h2>

        {/* subtitle */}
        <p className="text-sm text-white/70 mt-1">Coming Soon</p>

        {/* description */}
        <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-xs">
          Learn English together through competitive and cooperative multiplayer
          games.
        </p>

        {/* keywords */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-xs text-emerald-200 border border-emerald-400/10">
            ⚔️ Vocabulary Battle
          </span>

          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70">
            ⚡ Fast Translate Battle
          </span>

          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70">
            🕵️ English Among Us
          </span>
        </div>
      </div>
    </div>
  );
}
