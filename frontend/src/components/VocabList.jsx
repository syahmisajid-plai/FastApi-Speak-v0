import useVocabList from "../hooks/useVocabList";

export default function VocabList({ onClose, userId }) {
  const { vocabList, loading } = useVocabList(userId);

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* CONTENT */}
      <div className="relative z-10 h-full overflow-y-auto p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">📚 Vocabulary</h1>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vocabList.map((item) => (
              <div
                key={item.id}
                className={`border border-white/10 rounded-xl p-4 transition
      ${
        item.isCompleted
          ? "bg-white/5 opacity-40 blur-[1px] pointer-events-none"
          : "bg-white/5 hover:scale-[1.02]"
      }`}
              >
                <h2 className="text-white font-semibold">{item.word}</h2>

                <p className="text-gray-400 text-sm">{item.meaning}</p>

                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                    {item.type}
                  </span>
                  <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">
                    {item.level}
                  </span>
                </div>

                {/* 🔒 optional badge */}
                {item.isCompleted && (
                  <p className="text-xs text-green-400 mt-2">✔ Completed</p>
                )}

                <button
                  className={`mt-3 w-full py-1! text-sm rounded
                    ${
                      item.isCompleted
                        ? "bg-gray-500/10! text-gray-500 cursor-not-allowed"
                        : "bg-green-500/10! text-green-400"
                    }`}
                  disabled={item.isCompleted}
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
