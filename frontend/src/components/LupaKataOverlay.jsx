export default function LupaKataOverlay() {
  return (
    <div className="fixed bottom-52 left-0 right-0 flex justify-center z-40 pointer-events-none">
      <div className="flex flex-col items-center">
        {/* Lingkaran utama */}
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2a6 6 0 016 6v2a6 6 0 01-6 6 6 6 0 01-6-6V8a6 6 0 016-6zm0 16v2m-4 0h8"
            />
          </svg>
        </div>

        {/* Wave animation */}
        <div className="flex space-x-2 items-end h-16 mt-3">
          <span className="w-2 bg-emerald-400 rounded animate-wave"></span>
          <span className="w-2 bg-emerald-400 rounded animate-wave delay-200"></span>
          <span className="w-2 bg-emerald-400 rounded animate-wave delay-400"></span>
          <span className="w-2 bg-emerald-400 rounded animate-wave delay-600"></span>
          <span className="w-2 bg-emerald-400 rounded animate-wave delay-800"></span>
        </div>

        <p className="text-white font-semibold mt-2">🤔 Translate Instan...</p>
        <p className="text-sm text-emerald-200">
          Sebutkan kata dalam Bahasa Indonesia
        </p>
      </div>
    </div>
  );
}
