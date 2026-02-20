export default function RoleplaySummaryCard({ data, onClose }) {
  if (!data) return null; // aman jika data belum siap

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center relative">
      {/* Tombol X */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4">Roleplay Summary</h2>
      <p>
        <strong>Total Turns:</strong> {data.totalTurns}
      </p>
      <p>
        <strong>Last Message:</strong> {data.lastMessage}
      </p>
      <p>
        <strong>Duration:</strong> {data.duration}
      </p>
    </div>
  );
}
