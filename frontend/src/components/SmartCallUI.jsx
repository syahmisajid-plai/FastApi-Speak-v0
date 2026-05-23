import { useEffect, useState } from "react";

export default function SmartCallUI({
  // Recording
  startRecording,
  stopRecording,
  isRecording,
  liveTranscript,

  // Lupa Kata
  openLupaKata,
  isLupaKataActive,
  lupaKata,
}) {
  const [started, setStarted] = useState(false);

  // ================= AUTO START / STOP =================
  useEffect(() => {
    if (started) {
      startRecording?.();
    } else {
      stopRecording?.();
    }

    return () => stopRecording?.();
  }, [started]);

  return (
    <section className="mx-4 mt-12">
      <div className="relative">

        {/* ================= CARD WRAPPER ================= */}
        <div className="text-white border border-white/10 backdrop-blur-xl rounded-3xl p-6 bg-linear-to-b from-slate-900/80 to-cyan-900/40 shadow-lg shadow-black/30 relative overflow-hidden">

          {/* ================= BEFORE (FRIENDS LIST) ================= */}
          <div
            className={`transition-all duration-500 ${
              started
                ? "opacity-0 scale-95 pointer-events-none"
                : "opacity-100 scale-100"
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-sky-400/10 flex items-center justify-center text-2xl mb-4 border border-white/10">
                📞
              </div>

              <p className="text-sm font-semibold">SmartCall</p>
              <p className="text-xs text-white/60 mt-1 text-center">
                Talk with real people with AI assistance
              </p>
            </div>

            {/* FRIEND LIST */}
            <div className="mt-6">
              <p className="text-xs text-white/50 mb-3">Friends</p>

              <div className="space-y-2">

                {/* Alya */}
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="text-sm">Alya</p>
                      <p className="text-[10px] text-green-400">Online</p>
                    </div>
                  </div>

                  <button className="text-xs px-3! py-1! rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Call
                  </button>
                </div>

                {/* Rizky */}
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-500/30 flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="text-sm">Rizky</p>
                      <p className="text-[10px] text-white/40">Offline</p>
                    </div>
                  </div>

                  <button className="text-xs px-3! py-1! rounded-lg bg-white/5 text-white/30 border border-white/10 cursor-not-allowed">
                    Offline
                  </button>
                </div>

                {/* Nadia */}
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="text-sm">Nadia</p>
                      <p className="text-[10px] text-green-400">Online</p>
                    </div>
                  </div>

                  <button className="text-xs px-3! py-1! rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Call
                  </button>
                </div>

              </div>
            </div>

            {/* START BUTTON */}
            <button
              onClick={() => setStarted(true)}
              className="mt-5 w-full py-2.5! rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white text-sm font-medium"
            >
              Start Random Call
            </button>
          </div>

          {/* ================= AFTER ================= */}
          <div
            className={`absolute inset-0 p-6 h-full overflow-y-auto transition-all duration-500 ${
              started
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            {/* TOP */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold">Calling...</p>
                <p className="text-xs text-white/60">
                  {isRecording ? "Listening..." : "Idle"}
                </p>
              </div>

              <button
                onClick={() => setStarted(false)}
                className="text-xs px-3! py-1! rounded-lg bg-red-500/20 text-red-300"
              >
                End
              </button>
            </div>

            {/* CENTER ICON */}
            <div className="flex justify-center mb-6">
              <div
                className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all ${
                  isRecording
                    ? "bg-cyan-500/30 border-cyan-400 animate-pulse"
                    : "bg-white/10 border-white/20"
                }`}
              >
                📞
              </div>
            </div>

            {/* LIVE TRANSCRIPT */}
            <div className="bg-white/5 p-3 rounded-xl mb-3">
              <p className="text-xs text-white/50">Live Speech</p>
              <p className="text-sm">
                {liveTranscript || "Waiting for speech..."}
              </p>
            </div>

            {/* TRANSLATION (placeholder) */}
            <div className="bg-white/5 p-3 rounded-xl">
              <p className="text-xs text-white/50">Translation</p>
              <p className="text-sm">
                {lupaKata.lupaKataHeardText || "..."}
              </p>
            </div>

            {/* CONTROLS */}
            <div className="mt-5 flex gap-2">

              {/* MIC */}
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex-1 py-2 rounded-xl bg-green-500/20 text-green-300"
                >
                  Start Mic
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-300"
                >
                  Stop Mic
                </button>
              )}

              {/* TRANSLATE / LUPA KATA (FROM PARENT CONTROL PANEL) */}
              <button
                onClick={openLupaKata}
                className={`flex-1 py-2 rounded-xl border transition ${
                  isLupaKataActive
                    ? "bg-emerald-500/30 text-emerald-300 border-emerald-400"
                    : "bg-white/5 text-white/60 border-white/10"
                }`}
              >
                {isLupaKataActive ? "Translate ON" : "Translate"}
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}