import { useRef, useState } from "react";

export default function AndroidSTTTest() {
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);

  // STT state
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [envInfo, setEnvInfo] = useState({});

  // Recording state
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);

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
  };

  // =========================
  // STT
  // =========================
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
      addLog("🎤 STT START");
      startTimeRef.current = Date.now();
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript;
      }

      setText(finalText);
      addLog("📝 STT RESULT");
    };

    recognition.onerror = (e) => {
      addLog(`🔥 ERROR: ${e.error}`);
      setError(e.error);
    };

    recognition.onend = () => {
      const duration = startTimeRef.current
        ? Date.now() - startTimeRef.current
        : 0;

      addLog(`🔚 STT END (${duration}ms)`);

      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const startSTT = async () => {
    addLog("▶ STT START CLICKED");

    detectEnv();

    const recognition = recognitionRef.current || createRecognition();
    if (!recognition) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog("🎤 MIC OK");
    } catch (err) {
      addLog("❌ MIC DENIED");
      return;
    }

    setTimeout(() => {
      try {
        recognition.start();
      } catch (e) {
        addLog("❌ STT START FAILED");
      }
    }, 300);
  };

  const stopSTT = () => {
    addLog("⛔ STT STOP");
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      addLog("❌ STT STOP FAILED");
    }
  };

  // =========================
  // RECORDING
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
        addLog("🎙️ RECORDING START");
        setIsRecording(true);
      };

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        addLog("🛑 RECORDING STOP");

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
      addLog("❌ STOP REC FAILED");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-5 space-y-4">
        <h1 className="text-xl font-bold">🎤 STT + Voice Recorder</h1>

        {/* STATUS */}
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            isListening
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          STT: {isListening ? "Listening 🎤" : "Idle"}
        </div>

        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            isRecording
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Recorder: {isRecording ? "Recording 🎙️" : "Stopped"}
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={startSTT}
            className="flex-1 bg-indigo-600! text-white py-2! rounded-xl"
          >
            Start STT
          </button>

          <button
            onClick={stopSTT}
            className="flex-1 bg-red-500! text-white py-2! rounded-xl"
          >
            Stop STT
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={startRecording}
            className="flex-1 bg-green-600! text-white py-2! rounded-xl"
          >
            Start Rec 🎙️
          </button>

          <button
            onClick={stopRecording}
            className="flex-1 bg-gray-700! text-white py-2! rounded-xl"
          >
            Stop Rec ⏹
          </button>
        </div>

        {/* RESULT */}
        <div className="border rounded-xl p-3 bg-gray-50 min-h-[60px]">
          <div className="text-xs text-gray-400">STT Result</div>
          <div className="text-sm text-black">{text || "—"}</div>
        </div>

        {/* AUDIO PLAYBACK */}
        {audioURL && (
          <div className="border rounded-xl p-3 bg-gray-50">
            <div className="text-xs text-gray-400 mb-1">Voice Playback</div>
            <audio controls src={audioURL} className="w-full" />
          </div>
        )}

        {/* ENV */}
        <div className="border rounded-xl p-3 bg-gray-50 text-xs">
          <div className="text-gray-400 mb-1">Env</div>
          <pre className="text-black">{JSON.stringify(envInfo, null, 2)}</pre>
        </div>

        {/* LOGS */}
        <div className="border rounded-xl p-3 bg-gray-50 text-xs max-h-40 overflow-y-auto">
          <div className="text-black">Logs</div>
          {logs.map((l, i) => (
            <div className="text-black mb-1" key={i}>
              • {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
