import { useState } from "react";

export default function AudioUnlockOverlay({ onUnlock, onFinish }) {
  const [opening, setOpening] = useState(false);

  const handleClick = async () => {
    if (opening) return;

    setOpening(true);
    await onUnlock(); // mic + speaker
    // tunggu animasi
    setTimeout(() => {
      onFinish(); // baru buka layar utama
    }, 700); // harus sama dengan duration animasi
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
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
          className={`w-28 h-28 rounded-full bg-red-500 flex items-center justify-center text-5xl
            transition-all duration-500
            ${opening ? "scale-75 opacity-0" : "animate-pulse"}
          `}
        >
          🎤
        </button>

        {!opening && (
          <p className="mt-6 text-sm opacity-80">
            Tap to enable microphone & speaker
          </p>
        )}
      </div>
    </div>
  );
}
