// hooks/useConversationEngine.js
import { streamChat } from "../services/chatService";
import { cleanAIText } from "../utils/textUtils";

export default function useConversationEngine({
  sessionIdRef,
  userIdRef,
  scenarioRef,
  modeRef,
  modeScenarioRef,
  setChatHistory,
  speakText,
  unlockAudio,

  // grammarResult,

  onRoleplayCompleted,
  onPhaseCompleted, // ⭐ NEW

  autoCorrectionRef,
}) {
  // console.log("🧭 mode:", modeRef.current);
  const sendTextToBackend = async (text) => {
    console.log(
      "📤 sendTextToBackend autoCorrectionRef:",
      autoCorrectionRef.current,
    );

    console.log("📤 ====== useConversationEngine.js =======");
    console.log("📤 SEND TEXT TRIGGERED");
    console.log("👤 userIdRef:", userIdRef);
    console.log("🆔 sessionId:", sessionIdRef.current);
    console.log("🎭 scenarioId:", scenarioRef.current?.id ?? 0);
    console.log("🧭 mode:", modeRef.current);
    console.log("🧭 modeScenario:", modeScenarioRef.current);

    const currentUserId = userIdRef.current;

    await unlockAudio();
    await streamChat({
      text,
      sessionId: sessionIdRef.current,
      userId: currentUserId,
      scenarioId: scenarioRef.current?.id ?? 0,
      mode: modeRef.current,
      modeScenario: modeScenarioRef.current, // ⭐ NEW

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
        const isDailyStory = modeScenarioRef.current === "dailystory";

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
                message: autoCorrectionRef.current
                  ? finalText
                  : cleanAIText(finalText),
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

        const ttsMessage = autoCorrectionRef.current
          ? finalText
          : cleanAIText(finalText);

        await speakText(ttsMessage);

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
