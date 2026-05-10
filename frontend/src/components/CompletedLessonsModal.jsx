import { useState } from "react";

export default function CompletedLessonsModal({ completedLessons = [] }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {/* TRIGGER */}
      <button
        onClick={() => setOpen(true)}
        className="
          px-4 py-2 rounded-full
          bg-gradient-to-r from-indigo-500/30 to-purple-500/30
          text-white border border-white/20
          hover:from-indigo-500/50 hover:to-purple-500/50
          transition text-sm shadow-md
        "
      >
        🧩 Patterns ({completedLessons.length})
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
            className="relative z-10 w-full max-w-md
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
            <h2 className="text-white text-lg font-semibold mb-4">
              Sentence Patterns
            </h2>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {completedLessons.length === 0 ? (
                <div className="text-white/50 text-sm">
                  Belum ada pattern yang dipelajari.
                </div>
              ) : (
                completedLessons.map((item) => {
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
                      {/* 🔥 MAIN FOCUS: PATTERN */}
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

                      {/* secondary info */}
                      <div className="text-xs text-zinc-400">
                        {item.function_type}
                      </div>

                      {/* optional expand */}
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
              Total patterns: {completedLessons.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
