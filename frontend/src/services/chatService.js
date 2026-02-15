import { linkBackend } from "../config";

export async function streamChat({
  text,
  sessionId,
  scenarioId = 0, // 👈 tambah ini
  onUserMessage,
  onStreamUpdate,
  onStreamEnd,
}) {
  console.log("🚀 SEND TO AI:", text);

  // 1️⃣ kirim user message ke caller
  onUserMessage(text);

  // 2️⃣ POST streaming ke backend
  const res = await fetch(`${linkBackend}/stream_answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      input: text,
      scenario_id: scenarioId, // 🔥 INI YANG PENTING
    }),
  });

  if (!res.body) {
    throw new Error("No response body from server");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let aiText = "";

  // 3️⃣ baca stream token demi token
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    aiText += chunk.replace(/^data:\s*/gm, "");

    // kirim update stream ke caller
    onStreamUpdate(aiText);
  }

  // 4️⃣ kirim hasil final ke caller
  onStreamEnd(aiText);
}
