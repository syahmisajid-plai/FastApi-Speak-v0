import { useEffect, useState, useRef } from "react";

export default function FreeTalkUI({
  started,
  setStarted,
  isRecording,
  isSpeaking,
  islupaKata,
  sendStuckPrompt,

  openLupaKata,
}) {
  const [showStuckMenu, setShowStuckMenu] = useState(false);
  const [idleSuggest, setIdleSuggest] = useState(false);

  const avatars = [
    { id: 0, avatar: "🐱" },
    { id: 1, avatar: "🐶" },
    { id: 2, avatar: "🐰" },
    { id: 3, avatar: "🦊" },
    { id: 4, avatar: "🐼" },
    { id: 5, avatar: "🐨" },
    { id: 6, avatar: "🦁" },
    { id: 7, avatar: "🐸" },
    { id: 8, avatar: "🐵" },
    { id: 9, avatar: "🐧" },
    { id: 10, avatar: "🦄" },
    { id: 11, avatar: "🐹" },
    { id: 12, avatar: "🐺" },
    { id: 13, avatar: "🤖" },
    { id: 14, avatar: "👻" },
    { id: 15, avatar: "👽" },
    { id: 16, avatar: "🎃" },
    { id: 17, avatar: "🧙" },
    { id: 18, avatar: "🌸" },
    { id: 19, avatar: "🪐" },
    { id: 20, avatar: "💎" },
    { id: 21, avatar: "⭐" },
  ];

  const userAvatar = 1;

  // const userAvatar = avatars.find((a) => a.id === user.avatar)?.avatar ?? "🎃";

  // console.log("userAvatar", userAvatar);

  useEffect(() => {
    if (!started) return;

    // reset kalau ada aktivitas
    if (isRecording || isSpeaking || islupaKata) {
      setIdleSuggest(false);
      return;
    }

    const timer = setTimeout(() => {
      setIdleSuggest(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [started, isRecording, isSpeaking, islupaKata]);

  const rexMessage = islupaKata
    ? "Need a hint? 🤔"
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
      z-51
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
                className={`
                  absolute
                    ${
                      showStuckMenu
                        ? "-top-5 -right-20"
                        : idleSuggest
                          ? "-top-5 -right-20"
                          : "-top-5 -right-17"
                    }
                  bg-white
                  text-black
                  text-[9px]
                  rounded-xl
                  shadow-lg
                  overflow-hidden
                  transition-all duration-200
                  ${!showStuckMenu ? "animate-bounce" : ""}
                  p-1
                `}
              >
                {idleSuggest ? (
                  <button
                    onClick={() => setShowStuckMenu(true)}
                    className="
                      cursor-pointer
                      font-medium
                      hover:bg-black/5
                      transition
                      whitespace-nowrap
                    "
                  >
                    💡 Stuck? Click Here ✨
                  </button>
                ) : (
                  <>💬 {rexMessage}</>
                )}
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
                      : userAvatar}
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

      {showStuckMenu && (
        <div
          className="
            fixed inset-0 z-55
            bg-black/60 backdrop-blur-md
            flex items-center justify-center
            p-6
            animate-in fade-in duration-200
          "
          onClick={() => setShowStuckMenu(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              w-full max-w-md
              rounded-3xl
              bg-white
              shadow-2xl
              border border-slate-200
              overflow-hidden
              animate-in zoom-in-95 duration-200
            "
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center border-b border-slate-100">
              <div
                className="
                  w-14 h-14
                  mx-auto
                  rounded-2xl
                  bg-indigo-100
                  flex items-center justify-center
                  text-3xl
                "
              >
                🤖
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Need a little help?
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Choose how you'd like me to help continue the conversation.
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-3">
              <button
                onClick={() => {
                  setShowStuckMenu(false);
                  sendStuckPrompt();
                }}
                className="
                  w-full
                  rounded-2xl
                  border border-slate-200
                  p-4
                  text-left
                  transition
                  hover:border-indigo-300
                  hover:bg-indigo-50
                  active:scale-[0.98]
                  flex items-start gap-4
                "
              >
                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-yellow-100
                    flex items-center justify-center
                    text-xl
                    shrink-0
                  "
                >
                  💡
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Give me an idea
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Surprise me with a fun fact or an interesting topic.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowStuckMenu(false);
                  openLupaKata();
                }}
                className="
                  w-full
                  rounded-2xl
                  border border-slate-200
                  p-4!
                  text-left
                  transition
                  hover:border-indigo-300
                  hover:bg-indigo-50
                  active:scale-[0.98]
                  flex items-start gap-4
                "
              >
                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-blue-100
                    flex items-center justify-center
                    text-xl
                    shrink-0
                  "
                >
                  🇬🇧
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    I forgot a word
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Ask how to say a word or phrase in English.
                  </p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowStuckMenu(false)}
                className="
                  w-full
                  rounded-xl
                  py-3!
                  text-sm
                  font-medium
                  text-slate-500
                  hover:bg-slate-100!
                  transition
                "
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
