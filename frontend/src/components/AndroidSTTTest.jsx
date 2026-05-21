import { useState, useRef, useEffect } from "react";

export default function AndroidSTTTest() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const lastResultRef = useRef(Date.now());
  const intervalRef = useRef(null);

  const startListening = async () => {
    setError("");

    console.log("🟡 [STT] startListening triggered");

    // 🌐 ENVIRONMENT DEBUG (IMPORTANT FOR ANDROID BUGS)
    console.log("🌐 isSecureContext:", window.isSecureContext);
    console.log("🌐 protocol:", window.location.protocol);
    console.log("🌐 userAgent:", navigator.userAgent);
    console.log("🌐 mediaDevices:", !!navigator.mediaDevices);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    console.log("🟡 [STT] SpeechRecognition support:", !!SpeechRecognition);

    if (!SpeechRecognition) {
      const msg = "SpeechRecognition not supported";
      console.error("🔴 [STT]", msg);
      setError(msg);
      return;
    }

    try {
      console.log("🟡 [STT] Requesting microphone permission...");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log("🟢 [STT] Microphone permission GRANTED");
      console.log("🎤 audio tracks:", stream.getAudioTracks());

      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "id-ID";

      console.log("🟡 [STT] Recognition instance created", recognition);

      recognition.onstart = () => {
        console.log("🟢 [STT] recognition.onstart");
        setListening(true);
      };

      recognition.onspeechstart = () => {
        console.log("🟢 [STT] speech detected (onspeechstart)");
      };

      recognition.onspeechend = () => {
        console.log("🟠 [STT] speech ended (onspeechend)");
      };

      recognition.onsoundstart = () => {
        console.log("🟢 [STT] sound detected (onsoundstart)");
      };

      recognition.onsoundend = () => {
        console.log("🟠 [STT] sound ended (onsoundend)");
      };

      recognition.onresult = (event) => {
        console.log("🟡 [STT] onresult RAW EVENT:", event);

        lastResultRef.current = Date.now();

        const text = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join("");

        console.log("🟢 [STT] transcript:", text);

        setTranscript(text);
      };

      recognition.onerror = (event) => {
        console.error("🔴 [STT ERROR RAW EVENT]:", event);

        console.error("🔴 error type:", event?.error);
        console.error("🔴 error message:", event?.message);
        console.error("🔴 event type:", event?.type);

        // 🔎 GOOGLE-READY LOG
        console.error(
          "🔎 GOOGLE SEARCH:",
          `speechrecognition android chrome ${event?.error}`
        );

        setError(event?.error || "Speech recognition error");
        setListening(false);
      };

      recognition.onend = () => {
        console.log("🟠 [STT] recognition ended (onend)");
        setListening(false);
      };

      recognition.onaudiostart = () => {
        console.log("🟢 [STT] audio capture started");
      };

      recognition.onaudioend = () => {
        console.log("🟠 [STT] audio capture ended");
      };

      recognition.start();

      console.log("🟢 [STT] recognition.start() called");

      recognitionRef.current = recognition;

      // 🧠 SILENT FAILURE WATCHDOG (ANDROID IMPORTANT)
      intervalRef.current = setInterval(() => {
        const diff = Date.now() - lastResultRef.current;

        if (listening && diff > 5000) {
          console.warn(
            "🟠 [STT] SILENT FAILURE: no speech detected for 5s"
          );

          console.warn(
            "🔎 GOOGLE SEARCH:",
            "speechrecognition android chrome silent no result onend"
          );
        }
      }, 2000);
    } catch (err) {
      console.error("🔴 [STT] getUserMedia FAILED:", err);

      console.error("🔴 name:", err?.name);
      console.error("🔴 message:", err?.message);
      console.error("🔴 constraint:", err?.constraint);

      console.error(
        "🔎 GOOGLE SEARCH:",
        `getUserMedia ${err?.name} chrome android microphone`
      );

      setError("Mic permission ditolak / blocked / insecure context");
    }
  };

  const stopListening = () => {
    console.log("🟠 [STT] stopListening triggered");

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log("🟠 [STT] recognition.stop() called");
      recognitionRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setListening(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h3>Android STT Testf (FULL DEBUG MODE)</h3>

      <button onClick={listening ? stopListening : startListening}>
        {listening ? "Stop" : "Start"}
      </button>

      <div style={{ marginTop: 12 }}>
        <p>
          Status:{" "}
          <b style={{ color: listening ? "green" : "gray" }}>
            {listening ? "Listening..." : "Idle"}
          </b>
        </p>
      </div>

      <div>
        <strong>Transcript:</strong>
        <p>{transcript || "-"}</p>
      </div>

      {error && (
        <div style={{ marginTop: 10, color: "red" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: 12, color: "#666" }}>
        Open DevTools → Console untuk debug penuh STT Android Chrome
      </div>
    </div>
  );
}