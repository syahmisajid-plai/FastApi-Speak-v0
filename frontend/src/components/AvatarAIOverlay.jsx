import { useEffect, useState } from "react";

export default function AvatarAIOverlay({ onClose }) {
  const [visible, setVisible] = useState(false);
  const [turn, setTurn] = useState("ai");

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);

    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleAvatarClick = () => {
    setTurn((prev) => (prev === "ai" ? "user" : "ai"));
  };

  const isAI = turn === "ai";

  return (
    <div className="fixed inset-0 z-99 overflow-hidden">
      {/* BACKGROUND */}
      <div
        className={`
          absolute inset-0
          bg-slate-950
          transition-opacity duration-500
          ${visible ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* GLOW */}
      <div
        className={`
          absolute inset-0
          transition-all duration-1000
          ${
            isAI
              ? "bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.20),transparent_45%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_45%)]"
          }
          ${visible ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* CLOSE */}
      <button
        onClick={handleClose}
        className={`
          absolute top-6 right-6 z-30
          w-10 h-10
          flex items-center justify-center
          rounded-full
          bg-white/10
          border border-white/10
          text-white/70
          text-2xl
          backdrop-blur-md
          transition-all duration-300
          hover:bg-white/20
          hover:text-white
          hover:scale-105
          active:scale-95
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
        `}
      >
        ×
      </button>

      {/* CENTER */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        {/* TITLE */}
        <div
          className={`
            absolute top-16
            text-center
            transition-all duration-700
            ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
            }
          `}
        >
          <h1 className="text-2xl font-semibold tracking-tight">
            Speaking Practice
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Take turns speaking with your AI companion
          </p>
        </div>

        {/* AVATAR BUTTON */}
        <button
          onClick={handleAvatarClick}
          className={`
            relative
            flex items-center justify-center
            transition-all duration-500
            hover:scale-105
            active:scale-95
            ${visible ? "opacity-100 scale-100" : "opacity-0 scale-50"}
          `}
          aria-label={isAI ? "Switch to your turn" : "Switch to AI turn"}
        >
          {/* OUTER GLOW */}
          <div
            className={`
              absolute
              w-72 h-72
              rounded-full
              blur-3xl
              transition-all duration-700
              ${isAI ? "bg-violet-500/25" : "bg-emerald-500/20"}
            `}
          />

          {/* PULSE RING */}
          <div
            className={`
              absolute
              w-56 h-56
              rounded-full
              border
              transition-all duration-500
              ${isAI ? "border-violet-400/40" : "border-emerald-400/40"}
              animate-pulse
            `}
          />

          {/* AVATAR */}
          <div
            className={`
              relative z-10
              w-40 h-40
              rounded-full
              flex items-center justify-center
              border border-white/20
              shadow-2xl
              transition-all duration-500
              ${
                isAI
                  ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/40"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
              }
            `}
          >
            <span
              key={turn}
              className="
                text-7xl
                animate-[bounceIn_0.4s_ease-out]
              "
            >
              {isAI ? "🤖" : "👤"}
            </span>
          </div>
        </button>

        {/* STATUS */}
        <div
          key={turn}
          className={`
            mt-10
            text-center
            transition-all duration-500
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          `}
        >
          <h2 className="text-2xl font-semibold">
            {isAI ? "Avatar AI" : "Your Turn"}
          </h2>

          <p className="mt-2 text-sm text-white/50">
            {isAI ? "AI is speaking..." : "Tap when you're ready to speak"}
          </p>
        </div>

        {/* TAP HINT */}
        <div
          className={`
            mt-8
            px-4 py-2
            rounded-full
            bg-white/5
            border border-white/10
            backdrop-blur-md
            text-xs text-white/50
            transition-all duration-700 delay-300
            ${visible ? "opacity-100" : "opacity-0"}
          `}
        >
          Tap avatar to switch turn
        </div>
      </div>
    </div>
  );
}
