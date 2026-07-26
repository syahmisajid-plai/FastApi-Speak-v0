import { useEffect, useRef, useState } from "react";

export default function ConversationUI({ setConversationStage }) {
  const [expandedId, setExpandedId] = useState(1);
  const [visibleCount, setVisibleCount] = useState(1);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [visibleCount]);

  const conversation = [
    {
      id: 1,
      speaker: "Emma",
      avatar: "🟦",
      side: "left",
      text: "Hi, how are you doing today?",
      active: true,
    },
    {
      id: 2,
      speaker: "John",
      avatar: "🟨",
      side: "right",
      text: "I'm doing great! How about yourself?",
    },
    {
      id: 3,
      speaker: "Emma",
      avatar: "🟦",
      side: "left",
      text: "I'm pretty good, thank you.",
    },
    {
      id: 4,
      speaker: "John",
      avatar: "🟨",
      side: "right",
      text: "Good luck with your English study!",
    },
  ];
  return (
    <section className="max-w-md mx-auto mt-20 text-white rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-indigo-900/70 backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConversationStage("choice")}
            className="w-10 h-10 rounded-xl bg-white/10! hover:bg-white/20! transition"
          >
            ←
          </button>

          <div>
            <h2 className="font-semibold text-lg">Greetings</h2>
            <p className="text-xs text-white/50">A1 • 2 min • 12 Sentences</p>
          </div>
        </div>

        {/* Listen Full */}
        <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5 text-center">
          <div className="text-5xl">🎧</div>

          <h3 className="mt-3 font-semibold">Listen First</h3>

          <p className="text-xs text-white/60 mt-2">
            Listen to the whole conversation once.
          </p>

          <button className="mt-5 px-5! py-3! rounded-xl bg-indigo-500! hover:bg-indigo-400! transition font-medium">
            ▶ Play Full Conversation
          </button>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-white/50">
            <span>Conversation Progress</span>
            <span>1 / 4</span>
          </div>

          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-1/4 bg-indigo-400 rounded-full"></div>
          </div>
        </div>

        {/* Conversation */}
        <div className="mt-8 space-y-4">
          {conversation.slice(0, visibleCount).map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`w-full max-w-[70%] rounded-xl border transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${
                  item.side === "right" ? "ml-auto" : ""
                } ${
                  item.active
                    ? "border-indigo-400 bg-indigo-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="p-3">
                  {/* Speaker */}
                  <div
                    className={`flex items-center gap-2 ${
                      item.side === "right" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="text-xl">{item.avatar}</div>

                    <div
                      className={`flex-1 ${item.side === "right" ? "text-right" : ""}`}
                    >
                      <p className="font-semibold text-sm">{item.speaker}</p>
                      <p className="text-[11px] text-white/40">
                        {item.active ? "Now Practicing" : "Conversation"}
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="w-7 h-7 rounded-md bg-white/10! hover:bg-white/20! transition text-xs"
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`mt-3 rounded-lg p-3 text-sm leading-6 transition-all ${
                      item.active
                        ? "bg-indigo-400/10 border border-indigo-400/30"
                        : "bg-white/5"
                    }`}
                  >
                    {item.text}
                  </div>

                  {/* Expand Content */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? "max-h-48 opacity-100 mt-3"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Buttons */}
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 rounded-lg bg-white/10! hover:bg-white/20 h-9 text-sm! transition">
                          🔊 Listen
                        </button>

                        <button className="flex-1 rounded-lg bg-emerald-500! hover:bg-emerald-400 h-9 text-sm! transition font-medium">
                          🎤 Try Speaking
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={bottomRef} />

        {/* Next */}
        {visibleCount < conversation.length ? (
          <button
            onClick={() => {
              setVisibleCount((v) => v + 1);
              setExpandedId(visibleCount + 1);
            }}
            className="w-full mt-8 py-3! rounded-2xl bg-white/10! hover:bg-white/20! transition font-medium"
          >
            💬 Show Next Message
          </button>
        ) : (
          <button className="w-full mt-8 py-3! rounded-2xl bg-indigo-500! hover:bg-indigo-400! transition font-semibold">
            Continue →
          </button>
        )}

        {/* Vocabulary */}

        {/* <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-semibold">📚 New Vocabulary</h3>

          <div className="flex flex-wrap gap-2 mt-4">
            {["pretty", "yourself", "luck", "study"].map((word) => (
              <span
                key={word}
                className="px-4 py-2 rounded-full bg-indigo-500/20 text-sm"
              >
                {word}
              </span>
            ))}
          </div>
        </div> */}

        {/* Continue */}

        {/* <button className="w-full mt-8 py-3! rounded-2xl bg-indigo-500! hover:bg-indigo-400! transition font-semibold">
          Continue →
        </button> */}
      </div>
    </section>
  );
}
