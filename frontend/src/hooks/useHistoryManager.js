import { linkBackend } from "../config";

export default function useHistoryManager({
  sessionIdRef,
  setChatHistory,
  selectScenario,
}) {
  const clearAllHistory = async () => {
    const confirmClear = window.confirm("Hapus SEMUA chat history user ini?");

    if (!confirmClear) return;

    try {
      console.log("🧹 Clearing history for:", sessionIdRef.current);

      await fetch(`${linkBackend}/history/clear-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
        }),
      });

      await fetch(`${linkBackend}/roleplay/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          scenario_id: 0,
        }),
      });

      setChatHistory([]);
      selectScenario(null);

      console.log("✅ ALL history cleared");
    } catch (err) {
      console.error("❌ Failed clear all history", err);
    }
  };

  return { clearAllHistory };
}
