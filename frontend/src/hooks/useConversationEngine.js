// hooks/useConversationEngine.js
import { streamChat } from "../services/chatService";

export default function useConversationEngine({
  sessionIdRef,
  scenarioRef,
  modeRef,
  setChatHistory,
  speakText,

  onRoleplayCompleted,
  onPhaseCompleted, // ⭐ NEW
}) {
  const sendTextToBackend = async (text) => {
    console.log("🚀 SEND TEXT:", text);
    console.log("📌 MODE:", modeRef.current);
    console.log("📌 SESSION:", sessionIdRef.current);
    console.log("📌 SCENARIO:", scenarioRef.current);

    await streamChat({
      text,
      sessionId: sessionIdRef.current,
      scenarioId: scenarioRef.current?.id ?? 0,
      mode: modeRef.current,

      // =========================
      // USER MESSAGE
      // =========================
      onUserMessage: (msg) => {
        console.log("👤 USER MESSAGE TRIGGERED:", msg);

        setChatHistory((prev) => {
          const updated = [...prev, { sender: "You", text: msg }];
          console.log("🧠 CHAT STATE AFTER USER:", updated);
          return updated;
        });
      },

      // =========================
      // STREAMING TOKEN
      // =========================
      onStreamUpdate: (aiText) => {
        console.log("🤖 STREAM TOKEN:", aiText);

        setChatHistory((prev) => {
          const last = prev[prev.length - 1];

          let updated;

          if (last?.sender === "AI-temp") {
            updated = [
              ...prev.slice(0, -1),
              { sender: "AI-temp", text: aiText },
            ];
          } else {
            updated = [...prev, { sender: "AI-temp", text: aiText }];
          }

          console.log("🧠 CHAT STATE STREAM:", updated);
          return updated;
        });
      },

      // =========================
      // META EVENT
      // =========================
      onMeta: (meta) => {
        console.log("📊 META RECEIVED:", meta);

        if (meta?.ready) {
          console.log("✅ PHASE READY:", meta.phase);
          onPhaseCompleted?.(meta.phase);
        }
      },

      // =========================
      // FINAL ANSWER
      // =========================
      onStreamEnd: async (finalText, meta) => {
        console.log("✅ FINAL AI TEXT:", finalText);
        console.log("🏁 META END:", meta);

        setChatHistory((prev) => {
          const updated = prev.map((c) =>
            c.sender === "AI-temp" ? { sender: "AI", text: finalText } : c,
          );

          console.log("🧠 CHAT STATE FINAL:", updated);
          return updated;
        });

        speakText(finalText);

        if (meta?.completed && scenarioRef.current?.id > 0) {
          console.log("🎭 ROLEPLAY COMPLETED");
          onRoleplayCompleted?.(finalText);
        }
      },
    });
  };

  return {
    sendTextToBackend,
  };
}
