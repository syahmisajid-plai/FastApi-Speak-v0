export default function useMicController({ rawStartRecording, forceStop }) {
  const startRecording = async () => {
    console.log("🎤 Mic button pressed");

    forceStop();

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await Promise.resolve();

    setTimeout(() => {
      rawStartRecording();
    }, 120);
  };

  return { startRecording };
}
