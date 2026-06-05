import { updateInfo } from "../config/updateInfo";

export default function UpdateBanner({ onUpdate }) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-50 flex flex-col items-center text-center px-8 py-10 max-w-sm">

        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-5xl mb-4">
          🚀
        </div>

        <h2 className="text-2xl font-semibold text-emerald-200">
          Update Tersedia
        </h2>

        <p className="text-sm text-white/70 mt-1">
          Versi Baru Siap Digunakan
        </p>

        <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-xs">
          Kami telah meningkatkan performa dan stabilitas aplikasi.
        </p>

        {/* 🔥 version (opsional ditampilkan) */}
        <div className="text-xs text-white/40">
          v{updateInfo.version}
        </div>

        {/* 🔥 dynamic badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {updateInfo.features.map((item, index) => {
            const colorClass =
              item.color === "emerald"
                ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/10"
                : "bg-white/10 text-white/70 border-white/10";

            return (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs border ${colorClass}`}
              >
                {item.icon} {item.text}
              </span>
            );
          })}
        </div>

        <button
          onClick={onUpdate}
          className="mt-6 w-full rounded-xl bg-emerald-500! hover:bg-emerald-600 
                     text-white py-3! font-medium shadow-lg 
                     transition-all active:scale-[0.98]"
        >
          Update Sekarang
        </button>

      </div>
    </div>
  );
}