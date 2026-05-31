export default function ComingSoonScenarios() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* content */}
      <div
        className="
          relative z-50
          flex flex-col items-center text-center
          px-8 py-10
          max-w-sm
        "
      >
        {/* icon */}
        <div className="text-5xl mb-4">🎭</div>

        {/* title */}
        <h2 className="text-2xl font-semibold text-white">
          Roleplay Mode
        </h2>

        {/* subtitle */}
        <p className="text-sm text-purple-200 mt-1">
          Coming Soon
        </p>

        {/* description */}
        <p className="mt-4 text-sm text-white/75 leading-relaxed max-w-xs">
          Explore immersive{" "}
          <span className="font-medium text-purple-200">
            AI roleplays
          </span>{" "}
          designed to help you practice speaking in realistic situations.
        </p>

        {/* examples */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80">
            💼 Interview
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80">
            ✈️ Travel
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80">
            ☕ Daily Talk
          </span>

        </div>
      </div>
    </div>
  );
}