import { useState, useEffect, useMemo } from "react";
import useVocabList from "../hooks/useVocabList";

export default function VocabList({ onClose, userId }) {
  const { vocabList, loading } = useVocabList(userId);

  const [statusFilter, setStatusFilter] = useState("completed");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  useEffect(() => {
    if (!loading) {
      console.log("📦 vocabList:", vocabList);
    }
  }, [vocabList, loading]);

  const types = useMemo(() => {
    return [
      ...new Set(
        vocabList.flatMap((item) => item.type.split("/").map((t) => t.trim())),
      ),
    ];
  }, [vocabList]);

  const levels = useMemo(
    () => [...new Set(vocabList.map((item) => item.level))],
    [vocabList],
  );

  const filteredList = useMemo(() => {
    return vocabList.filter((item) => {
      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchType =
        selectedType === "all" || item.type.split("/").includes(selectedType);

      const matchLevel =
        selectedLevel === "all" || item.level === selectedLevel;

      return matchStatus && matchType && matchLevel;
    });
  }, [vocabList, statusFilter, selectedType, selectedLevel]);

  return (
    <div className="fixed inset-0 z-52">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* CONTENT */}
      <div className="relative z-10 h-full overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto w-full">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-white">
              📚 Saved Vocabulary
            </h2>

            <button
              onClick={onClose}
              className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* FILTERS */}
          {!loading && (
            <div className="flex flex-wrap gap-3 mb-6">
              {/* STATUS */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 text-white px-3 py-2 rounded-lg w-[48%] md:w-auto"
              >
                <option value="completed" className="text-black bg-white">
                  Completed
                </option>

                <option value="known" className="text-black bg-white">
                  Known
                </option>
              </select>

              {/* TYPE */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white/10 text-white px-3 py-2 rounded-lg w-[48%] md:w-auto"
              >
                <option value="all" className="text-black bg-white">
                  All Types
                </option>

                {types.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="text-black bg-white"
                  >
                    {type}
                  </option>
                ))}
              </select>

              {/* LEVEL */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-white/10 text-white px-3 py-2 rounded-lg w-[48%] md:w-auto"
              >
                <option value="all" className="text-black bg-white">
                  All Levels
                </option>

                {levels.map((level) => (
                  <option
                    key={level}
                    value={level}
                    className="text-black bg-white"
                  >
                    {level}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <p className="text-gray-400">Loading vocabulary...</p>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No saved vocabulary found.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredList.map((item) => {
                const isCompleted = item.status === "completed";

                const isKnown = item.status === "known";

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl p-4 border transition
                    ${
                      isCompleted
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-blue-500/5 border-blue-500/20"
                    }`}
                  >
                    {/* WORD */}
                    <h2 className="text-white font-semibold text-lg">
                      {item.word}
                    </h2>

                    {/* MEANING */}
                    <p className="text-gray-400 text-sm mt-1">{item.meaning}</p>

                    {/* TAGS */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                        {item.type}
                      </span>

                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">
                        {item.level}
                      </span>
                    </div>

                    {/* STATUS */}
                    {isCompleted && (
                      <p className="text-xs text-green-400 mt-3">✔ Completed</p>
                    )}

                    {isKnown && (
                      <p className="text-xs text-blue-400 mt-3">✔ Known</p>
                    )}

                    {/* ACTION */}
                    <button className="mt-3 w-full py-2 text-sm rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition">
                      Review
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
