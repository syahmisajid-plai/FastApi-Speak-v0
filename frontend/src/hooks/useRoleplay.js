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

  const [isLoading, setIsLoading] = useState(false);

  const exitRoleplay = async () => {
    if (scenarioRef.current) {
      await clearRoleplay(scenarioRef.current.id);
    }
    setSelectedScenario(null);
    setChatHistory([]);
  };

  // =========================
  // SYNC REF
  // =========================
  useEffect(() => {
    scenarioRef.current = selectedScenario;
  }, [selectedScenario]);

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

      const mapped = {
        id: data.scenario_id,
        name: data.theme,
        category: data.category,
        difficulty: data.difficulty,
        user_role: data.user_role,
        ai_role: data.ai_role,
        situation: data.situation,
        goal: data.goal,
        target_turn: data.target_turn,
        checklist: data.checklist,
      };

      return mapped;
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
      await fetch(`${linkBackend}/roleplay/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          scenario_id: scenario.id,
        }),
      });

      // 🔥 initial AI message
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
    const scenario = await generateScenario(difficulty);
    if (!scenario) return;

    // clear previous
    if (scenarioRef.current) {
      await clearRoleplay(scenarioRef.current.id);
    }

    setSelectedScenario(scenario);
    await startRoleplay(scenario);
  };

  // =========================
  // STREAM ANSWER (CORE 🔥)
  // =========================
  const sendMessage = async (input) => {
    const scenario = scenarioRef.current;
    if (!scenario) return;

    // add user message
    setChatHistory((prev) => [...prev, { sender: "You", text: input }]);

    try {
      const res = await fetch(`${linkBackend}/roleplay/stream_answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          scenario_id: scenario.id,
          input,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";

      setChatHistory((prev) => [...prev, { sender: "AI", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (let line of lines) {
          if (line.startsWith("data: ")) {
            const token = line.replace("data: ", "");

            // selesai
            if (token === "__ROLEPLAY_END__") {
              handleRoleplayCompleted(fullText);
              return;
            }

            fullText += token;

            // realtime update AI message
            setChatHistory((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].text += token;
              return updated;
            });
          }
        }
      }
    } catch (err) {
      console.error("❌ stream error", err);
    }
  };

  // =========================
  // COMPLETED
  // =========================
  const handleRoleplayCompleted = async (finalText) => {
    const chatHistoryRef = useRef([]);

    useEffect(() => {
      chatHistoryRef.current = chatHistory;
    }, [chatHistory]);

    const totalTurns = chatHistoryRef.filter((c) => c.sender === "You").length;

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
    sendMessage,
    closeSummary,
    exitRoleplay,
  };
}
