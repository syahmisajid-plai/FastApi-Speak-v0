import { useState, useRef } from "react";
import { linkBackend } from "../config"; // Railway backend URL

export default function WhisperSTTSimple() {
  const [text, setText] = useState("");
  const recorderRef = useRef(null);

  const startRecording = async () => {
    console.log("🎤 Start recording clicked");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Microphone access granted", stream);

      const recorder = new MediaRecorder(stream);
      const chunks = [];

    console.log("Recorder mimeType =", recorder.mimeType);

      recorder.onstart = () => {
        console.log("🔴 Recording started");
      };

      recorder.ondataavailable = (e) => {
        console.log("📦 Audio chunk received:", e.data.size, "bytes");
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        console.log("⏹ Recording stopped");
        console.log("📊 Total chunks:", chunks.length);

        const blob = new Blob(chunks, { type: "audio/wav" });

        console.log("🎵 Blob created");
        console.log("Type:", blob.type);
        console.log("Size:", blob.size, "bytes");

        const formData = new FormData();
        formData.append("file", blob, "audio.wav");

        console.log("📤 Uploading to:", `${linkBackend}/transcribe`);

        try {
          const startTime = Date.now();

          const res = await fetch(`${linkBackend}/transcribe`, {
            method: "POST",
            body: formData,
          });

          console.log("📥 Response status:", res.status);
          console.log("📥 Response ok:", res.ok);

          const data = await res.json();

          console.log("📝 Transcription result:", data);
          console.log(
            "⏱ Processing time:",
            ((Date.now() - startTime) / 1000).toFixed(2),
            "seconds"
          );

          setText(data.text);
        } catch (err) {
          console.error("❌ Upload/Transcribe Error:", err);
        }
      };

      recorder.start();
      recorderRef.current = recorder;

      console.log("⏳ Auto stop in 5 seconds");

      setTimeout(() => {
        console.log("🛑 Stopping recorder...");
        recorder.stop();
      }, 5000);
    } catch (err) {
      console.error("❌ Microphone Error:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Whisper STT Test</h3>

      <button
        className="bg-blue-500! hover:bg-blue-700 text-white font-bold py-2! px-4! rounded"
        onClick={startRecording}
      >
        🎤 Rekam 5 detik
      </button>

      <p>Hasil: {text || "-"}</p>
    </div>
  );
}