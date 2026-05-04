import { useRef, useState } from "react";

export default function AndroidSTTTest() {
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [envInfo, setEnvInfo] = useState({});

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const addLog = (msg) => {
    console.log(msg);
    setLogs((prev) => [msg, ...prev].slice(0, 20));
  };

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

    addLog("📱 ENV DETECTED");
    console.log(info);
  };

  const createRecognition = () => {
    if (!SpeechRecognition) {
      addLog("❌ SpeechRecognition NOT SUPPORTED");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      addLog("🎤 START");
      startTimeRef.current = Date.now();
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript;
      }

      addLog("📝 RESULT RECEIVED");
      setText(finalText);
    };

    recognition.onerror = (e) => {
      addLog(`🔥 ERROR: ${e.error}`);
      setError(e.error);
    };

    recognition.onend = () => {
      const duration = startTimeRef.current
        ? Date.now() - startTimeRef.current
        : 0;

      addLog(`🔚 END (duration: ${duration}ms)`);

      // 🔍 AUTO DIAGNOSIS
      if (duration < 1000) {
        addLog("⚠️ STOP TERLALU CEPAT → kemungkinan permission / engine issue");
      }

      if (!text) {
        addLog("⚠️ TIDAK ADA RESULT → kemungkinan STT engine tidak jalan");
      }

      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const start = async () => {
    addLog("▶ START CLICKED");

    detectEnv();

    const recognition = recognitionRef.current || createRecognition();
    if (!recognition) return;

    try {
      // 🔥 FORCE PERMISSION CHECK
      await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog("🎤 MIC PERMISSION OK");
    } catch (err) {
      addLog("❌ MIC PERMISSION DENIED");
      return;
    }

    setTimeout(() => {
      try {
        recognition.start();
        addLog("🚀 START CALLED");
      } catch (e) {
        addLog("❌ START FAILED (exception)");
        console.error(e);
      }
    }, 400);
  };

  const stop = () => {
    addLog("⛔ STOP CLICKED");

    try {
      recognitionRef.current?.stop();
    } catch (e) {
      addLog("❌ STOP FAILED");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-5 space-y-4">
        <h1 className="text-xl font-bold text-gray-800">
          🎤 Android STT Advanced Debug
        </h1>

        {/* STATUS */}
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            isListening
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          Status: {isListening ? "Listening 🎤" : "Idle ⛔"}
        </div>

        {/* SUPPORT */}
        <div className="text-sm text-gray-600">
          SpeechRecognition:{" "}
          <span className="font-semibold">
            {SpeechRecognition ? "✅ Available" : "❌ Not Supported"}
          </span>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* BUTTON */}
        <div className="flex gap-2">
          <button
            onClick={start}
            className="flex-1 bg-indigo-600! text-white py-2! rounded-xl shadow active:scale-95"
          >
            Start
          </button>

          <button
            onClick={stop}
            className="flex-1 bg-red-500! text-white py-2! rounded-xl shadow active:scale-95"
          >
            Stop
          </button>
        </div>

        {/* RESULT */}
        <div className="border rounded-xl p-3 bg-gray-50 min-h-[60px]">
          <div className="text-xs text-gray-400 mb-1">Result</div>
          <div className="text-gray-800 text-sm">
            {text || "— belum ada hasil —"}
          </div>
        </div>

        {/* ENV INFO */}
        <div className="border rounded-xl p-3 bg-gray-50 text-xs">
          <div className="text-gray-400 mb-1">Environment</div>
          <pre className="text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(envInfo, null, 2)}
          </pre>
        </div>

        {/* LOGS */}
        <div className="border rounded-xl p-3 bg-gray-50 text-xs max-h-48 overflow-y-auto">
          <div className="text-gray-400 mb-1">Logs</div>
          {logs.length === 0 && <div className="text-gray-400">— kosong —</div>}
          {logs.map((log, i) => (
            <div className="text-gray-400" key={i}>
              • {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
