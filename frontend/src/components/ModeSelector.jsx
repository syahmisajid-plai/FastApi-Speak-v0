import { useState, useEffect } from "react";

export default function ModeSelector({
  mode,
  setMode,
  micActive,
  lupaKataActive,
}) {
  const [lockedMode, setLockedMode] = useState(null); // mode yang sedang dikunci

  const modes = [
    { key: "dailyStory", icon: "📖", label: "Story", color: "emerald" },
    { key: "freeTalk", icon: "💬", label: "Talk", color: "blue" },
    { key: "roleplay", icon: "🎭", label: "Roleplay", color: "purple" },
  ];

  const modeStyles = {
    emerald:
      "bg-gradient-to-r from-emerald-500 to-emerald-300 ring-emerald-300",
    blue: "bg-gradient-to-r from-blue-500 to-blue-300 ring-blue-300",
    purple: "bg-gradient-to-r from-purple-500 to-purple-300 ring-purple-300",
  };

  const handleModeChange = (m) => {
    if (mode === m.key) return; // sudah aktif
    if (lockedMode) return; // sedang dikunci
    if (micActive || lupaKataActive) return; // mic/lupa kata aktif

    setMode(m.key);
    setLockedMode(m.key); // kunci mode lain sementara

    // // unlock setelah 5 detik
    // setTimeout(() => {
    //   setLockedMode(null);
    // }, 3000);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-center z-40 px-4">
      <div className="w-full max-w-md flex bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-1">
        {modes.map((m) => {
          const active = mode === m.key;
          const locked =
            (lockedMode && !active) ||
            ((micActive || lupaKataActive) && !active);

          return (
            <div key={m.key} className="relative flex-1">
              <button
                onClick={() => handleModeChange(m)}
                className={`
                  w-full flex flex-col items-center justify-center
                  py-2 rounded-xl transition-all duration-200
                  ${
                    active
                      ? `${modeStyles[m.color]} text-white shadow-2xl scale-105 ring-2 animate-slow-pulse`
                      : ""
                  }
                  ${
                    locked
                      ? "pointer-events-none text-white/40 filter blur-sm"
                      : !active
                        ? "text-white/60 hover:text-white hover:bg-white/10"
                        : ""
                  }
                `}
                title={
                  locked
                    ? "Cannot change mode while mic/lupa kata is active or during cooldown"
                    : ""
                }
              >
                <div className="text-lg">{m.icon}</div>
                <span className="text-[11px] font-medium">{m.label}</span>
              </button>

              {locked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-red-400 text-xl">🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
