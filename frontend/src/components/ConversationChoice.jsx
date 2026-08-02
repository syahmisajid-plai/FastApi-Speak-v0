import { useState } from "react";

export default function ConversationChoice({
  conversationProps,
  setModeLearn,
  setConversationStage,
  setSelectedTopicConversationId,
}) {
  const { loading, topics, getConversation } = conversationProps;

  const ITEMS_PER_PAGE = 3;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(topics.length / ITEMS_PER_PAGE);

  const currentTopics = topics.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const cardStyles = [
    {
      bg: "from-sky-500/10 to-white/5",
      border: "border-sky-500/20 hover:border-sky-400/40",
      icon: "bg-sky-500/20 border-sky-400/20",
    },
    {
      bg: "from-emerald-500/10 to-white/5",
      border: "border-emerald-500/20 hover:border-emerald-400/40",
      icon: "bg-emerald-500/20 border-emerald-400/20",
    },
    {
      bg: "from-orange-500/10 to-white/5",
      border: "border-orange-500/20 hover:border-orange-400/40",
      icon: "bg-orange-500/20 border-orange-400/20",
    },
    {
      bg: "from-violet-500/10 to-white/5",
      border: "border-violet-500/20 hover:border-violet-400/40",
      icon: "bg-violet-500/20 border-violet-400/20",
    },
  ];

  const handleSelect = async (topicId) => {
    setSelectedTopicConversationId(topicId);
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

      {loading && (
        <div className="text-center text-white/60 py-10">
          Loading conversations...
        </div>
      )}

      {!loading && (
        <>
          <div className="space-y-3">
            {currentTopics.map((topic, index) => {
              const style = cardStyles[index % cardStyles.length];
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelect(topic.id)}
                  className={`group w-full rounded-2xl border
                    ${style.border}
                    bg-gradient-to-br ${style.bg}
                    p-4! transition-all duration-300`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 shrink-0 rounded-xl border
                        flex items-center justify-center text-2xl
                        ${style.icon}`}
                      >
                        🎧
                      </div>

                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm font-semibold">{topic.title}</p>

                        <p className="text-xs text-white/50 mt-1">
                          {topic.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-2">
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

                    <span className="shrink-0 text-white/30 text-lg group-hover:translate-x-1 transition">
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg bg-white/10 disabled:opacity-40"
              >
                ←
              </button>

              <span className="text-sm text-white/70">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg bg-white/10 disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
