export default function ModeSelector({ mode, setMode }) {
  const modes = [
    { key: "freeTalk", icon: "💬", label: "Talk" },
    { key: "dailyStory", icon: "📖", label: "Story" },
    { key: "roleplay", icon: "🎭", label: "Roleplay" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-center z-40 px-4">
      <div
        className="
        w-full max-w-md
        flex
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-lg
        p-1
      "
      >
        {modes.map((m) => {
          const active = mode === m.key;

          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`
                flex-1
                flex flex-col items-center justify-center
                py-2
                rounded-xl
                transition-all duration-200
                ${
                  active
                    ? "bg-white text-slate-900 shadow-md scale-105"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <div className="text-lg">{m.icon}</div>
              <span className="text-[11px] font-medium">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
