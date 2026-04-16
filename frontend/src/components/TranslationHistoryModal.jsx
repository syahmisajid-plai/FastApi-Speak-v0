import { useEffect, useState } from "react";

import useTranslationHistory from "../hooks/useTranslationHistory";

export default function TranslationHistoryModal({ show, onClose, userId }) {
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false);

  const { data, page, loading, hasMore, nextPage, prevPage, error, refresh } =
    useTranslationHistory(userId, 8, showFavoriteOnly);

  if (!show) return null;

  const filteredData = showFavoriteOnly
    ? data.filter((item) => item.is_favorite)
    : data;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md px-4"
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-4 text-white text-sm"
        >
          ✕
        </button>

        <div className="bg-black/80 border border-white/10 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold">🕘 Translation History</h3>

            <div className="flex bg-white/10 rounded-full p-1 text-xs">
              <button
                onClick={() => setShowFavoriteOnly(false)}
                className={`px-3! py-1! rounded-full transition ${
                  !showFavoriteOnly ? "bg-white! text-black" : "text-white/70"
                }`}
              >
                📄 All
              </button>

              <button
                onClick={() => setShowFavoriteOnly(true)}
                className={`px-3! py-1! rounded-full transition ${
                  showFavoriteOnly
                    ? "bg-yellow-400! text-black"
                    : "text-white/70"
                }`}
              >
                ⭐ Favorite
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && <div className="text-red-400 text-xs mb-2">{error}</div>}

          {/* LOADING */}
          {loading && (
            <div className="text-xs text-gray-400 mb-2">Loading...</div>
          )}

          {/* DATA */}
          <div className="min-h-[120px] space-y-2 text-xs text-gray-300">
            {filteredData.length === 0 && !loading ? (
              <div className="text-gray-500">
                {showFavoriteOnly ? "No favorite yet" : "No history yet"}
              </div>
            ) : (
              filteredData.map((item) => (
                <div key={item.id} className="p-2 bg-white/5 rounded">
                  <span className="text-white">{item.source_text}</span> →{" "}
                  {item.translated_text}
                </div>
              ))
            )}
          </div>

          {/* NAV */}
          <div className="flex justify-between mt-3">
            <button
              onClick={prevPage}
              disabled={page === 0 || loading}
              className="text-xs px-3 py-1 bg-white/10 rounded disabled:opacity-30"
            >
              ← Prev
            </button>

            <div className="text-xs text-gray-400">Page {page + 1}</div>

            <button
              onClick={nextPage}
              disabled={showFavoriteOnly || !hasMore || loading}
              className="text-xs px-3 py-1 bg-white/10 rounded disabled:opacity-30"
            >
              Next →
            </button>
          </div>

          {/* INDICATOR */}
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: Math.min(page + 2, 5) }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === page ? "bg-white/50" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
