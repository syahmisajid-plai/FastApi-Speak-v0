import { useState, useEffect, useRef } from "react";
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

  const [isLoading, setIsLoading] = useState(false);
  const isGeneratingRef = useRef(false);

  const chatHistoryRef = useRef([]);

  // =========================
  // SYNC CHAT REF
  // =========================
  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  // =========================
  // SYNC SCENARIO REF
  // =========================
  useEffect(() => {
    scenarioRef.current = selectedScenario;
  }, [selectedScenario]);

  // =========================
  // EXIT ROLEPLAY
  // =========================
  const exitRoleplay = async () => {
    if (scenarioRef.current) {
      await clearRoleplay(scenarioRef.current.id);
    }

    setSelectedScenario(null);
    setChatHistory([]);
  };

  // =========================
  // GENERATE SCENARIO
  // =========================
  const generateScenario = async (difficulty = "easy") => {
    try {
      setIsLoading(true);

      const res = await fetch(
        `${linkBackend}/roleplay/generate?difficulty=${difficulty}`,
      );

      const data = await res.json();

      if (!res.ok || !data.scenario_id) {
        console.error("❌ INVALID GENERATE RESPONSE:", data);
        return null;
      }

      return {
        id: Number(data.scenario_id),
        name: data.theme ?? "",
        category: data.category ?? "",
        difficulty: data.difficulty ?? "",
        user_role: data.user_role ?? "",
        ai_role: data.ai_role ?? "",
        situation: data.situation ?? "",
        goal: data.goal ?? "",
        target_turn: data.target_turn ?? 0,
        // 🔥 UBAH DI SINI
        checklist: (data.checklist ?? []).map((item) => ({
          step_key: item.step_key,
          description: item.description,
          step_order: item.step_order,
          keywords: item.keywords ?? [],
          done: false, // 👈 ini penting untuk UI checklist
        })),
      };
    } catch (err) {
      console.error("❌ generateScenario error", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // START ROLEPLAY
  // =========================
  const startRoleplay = async (scenario) => {
    try {
      if (!scenario?.id) {
        console.error("❌ scenario.id INVALID:", scenario);
        return;
      }

      const res = await fetch(`${linkBackend}/roleplay/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          scenario_id: scenario.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ START FAILED:", data);
        return;
      }

      // ✅ initial AI message
      setChatHistory([
        {
          sender: "AI",
          text: `Hi! I'm your ${scenario.ai_role}. ${scenario.situation}`,
        },
      ]);
    } catch (err) {
      console.error("❌ startRoleplay error", err);
    }
  };

  // =========================
  // CLEAR ROLEPLAY
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
    } catch (err) {
      console.error("❌ clearRoleplay error", err);
    }
  };

  // =========================
  // SELECT SCENARIO
  // =========================
  const selectScenario = async (difficulty = "easy") => {
    if (isGeneratingRef.current) return null;
    isGeneratingRef.current = true;

    const scenario = await generateScenario(difficulty);

    if (!scenario) {
      isGeneratingRef.current = false;
      return null;
    }

    if (scenarioRef.current) {
      await clearRoleplay(scenarioRef.current.id);
    }

    setSelectedScenario(scenario);
    await startRoleplay(scenario);

    isGeneratingRef.current = false;

    return scenario;
  };

  // =========================
  // COMPLETED (dipanggil dari ConversationEngine)
  // =========================
  const handleRoleplayCompleted = async (finalText) => {
    const totalTurns = chatHistoryRef.current.filter(
      (c) => c.sender === "You",
    ).length;

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
  // CLOSE SUMMARY
  // =========================
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
    // state
    selectedScenario,
    chatHistory,
    isLoading,
    showSummary,
    summaryData,

    // actions
    selectScenario,
    closeSummary,
    exitRoleplay,

    // 🔥 expose ke engine
    handleRoleplayCompleted,
  };
}
