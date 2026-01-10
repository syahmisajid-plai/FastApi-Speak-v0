export default function ControlSection({
  isRecording,
  toggleRecording,
  toggleSuggestion,
}) {
  return (
    <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
      <div className="col-span-3 h-16 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition">
        <button className="w-full h-full" onClick={toggleRecording}>
          {isRecording ? "Stop" : "🔴 Record"}
        </button>
      </div>

      <div className="col-span-1 h-16 bg-emerald-500 text-white text-sm rounded-lg font-medium hover:bg-emerald-600 transition">
        <button className="w-full h-full" onClick={toggleSuggestion}>
          ✨ Suggestion
        </button>
      </div>
    </div>
  );
}
