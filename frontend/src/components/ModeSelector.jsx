import { useState, useEffect } from "react";

export default function ModeSelector({
  user_id,
  mode,
  setMode,

  isRecording,
  isLupaKataActive,
  isWaitingForAI,

  isSpeaking,
  forceStop,
}) {
  // const isTestUser = user_id === "21121b45-6987-432c-a2cd-fda17eabbd2b";
  const isTestUser = user_id === "xxxx";
  // console.log("isSpeaking : ", isSpeaking);
  const baseModes = [
    { key: "learn", icon: "🧠", label: "Learn", color: "indigo" },
    { key: "scenarios", icon: "🎭", label: "Scenarios", color: "purple" },
    { key: "freeTalk", icon: "💬", label: "Talk", color: "blue" },
    { key: "smartcall", icon: "📞", label: "SmartCall", color: "cyan" },
    { key: "games", icon: "🎮", label: "Multiplayer", color: "emerald" },
    // { key: "ielts", icon: "📝", label: "IELTS", color: "rose" },
  ];

  const modes = isTestUser
    ? [
        ...baseModes,
        {
          key: "testMicAndoid",
          icon: "🎤",
          label: "Test Mic",
          color: "indigo",
        },
      ]
    : baseModes;

  const modeStyles = {
    indigo: "bg-gradient-to-r from-indigo-500 to-indigo-300 ring-indigo-300",
    purple: "bg-gradient-to-r from-purple-500 to-purple-300 ring-purple-300",
    blue: "bg-gradient-to-r from-blue-500 to-blue-300 ring-blue-300",
    cyan: "bg-gradient-to-r from-cyan-500 to-cyan-300 ring-cyan-300",
    emerald:
      "bg-gradient-to-r from-emerald-500 to-emerald-300 ring-emerald-300",
    rose: "bg-gradient-to-r from-rose-500 to-rose-300 ring-rose-300",
  };

  const handleModeChange = (m) => {
    if (mode === m.key) return;
    if (isRecording || isLupaKataActive || isWaitingForAI) return;

    setMode(m.key);
  };

  return (
    <div className="fixed bottom-2 left-0 w-full flex justify-center z-51 px-4">
      <div className="w-full max-w-md flex bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-1">
        {modes.map((m) => {
          const active = mode === m.key;

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
                    !active
                      ? "text-white/60 hover:text-white hover:bg-white/10"
                      : ""
                  }
                `}
              >
                <div className="text-lg">{m.icon}</div>
                <span className="text-[11px] font-medium">{m.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
