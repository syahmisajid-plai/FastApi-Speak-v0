import React from "react";

export default function SmartCallSummaryModal({
  open,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      className="
      fixed inset-0 z-[50]
      flex items-center justify-center
      bg-black/70 backdrop-blur-md
      p-4
      "
    >
        <div
        className="
        w-full max-w-lg
        h-[80vh]
        overflow-hidden
        rounded-3xl
        bg-gradient-to-b
        from-slate-900
        to-cyan-950
        border border-cyan-400/15
        shadow-[0_0_60px_rgba(34,211,238,0.15)]
        text-white
        flex flex-col
        "
        >
        {/* HEADER */}
        <div
          className="
          sticky top-0 z-10
          px-5 py-4
          border-b border-white/5
          bg-slate-900/80
          backdrop-blur-xl
          "
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-wide">
                📞 SmartCall Summary
              </h2>

              <p className="text-xs text-white/50 mt-1">
                Your speaking insights from this session
              </p>
            </div>

            <button
              onClick={onClose}
              className="
              w-9 h-9
              rounded-xl
              bg-white/5!
              hover:bg-white/10
              transition
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-5 space-y-4">

          {/* SESSION INFO */}
          <div
            className="
            rounded-2xl
            bg-white/5
            border border-white/10
            p-4
            "
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/40">
                  Duration
                </p>

                <p className="mt-1 font-medium">
                  12m 43s
                </p>
              </div>

              <div>
                <p className="text-xs text-white/40">
                  Translation Assists
                </p>

                <p className="mt-1 font-medium text-emerald-300">
                  8 times
                </p>
              </div>
            </div>
          </div>

          {/* CONVERSATION SUMMARY */}
          <div
            className="
            rounded-2xl
            bg-white/5
            border border-white/10
            p-4
            "
          >
            <h3 className="text-cyan-300 font-medium mb-3">
              📝 Conversation Summary
            </h3>

            <p className="text-sm text-white/80 mb-3">
              You discussed:
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span>•</span>
                <span>Weekend activities</span>
              </div>

              <div className="flex gap-2">
                <span>•</span>
                <span>Favorite food</span>
              </div>

              <div className="flex gap-2">
                <span>•</span>
                <span>Travel plans</span>
              </div>
            </div>
          </div>

          {/* VOCABULARY LEARNED */}
          <div
            className="
            rounded-2xl
            bg-white/5
            border border-white/10
            p-4
            "
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-emerald-300 font-medium">
                🌐 Translation Usage
              </h3>

              <span
                className="
                px-2 py-1
                rounded-lg
                text-xs
                bg-emerald-500/15
                text-emerald-300
                border border-emerald-400/20
                "
              >
                8 assists
              </span>
            </div>

            <div className="space-y-3">

              <div
                className="
                flex justify-between items-center
                p-3 rounded-xl
                bg-black/20
                "
              >
                <div>
                  <p className="text-white/60 text-xs">
                    Indonesian
                  </p>

                  <p className="text-sm">
                    berangkat kerja
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-white/40 text-xs">
                    English
                  </p>

                  <p className="text-cyan-200 text-sm">
                    go to work
                  </p>
                </div>
              </div>

              <div
                className="
                flex justify-between items-center
                p-3 rounded-xl
                bg-black/20
                "
              >
                <div>
                  <p className="text-white/60 text-xs">
                    Indonesian
                  </p>

                  <p className="text-sm">
                    terjebak macet
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-white/40 text-xs">
                    English
                  </p>

                  <p className="text-cyan-200 text-sm">
                    stuck in traffic
                  </p>
                </div>
              </div>

              <div
                className="
                flex justify-between items-center
                p-3 rounded-xl
                bg-black/20
                "
              >
                <div>
                  <p className="text-white/60 text-xs">
                    Indonesian
                  </p>

                  <p className="text-sm">
                    sangat sibuk
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-white/40 text-xs">
                    English
                  </p>

                  <p className="text-cyan-200 text-sm">
                    very busy
                  </p>
                </div>
              </div>

            </div>

            <button
              className="
              mt-4
              text-sm
              text-cyan-300
              hover:text-cyan-200
              transition
              "
            >
              View More →
            </button>
          </div>

          {/* AI INSIGHT */}
          <div
            className="
            rounded-2xl
            bg-cyan-500/10
            border border-cyan-400/20
            p-4
            "
          >
            <h3 className="text-cyan-300 font-medium mb-3">
              ✨ Speaking Tip
            </h3>

            <p className="text-sm text-white mb-4">
              You often use{" "}
              <span className="text-cyan-300 font-medium">
                "like"
              </span>.
            </p>

            <p className="text-xs text-white/50 mb-2">
              Try these alternatives:
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 rounded-lg bg-white/5 text-sm">
                such as
              </span>

              <span className="px-2 py-1 rounded-lg bg-white/5 text-sm">
                for example
              </span>

              <span className="px-2 py-1 rounded-lg bg-white/5 text-sm">
                for instance
              </span>
            </div>

            <div
              className="
              bg-black/20
              rounded-xl
              border border-white/5
              p-3
              "
            >
              <p className="text-xs text-white/40 mb-1">
                Example
              </p>

              <p className="text-xs text-white/70">
                "I like outdoor activities."
              </p>

              <p className="text-xs text-cyan-200 mt-1">
                → "For example, I enjoy hiking and cycling."
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div
          className="
          border-t border-white/5
          p-5
          "
        >
          <button
            onClick={onClose}
            className="
            w-full
            py-3!
            rounded-2xl
            bg-cyan-500!
            text-black
            font-medium
            hover:bg-cyan-400
            transition
            "
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}