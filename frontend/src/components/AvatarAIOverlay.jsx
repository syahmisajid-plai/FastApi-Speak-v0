import { useEffect, useState } from "react";

import { AVATARS } from "../utils/avatars";

function VoiceWaveform({ isActive }) {
  const [levels, setLevels] = useState(Array.from({ length: 24 }, () => 0.15));

  useEffect(() => {
    console.log("🔵 isActive:", isActive);

    if (!isActive) {
      setLevels(Array.from({ length: 24 }, () => 0.15));
      return;
    }

    let audioContext;
    let analyser;
    let animationId;
    let stream;

    const startAnalyser = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();

        analyser.fftSize = 512;

        // Lebih smooth
        analyser.smoothingTimeConstant = 0.5;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          analyser.getByteFrequencyData(dataArray);

          const sourceLevels = Array.from({ length: 12 }, (_, index) => {
            const binIndex = Math.floor(index * 5);

            const rawValue = dataArray[binIndex];

            const normalized = rawValue / 255;

            // SEBELUM: 2.5
            // SEKARANG: lebih rendah
            const amplified = normalized * 0.5;

            return Math.max(0.12, Math.min(0.65, amplified));
          });

          const newLevels = [
            ...sourceLevels.slice().reverse(),
            ...sourceLevels,
          ];

          setLevels(newLevels);

          animationId = requestAnimationFrame(update);
        };

        update();
      } catch (error) {
        console.error("❌ Microphone analyser error:", error);
      }
    };

    startAnalyser();

    return () => {
      cancelAnimationFrame(animationId);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isActive]);

  return (
    <div
      className={`
        absolute
        -bottom-12
        flex items-center justify-center
        gap-[3px]
        h-16
        transition-all duration-500
        ${isActive ? "opacity-100" : "opacity-0"}
      `}
    >
      {levels.map((level, index) => (
        <div
          key={index}
          className="
            w-[3px]
            rounded-full
            bg-emerald-300
            shadow-[0_0_8px_rgba(52,211,153,0.8)]
          "
          style={{
            height: `${6 + level * 35}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function AvatarAIOverlay({
  onClose,
  isRecording,
  startRecording,
  stopRecording,
  cancelRecording,

  isSpeaking,
  user,
}) {
  const [visible, setVisible] = useState(false);

  // user | loading | ai | disconnected
  const [turn, setTurn] = useState("user");

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const avatarData =
    AVATARS.find((a) => a.id === user?.avatar_id) ?? AVATARS[16];

  const userAvatar = avatarData.avatar;

  /*
   * FLOW:
   *
   * USER
   *  ↓ klik
   * LOADING
   *  ↓ isSpeaking === true
   * AI
   *  ↓ isSpeaking === false
   * USER
   */

  useEffect(() => {
    // AI mulai bicara
    if (isSpeaking) {
      setTurn("ai");
      return;
    }

    // AI selesai → kembali ke user dan langsung mulai recording
    if (!isSpeaking && turn === "ai") {
      startRecording();
      setTurn("user");
    }
  }, [isSpeaking]);

  useEffect(() => {
    // Hanya berlaku ketika memang sedang berada di turn user
    if (turn === "user" && !isRecording) {
      setTurn("disconnected");
    }

    // Kalau recording berhasil dimulai lagi
    if (turn === "disconnected" && isRecording) {
      setTurn("user");
    }
  }, [isRecording, turn]);

  const handleClose = () => {
    setVisible(false);
    cancelRecording();

    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleUserClick = () => {
    // ==============================
    // DISCONNECTED → START RECORDING
    // ==============================
    if (turn === "disconnected") {
      console.log("🎤 Recording terputus, mulai lagi...");

      startRecording();
      setTurn("user");

      return;
    }

    // ==============================
    // USER → FINISH SPEAKING
    // ==============================
    if (turn !== "user") return;

    console.log("🛑 User selesai, menunggu AI...");

    stopRecording();

    // Langsung ubah UI menjadi loading
    setTurn("loading");
  };

  const isUser = turn === "user";
  const isLoading = turn === "loading";
  const isAI = turn === "ai";
  const isDisconnected = turn === "disconnected";

  return (
    <div className="fixed inset-0 z-99 overflow-hidden">
      {/* BACKGROUND */}
      <div
        className={`
          absolute inset-0
          bg-slate-950
          transition-opacity duration-500
          ${visible ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* GLOW */}
      <div
        className={`
          absolute inset-0
          transition-all duration-1000

          ${
            isAI
              ? "bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.20),transparent_45%)]"
              : isLoading
                ? "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),transparent_45%)]"
                : "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_45%)]"
          }

          ${visible ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* CLOSE */}
      <button
        onClick={handleClose}
        className={`
          absolute top-6 right-6 z-30
          w-10 h-10
          flex items-center justify-center
          rounded-full
          bg-white/10
          border border-white/10
          text-white/70
          text-2xl
          backdrop-blur-md
          transition-all duration-300
          hover:bg-white/20
          hover:text-white
          hover:scale-105
          active:scale-95
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
        `}
      >
        ×
      </button>

      {/* CENTER */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        {/* TITLE */}
        <div
          className={`
            absolute top-16
            text-center
            transition-all duration-700
            ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
            }
          `}
        >
          <h1 className="text-2xl font-semibold tracking-tight">
            Speaking Practice
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Take turns speaking with your AI companion
          </p>
        </div>

        {/* AVATAR AREA */}

        {isUser || isDisconnected ? (
          /* ================= USER BUTTON ================= */
          <button
            onClick={handleUserClick}
            className={`
      relative
      flex items-center justify-center
      transition-all duration-500
      hover:scale-105
      active:scale-95
      ${visible ? "opacity-100 scale-100" : "opacity-0 scale-50"}
    `}
            aria-label="Finish speaking"
          >
            {/* OUTER GLOW */}
            <div
              className="
        absolute
        w-72 h-72
        rounded-full
        blur-3xl
        bg-emerald-500/20
      "
            />

            {/* PULSE RING */}
            <div
              className={`
                absolute
                w-56 h-56
                rounded-full
                border
                transition-all duration-500

                ${
                  isDisconnected
                    ? "border-slate-500/30"
                    : "border-emerald-400/40 animate-pulse"
                }
  `}
            />

            {/* AVATAR */}
            <div
              className={`
    relative z-10
    w-40 h-40
    rounded-full
    flex items-center justify-center
    border border-white/20
    shadow-2xl
    transition-all duration-500

    ${
      isDisconnected
        ? "bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/20"
        : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
    }
  `}
            >
              <span
                className={`
      text-7xl
      transition-all duration-500
      ${isDisconnected ? "opacity-50 grayscale" : ""}
    `}
              >
                {userAvatar}
              </span>
            </div>

            {/* VOICE WAVEFORM */}
            <VoiceWaveform isActive={isUser && isRecording} />
          </button>
        ) : (
          /* ================= LOADING / AI ================= */
          <div
            className={`
              relative
              flex items-center justify-center
              transition-all duration-500
              ${visible ? "opacity-100 scale-100" : "opacity-0 scale-50"}
            `}
          >
            {/* OUTER GLOW */}
            <div
              className={`
                absolute
                w-72 h-72
                rounded-full
                blur-3xl
                transition-all duration-700

                ${isAI ? "bg-violet-500/25" : "bg-blue-500/20"}

                ${isLoading ? "animate-pulse" : ""}
              `}
            />

            {/* RING */}
            <div
              className={`
                absolute
                w-56 h-56
                rounded-full
                border-2
                animate-heartbeat

                ${isAI ? "border-violet-400/50" : "border-blue-400/50"}
              `}
            />

            {/* AVATAR / LOADING */}
            <div
              className={`
                relative z-10
                w-40 h-40
                rounded-full
                flex items-center justify-center
                border border-white/20
                shadow-2xl
                transition-all duration-500

                ${
                  isAI
                    ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/40"
                    : "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30"
                }
              `}
            >
              {isLoading ? (
                /* LOADING */
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-white animate-bounce" />
                  <span
                    className="w-3 h-3 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-3 h-3 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              ) : (
                /* AI */
                <span className="text-7xl animate-[bounceIn_0.4s_ease-out]">
                  🤖
                </span>
              )}
            </div>
          </div>
        )}

        {/* STATUS */}
        <div
          key={turn}
          className={`
            mt-10
            text-center
            transition-all duration-500
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          `}
        >
          <h2 className="text-2xl font-semibold">
            {isDisconnected
              ? "Microphone Paused"
              : isUser
                ? "Your Turn"
                : isLoading
                  ? "Thinking..."
                  : "Avatar AI"}
          </h2>

          <p className="mt-2 text-sm text-white/50">
            {isDisconnected
              ? "Tap the avatar to start speaking again"
              : isUser
                ? "Tap avatar when you're finished speaking"
                : isLoading
                  ? "AI is preparing a response..."
                  : "AI is speaking..."}
          </p>
        </div>

        {/* TAP HINT */}
        <div
          className={`
            mt-8
            px-4 py-2
            rounded-full
            bg-white/5
            border border-white/10
            backdrop-blur-md
            text-xs text-white/50
            transition-all duration-700 delay-300
            ${visible ? "opacity-100" : "opacity-0"}
          `}
        >
          {isDisconnected
            ? "Tap avatar to resume"
            : isUser
              ? "Tap avatar when you're done"
              : isLoading
                ? "Please wait..."
                : "AI is speaking"}
        </div>
      </div>
    </div>
  );
}
