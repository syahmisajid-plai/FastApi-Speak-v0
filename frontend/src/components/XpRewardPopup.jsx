// components/XpRewardPopup.jsx

import { useEffect } from "react";

export default function XpRewardPopup({
  xp,
  message = "Great Progress!",
  onClose,
}) {
  useEffect(() => {
    if (!xp) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [xp, onClose]);

  if (!xp) return null;

  return (
    <div
      className="
        fixed
        top-24
        left-1/2
        -translate-x-1/2
        z-[999]
        animate-bounce
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
          px-5
          py-3
          rounded-2xl
          bg-gradient-to-r
          from-yellow-400
          to-orange-400
          text-white
          shadow-xl
          font-bold
        "
      >
        <span className="text-2xl">✨</span>

        <div>
          <div className="text-lg">+{xp} XP</div>

          <div className="text-xs opacity-90">{message}</div>
        </div>
      </div>
    </div>
  );
}
