// ================== REACT CORE ==================
import { useEffect, useState, useRef } from "react";

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
  const [showHint, setShowHint] = useState(true);

  return (
    <>
      {/* FLOATING SUGGEST BUTTON */}
      {/* <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
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
      </div> */}

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
              <div className="col-start-2 col-span-2 h-16 rounded-lg font-bold transition relative">
                {isRecording ? (
                  isLupaKataActive ? (
                    <div className="w-full h-full bg-gray-400 text-gray-700 rounded-lg flex items-center justify-center font-bold">
                      🔒 Recording Locked
                    </div>
                  ) : (
                    <div className="flex w-full h-full items-center justify-center gap-3">
                      {/* SEND */}
                      <div
                        className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer font-semibold shadow-md hover:scale-105 transition"
                        onClick={stopRecording}
                      >
                        📤 Send
                      </div>

                      {/* CANCEL */}
                      <div
                        className="flex-1 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center cursor-pointer font-semibold shadow-md hover:scale-105 transition"
                        onClick={cancelRecording}
                      >
                        ✖ Cancel
                      </div>
                    </div>
                  )
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    onClick={
                      !isLupaKataActive && !isDailyLocked
                        ? () => {
                            if (isSpeaking) {
                              console.log("🛑 Interrupting TTS first");
                              forceStop();
                              return;
                            }

                            startRecording();
                          }
                        : undefined
                    }
                  >
                    <div className="relative flex items-center justify-center">
                      {/* OUTER PULSE RING */}
                      {!isLupaKataActive && !isDailyLocked && (
                        <span
                          className={`absolute w-12 h-12 rounded-full border-2 border-white/70 animate-ping`}
                        />
                      )}

                      {/* MAIN MIC BUTTON */}
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg
                      ${
                        isLupaKataActive || isDailyLocked
                          ? "bg-gray-500 text-gray-300"
                          : isSpeaking
                            ? "bg-orange-500 text-white"
                            : "bg-red-600 text-white hover:scale-105 transition"
                      }`}
                      >
                        {isLupaKataActive ? "🔒" : isSpeaking ? "⏹" : "🎙️"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lupa Kata */}
              {micReady && (
                <div className="col-span-1 h-16 flex items-center justify-center relative group">
                  {/* mobile hint sebelum ditekan */}
                  {showHint && !isLupaKataActive && (
                    <div className="absolute -top-16 bg-black/80 text-white text-[10px] px-3 py-1 rounded-md whitespace-normal text-center">
                      Forgot a word? Tap here
                      <br />
                      (ID → EN)
                    </div>
                  )}

                  {/* clue setelah ditekan */}
                  {isLupaKataActive && (
                    <div
                      className="absolute -top-16 left-1/2 transform -translate-x-1/2 
                    bg-black/80 text-white text-xs px-3 py-1 rounded-md text-center whitespace-normal max-w-xs"
                    >
                      Speak in Indonesian now ⬇
                    </div>
                  )}

                  {/* subtle glow ketika aktif */}
                  {isLupaKataActive && (
                    <span className="absolute w-14 h-14 rounded-full bg-emerald-400/40 blur-md animate-pulse"></span>
                  )}

                  {/* tombol Lupa Kata */}
                  <div
                    className={`relative w-14 h-14 flex items-center justify-center rounded-full text-xl shadow-md transition-all duration-200
                  ${
                    isDailyLocked
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isLupaKataActive
                        ? "bg-emerald-500 text-white scale-105"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-110 cursor-pointer"
                  }`}
                    onClick={() => {
                      if (!isDailyLocked) {
                        openLupaKata(); // aktifkan translate
                        setShowHint(false); // sembunyikan hint awal
                      }
                    }}
                  >
                    {isRecording ? "🤔" : isLupaKataActive ? "⏹" : "🔄"}
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
