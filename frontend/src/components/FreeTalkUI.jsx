import { useEffect, useState, useRef } from "react";

export default function FreeTalkUI({
  started,
  setStarted,
  isRecording,
  isSpeaking,
  islupaKata,
}) {
  const [idleSuggest, setIdleSuggest] = useState(false);

  useEffect(() => {
    if (!started) return;

    // reset kalau ada aktivitas
    if (isRecording || isSpeaking || islupaKata) {
      setIdleSuggest(false);
      return;
    }

    const timer = setTimeout(() => {
      setIdleSuggest(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, [started, isRecording, isSpeaking, islupaKata]);

  const rexMessage = islupaKata
    ? "Need a hint? 🤔"
    : idleSuggest
      ? "Stuck? Try 🔄 Lupa Kata"
      : isSpeaking
        ? "My turn! 🗣️"
        : isRecording
          ? "I'm listening 👂"
          : "Ready to talk ✨";
  return (
    // <section
    //   className={`mx-4 transition-all duration-500 ${
    //     started ? "mt-4" : "mt-36 md:mt-12"
    //   }`}
    // >
    <section
      className={`
      fixed
      z-50
left-8
right-8
      md:left-1/2
      md:-translate-x-1/2
      md:w-[420px]
      transition-all duration-500
      ${started ? "top-28" : "top-64 md:top-40"}
    `}
    >
      <div
        className={`text-white backdrop-blur-xl transition-all duration-500
        ${
          started
            ? `
              border border-white/10
              rounded-2xl
              px-4 py-3
              bg-slate-900/70
            `
            : `
              border border-white/10
              rounded-3xl
              p-6
              bg-slate-900/70
              text-center
              shadow-lg shadow-black/20
            `
        }`}
      >
        <div
          className={`transition-all duration-500 ${
            started ? "flex items-center gap-3" : "flex flex-col items-center"
          }`}
        >
          {/* ICON */}
          <div
            className={`relative flex items-center justify-center shrink-0 transition-all duration-500
  ${
    started
      ? "w-10 h-10 rounded-xl bg-white/10 text-base"
      : "w-14 h-14 rounded-2xl bg-white/10 text-2xl mb-4"
  }`}
          >
            {started && (
              <div
                className="
      absolute
      -top-5
      -right-17
      bg-white
      text-black
      text-[9px]
      px-2
      py-1
      rounded-xl
      shadow-lg
      whitespace-nowrap
      animate-bounce
    "
              >
                💬 {rexMessage}
              </div>
            )}

            <span className={started ? "animate-slow-pulse" : ""}>
              {!started
                ? "🎙️"
                : islupaKata
                  ? "🤔"
                  : isSpeaking
                    ? "🗣️"
                    : isRecording
                      ? "👂"
                      : "🐱"}
            </span>
          </div>

          {/* TEXT */}
          <div className={`${started ? "leading-tight" : ""}`}>
            <p
              className={`font-semibold tracking-wide transition-all duration-500 ${
                started ? "text-sm mt-1" : "text-base"
              }`}
            >
              {started ? "Free Talk" : "Free Talk Mode"}
            </p>

            <div
              className={`text-white/60 transition-all duration-500 ${
                started ? "text-xs" : "text-xs mt-1"
              }`}
            >
              {started ? (
                <div className="flex items-center gap-2">
                  <div className="w-14 overflow-hidden">
                    <span className="inline-block animate-walk-ai">🦖</span>
                  </div>

                  <p className="text-xs text-white/60">Ready to talk</p>
                </div>
              ) : (
                <p className="text-xs text-white/60 mt-1">
                  Speak naturally with AI
                </p>
              )}
            </div>

            {!started && (
              <p className="text-[10px] text-white/35 uppercase tracking-[0.2em] mt-3">
                Natural • Instant • Voice
              </p>
            )}
          </div>
        </div>

        {/* BUTTON */}
        {!started && (
          <button
            onClick={() => setStarted(true)}
            className="
              mt-5
              w-full
              py-2.5!
              rounded-xl
              bg-white!
              text-black
              text-base!
              font-medium
              transition
              hover:bg-white/90
              active:scale-[0.98]
            "
          >
            Start Talking
          </button>
        )}
      </div>
    </section>
  );
}
