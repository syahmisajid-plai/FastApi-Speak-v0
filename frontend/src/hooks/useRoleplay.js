import { useState, useEffect } from "react";
import { linkBackend } from "../config";

export default function useRoleplay({
  sessionIdRef,
  scenarioRef,
  chatHistory,
  setChatHistory,
}) {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // sync ref
  useEffect(() => {
    scenarioRef.current = selectedScenario;
  }, [selectedScenario]);

  // =========================
  // API HELPERS
  // =========================

  const clearRoleplay = async (scenarioId) => {
    try {
      await fetch(`${linkBackend}/roleplay/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          scenario_id: scenarioId,
        }),
      });

      console.log("🧹 Roleplay cleared");
    } catch (err) {
      console.error("❌ clearRoleplay error", err);
    }
  };

  const startRoleplay = async (scenario) => {
    try {
      await fetch(`${linkBackend}/roleplay/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          scenario_id: scenario.id,
        }),
      });

      console.log("🎯 Roleplay started:", scenario.name);
    } catch (err) {
      console.error("❌ startRoleplay error", err);
    }
  };

  // =========================
  // SELECT SCENARIO
  // =========================

  const selectScenario = async (scenario) => {
    const prevScenario = scenarioRef.current;

    // keluar roleplay
    if (!scenario && prevScenario) {
      await clearRoleplay(prevScenario.id);
    }

    // masuk roleplay baru
    if (scenario) {
      await startRoleplay(scenario);
    }

    setChatHistory([]);
    setSelectedScenario(scenario ?? null);
  };

  // =========================
  // ROLEPLAY COMPLETED
  // =========================

  const handleRoleplayCompleted = async (finalText) => {
    console.log("🏁 Roleplay finished");

    const totalTurns = chatHistory.filter((c) => c.sender === "You").length;

    setSummaryData({
      totalTurns,
      lastMessage: finalText,
      duration: "5m",
    });

    setShowSummary(true);

    const scenarioId = scenarioRef.current?.id;

    setSelectedScenario(null);
    setChatHistory([]);

    if (scenarioId) {
      await clearRoleplay(scenarioId);
    }
  };

  // =========================
  // SUMMARY CONTROL
  // =========================

  const openSummary = (data) => {
    setSummaryData(data);
    setShowSummary(true);
  };

  const closeSummary = async () => {
    const scenarioId = scenarioRef.current?.id;

    setShowSummary(false);
    setSelectedScenario(null);
    setChatHistory([]);

    if (scenarioId) {
      await clearRoleplay(scenarioId);
    }
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
