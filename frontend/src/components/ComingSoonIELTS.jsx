import usePWA from "../hooks/usePWA";

export default function InstallPWAOverlay() {
  const isPWA = usePWA();

  if (isPWA) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* content */}
      <div className="relative z-50 flex flex-col items-center text-center px-8 py-10 max-w-sm">
        {/* icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-5xl mb-4">
          📱
        </div>

        {/* title */}
        <h2 className="text-2xl font-semibold text-cyan-200">Install App</h2>

        {/* subtitle */}
        <p className="text-sm text-white/70 mt-1">Better Learning Experience</p>

        {/* description */}
        <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-xs">
          Install the app to access a smoother experience, faster loading,
          offline support, and future mobile-only features.
        </p>

        {/* keywords */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-xs text-cyan-200 border border-cyan-400/10">
            ⚡ Faster
          </span>

          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70">
            📶 Offline
          </span>

          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70">
            🔔 Notifications
          </span>
        </div>

        {/* instruction */}
        <div className="mt-6 text-xs text-white/50 leading-relaxed">
          Chrome Menu → <span className="text-white">Install App</span>
        </div>
      </div>
    </div>
  );
}
