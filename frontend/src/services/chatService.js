// services/chatService.js
import { linkBackend } from "../config";

export async function streamChat({
  text,
  sessionId,
  scenarioId = 0,
  mode = "roleplay",

  onUserMessage,
  onStreamUpdate,
  onStreamEnd,
  onMeta, // ⭐ NEW
}) {
  console.log("🚀 SEND TO AI:", text);

  onUserMessage(text);

  let endpoint = "";

  if (mode === "roleplay") endpoint = "/roleplay/stream_answer";
  if (mode === "dailyStory") endpoint = "/daily-story/stream_answer";
  if (mode === "freeTalk") endpoint = "/roleplay/stream_answer";

  const res = await fetch(`${linkBackend}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      input: text,
      scenario_id: scenarioId,
    }),
  });

  // ⭐ detect non-stream response
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();

    onStreamUpdate(data.text);
    onStreamEnd(data.text);

    onMeta?.({
      phase: data.phase,
      ready: data.ready,
      completed: data.completed,
    });

    return;
  }

  if (!res.body) {
    throw new Error("No response body from server");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let aiText = "";
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value);

    const events = buffer.split("\n\n");
    buffer = events.pop(); // sisa event belum selesai

    for (const event of events) {
      // =====================
      // META EVENT
      // =====================
      if (event.includes("event: meta")) {
        const json = event.split("data: ")[1];

        try {
          const meta = JSON.parse(json);
          onMeta?.(meta);
        } catch (e) {
          console.error("Meta parse error:", e);
        }

        continue;
      }

      // =====================
      // NORMAL TOKEN STREAM
      // =====================
      // const cleanChunk = event.replace(/^data:\s*/gm, "");
      const cleanChunk = event.replace(/^data:\s*/gm, "").trim();

      if (!cleanChunk) continue;

      if (cleanChunk.includes("__ROLEPLAY_END__")) {
        await reader.cancel();
        reader.releaseLock();

        onStreamEnd(aiText, { completed: true });
        return;
      }

      aiText += cleanChunk + " ";

      const formatted = aiText
        .replace(/\s+([.,!?])/g, "$1")
        .replace(/\s+([’'])/g, "$1")
        .replace(/([’'])\s+/g, "$1")
        .replace(/\s+/g, " ")
        .trim();

      onStreamUpdate(formatted);
    }
  }

  await reader.cancel();
  reader.releaseLock();

  const finalFormatted = aiText
    .replace(/\s+([.,!?])/g, "$1")
    .replace(/([’'])\s+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  onStreamEnd(finalFormatted);
}
