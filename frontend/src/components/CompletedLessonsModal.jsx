import { useState } from "react";

export default function CompletedLessonsModal({ completedLessons = [] }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // 🔥 category dropdown state
  const [selectedCategory, setSelectedCategory] = useState("All");

  const toggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ambil semua kategori unik
  const categories = [
    "All",
    ...new Set(completedLessons.map((item) => item.function_type)),
  ];

  // filter berdasarkan kategori
  const filteredLessons =
    selectedCategory === "All"
      ? completedLessons
      : completedLessons.filter(
          (item) => item.function_type === selectedCategory,
        );

  return (
    <>
      {/* TRIGGER */}
      <button
        onClick={() => setOpen(true)}
        className="
          px-2! py-2! rounded-fullx
          bg-gradient-to-r from-indigo-500/30 to-purple-500/30
          text-white border border-white/20
          hover:from-indigo-500/50 hover:to-purple-500/50
          transition shadow-md
        "
      >
        <div className="inline-flex items-center gap-2">
          <span className="text-sm">🧩</span>
          <span className="hidden sm:inline">Patterns</span>
          <span className="text-sm rounded-full text-white leading-none">
            {completedLessons.length}
          </span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20"
          aria-modal="true"
          role="dialog"
        >
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setOpen(false)}
          />

          {/* MODAL */}
          <div
            className="
              relative z-10 w-full max-w-md
              bg-[#121212] border border-white/10 rounded-2xl p-6
              max-h-[85vh] flex flex-col shadow-2xl animate-scaleIn
              overflow-hidden
            "
          >
            {/* CLOSE */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* TITLE */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-white text-lg font-semibold">
                Sentence Patterns
              </h2>

              {/* 🔥 CATEGORY DROPDOWN */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="
                  bg-white/5 border border-white/10
                  text-white text-xs rounded-lg
                  px-3 py-2 outline-none
                  hover:bg-white/10 transition
                "
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#121212]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredLessons.length === 0 ? (
                <div className="text-white/50 text-sm">
                  Tidak ada pattern di kategori ini.
                </div>
              ) : (
                filteredLessons.map((item) => {
                  const isOpen = expandedId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className="
                        p-3 rounded-lg cursor-pointer
                        bg-white/5 border border-white/10
                        hover:bg-white/10 transition
                        space-y-2 group
                      "
                    >
                      {/* PATTERN */}
                      <div className="flex items-center justify-between">
                        <div className="text-indigo-300 font-semibold text-sm">
                          {item.pattern_display}
                        </div>

                        <span
                          className={`text-xs transition ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        >
                          ➤
                        </span>
                      </div>

                      {/* CATEGORY */}
                      <div className="text-xs text-zinc-400">
                        {item.function_type}
                      </div>

                      {/* EXPAND */}
                      {isOpen && (
                        <div className="pt-2 border-t border-white/10 space-y-2 animate-fadeIn">
                          <div className="text-white text-sm">
                            {item.key_expression}
                          </div>

                          <div className="text-white/60 text-sm">
                            {item.context}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-3 text-center text-xs text-white/40">
              Total patterns: {filteredLessons.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
