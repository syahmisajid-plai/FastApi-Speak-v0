export default function ModeConfirmModal({ open, onCancel, onContinue }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-55">
      <div
        className="
          bg-white/10
          backdrop-blur-xl
          border border-white/20
          text-white
          rounded-2xl
          p-6
          w-[320px]
          text-center
          space-y-5
          shadow-2xl
        "
      >
        {/* ICON */}
        <div className="text-4xl">⚠️</div>

        {/* TITLE */}
        <h2 className="text-lg font-semibold">Change Mode?</h2>

        {/* DESCRIPTION */}
        <p className="text-sm text-white/70 leading-relaxed">
          Your current chat will be cleared when switching modes.
          <br />
          Do you want to continue?
        </p>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-2">
          <button
            className="
              flex-1
              py-2.5!
              rounded-xl
              bg-white/10!
              hover:bg-white/20
              text-white/80
              font-medium
              transition-all
              active:scale-95
            "
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="
              flex-1
              py-2.5!
              rounded-xl
              bg-gradient-to-r
              from-red-500
              to-rose-500
              hover:from-red-600
              hover:to-rose-600
              text-white
              font-semibold
              shadow-lg
              transition-all
              active:scale-95
            "
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
