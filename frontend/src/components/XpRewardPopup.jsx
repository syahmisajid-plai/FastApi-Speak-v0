// components/XpRewardPopup.jsx
import { useEffect, useState, useMemo, useRef } from "react";

export default function XpRewardPopup({ type = "xp", xp, message, onClose }) {
  const [phase, setPhase] = useState("start");
  // start -> center -> end
  const [fly, setFly] = useState(false);
  const isInfo = type === "info";
  useEffect(() => {
    if (!xp) return;

    // Reset posisi awal setiap popup muncul
    setFly(false);

    // Setelah sebentar, mulai terbang
    const flyTimer = setTimeout(() => {
      setFly(true);
    }, 2100);

    // Hilangkan popup
    const closeTimer = setTimeout(() => {
      onClose?.();
    }, 4200);

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(closeTimer);
    };
  }, [xp]);

  useEffect(() => {
    if (xp == null && !message) return;

    setPhase("start");

    // 0 ms
    requestAnimationFrame(() => {
      setPhase("center");
    });

    // setelah diam
    const t1 = setTimeout(() => {
      setPhase("end");
    }, 1800);

    const t2 = setTimeout(() => {
      onClose?.();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [xp]);

  if (xp == null && !message) return null;

  return (
    <div
      className={`
      fixed
      top-24
      left-1/2
      z-[999]
      pointer-events-none
      transition-all
      duration-700
      ease-out

      ${
        phase === "start"
          ? "-translate-x-[70px] -translate-y-4 scale-90 opacity-0"
          : phase === "center"
            ? "-translate-x-1/2 scale-100 opacity-100"
            : "-translate-x-[170px] -translate-y-16 scale-25 opacity-0"
      }
    `}
    >
      <div
        className="
    flex
    items-center
    gap-3

    px-4
    py-2.5

    rounded-2xl
    bg-white/95
    backdrop-blur-xl

    border
    border-yellow-100

    shadow-[0_10px_24px_rgba(0,0,0,0.10)]
  "
      >
        {/* Badge */}
        <div
          className="
      relative
      w-9
      h-9

      rounded-full

      flex
      items-center
      justify-center

      bg-gradient-to-br
      from-yellow-300
      to-amber-500

      text-white
      text-sm
      font-bold

      shadow-[0_0_12px_rgba(251,191,36,.35)]
    "
        >
          {isInfo ? "🏆" : "XP"}
        </div>

        <div>
          {!isInfo && (
            <div className="text-base font-bold leading-none text-gray-900">
              +{xp}
            </div>
          )}

          <div
            className={
              isInfo
                ? "text-sm font-semibold text-gray-900"
                : "mt-0.5 text-[11px] text-gray-500"
            }
          >
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
