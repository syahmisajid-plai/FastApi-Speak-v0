export default function ComingSoon() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* content */}
      <div
        className="
          relative z-50
          flex flex-col items-center text-center
          px-6 py-8
        "
      >
        {/* icon */}
        <div className="text-5xl mb-4">🔒</div>

        {/* title */}
        <h2 className="text-xl font-semibold text-rose-200 mb-2">IELTS Mode</h2>

        {/* subtitle */}
        <p className="text-sm text-white/70 mb-1">Coming Soon</p>

        {/* description */}
        <p className="text-xs text-white/50 max-w-xs">
          We’re preparing something special for your IELTS speaking practice.
        </p>
      </div>
    </div>
  );
}
