import { useState, useRef, useEffect } from "react";
import { linkBackend } from "../config";

export default function WhisperSTTSimple() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const recorderRef = useRef(null);

  useEffect(() => {
    console.log("====================================");
    console.log("🚀 App loaded");
    console.log("====================================");

    console.log("🌐 User Agent:");
    console.log(navigator.userAgent);

    const canUseWebSpeech =
      "webkitSpeechRecognition" in window ||
      "SpeechRecognition" in window;

    console.log(
      "🎙 Web Speech API Supported:",
      canUseWebSpeech
    );

    if ("webkitSpeechRecognition" in window) {
      console.log(
        "✅ Browser supports webkitSpeechRecognition"
      );
    }

    if ("SpeechRecognition" in window) {
      console.log(
        "✅ Browser supports SpeechRecognition"
      );
    }

    if (!canUseWebSpeech) {
      console.warn(
        "❌ Web Speech API NOT supported"
      );
      console.warn(
        "➡️ Recommend using Whisper"
      );
    }

    console.log(
      "🎤 MediaRecorder Supported:",
      typeof MediaRecorder !== "undefined"
    );

    console.log(
      "🔐 getUserMedia Supported:",
      !!navigator.mediaDevices?.getUserMedia
    );

    console.log("====================================");
  }, []);

  const startRecording = async () => {
    console.log("🎤 Start recording clicked");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      console.log("✅ Microphone access granted");

      const mimeType = MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      )
        ? "audio/webm;codecs=opus"
        : undefined;

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      const chunks = [];

      console.log(
        "🎙 Recorder mimeType:",
        recorder.mimeType
      );

      recorder.onstart = () => {
        console.log("🔴 Recording started");
      };

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log(
            "📦 Audio chunk received:",
            e.data.size,
            "bytes"
          );

          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        console.log("⏹ Recording stopped");
        console.log(
          "📊 Total chunks:",
          chunks.length
        );

        const blob = new Blob(chunks, {
          type: recorder.mimeType,
        });

        console.log("🎵 Blob created");
        console.log("📄 Type:", blob.type);
        console.log(
          "📏 Size:",
          blob.size,
          "bytes"
        );

        const extension = recorder.mimeType.includes(
          "mp4"
        )
          ? "m4a"
          : "webm";

        const formData = new FormData();

        formData.append(
          "file",
          blob,
          `audio.${extension}`
        );

        console.log(
          "📤 Uploading to:",
          `${linkBackend}/transcribe`
        );

        try {
          setLoading(true);

          const startTime = Date.now();

          const res = await fetch(
            `${linkBackend}/transcribe`,
            {
              method: "POST",
              body: formData,
            }
          );

          console.log(
            "📥 Response status:",
            res.status
          );

          console.log(
            "📥 Response ok:",
            res.ok
          );

          if (!res.ok) {
            throw new Error(
              `HTTP Error ${res.status}`
            );
          }

          const data = await res.json();

          console.log(
            "📝 Transcription result:"
          );
          console.log(data);

          console.log(
            "⏱ Processing time:",
            (
              (Date.now() - startTime) /
              1000
            ).toFixed(2),
            "seconds"
          );

          setText(data.text || "");
        } catch (err) {
          console.error(
            "❌ Upload/Transcribe Error:",
            err
          );
        } finally {
          setLoading(false);
        }

        stream.getTracks().forEach((track) =>
          track.stop()
        );

        console.log(
          "🔇 Microphone tracks stopped"
        );
      };

      recorder.start();

      recorderRef.current = recorder;

      console.log(
        "⏳ Auto stop in 5 seconds"
      );

      setTimeout(() => {
        if (
          recorder &&
          recorder.state !== "inactive"
        ) {
          console.log(
            "🛑 Stopping recorder..."
          );

          recorder.stop();
        }
      }, 5000);
    } catch (err) {
      console.error(
        "❌ Microphone Error:",
        err
      );
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Whisper STT Test</h3>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={startRecording}
        disabled={loading}
      >
        {loading
          ? "⏳ Processing..."
          : "🎤 Rekam 5 detik"}
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>Hasil:</strong>
        <p>{text || "-"}</p>
      </div>
    </div>
  );
}