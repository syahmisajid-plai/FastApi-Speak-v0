import { useState, useRef } from "react";

export default function SimpleSTT() {
  const recognitionRef = useRef(null);

  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("id-ID");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const start = () => {
    console.log("========== STARTT BUTTON CLICK ==========");
    console.log("User Agent:", navigator.userAgent);
    console.log("Protocol:", window.location.protocol);
    console.log("Host:", window.location.host);

    if (!SpeechRecognition) {
      console.log("❌ SpeechRecognition NOT SUPPORTED");
      alert("Browser tidak support SpeechRecognition");
      return;
    }

    console.log("✅ SpeechRecognition Supported");

    try {
      const recognition = new SpeechRecognition();

      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.continuous = false;

      console.log("Language:", recognition.lang);
      console.log("interimResults:", recognition.interimResults);
      console.log("continuous:", recognition.continuous);

      const logTime = (label) => {
        console.log(`[${new Date().toLocaleTimeString()}] ${label}`);
      };

      recognition.onstart = () => {
        logTime("🎤 onstart triggered");
        setListening(true);
      };

      recognition.onaudiostart = () => {
        logTime("🔊 Audio capturing started");
      };

      recognition.onsoundstart = () => {
        logTime("📢 Sound detected");
      };

      recognition.onspeechstart = () => {
        logTime("🗣️ Speech detected");
      };

      recognition.onresult = (e) => {
        logTime("✅ onresult triggered");

        let result = "";

        for (let i = e.resultIndex; i < e.results.length; i++) {
          result += e.results[i][0].transcript;
        }

        console.log("📝 RESULT:", result);

        setText(result);
      };

      recognition.onerror = (e) => {
        logTime(`❌ ERROR: ${e.error}`);
      };

      recognition.onspeechend = () => {
        logTime("🛑 Speech ended");
      };

      recognition.onsoundend = () => {
        logTime("🔇 Sound ended");
      };

      recognition.onaudioend = () => {
        logTime("🎧 Audio capture ended");
      };

      recognition.onend = () => {
        logTime("⛔ Recognition ended");
        setListening(false);
      };

      recognitionRef.current = recognition;

      console.log("🚀 Calling recognition.start()");

      recognition.start();
    } catch (err) {
      console.log("🔥 FAILED TO START STT");
      console.log(err);
    }
  };

  const stop = () => {
    console.log("========== STOP BUTTON CLICK ==========");
    recognitionRef.current?.stop();
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Simple 6 STT Debug</h3>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setLang("en-GB")}>🇬🇧 EN-GB</button>

        <button onClick={() => setLang("en-US")} style={{ marginLeft: 8 }}>
          🇺🇸 EN-US
        </button>

        <button onClick={() => setLang("id-ID")} style={{ marginLeft: 8 }}>
          🇮🇩 ID
        </button>
      </div>

      <p>
        Language: <b>{lang}</b>
      </p>

      <button onClick={start} disabled={listening}>
        Start
      </button>

      <button onClick={stop} style={{ marginLeft: 10 }}>
        Stop
      </button>

      <p>Status: {listening ? "Listening..." : "Idle"}</p>

      <h4>Result:</h4>
      <p>{text}</p>
    </div>
  );
}