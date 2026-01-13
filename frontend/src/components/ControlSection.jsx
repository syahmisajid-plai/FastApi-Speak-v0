export default function ControlSection({
  isRecording,
  micReady,
  requestMicPermission,
  startRecording,
  stopRecording,
  cancelRecording,
  toggleSuggestion,
  isIdle,
}) {
  return (
    <>
      <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
        {/* KOSONG */}
        <div className="flex justify-center col-span-4"></div>
        {/* FLOATING SUGGEST BUTTON */}
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

      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {/* MIC / RECORD */}
        <div className="col-span-3 h-16 rounded-lg font-bold transition relative">
          {!micReady ? (
            <div
              className="w-full h-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center cursor-pointer"
              onClick={requestMicPermission}
            >
              🎤 Enable Microphone
            </div>
          ) : isRecording ? (
            <div className="flex w-full h-full">
              {/* STOP */}
              <div
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-l-lg flex items-center justify-center cursor-pointer"
                onClick={stopRecording}
              >
                🟦 Send
              </div>

              {/* CANCEL */}
              <div
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-r-lg flex items-center justify-center cursor-pointer"
                onClick={cancelRecording}
              >
                🟥 Cancel
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center cursor-pointer"
              onClick={startRecording}
            >
              🔴 Record
            </div>
          )}
        </div>

        {/* Lupa Kata */}
        <div className="col-span-1 h-16 rounded-lg transition">
          <div
            className={`w-full h-full flex items-center justify-center text-white text-sm font-medium rounded-lg cursor-pointer text-center
            ${
              isRecording
                ? "bg-emerald-300"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
            // onClick={toggleSuggestion}
          >
            📖 Lupa Kata
          </div>
        </div>
      </div>
    </>
  );
}
