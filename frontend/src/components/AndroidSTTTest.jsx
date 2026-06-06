import useWhisperSTT from "../hooks/useWhisperSTT";

export default function WhisperSTTSimple() {
  const {
    text,
    loading,
    isRecording,
    startRecording,
    stopRecording,
  } = useWhisperSTT();

  return (
    <div style={{ padding: 20 }}>
      <h3>Whisper STT - Stable VAD</h3>

      <button
        onClick={startRecording}
        disabled={isRecording || loading}
      >
        🎤 Start
      </button>

      <button onClick={stopRecording} disabled={!isRecording}>
        🛑 Stop
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>Result:</strong>
        <p>{text || "-"}</p>
      </div>
    </div>
  );
}