import { useState } from "react";

export default function WebSpeechDiagnostic() {
  const [logs, setLogs] = useState([]);
  const [category, setCategory] = useState("Belum dites");
  const [transcript, setTranscript] = useState("");

  const addLog = (msg) => {
    console.log(msg);

    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} ${msg}`,
    ]);
  };

  const testWebSpeech = () => {
    setLogs([]);
    setTranscript("");
    setCategory("Testing...");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    // ======================
    // CATEGORY A
    // ======================
    if (!SpeechRecognition) {
      addLog("❌ CATEGORY A - NOT SUPPORTED");

      setCategory(
        "A - Browser does not support Web Speech API"
      );

      return;
    }

    addLog("✅ Web Speech API Supported");

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    let gotResult = false;

    recognition.onstart = () => {
      addLog("🎤 onstart");
    };

    recognition.onaudiostart = () => {
      addLog("🔊 onaudiostart");
    };

    recognition.onspeechstart = () => {
      addLog("🗣 onspeechstart");
    };

    recognition.onresult = (event) => {
      gotResult = true;

      const text =
        event.results[0][0].transcript;

      setTranscript(text);

      addLog(`📝 onresult: ${text}`);

      // ======================
      // CATEGORY B
      // ======================
      setCategory(
        "B - Working (Web Speech is functioning)"
      );
    };

    recognition.onerror = (event) => {
      addLog(`❌ onerror: ${event.error}`);

      // ======================
      // CATEGORY C
      // ======================
      setCategory(
        `C - Error (${event.error})`
      );
    };

    recognition.onend = () => {
      addLog("⏹ onend");
    };

    try {
      recognition.start();

      addLog(
        "🚀 recognition.start() called"
      );

      setTimeout(() => {
        if (!gotResult) {
          addLog(
            "⚠️ No transcript received within 10 seconds"
          );

          // Jika belum masuk kategori C
          setCategory((prev) => {
            if (
              typeof prev === "string" &&
              prev.startsWith("C -")
            ) {
              return prev;
            }

            // ======================
            // CATEGORY D
            // ======================
            return "D - No Transcript";
          });
        }
      }, 10000);
    } catch (err) {
      addLog(
        `💥 Exception: ${err.message}`
      );

      setCategory(
        `C - Error (${err.message})`
      );
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Web Speech Diagnostic</h2>

      <button
        onClick={testWebSpeech}
        style={{
          padding: "10px 20px",
          marginBottom: 20,
        }}
      >
        🎤 Run Test
      </button>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 20,
        }}
      >
        <strong>Category:</strong>
        <br />
        {category}
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 20,
        }}
      >
        <strong>Transcript:</strong>
        <br />
        {transcript || "-"}
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 300,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        <strong>Logs</strong>
        <hr />

        {logs.length === 0
          ? "No logs yet"
          : logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
      </div>
    </div>
  );
}