// hooks/useConversationEngine.js
import { streamChat } from "../services/chatService";

export default function useConversationEngine({
  sessionIdRef,
  userIdRef,
  scenarioRef,
  modeRef,
  setChatHistory,
  speakText,

  onRoleplayCompleted,
  onPhaseCompleted, // ⭐ NEW
}) {
  const sendTextToBackend = async (text) => {
    console.log("📤 ====== useConversationEngine.js =======");
    console.log("📤 SEND TEXT TRIGGERED");
    console.log("👤 userIdRef:", userIdRef);
    console.log("🆔 sessionId:", sessionIdRef.current);
    console.log("🎭 scenarioId:", scenarioRef.current?.id ?? 0);
    console.log("🧭 mode:", modeRef.current);

    const currentUserId = userIdRef.current;

    await streamChat({
      text,
      sessionId: sessionIdRef.current,
      userId: currentUserId,
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
        console.log("META RECEIVED:", meta);

        if (meta?.ready) {
          console.log("CALLING onPhaseCompleted", meta.phase);
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
