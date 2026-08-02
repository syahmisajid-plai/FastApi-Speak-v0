import { useEffect, useRef, useState } from "react";

import cross from "../assets/children-cross-road.webp";

export default function ConversationUI({
  conversationProps,
  setConversationStage,
  selectedTopicConversationId,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const [listenedIds, setListenedIds] = useState([]);

  const [visibleCount, setVisibleCount] = useState(1);

  const bottomRef = useRef(null);

  const handleListen = async (item) => {
    await playAudio(item.audio_url);

    setListenedIds((prev) =>
      prev.includes(item.id) ? prev : [...prev, item.id],
    );
  };

  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({
  //     behavior: "smooth",
  //   });
  // }, [visibleCount]);

  // AUDIO CONVERSATION
  const audioRef = useRef(null);
  useEffect(() => {
    audioRef.current = new Audio();

    return () => {
      audioRef.current.pause();
    };
  }, []);

  const playAudio = (url) => {
    if (!url) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    audioRef.current.src = url;
    audioRef.current.play();
  };

  const { loading, topics, conversation } = conversationProps;

  const idTopic = selectedTopicConversationId - 1;

  useEffect(() => {
    if (sentences.length > 0) {
      setExpandedId(sentences[0].id);
    }
  }, [conversation]);
  // console.log(topics[idTopic]?.title);

  // console.log("topics", topics);
  if (loading) {
    return (
      <div className="text-center text-white mt-32">
        Loading conversation...
      </div>
    );
  }

  if (!conversation) return null;

  const sentences = conversation.sentences;

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
            <h2 className="font-semibold text-lg">{conversation.title}</h2>
            <p className="text-xs text-white/50">
              {conversation.cefr_level} • {conversation.estimated_minutes} min •{" "}
              {conversation.total_sentences} Sentences
            </p>
          </div>
        </div>

        {/* Listen Full */}
        <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5 text-center">
          <img
            src={cross}
            alt="Children crossing the road"
            className="mx-auto h-44 w-auto object-contain"
          />

          <h3 className="mt-4 text-lg font-semibold">
            {topics[idTopic]?.title}
          </h3>

          <p className="mt-2 text-xs text-white/60 max-w-xs mx-auto">
            {topics[idTopic]?.description}
          </p>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-white/50">
            <span>Conversation Progress</span>
            <span>
              {visibleCount} / {sentences.length}
            </span>
          </div>

          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-indigo-400 rounded-full"
              style={{
                width: `${(visibleCount / sentences.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Conversation */}
        <div className="mt-8 space-y-4">
          {sentences.slice(0, visibleCount).map((item, index) => {
            const isExpanded = expandedId === item.id;
            const isActive = index === visibleCount - 1;
            const isRight = item.speaker === "B";

            const hasListened = listenedIds.includes(item.id);

            const hasNextSentence = visibleCount < sentences.length;

            return (
              <div
                key={item.id}
                className={`flex ${
                  isRight ? "justify-end" : "justify-start"
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
                        isRight ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className={isActive ? "text-xl" : "text-base"}>
                        {item.speaker === "A" ? "🟦" : "🟨"}
                      </div>

                      <div className={`flex-1 ${isRight ? "text-right" : ""}`}>
                        <p
                          className={`font-medium ${
                            isActive ? "text-sm" : "text-xs"
                          }`}
                        >
                          {item.speaker_name}
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
                      {isActive ? (
                        <>
                          {/* Active sentence belum listen */}
                          {!hasListened ? (
                            <button
                              onClick={() => handleListen(item)}
                              className="w-full h-9 rounded-lg bg-white/10! hover:bg-white/20! transition text-sm!"
                            >
                              🔊 Listen
                            </button>
                          ) : (
                            <>
                              {/* Active sentence sudah listen */}
                              <button
                                onClick={() => handleListen(item)}
                                className="w-full h-9 rounded-lg bg-white/10! hover:bg-white/20! transition text-sm!"
                              >
                                🔊 Replay
                              </button>

                              <div className="flex gap-2 mt-2">
                                <button className="flex-1 h-9 rounded-lg bg-emerald-500! hover:bg-emerald-400! transition text-sm! font-medium">
                                  🎤 Try
                                </button>

                                {hasNextSentence ? (
                                  <button
                                    onClick={() => {
                                      const nextVisible = visibleCount + 1;

                                      setVisibleCount(nextVisible);

                                      const nextSentence =
                                        sentences[nextVisible - 1];

                                      if (nextSentence) {
                                        setExpandedId(nextSentence.id);

                                        setTimeout(() => {
                                          playAudio(nextSentence.audio_url);

                                          setListenedIds((prev) =>
                                            prev.includes(nextSentence.id)
                                              ? prev
                                              : [...prev, nextSentence.id],
                                          );
                                        }, 300);
                                      }
                                    }}
                                    className="flex-1 h-9 rounded-lg bg-indigo-500! hover:bg-indigo-400! transition text-sm! font-medium"
                                  >
                                    Continue →
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="flex-1 h-9 rounded-lg bg-white/10! text-white/60! cursor-default text-sm! font-medium"
                                  >
                                    Completed
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {/* History sentence hanya Replay */}
                          <button
                            onClick={() => handleListen(item)}
                            className="w-full h-9 rounded-lg bg-white/10! hover:bg-white/20! transition text-sm!"
                          >
                            🔊 Replay
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={bottomRef} />

        {/* Finish */}
        {visibleCount < sentences.length ? (
          <button
            disabled
            className="w-full mt-8 py-3! rounded-2xl bg-white/10! text-white/40! cursor-not-allowed transition font-medium"
          >
            🔒 Finish
          </button>
        ) : (
          <button
            onClick={() => {
              // lanjut ke halaman selesai / summary
              console.log("Conversation finished");
            }}
            className="w-full mt-8 py-3! rounded-2xl bg-indigo-500! hover:bg-indigo-400! transition font-semibold"
          >
            Finish ✓
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
