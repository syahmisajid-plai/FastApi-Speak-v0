import { useState } from "react";

export default function CompletedLessonsModal({ completedLessons = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 🔘 Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="
          px-4 py-2 rounded-full
          bg-white/10 text-white
          border border-white/20
          hover:bg-white/20
          transition
          text-sm
          flex items-center gap-2
        "
      >
        📚 Completed
        <span className="text-blue-300 font-medium">
          ({completedLessons.length})
        </span>
      </button>

      {/* 🌑 OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* CENTER WRAPPER */}
          <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-6">
            {/* CARD */}
            <div
              className="
                w-full max-w-md
                bg-[#121212]
                border border-white/10
                rounded-2xl
                shadow-2xl
                p-5
                relative

                max-h-[85vh]
                flex flex-col
                overflow-hidden
              "
            >
              {/* ❌ CLOSE */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 text-white/50 hover:text-white"
              >
                ✕
              </button>

              {/* TITLE */}
              <h2 className="text-white text-lg font-semibold mb-4">
                Completed Lessons
              </h2>

              {/* CONTENT */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                {completedLessons.length === 0 ? (
                  <div className="text-white/50 text-sm">
                    Belum ada lesson yang selesai.
                  </div>
                ) : (
                  completedLessons.map((item) => (
                    <div
                      key={item.id}
                      className="
                        p-3 rounded-lg
                        bg-white/5
                        border border-white/10
                        space-y-2
                      "
                    >
                      {/* FUNCTION TYPE */}
                      <div className="text-xs text-blue-400">
                        {item.function_type}
                      </div>

                      {/* CONTEXT */}
                      <div className="text-white text-sm">{item.context}</div>

                      {/* KEY EXPRESSION (MEMORY CORE) */}
                      <div className="text-green-300 text-sm font-medium">
                        {item.key_expression}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* FOOTER */}
              <div className="mt-4 text-xs text-white/40 text-center">
                Total: {completedLessons.length} lessons
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
