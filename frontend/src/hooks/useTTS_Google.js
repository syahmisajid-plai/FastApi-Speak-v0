export default function useTTS() {
  const speakText = async (text) => {
    console.log("🔊 speakText (backend TTS) called:", {
      text,
      textLength: text?.length,
    });

    if (!text) {
      console.warn("⛔ speakText aborted: NO_TEXT");
      return;
    }

    try {
      // 1️⃣ Request TTS dari backend
      const res = await fetch("http://127.0.0.1:8000/tts-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        console.error("❌ TTS backend failed:", res.statusText);
        return;
      }

      // 2️⃣ Convert response ke blob
      const audioBlob = await res.blob();

      // 3️⃣ Buat object URL
      const audioUrl = URL.createObjectURL(audioBlob);

      // 4️⃣ Play audio
      const audio = new Audio(audioUrl);
      audio.play();

      // 5️⃣ Cleanup object URL setelah selesai
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (err) {
      console.error("❌ speakText error:", err);
    }
  };

  return { speakText };
}
