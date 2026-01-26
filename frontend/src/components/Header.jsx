export default function Header({ streak }) {
  return (
    <header className="text-center space-y-1">
      <h1 className="text-2xl font-bold text-amber-100">
        🦦 <br /> SpeakEasy
      </h1>

      <p className="text-sm text-gray-400">Practice your English speaking!</p>

      {/* 🔥 STREAK */}
      <p className="text-sm text-orange-400 font-semibold">
        🔥 Streak: {streak.current_streak} | Best: {streak.longest_streak}
      </p>

      {/* ⏳ PROGRESS */}
      <p className="text-sm text-gray-300">
        ⏳ Progress:{" "}
        {streak.chat_count >= 5 ? "Completed ✅" : `${streak.chat_count} / 5`}
      </p>
    </header>
  );
}
