import { useState, useRef, useEffect } from "react";
import { linkBackend } from "../config";

export default function useRoleplay({
  sessionIdRef,
  scenarioRef,
  chatHistory,
  setChatHistory,
}) {
  // ================== STATE ==================

  const [selectedScenario, setSelectedScenario] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    scenarioRef.current = selectedScenario;
  }, [selectedScenario]);

  // ================== SELECT SCENARIO ==================
  const selectScenario = async (scenario) => {
    const prevScenario = scenarioRef.current;

    try {
      // 🧹 keluar roleplay
      if (scenario === null && prevScenario) {
        await fetch(`${linkBackend}/roleplay/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionIdRef.current,
            scenario_id: prevScenario.id,
          }),
        });

        console.log("🧹 Roleplay cleared");
      }

      // ⭐ masuk roleplay baru
      if (scenario) {
        await fetch(`${linkBackend}/roleplay/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionIdRef.current,
            scenario_id: scenario.id,
          }),
        });

        console.log("🎯 Roleplay started:", scenario.name);
      }

      // ⭐ UPDATE REF (INI YANG PENTING)
      scenarioRef.current = scenario ?? null;

      // reset UI
      setChatHistory([]);
      setSelectedScenario(scenario ?? null);
    } catch (err) {
      console.error("❌ Roleplay error:", err);
    }
  };

  // ================== SHOW SUMMARY ==================
  const openSummary = (data) => {
    setSummaryData(data);
    setShowSummary(true);
  };

  // ================== CLOSE SUMMARY ==================
  const closeSummary = async () => {
    try {
      setShowSummary(false);
      setChatHistory([]);
      setSelectedScenario(null);

      await fetch(`${linkBackend}/roleplay/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          scenario_id: scenarioRef.current?.id ?? 0,
        }),
      });
    } catch (err) {
      console.error("❌ Failed to clear roleplay", err);
    }
  };

  const handleRoleplayCompleted = async (finalText) => {
    console.log("🏁 Roleplay finished");

    const totalTurns = chatHistory.filter((c) => c.sender === "You").length;

    setSummaryData({
      totalTurns,
      lastMessage: finalText,
      duration: "5m",
    });

    setShowSummary(true);

    setChatHistory([]);
    setSelectedScenario(null);

    await fetch(`${linkBackend}/roleplay/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionIdRef.current,
        scenario_id: scenarioRef.current.id,
      }),
    });
  };

  return {
    selectedScenario,

    selectScenario,

    showSummary,
    summaryData,

    openSummary,
    closeSummary,

    handleRoleplayCompleted,
  };
}
