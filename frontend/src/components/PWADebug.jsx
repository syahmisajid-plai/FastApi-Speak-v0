import usePWA from "../hooks/usePWA";
import useInstallPWA from "../hooks/useInstallPWA";

export default function PWADebug() {
  const isPWA = usePWA();
  const { canInstall, install } = useInstallPWA();

  if (isPWA) return null;

  //   console.log({
  //     isPWA,
  //     canInstall,
  //   });

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-50 flex flex-col items-center text-center px-8 py-10 max-w-sm">
        <div className="text-6xl mb-4">📱</div>

        <h2 className="text-2xl font-semibold text-cyan-200">
          Install Required
        </h2>

        <p className="mt-4 text-sm text-white/70 leading-relaxed">
          Please install the application before continuing.
        </p>

        {canInstall && (
          <button
            onClick={install}
            className="mt-6 px-5! py-3! rounded-xl bg-cyan-500! hover:bg-cyan-400 text-white font-medium"
          >
            Install App
          </button>
        )}

        {!canInstall && (
          <p className="mt-6 text-xs text-white/50">
            Open Chrome menu → Install App
          </p>
        )}
      </div>
    </div>
  );
}
