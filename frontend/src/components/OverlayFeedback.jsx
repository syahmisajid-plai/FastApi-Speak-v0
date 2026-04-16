import { useEffect, useState } from "react";

export default function OverlayFeedback({ message }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message && !visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-md bg-white/10">
      <div
        className={`px-6 py-4 rounded-2xl shadow-2xl text-lg font-semibold
        transition-all duration-300
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}
        bg-white/90 text-gray-900`}
      >
        <div className="flex items-center gap-2">
          {/* <span className="animate-bounce text-xl">⭐</span> */}
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
