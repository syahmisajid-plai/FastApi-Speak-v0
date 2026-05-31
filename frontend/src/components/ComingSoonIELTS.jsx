export default function ComingSoonIELTS() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* content */}
      <div className="relative z-50 flex flex-col items-center text-center px-8 py-10 max-w-sm">
        
        {/* icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-5xl mb-4">
          📘
        </div>

        {/* title */}
        <h2 className="text-2xl font-semibold text-rose-200">
          IELTS Practice
        </h2>

        {/* subtitle */}
        <p className="text-sm text-white/70 mt-1">
          Coming Soon
        </p>

        {/* description */}
        <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-xs">
          Practice IELTS speaking with real exam-style questions and structured feedback.
        </p>

        {/* keywords */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-xs text-rose-200 border border-rose-400/10">
            🎤 Speaking Test
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70">
            ⏱️ Timed
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70">
            📊 Band Score
          </span>
        </div>
      </div>
    </div>
  );
}