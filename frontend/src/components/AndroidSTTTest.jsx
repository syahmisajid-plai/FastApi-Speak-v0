import { useEffect, useRef, useState } from "react";

export default function AndroidSTTTest() {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const createRecognition = () => {
    if (!SpeechRecognition) {
      alert("SpeechRecognition not supported");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      console.log("🎤 START");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript;
      }

      console.log("📝 RESULT:", finalText);
      setText(finalText);
    };

    recognition.onerror = (e) => {
      console.log("🔥 ERROR:", e.error);
    };

    recognition.onend = () => {
      console.log("🔚 END");
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const start = () => {
    console.log("▶ START CLICKED");

    try {
      const recognition = recognitionRef.current || createRecognition();

      setTimeout(() => {
        try {
          recognition.start();
        } catch (e) {
          console.log("❌ START FAILED:", e);
        }
      }, 400);
    } catch (e) {
      console.log("❌ CREATE FAILED:", e);
    }
  };

  const stop = () => {
    console.log("⛔ STOP CLICKED");

    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.log("❌ STOP FAILED:", e);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Android STT Test</h2>

      <button onClick={start} style={{ marginRight: 10 }}>
        Start
      </button>

      <button onClick={stop}>Stop</button>

      <p>Status: {isListening ? "Listening 🎤" : "Idle ⛔"}</p>

      <p>Result:</p>
      <div style={{ fontSize: 18, marginTop: 10 }}>{text}</div>
    </div>
  );
}
