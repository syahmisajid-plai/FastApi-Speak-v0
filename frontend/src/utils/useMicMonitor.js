// utils/useMicMonitor.js
import { useEffect, useRef, useState } from "react";

export default function useMicMonitor() {
  const [volume, setVolume] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const silenceStart = useRef(null);
  const running = useRef(false);
  const lastUpdate = useRef(0);

  useEffect(() => {
    let ctx;
    let stream;
    let analyser;
    let data;

    const SILENCE_THRESHOLD = 5; // noise filter
    const UI_UPDATE_MS = 150; // update UI tiap 150ms

    async function startMic() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);

        analyser = ctx.createAnalyser();
        analyser.fftSize = 512;

        source.connect(analyser);

        data = new Uint8Array(analyser.frequencyBinCount);

        running.current = true;
        loop();
      } catch (err) {
        console.error("Mic permission denied:", err);
      }
    }

    function loop() {
      if (!running.current) return;

      analyser.getByteFrequencyData(data);

      const vol = data.reduce((a, b) => a + b, 0);
      const now = Date.now();

      /* ======================
         THROTTLE REACT UPDATE
      ====================== */
      if (now - lastUpdate.current > UI_UPDATE_MS) {
        setVolume(vol);
        lastUpdate.current = now;
      }

      /* ======================
         SILENCE DETECTION
      ====================== */
      if (vol > SILENCE_THRESHOLD) {
        silenceStart.current = null;
        setShowPopup(false);
      } else {
        if (!silenceStart.current) {
          silenceStart.current = now;
        }

        if (now - silenceStart.current > 3000) {
          setShowPopup(true);
        }
      }

      requestAnimationFrame(loop);
    }

    startMic();

    return () => {
      running.current = false;
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
    };
  }, []);

  return { volume, showPopup };
}
