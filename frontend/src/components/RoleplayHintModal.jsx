import React from "react";

export default function RoleplayHintModal({ selectedChecklist, onClose }) {
  if (!selectedChecklist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-md rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">💡 Hint</h2>

          <button
            onClick={onClose}
            className="text-white/60 transition hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-white/80">
          {selectedChecklist.text}
        </p>

        <div className="flex flex-wrap gap-2">
          {selectedChecklist.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1 text-xs text-indigo-200"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
