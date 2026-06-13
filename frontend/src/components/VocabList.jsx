import { useState, useEffect, useMemo } from "react";
import useVocabList from "../hooks/useVocabList";

export default function VocabList({ onClose, userId }) {
  const { vocabList, loading } = useVocabList(userId);

  // ✅ state filter
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!loading) {
      console.log("📦 vocabList:", vocabList);
    }
  }, [vocabList, loading]);

  // ✅ ambil unique value
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

  // ✅ filter logic
  const filteredList = useMemo(() => {
    return vocabList.filter((item) => {
      const matchType =
        selectedType === "all" || item.type.split("/").includes(selectedType);

      const matchLevel =
        selectedLevel === "all" || item.level === selectedLevel;

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchType && matchLevel && matchStatus;
    });
  }, [vocabList, selectedType, selectedLevel, statusFilter]);

  return (
    <div className="fixed inset-0 z-52">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* CONTENT */}
      <div className="relative z-10 h-full overflow-y-auto p-6">
        {/* ✅ ADD THIS WRAPPER */}
        <div className="max-w-4xl mx-auto w-full">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-white">📚 Vocabulary</h2>

            <button
              onClick={onClose}
              className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* ✅ FILTER SECTION */}
          {!loading && (
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Completed */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 text-white px-3 py-2 rounded-lg w-[48%] md:w-auto"
              >
                {/* <option value="all" className="text-black bg-white">
                  All Status
                </option>
                <option value="learning" className="text-black bg-white">
                  not Completed
                </option> */}
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
                {types.map((t) => (
                  <option key={t} value={t} className="text-black bg-white">
                    {t}
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
                {levels.map((l) => (
                  <option key={l} value={l} className="text-black bg-white">
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredList.map((item) => {
                const isCompleted = item.status === "completed";
                const isKnown = item.status === "known";
                const isLearning = item.status === "learning";

                return (
                  <div
                    key={item.id}
                    className={`border border-white/10 rounded-xl p-4 transition
                    ${
                      isCompleted
                        ? "bg-green-500/5"
                        : isKnown
                          ? "bg-blue-500/5"
                          : "bg-white/5 opacity-50"
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

                    {isCompleted && (
                      <p className="text-xs text-green-400 mt-2">✔ Completed</p>
                    )}

                    {isKnown && (
                      <p className="text-xs text-blue-400 mt-2">✔ Known</p>
                    )}

                    <button
                      className={`mt-3 w-full py-1 text-sm rounded
                      ${
                        isCompleted || isKnown
                          ? "bg-gray-500/10 text-gray-500 cursor-not-allowed"
                          : "bg-green-500/10 text-green-400"
                      }`}
                      disabled={isCompleted || isKnown}
                    >
                      Practice
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
