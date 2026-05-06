import { useRef, useState } from "react";

export default function AndroidSTTTest() {
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [envInfo, setEnvInfo] = useState({});

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const addLog = (msg) => {
    console.log(msg);
    setLogs((prev) => [msg, ...prev].slice(0, 30));
  };

  // =========================
  // ENV CHECK
  // =========================
  const detectEnv = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isSecure: window.isSecureContext,
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      speechRecognition: !!SpeechRecognition,
    };

    setEnvInfo(info);
    addLog("📱 ENV CHECK DONE");
    addLog(JSON.stringify(info));
  };

  // =========================
  // CREATE STT
  // =========================
  const createRecognition = () => {
    if (!SpeechRecognition) {
      addLog("❌ SpeechRecognition NOT SUPPORTED");
      return null;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-GB"; // 👉 coba ganti ke id-ID kalau perlu
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      addLog("🎤 ONSTART");
      setIsListening(true);
      startTimeRef.current = Date.now();
      setError("");
    };

    recognition.onaudiostart = () => addLog("🔊 AUDIO START");
    recognition.onaudioend = () => addLog("🔇 AUDIO END");
    recognition.onsoundstart = () => addLog("🎧 SOUND START");
    recognition.onspeechstart = () => addLog("🗣️ SPEECH START");
    recognition.onspeechend = () => addLog("🤐 SPEECH END");
    recognition.onnomatch = () => addLog("❌ NO MATCH");

    recognition.onresult = (event) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript;
      }

      addLog("📝 RESULT RECEIVED");
      setText(finalText);
    };

    recognition.onerror = (e) => {
      addLog("🔥 ERROR: " + JSON.stringify(e));
      setError(e.error);
    };

    recognition.onend = () => {
      const duration = startTimeRef.current
        ? Date.now() - startTimeRef.current
        : 0;

      addLog(`🔚 ONEND (${duration}ms)`);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  // =========================
  // START STT (FIXED)
  // =========================
  const startSTT = async () => {
    addLog("▶ START CLICKED");

    detectEnv();

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog("🎤 MIC GRANTED");
    } catch (err) {
      addLog("❌ MIC DENIED");
      return;
    }

    // 🔥 IMPORTANT: reset instance (fix Android freeze bug)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    const recognition = createRecognition();
    if (!recognition) return;

    try {
      recognition.start();
      addLog("🚀 STT START CALLED");
    } catch (e) {
      addLog("❌ START FAILED: " + e.message);
    }
  };

  // =========================
  // STOP STT
  // =========================
  const stopSTT = () => {
    addLog("⛔ STOP CLICKED");

    try {
      recognitionRef.current?.stop();
    } catch (e) {
      addLog("❌ STOP ERROR");
    }
  };

  // =========================
  // RECORDING (WORKING)
  // =========================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.onstart = () => {
        addLog("🎙️ RECORD START");
        setIsRecording(true);
      };

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        addLog("🛑 RECORD STOP");

        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setIsRecording(false);
      };

      mediaRecorder.start();
    } catch (err) {
      addLog("❌ RECORD ERROR: " + err.message);
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch (e) {
      addLog("❌ STOP REC ERROR");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="flex items-center justify-center p-4 text-black">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-5 space-y-4">
        <h2 className="text-xl font-bold">🎤 STT FULL DEBUG MODE</h2>

        {/* STATUS */}
        <div className="p-3 rounded-xl bg-gray-100 text-sm">
          STT: {isListening ? "LISTENING 🎤" : "IDLE"}
        </div>

        <div className="p-3 rounded-xl bg-gray-100 text-sm">
          REC: {isRecording ? "RECORDING 🎙️" : "STOP"}
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded">
            {error}
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={startSTT}
            className="flex-1 bg-indigo-600! text-white p-2! rounded"
          >
            Start STT
          </button>
          <button
            onClick={stopSTT}
            className="flex-1 bg-red-500! text-white p-2! rounded"
          >
            Stop STT
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={startRecording}
            className="flex-1 bg-green-600! text-white p-2! rounded"
          >
            Start Rec
          </button>
          <button
            onClick={stopRecording}
            className="flex-1 bg-gray-700! text-white p-2! rounded"
          >
            Stop Rec
          </button>
        </div>

        {/* RESULT */}
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">STT RESULT</div>
          <div>{text || "—"}</div>
        </div>

        {/* AUDIO */}
        {audioURL && <audio controls src={audioURL} className="w-full mt-2" />}

        {/* ENV */}
        <pre className="text-xs bg-gray-50 p-2 rounded">
          {JSON.stringify(envInfo, null, 2)}
        </pre>

        {/* LOGS */}
        <div className="h-48 overflow-y-auto bg-black text-green-400 text-xs p-2 rounded">
          {logs.map((l, i) => (
            <div key={i}>• {l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
