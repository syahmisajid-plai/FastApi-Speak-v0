import { useState } from "react";

export default function AudioUnlockOverlay({
  onUnlock,
  onFinish,
  isBackendConnected,
}) {
  const [opening, setOpening] = useState(false);

  const handleClick = async () => {
    if (opening || isBackendConnected !== true) return;

    setOpening(true);
    await onUnlock();

    setTimeout(() => {
      onFinish();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-99 overflow-hidden pointer-events-none">
      {/* TOP */}
      <div
        className={`absolute top-0 left-0 w-full h-1/2 bg-black
          transition-transform duration-700 ease-in-out
          ${opening ? "-translate-y-full" : "translate-y-0"}
        `}
      />

      {/* BOTTOM */}
      <div
        className={`absolute bottom-0 left-0 w-full h-1/2 bg-black
          transition-transform duration-700 ease-in-out
          ${opening ? "translate-y-full" : "translate-y-0"}
        `}
      />

      {/* CENTER CONTENT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 pointer-events-auto">
        <button
          onClick={handleClick}
          disabled={isBackendConnected !== true}
          className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl transition-all duration-500
            ${
              isBackendConnected === true
                ? "bg-red-500 animate-pulse"
                : "bg-gray-600 cursor-not-allowed opacity-60"
            }
            ${opening ? "scale-75 opacity-0" : ""}
          `}
        >
          🎤
        </button>

        {!opening && (
          <p className="mt-6 text-sm opacity-80">
            {isBackendConnected === null && "Connecting to backend..."}

            {isBackendConnected === false &&
              "Backend unavailable. Please wait..."}

            {isBackendConnected === true &&
              "Tap to enable microphone & speaker"}
          </p>
        )}
      </div>
    </div>
  );
}
