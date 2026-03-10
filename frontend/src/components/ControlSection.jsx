export default function ControlSection({
  isRecording,
  isSpeaking, // ✅ TAMBAHKAN
  micReady,
  requestAudioPermission,
  startRecording,
  stopRecording,
  cancelRecording,
  toggleSuggestion,
  isIdle,
  openLupaKata,
  isLupaKataActive,
  lupaKataResult,
  speakerReady,
  forceStop, // ✅ TAMBAHKAN
  isDailyLocked,
}) {
  return (
    <>
      {/* FLOATING SUGGEST BUTTON */}
      <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
        <div className="flex justify-center col-span-4"></div>
        <div className="flex justify-center col-span-1">
          <div
            className={`w-14 h-14 flex items-center justify-center rounded-full shadow-xl cursor-pointer transition transform hover:scale-110
              ${isIdle && !isRecording ? "animate-bounce" : ""}
              ${
                isRecording
                  ? "bg-amber-200 text-black"
                  : "bg-amber-400 text-black hover:bg-amber-500"
              }
            `}
            onClick={toggleSuggestion}
          >
            ✨
          </div>
        </div>
      </div>

      {/* MIC / RECORD & LUPA KATA */}
      <div className="relative max-w-md mx-auto">
        {isDailyLocked && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
            <div className="relative px-16 py-0 text-center rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 blur opacity-30"></div>

              <div className="relative">
                <div className="text-2xl mb-2">🔒</div>

                <div className="text-zinc-400 text-sm mt-1">
                  Available 16:00 – 02:00
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mt-2">
          {/* Tombol Enable Audio (Mic + Speaker) */}
          {!(micReady && speakerReady) ? (
            <div
              className="col-span-4 h-16 w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center cursor-pointer font-bold"
              onClick={requestAudioPermission}
            >
              🎤🔊 Enable Audio
            </div>
          ) : (
            <>
              {/* Tombol Record */}
              <div className="col-span-3 h-16 rounded-lg font-bold transition relative">
                {isRecording ? (
                  <div className="flex w-full h-full">
                    <div
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-l-lg flex items-center justify-center cursor-pointer"
                      onClick={stopRecording}
                    >
                      🟦 Send
                    </div>
                    <div
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-r-lg flex items-center justify-center cursor-pointer"
                      onClick={cancelRecording}
                    >
                      🟥 Cancel
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-full h-full rounded-lg flex items-center justify-center font-bold
                    ${
                      isLupaKataActive || isDailyLocked
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : isSpeaking
                          ? "bg-orange-400 hover:bg-orange-500 text-white cursor-pointer"
                          : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                    }
                  `}
                    onClick={
                      !isLupaKataActive && !isDailyLocked
                        ? () => {
                            if (isSpeaking) {
                              console.log("🛑 Interrupting TTS first");
                              forceStop(); // tap pertama cuma stop audio
                              return;
                            }

                            startRecording(); // baru record kalau tidak speaking
                          }
                        : undefined
                    }
                  >
                    {isLupaKataActive
                      ? "🔒 Recording Locked"
                      : isSpeaking
                        ? "⏹ Stop AI"
                        : "🔴 Record"}
                  </div>
                )}
              </div>

              {/* Lupa Kata */}
              {micReady && (
                <div className="col-span-1 h-16 rounded-lg transition relative">
                  <div
                    className={`w-full h-full flex items-center justify-center text-white text-sm font-bold rounded-lg text-center
                  ${
                    isRecording || isDailyLocked
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : isLupaKataActive
                        ? "bg-emerald-300"
                        : "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                  }`}
                    onClick={
                      !isRecording && !isDailyLocked ? openLupaKata : undefined
                    }
                  >
                    {isRecording
                      ? "🔒 Translate Locked"
                      : isLupaKataActive
                        ? "⏹ Stop"
                        : "📖 Translate"}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
