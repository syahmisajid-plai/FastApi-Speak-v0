export default function LupaKataOverlay({ lupaKata }) {
  if (!lupaKata.isLupaKataActive) return null;

  return (
    <div className="fixed bottom-70 left-0 w-full flex justify-center z-50">
      <div className="w-full max-w-md px-4">
        <div className="bg-yellow-500/90 text-black rounded-xl px-4 py-3 text-center shadow-lg space-y-1">
          {!lupaKata.isProcessingLupaKata ? (
            <div className="font-semibold animate-pulse">
              🎧 Suara tertangkap, sedang mendengarkan
            </div>
          ) : (
            <div className="space-y-1">
              <div className="font-semibold">⏳ Memproses suara</div>
              <div className="flex justify-center text-xl font-bold tracking-widest">
                <span className="dot">•</span>
                <span className="dot">•</span>
                <span className="dot">•</span>
              </div>
              <div className="text-xs opacity-80">
                Using AI to recognize your speech…
              </div>
            </div>
          )}

          {lupaKata.lupaKataHeardText && (
            <div className="text-sm italic">“{lupaKata.lupaKataHeardText}”</div>
          )}
        </div>
      </div>
    </div>
  );
}
