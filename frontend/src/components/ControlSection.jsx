export default function ControlSection({
  isRecording,
  micReady,
  requestMicPermission,
  startRecording,
  stopRecording,
  cancelRecording,
  toggleSuggestion,
}) {
  return (
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
              🟦 Stop
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

      {/* SUGGESTION */}
      <div className="col-span-1 h-16 rounded-lg transition">
        <div
          className={`w-full h-full flex items-center justify-center text-white text-sm font-medium rounded-lg cursor-pointer
            ${
              isRecording
                ? "bg-emerald-300"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          onClick={toggleSuggestion}
        >
          ✨ Suggestion
        </div>
      </div>
    </div>
  );
}
