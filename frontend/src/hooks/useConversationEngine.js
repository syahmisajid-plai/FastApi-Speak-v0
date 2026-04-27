// hooks/useConversationEngine.js
import { streamChat } from "../services/chatService";

function cleanAIText(text) {
  return text
    .replace(/You could say:\s*"?[^"\n]+"?/i, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export default function useConversationEngine({
  sessionIdRef,
  userIdRef,
  scenarioRef,
  modeRef,
  setChatHistory,
  speakText,

  // grammarResult,

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
        const mode = modeRef.current?.toLowerCase();

        const isFreetalk = mode === "freetalk";
        const isDailyStory = mode === "dailystory";

        console.log("🧭 MODE RAW:", modeRef.current);
        console.log("🧭 MODE NORMALIZED:", mode);
        console.log("📖 isDailyStory:", isDailyStory);

        let alternative = null;

        if (isDailyStory) {
          alternative = meta?.alternative;
          console.log(
            " ========================= MODE DAILY =============================  🧠:",
            alternative,
          );
        }

        if (isFreetalk) {
          alternative = meta?.alternative;

          console.log(
            " ========================= MODE FREETALK =============================  🧠:",
            alternative,
          );
        }

        const cleanText = cleanAIText(finalText);

        const safeAlternative = isFreetalk
          ? alternative || "Nice 👍"
          : alternative;

        console.log("🧠 RAW:", finalText);
        console.log("🧾 FULL META:", meta);
        console.log("🧾 META alternative:", meta?.alternative);
        setChatHistory((prev) => {
          let alternativeAttached = false;

          return prev.map((c) => {
            if (c.sender === "AI-temp") {
              return {
                sender: "AI",
                message: cleanText,
              };
            }

            if (!alternativeAttached && c.sender === "You" && !c.alternative) {
              alternativeAttached = true;

              return {
                ...c,
                alternative: safeAlternative,
              };
            }

            return c;
          });
        });

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
