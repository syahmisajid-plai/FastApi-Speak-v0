export default function ConversationChoice({
  conversationProps,
  setModeLearn,
  setConversationStage,
}) {
  const { loading, topics, getConversation } = conversationProps;

  const handleSelect = async (topicId) => {
    const result = await getConversation(topicId);

    if (result) {
      setConversationStage("session");
    }
  };

  return (
    <section className="text-white max-w-md mx-auto min-h-25 mt-28 p-6 border border-white/10 backdrop-blur-xl rounded-3xl bg-linear-to-b from-slate-900/80 to-indigo-900/60 shadow-lg shadow-black/30">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            setConversationStage("idle");
            setModeLearn("idle");
          }}
          className="w-9 h-9 rounded-xl bg-white/10! hover:bg-white/15! transition"
        >
          ←
        </button>

        <div>
          <h2 className="font-semibold">Conversations</h2>
          <p className="text-xs text-white/60">Learn through real dialogues</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-white/60 py-10">
          Loading conversations...
        </div>
      )}

      {/* Topics */}
      {!loading && (
        <div className="space-y-3">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleSelect(topic.id)}
              className="group w-full rounded-2xl border border-orange-500/20
              bg-gradient-to-br from-orange-500/10 to-white/5
              p-4! hover:border-orange-400/40 hover:bg-white/10
              transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl
                    bg-orange-500/20 border border-orange-400/20
                    flex items-center justify-center text-2xl"
                  >
                    🎧
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold">{topic.title}</p>

                    <p className="text-xs text-white/50 mt-1">
                      {topic.description}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">
                        {topic.cefr_level}
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">
                        {topic.estimated_minutes} min
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">
                        {topic.total_sentences} Sentences
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-white/30 text-lg group-hover:translate-x-1 transition">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
