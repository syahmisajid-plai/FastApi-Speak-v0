import { useState, useRef } from "react";
import { linkBackend } from "../config"; // Railway backend URL

export default function WhisperSTTSimple() {
  const [text, setText] = useState("");
  const recorderRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", blob, "audio.wav");

      // 🔥 kirim ke Railway backend
      const res = await fetch(`${linkBackend}/transcribe`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setText(data.text);
    };

    recorder.start();
    recorderRef.current = recorder;

    // otomatis stop setelah 5 detik
    setTimeout(() => recorder.stop(), 5000);
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Whisper STT Test</h3>
      <button className="bg-blue-500! hover:bg-blue-700 text-white font-bold py-2! px-4! rounded" onClick={startRecording}>
        🎤 Rekam 5 detik
      </button>
      <p>Hasil: {text || "-"}</p>
    </div>
  );
}
