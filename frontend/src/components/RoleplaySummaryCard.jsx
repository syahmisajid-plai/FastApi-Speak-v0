import { useState } from "react";

export default function RoleplaySummaryCard({ data, onClose }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!data) return null;

  return (
    <div className="relative w-80 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl p-5 overflow-hidden">
      {/* Glow decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        ✕
      </button>

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold">🎭 Roleplay Summary</h2>
        <p className="text-xs text-white/60 mt-1">
          Session overview & performance
        </p>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center mb-4">
        <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
          ✅ Completed
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 text-sm mb-4">
        <div className="flex justify-between items-center bg-white/5 rounded-lg p-3 border border-white/10">
          <span className="text-white/60">Total Turns</span>
          <span className="font-semibold">{data.totalTurns}</span>
        </div>

        <div className="flex justify-between items-center bg-white/5 rounded-lg p-3 border border-white/10">
          <span className="text-white/60">Duration</span>
          <span className="font-semibold">{data.duration}</span>
        </div>

        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-white/60 text-xs mb-1">Last Message</p>
          <p className="text-sm leading-snug line-clamp-3">
            {data.lastMessage}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>Progress</span>
          <span>100%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
        </div>
      </div>

      {/* Toggle Advance Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center gap-1 text-xs text-white/70 hover:text-white transition mb-3"
      >
        <span>Advance Details</span>
        <span
          className={`transition-transform duration-300 ${
            showDetails ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Learning Insights */}
      {showDetails && (
        <div className="space-y-3 mb-4">
          {/* Feedback */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/60 mb-1">🧠 Feedback</p>
            <p className="text-sm leading-snug">
              You communicated clearly, but some of your sentences were too
              direct. Try using more polite and complete expressions.
            </p>
          </div>

          {/* Suggested Improvement */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/60 mb-1">
              ✨ Suggested Improvement
            </p>
            <p className="text-sm leading-snug">
              Instead of:{" "}
              <span className="text-red-300">"I want food chicken"</span>
              <br />
              Try:{" "}
              <span className="text-green-300">
                "I’d like to order chicken."
              </span>
            </p>
          </div>

          {/* Useful Phrases */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/60 mb-1">💬 Useful Phrases</p>
            <ul className="text-sm space-y-1">
              <li>• I’d like to...</li>
              <li>• Could you recommend...?</li>
              <li>• What do you suggest?</li>
              <li>• How much is it?</li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer Action */}
      <div className="mt-5 pt-4 border-t border-white/10 flex justify-center">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-white/10 text-white border border-white/20 
                     hover:bg-white/20 transition backdrop-blur-md"
        >
          Close
        </button>
      </div>
    </div>
  );
}
