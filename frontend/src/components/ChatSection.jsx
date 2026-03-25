import ChatBubble from "./ChatBubble";

export default function ChatSection({
  chatHistory,
  liveTranscript,
  lupaKata, // ⬅️ TAMBAH INI
  bottomRef,
}) {
  return (
    <section className="rounded-xl p-4 shadow flex flex-col space-y-2 max-h-max overflow-y-auto">
      {/* Chat history biasa */}
      {chatHistory.map((chat, idx) => {
        // 🌅 PHASE DIVIDER
        if (chat.type === "phase") {
          return (
            <div key={idx} className="flex items-center my-4">
              <div className="flex-1 h-[1px] bg-white/20"></div>

              <div className="px-3 text-[11px] text-white/60">
                {chat.phase.toUpperCase()}
              </div>

              <div className="flex-1 h-[1px] bg-white/20"></div>
            </div>
          );
        }

        // 💬 CHAT BUBBLE
        return <ChatBubble key={idx} chat={chat} />;
      })}

      {/* Live transcript (recording biasa) */}
      {liveTranscript && (
        <div className="flex justify-end">
          <div className="max-w-[75%] p-3 rounded-lg bg-yellow-100 text-gray-900 italic">
            🎤 {liveTranscript}
          </div>
        </div>
      )}

      {/* ⬇️ LUPA KATA transcript MASUK CHAT */}
      {lupaKata.lupaKataHeardText && (
        <div className="flex justify-end">
          <div className="max-w-[75%] p-3 rounded-lg bg-orange-100 text-gray-900 italic">
            🤔 “{lupaKata.lupaKataHeardText}”
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </section>
  );
}
