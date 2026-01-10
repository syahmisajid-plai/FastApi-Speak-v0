export default function SuggestionSection({ suggestions, playAudio }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mt-2 space-y-2 max-h-60 overflow-y-auto max-w-md mx-auto">
      {suggestions.map((s, i) => (
        <div
          key={i}
          className="flex justify-between items-center bg-gray-100 p-2 rounded"
        >
          <p className="text-gray-800 text-sm">{s}</p>
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
            onClick={() => playAudio(s)}
          >
            🔊
          </button>
        </div>
      ))}
    </div>
  );
}
