import ChatBubble from "./ChatBubble";

export default function ChatSection({
  chatHistory,
  liveTranscript,
  lupaKata, // ⬅️ TAMBAH INI
  bottomRef,
  disabled = false, // 🔒 tambahkan prop disabled
  mode,
  data,
  toggleFavorite,
  autoCorrectionRef,
}) {
  return (
    <section className="relative rounded-xl p-4 shadow flex flex-col space-y-2 max-h-max overflow-y-auto">
      {/* Overlay jika chat di-disable */}
      {mode === "dailyStory" && disabled && (
        <div className="absolute inset-0 z-25 bg-black/70 flex flex-col items-center justify-center text-center p-4 rounded-xl">
          <h2 className="text-white text-lg font-bold mb-2">
            🎉 Daily hari ini sudah complete!
          </h2>
          <p className="text-gray-200 text-sm mb-4">
            Terima kasih telah menyelesaikan semua phase hari ini.
          </p>
        </div>
      )}

      {/* Chat history biasa */}
      {chatHistory.map((chat, idx) => {
        // 🌅 PHASE DIVIDER
        if (chat.type === "phase") {
          return (
            <div key={idx} className="flex items-center my-4">
              <div className="flex-1 h-[1px] bg-white/20"></div>

              <div className="px-3 text-[11px] text-white/60">
                {chat.phase?.toUpperCase() || "[UNKNOWN PHASE]"}
              </div>

              <div className="flex-1 h-[1px] bg-white/20"></div>
            </div>
          );
        }

        // 💬 CHAT BUBBLE
        return (
          <ChatBubble
            key={idx}
            chat={chat}
            data={data}
            toggleFavorite={toggleFavorite}
            autoCorrectionRef={autoCorrectionRef}
          />
        );
      })}

      {/* Live transcript */}
      {liveTranscript && (
        <div className="flex justify-end">
          <div className="max-w-[75%] p-3 rounded-lg bg-yellow-100 text-gray-900 italic">
            🎤 {liveTranscript}
          </div>
        </div>
      )}

      {/* LUPA KATA transcript MASUK CHAT */}
      {lupaKata.lupaKataHeardText && (
        <div className="flex justify-end">
          <div className="max-w-[75%] p-3 rounded-lg bg-orange-100 text-gray-900 italic">
            🤔 “{lupaKata.lupaKataHeardText}”
          </div>
        </div>
      )}

      <div ref={bottomRef} />
      {/* <div className="mb-96"></div>
      <div className="mb-96"></div> */}
      {/* <div className="mb-96"></div>
      <div className="mb-96"></div> */}
    </section>
  );
}
