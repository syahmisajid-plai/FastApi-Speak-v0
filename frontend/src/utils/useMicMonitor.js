import { useEffect, useRef, useState } from "react";

export default function useMicMonitor() {
  const [volume, setVolume] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const silenceStart = useRef(null);
  const running = useRef(false);

  useEffect(() => {
    let ctx;
    let stream;
    let analyser;
    let data;

    async function startMic() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);

      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;

      source.connect(analyser);

      data = new Uint8Array(analyser.frequencyBinCount);

      running.current = true;
      loop();
    }

    function loop() {
      if (!running.current) return;

      analyser.getByteFrequencyData(data);

      const vol = data.reduce((a, b) => a + b, 0);
      setVolume(vol);

      const now = Date.now();

      // 🔊 jika ada suara
      if (vol > 0) {
        silenceStart.current = null;
        setShowPopup(false);
      } else {
        // mulai hitung silent
        if (!silenceStart.current) {
          silenceStart.current = now;
        }

        // jika silent > 3 detik
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
