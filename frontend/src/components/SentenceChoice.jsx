import { useState } from "react";

import choiceSoundFile from "../assets/sound/universfield-game-level-complete-143022.mp3";

const sentenceTypes = [
  {
    id: "opinion",
    icon: "🧠",
    title: "Opinion",
    desc: "Express your thoughts",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "suggestion",
    icon: "💡",
    title: "Suggestion",
    desc: "Give recommendations",
    color: "from-yellow-400 to-orange-400",
  },
  {
    id: "asking",
    icon: "❓",
    title: "Asking",
    desc: "Ask questions properly",
    color: "from-sky-400 to-blue-500",
  },
  {
    id: "uncertainty",
    icon: "🌫️",
    title: "Uncertainty",
    desc: "Express doubt or unsure feelings",
    color: "from-gray-400 to-slate-600",
  },
  {
    id: "agreement",
    icon: "✅",
    title: "Agreement",
    desc: "Agree with someone",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "refusal",
    icon: "🚫",
    title: "Refusal",
    desc: "Say no politely",
    color: "from-red-400 to-rose-500",
  },
];

export default function SentenceChoice({
  onSelect,
  setModeLearn,
  setSentenceStage,
}) {
  const [loading, setLoading] = useState(null);

  const choiceSound = new Audio(choiceSoundFile);

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[400px] text-white px-6 py-8 mt-24">
      {/* HEADER */}
      <button
        onClick={() => {
          setModeLearn("idle");
          setSentenceStage("idle");
        }}
        className="
                  absolute top-2 left-6 z-20
                  flex items-center gap-2
                  px-2! py-1!
                  rounded-xl
                  bg-white/5!
                  hover:bg-white/10!
                  border border-white/10
                  text-white/70 hover:text-white
                  backdrop-blur-md
                  transition-all duration-200
                "
      >
        <span className="text-md">←</span>
      </button>
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold">Sentence Training</h2>
        <p className="text-white/40 text-sm mt-1">
          Choose the type of sentence you want to practice
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4">
        {sentenceTypes.map((type) => (
          <button
            key={type.id}
            onClick={async () => {
              choiceSound.currentTime = 0;
              await choiceSound.play().catch(() => {});

              if (loading) return;
              setLoading(type.id);

              try {
                await onSelect?.(type.id);
              } finally {
                setLoading(null);
              }
            }}
            className={`
              relative p-4! rounded-xl border border-white/10
              bg-white/5! hover:bg-white/10!
              transition-all duration-200
              overflow-hidden
            `}
          >
            {/* gradient glow */}
            <div
              className={`absolute inset-0 opacity-10 bg-gradient-to-br ${type.color}`}
            />

            {/* content */}
            <div className="relative flex flex-col items-start text-left">
              <div className="text-2xl mb-2">
                {loading === type.id ? "⏳" : type.icon}
              </div>

              <div className="font-semibold">{type.title}</div>

              <div className="text-xs text-white/50 mt-1">{type.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
