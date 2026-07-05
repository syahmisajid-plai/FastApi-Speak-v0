// useRoleplay.js

import { useState, useEffect, useRef } from "react";
import { linkBackend } from "../config";

export default function useRoleplay({
  sessionIdRef,
  scenarioRef,
  chatHistory,
  setChatHistory,
  checklistProgress,
  userId,
  activeChecklist,
}) {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const isGeneratingRef = useRef(false);

  const chatHistoryRef = useRef([]);

  const lastStepKeyRef = useRef(null);

  const [activeContext, setActiveContext] = useState(null);

  const pushNextStepToChat = (updatedChecklist) => {
    const nextStep = updatedChecklist.find((s) => !s.done);
    if (!nextStep) return;

    if (lastStepKeyRef.current === nextStep.step_key) return;
    lastStepKeyRef.current = nextStep.step_key;

    if (nextStep.context_type && nextStep.context_data) {
      setActiveContext({
        type: nextStep.context_type,
        data: nextStep.context_data,
        stepKey: nextStep.step_key,
      });
    }
  };

  // Checklist progress
  const maxTurn = selectedScenario?.target_turn ?? 0;
  const currentTurn = chatHistory.filter((msg) => msg.sender === "You").length;
  const handleChecklistFinished = (progress) => {
    handleRoleplayCompleted("Checklist completed", progress);
  };
  const handleChecklistUpdate = (updatedChecklist, currentStep) => {
    // console.log("📍 CURRENT STEP:", currentStep);

    pushNextStepToChat(updatedChecklist);
  };

  const resetContextState = () => {
    setActiveContext(null);
    lastStepKeyRef.current = null;
  };

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

    resetContextState(); // 🔥 TAMBAH INI

    setSelectedScenario(null);
    setChatHistory([]);
  };

  // =========================
  // GENERATE SCENARIO
  // =========================
  const generateScenario = async (category = "food") => {
    try {
      setIsLoading(true);

      const res = await fetch(
        `${linkBackend}/roleplay/generate?category=${category}`,
      );

      const data = await res.json();

      console.log("🔥 RAW DATA FROM BACKEND:", data);
      console.log("🔥 CHECKLIST RAW:", data.checklist);

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
          done: false,

          // ✅ tambahkan ini
          context_type: item.context_type ?? null,
          context_data: item.context_data ?? null,
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
          user_id: userId, // ✅ TAMBAH INI
          scenario_id: scenario.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ START FAILED:", data);
        return;
      }
    } catch (err) {
      console.error("❌ startRoleplay error", err);
    }
  };

  // =========================
  // Send Initial Message
  // =========================
  const sendInitialMessage = (scenario) => {
    if (!scenario) return;

    setChatHistory([
      {
        sender: "AI",
        message: `Hi! I'm your ${scenario.ai_role}. ${scenario.situation}`,
      },
    ]);
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
  const selectScenario = async (category = "food") => {
    if (isGeneratingRef.current) return null;
    isGeneratingRef.current = true;

    // 🔥 RESET DULU (INI KUNCI)
    resetContextState();

    const scenario = await generateScenario(category);

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
  const handleRoleplayCompleted = async (finalText, progressFromChild) => {
    const totalTurns = chatHistoryRef.current.filter(
      (c) => c.sender === "You",
    ).length;

    const progressSnapshot = {
      done: progressFromChild?.totalDone ?? 0,
      total: progressFromChild?.totalChecklist ?? 0,
    };

    setSummaryData({
      totalTurns,
      lastMessage: finalText,
      duration: "5m",
      checklistDone: progressSnapshot.done,
      checklistTotal: progressSnapshot.total,
    });

    setShowSummary(true);

    const scenarioId = scenarioRef.current?.id;

    // 🔥 RESET
    resetContextState();

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

    resetContextState(); // 🔥 TAMBAH INI
    setSelectedScenario(null);
    setChatHistory([]);

    if (scenarioId) {
      await clearRoleplay(scenarioId);
    }
  };

  const totalDone = activeChecklist?.filter((x) => x.done).length ?? 0;

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
    sendInitialMessage,

    // 🔥 expose ke engine
    handleRoleplayCompleted,

    // 🔥 TAMBAHKAN INI
    pushNextStepToChat,

    // 🔥 ini yang penting
    activeContext,

    handleChecklistFinished,
    handleChecklistUpdate,

    totalDone,
  };
}
