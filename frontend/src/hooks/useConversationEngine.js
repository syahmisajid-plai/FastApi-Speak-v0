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
    await streamChat({
      text,
      sessionId: sessionIdRef.current,
      scenarioId: scenarioRef.current?.id ?? 0,
      mode: modeRef.current,

      // =========================
      // USER MESSAGE
      // =========================
      onUserMessage: (msg) => {
        setChatHistory((prev) => [...prev, { sender: "You", message: msg }]);
      },

      // =========================
      // STREAMING TOKEN
      // =========================
      onStreamUpdate: (aiText) => {
        setChatHistory((prev) => {
          const withoutTemp = prev.filter((c) => c.sender !== "AI-temp");

          return [...withoutTemp, { sender: "AI-temp", message: aiText }];
        });
      },

      // =========================
      // META EVENT (Daily Story)
      // =========================
      onMeta: (meta) => {
        if (meta?.completed) {
          onPhaseCompleted?.(meta.phase);
        }
      },

      // =========================
      // FINAL ANSWER
      // =========================
      onStreamEnd: async (finalText, meta) => {
        setChatHistory((prev) =>
          prev.map((c) =>
            c.sender === "AI-temp" ? { sender: "AI", message: finalText } : c,
          ),
        );

        speakText(finalText);

        // ⭐ hanya roleplay yang punya completion
        if (meta?.completed && scenarioRef.current?.id > 0) {
          onRoleplayCompleted?.(finalText);
        }
      },
    });
  };

  return {
    sendTextToBackend,
  };
}
