import { AVATARS } from "../utils/avatars";

export default function AvatarModal({
  open,
  onClose,
  selectedAvatar,
  setSelectedAvatar,
  onSave,
}) {
  if (!open) return null;

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
        <div className="grid grid-cols-5 gap-4">
          {AVATARS.map((item) => {
            const active = selectedAvatar === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedAvatar(item.id)}
                className={`
                  relative
                  flex h-16 w-16 items-center justify-center
                  rounded-full
                  text-3xl
                  transition-all duration-200

                  ${
                    active
                      ? "scale-110 bg-indigo-500 shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-300"
                      : "bg-white/5 hover:bg-white/10 hover:scale-105"
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
                      flex h-6 w-6 items-center justify-center
                      rounded-full
                      bg-white
                      text-xs
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

        {/* Footer */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1
              rounded-2xl
              border border-white/10
              bg-white/5
              py-3
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
              bg-indigo-600
              py-3
              font-medium
              text-white
              transition
              hover:bg-indigo-500
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
