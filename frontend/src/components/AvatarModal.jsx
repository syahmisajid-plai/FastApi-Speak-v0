import { useState } from "react";
import { AVATARS } from "../utils/avatars";

export default function AvatarModal({
  open,
  onClose,
  selectedAvatar,
  setSelectedAvatar,
  onSave,
}) {
  const PER_PAGE = 20;
  const [page, setPage] = useState(0);

  if (!open) return null;

  const totalPages = Math.ceil(AVATARS.length / PER_PAGE);

  const visibleAvatars = AVATARS.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const currentAvatar =
    AVATARS.find((a) => a.id === selectedAvatar)?.avatar ?? "🙂";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          fixed left-1/2 top-1/2 z-[100]
          w-[420px] max-w-[92vw]
          -translate-x-1/2 -translate-y-1/2
          rounded-3xl
          border border-white/10
          bg-gradient-to-b from-zinc-900 to-zinc-950
          p-7
          shadow-[0_25px_80px_rgba(0,0,0,0.55)]
        "
      >
        {/* Header */}
        <div className="mb-7 flex flex-col items-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 text-6xl ring-2 ring-indigo-500/30">
            {currentAvatar}
          </div>

          <h2 className="text-xl font-semibold text-white">
            Choose Your Avatar
          </h2>

          <p className="mt-1 text-center text-sm text-zinc-400">
            Pick an avatar that represents you.
          </p>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-5 gap-5">
          {visibleAvatars.map((item) => {
            const active = selectedAvatar === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedAvatar(item.id)}
                className={`
          relative
          flex h-14 w-14 sm:h-16 sm:w-16
          items-center justify-center
          rounded-full
          text-3xl
          transition-all duration-200

          ${
            active
              ? "scale-110 bg-indigo-500! shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-300"
              : "bg-white/5! hover:bg-white/10! hover:scale-105"
          }
        `}
              >
                {item.avatar}

                {active && (
                  <span
                    className="
              absolute
              -right-1
              -top-1
              flex h-5 w-5 items-center justify-center
              rounded-full
              bg-white
              text-[10px]
              font-bold
              text-indigo-600
              shadow-md
            "
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="
              rounded-xl
              border border-white/10
              bg-white/5!
              px-4! py-2!
              text-sm text-white
              transition
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            ← Previous
          </button>

          <span className="text-sm text-zinc-400">
            Page {page + 1} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="
              rounded-xl
              border border-white/10
              bg-white/5!
              px-4! py-2!
              text-sm text-white
              transition
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Next →
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1
              rounded-2xl
              border border-white/10
              bg-white/5!
              py-3!
              text-white
              transition
              hover:bg-white/10
            "
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="
              flex-1
              rounded-2xl
              bg-indigo-600!
              py-3!
              font-medium
              text-white
              transition
              hover:bg-indigo-500!
              active:scale-[0.98]
            "
          >
            Save Avatar
          </button>
        </div>
      </div>
    </>
  );
}
