import { updateInfo } from "../config/updateInfo";

export default function UpdateBanner({ onUpdate }) {
  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center">
      
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* card */}
      <div className="relative z-55 w-full max-w-sm mx-4 rounded-2xl 
                      bg-white/5 border border-white/10 backdrop-blur-xl 
                      p-6 text-center">

        {/* BIG ICON */}
        <div className="text-5xl mb-3 animate-pulse">
          🚀
        </div>

        {/* 🔥 HERO TITLE (dibuat lebih strong) */}
        <h2 className="text-2xl font-bold text-emerald-300 tracking-wide">
          UPDATE TERSEDIA
        </h2>

        {/* version kecil */}
        <p className="text-xs text-white/40 mt-1">
          v{updateInfo.version}
        </p>

        {/* divider biar lebih fokus */}
        <div className="w-12 h-px bg-white/10 mx-auto my-4" />

        {/* features */}
        <div className="flex flex-wrap justify-center gap-2">
          {updateInfo.features.slice(0, 3).map((item, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded-full text-[11px] 
                         bg-white/10 text-white/70 border border-white/10"
            >
              {item.icon} {item.text}
            </span>
          ))}
        </div>

        {/* CTA button (lebih dominant) */}
        <button
          onClick={onUpdate}
          className="mt-6 w-full rounded-xl bg-emerald-500!
                     hover:bg-emerald-600 text-white py-3! font-semibold
                     shadow-lg shadow-emerald-500/20
                     transition active:scale-[0.98]"
        >
          Update Sekarang
        </button>

        {/* hint kecil */}
        <p className="text-[10px] text-white/30 mt-3">
          Recommended untuk performa terbaik
        </p>

      </div>
    </div>
  );
}