import { useState, useRef } from "react";

export default function SimpleSTT() {
  const recognitionRef = useRef(null);

  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en-GB");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const start = () => {
    if (!SpeechRecognition) {
      alert("Browser tidak support SpeechRecognition");
      return;
    }

    const recognition = new SpeechRecognition();

    // 🔥 pakai bahasa dari state
    recognition.lang = lang;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (e) => {
      let result = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        result += e.results[i][0].transcript;
      }
      setText(result);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stop = () => {
    recognitionRef.current?.stop();
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Simple STT</h3>

      {/* LANGUAGE BUTTONS */}
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

      {/* CONTROL */}
      <button onClick={start} disabled={listening}>
        Start
      </button>

      <button onClick={stop} style={{ marginLeft: 10 }}>
        Stop
      </button>

      <p>Status: {listening ? "Listening..." : "Idle"}</p>

      {/* RESULT */}
      <h4>Result:</h4>
      <p>{text}</p>
    </div>
  );
}
