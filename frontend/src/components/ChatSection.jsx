import ChatBubble from "./ChatBubble";

export default function ChatSection({
  chatHistory,
  liveTranscript,
  bottomRef,
}) {
  return (
    <section className="rounded-xl p-4 shadow flex flex-col space-y-2 max-h-max overflow-y-auto">
      {/* Chat history biasa */}
      {chatHistory.map((chat, idx) => (
        <ChatBubble key={idx} chat={chat} />
      ))}

      {/* Live transcript sementara */}
      {liveTranscript && (
        <div className="flex justify-end">
          <div className="max-w-[75%] p-3 rounded-lg bg-yellow-100 text-gray-900 italic">
            🎤 {liveTranscript}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </section>
  );
}
