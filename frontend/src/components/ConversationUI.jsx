import { useEffect, useRef, useState } from "react";

export default function ConversationUI({ setConversationStage }) {
  const [expandedId, setExpandedId] = useState(1);
  const [visibleCount, setVisibleCount] = useState(1);

  const bottomRef = useRef(null);

  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({
  //     behavior: "smooth",
  //   });
  // }, [visibleCount]);

  const conversation = [
    {
      id: 1,
      speaker: "A",
      avatar: "🟦",
      side: "left",
      text: "Hi, how are you doing?",
    },
    {
      id: 2,
      speaker: "B",
      avatar: "🟨",
      side: "right",
      text: "I'm fine. How about yourself?",
    },
    {
      id: 3,
      speaker: "A",
      avatar: "🟦",
      side: "left",
      text: "I'm pretty good. Thanks for asking.",
    },
    {
      id: 4,
      speaker: "B",
      avatar: "🟨",
      side: "right",
      text: "No problem. So how have you been?",
    },
    {
      id: 5,
      speaker: "A",
      avatar: "🟦",
      side: "left",
      text: "I've been great. What about you?",
    },
    {
      id: 6,
      speaker: "B",
      avatar: "🟨",
      side: "right",
      text: "I've been good. I'm in school right now.",
    },
    {
      id: 7,
      speaker: "A",
      avatar: "🟦",
      side: "left",
      text: "What school do you go to?",
    },
    {
      id: 8,
      speaker: "B",
      avatar: "🟨",
      side: "right",
      text: "I go to PCC.",
    },
    {
      id: 9,
      speaker: "A",
      avatar: "🟦",
      side: "left",
      text: "Do you like it there?",
    },
    {
      id: 10,
      speaker: "B",
      avatar: "🟨",
      side: "right",
      text: "It's okay. It's a really big campus.",
    },
    {
      id: 11,
      speaker: "A",
      avatar: "🟦",
      side: "left",
      text: "Good luck with school.",
    },
    {
      id: 12,
      speaker: "B",
      avatar: "🟨",
      side: "right",
      text: "Thank you very much.",
    },
  ];

  return (
    <section className="max-w-md mx-auto mt-32 text-white rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-indigo-900/70 backdrop-blur-xl shadow-xl overflow-hidden">
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
            const isActive = item.id === visibleCount;

            return (
              <div
                key={item.id}
                className={`flex ${
                  item.side === "right" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-500`}
              >
                <div
                  className={`w-full ${
                    isActive ? "max-w-[72%]" : "max-w-[60%]"
                  } rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "border border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                      : "bg-white/5"
                  }`}
                >
                  <div className={`${isActive ? "p-3" : "px-3 py-2"}`}>
                    {/* Speaker */}
                    <div
                      className={`flex items-center gap-2 ${
                        item.side === "right" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className={isActive ? "text-xl" : "text-base"}>
                        {item.avatar}
                      </div>

                      <div
                        className={`flex-1 ${
                          item.side === "right" ? "text-right" : ""
                        }`}
                      >
                        <p
                          className={`font-medium ${
                            isActive ? "text-sm" : "text-xs"
                          }`}
                        >
                          {item.speaker}
                        </p>

                        <p className="text-[11px] text-white/45">
                          {isActive ? "🎤 Now Practicing" : "✓ Completed"}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : item.id)
                        }
                        className={`rounded-md bg-white/10! hover:bg-white/20! transition ${
                          isActive ? "w-7 h-7 text-xs!" : "w-6 h-6 text-[10px]!"
                        }`}
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </div>

                    {/* Bubble */}
                    <div
                      className={`rounded-xl text-sm transition-all ${
                        isActive
                          ? "mt-3 p-3 bg-indigo-400/10 border border-indigo-400/30 leading-6"
                          : "mt-2 px-3 py-2 bg-white/5 text-white/75 leading-5"
                      }`}
                    >
                      {item.text}
                    </div>

                    {/* Expand */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isExpanded
                          ? "max-h-56 opacity-100 mt-3"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="flex gap-2">
                        <button className="flex-1 h-9 rounded-lg bg-white/10! hover:bg-white/20! transition text-sm!">
                          🔊 {isActive ? "Listen" : ""}
                        </button>

                        <button
                          className={`flex-1 h-9 rounded-lg transition text-sm! font-medium ${
                            isActive
                              ? "bg-emerald-500! hover:bg-emerald-400!"
                              : "bg-indigo-500! hover:bg-indigo-400!"
                          }`}
                        >
                          🎤 {isActive ? "Try" : ""}
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
            Continue Conversation →
          </button>
        ) : (
          <button className="w-full mt-8 py-3! rounded-2xl bg-indigo-500! hover:bg-indigo-400! transition font-semibold">
            Continue →
          </button>
        )}

        {/* Vocabulary */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
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
        </div>

        {/* Continue */}

        {/* <button className="w-full mt-8 py-3! rounded-2xl bg-indigo-500! hover:bg-indigo-400! transition font-semibold">
          Continue →
        </button> */}
      </div>
    </section>
  );
}
