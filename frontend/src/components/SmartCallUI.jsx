import { useEffect, useState } from "react";
import useSmartCall from "../hooks/useSmartCall";

export default function SmartCallUI({
  startRecording,
  stopRecording,
  isRecording,
  liveTranscript,

  openLupaKata,
  isLupaKataActive,
  lupaKata,

  user,
}) {
  const {
    started,
    remoteTranscript,
    aiReply,

    isMuted,
    toggleMute,

    setMicEnabled,

    roomId,
    joinedRoom,
    roomInput,

    setRoomInput,

    createRoom,
    joinRoom,
    startCall,
    endCall,

    remoteAudioRef,
  } = useSmartCall({
    startRecording,
    stopRecording,
    liveTranscript,
    user,
  });

  const [stage, setStage] = useState("A"); // A | B | C

  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomMode, setRoomMode] = useState(null);
  const [readyToCall, setReadyToCall] = useState(false);

  useEffect(() => {

  if (isLupaKataActive) {

    // mute mic ke peer
    setMicEnabled(false);

  }
  else {

    // nyalakan lagi
    setMicEnabled(true);

  }

}, [isLupaKataActive]);

  return (
    <section className="mt-24 md:mb-90 text-white flex items-center justify-center bg-linear-to-b from-slate-900 to-cyan-950">
      <div className="w-full max-w-md relative">

        {/* AUDIO */}
        <audio ref={remoteAudioRef} autoPlay />

        {/* ================= A: START SMARTCALL ================= */}
        <section
          className={`transition-all duration-500 ease-out absolute w-full mt-12
          ${
            stage === "A"
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-3 pointer-events-none"
          }`}
        >
          <div
            className="text-white border border-cyan-400/10 backdrop-blur-xl rounded-3xl p-6
            bg-linear-to-b from-slate-900/80 to-cyan-950/70
            shadow-lg shadow-cyan-500/10 flex flex-col justify-center
            transition-all duration-300 ease-out"
          >
            {/* ICON */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-2xl mb-4 flex items-center justify-center">
                📞
              </div>

              <div>
                <p className="text-base font-semibold tracking-wide">
                  SmartCall
                </p>

                <p className="text-xs text-white/60 mt-1">
                  Talk with AI-assisted voice calls
                </p>
              </div>
            </div>

            {/* BUTTON */}
            <button
              onClick={() => {
                // tunggu fade out dulu
                setStage("B");
              }}
              className="mt-6 w-full py-2! rounded-xl
              bg-cyan-400! text-black text-sm font-medium
              hover:bg-white transition
              active:scale-[0.98]"
            >
              Start SmartCall
            </button>
          </div>
        </section>

        {/* ================= B: BEFORE CALL ================= */}
        {stage === "B" && (
          <div
            className={`absolute w-full transition-all duration-500 ease-out ${
              started
                ? "opacity-0 scale-95 pointer-events-none"
                : `opacity-100 scale-100 ${
                    roomMode === "join" || roomMode === "create" ? "" : "mt-12"
                  }`
            }`}
          >
            <div
              className="rounded-2xl backdrop-blur-2xl
              bg-linear-to-b from-slate-900/70 to-cyan-950/60
              border border-cyan-400/10
              shadow-xl shadow-cyan-500/10
              p-6"
            >

              {/* HEADER */}
              <div className="text-center">
                <div
                  className="mx-auto w-14 h-14 rounded-2xl
                  bg-cyan-400/10 text-cyan-300
                  border border-cyan-400/20
                  flex items-center justify-center text-xl"
                >
                  📞
                </div>

                <h2 className="mt-4 text-lg font-semibold text-white tracking-wide">
                  SmartCall
                </h2>

                <p className="text-xs text-white/50 mt-1">
                  Create or join a real-time AI voice call
                </p>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 space-y-3">

                <div className="grid grid-cols-2 gap-3">

                  {/* CREATE */}
                  <button
                    onClick={() => {
                      setRoomMode("create");
                      setShowJoinInput(false);
                      setRoomInput("");
                      setReadyToCall(true);
                      createRoom();
                    }}
                    className="py-2.5! rounded-xl
                    bg-cyan-500! text-black font-medium text-sm
                    hover:bg-cyan-400
                    active:scale-[0.98]
                    shadow-md shadow-cyan-500/20 transition"
                  >
                    Create
                  </button>

                  {/* JOIN */}
                  <button
                    onClick={() => {
                      setRoomMode("join");
                      setShowJoinInput(true);
                      setRoomInput("");
                      setReadyToCall(false);
                    }}
                    className="py-2.5! rounded-xl
                    bg-white/5! text-white/80 text-sm
                    border border-white/10
                    hover:bg-white/10 hover:border-cyan-400/20
                    active:scale-[0.98]
                    transition"
                  >
                    Join
                  </button>

                </div>

                {/* JOIN INPUT */}
                {showJoinInput && (
                  <div className="space-y-2 animate-in fade-in duration-300">

                    <input
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value)}
                      placeholder="Enter Room ID"
                      className="w-full px-3 py-2.5 rounded-xl
                      bg-white/5 text-white text-sm
                      border border-white/10
                      placeholder:text-white/30
                      outline-none
                      focus:border-cyan-400/40 focus:bg-white/10
                      transition"
                    />

                    <button
                      onClick={async () => {
                        await joinRoom(roomInput);
                        setReadyToCall(true);
                      }}
                      className="w-full py-2.5! rounded-xl
                      bg-emerald-500/20! text-emerald-300 text-sm
                      border border-emerald-400/20
                      hover:bg-emerald-500/30
                      transition active:scale-[0.98]"
                    >
                      Join Room
                    </button>

                  </div>
                )}

                {/* ROOM INFO */}
                {roomMode === "create" && joinedRoom && (
                  <div
                    className="mt-3 text-center p-3 rounded-xl relative
                    bg-cyan-500/5 border border-cyan-400/10"
                  >
                    <p className="text-[10px] text-white/40">Room ID</p>

                    {/* COPY BUTTON */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomId);
                      }}
                      className="absolute top-2 right-2 text-sm
                      text-white/60 hover:text-white transition"
                    >
                      📑
                    </button>

                    {/* ROOM ID CENTER */}
                    <p className="text-base font-semibold text-cyan-300 tracking-widest mt-1">
                      {roomId}
                    </p>
                  </div>
                )}

                {/* START CALL */}
                {readyToCall && (
                  <button
                    onClick={() => {
                      startCall();
                      setStage("C");
                    }}
                    className="w-full mt-2 py-3! rounded-xl font-medium text-sm
                    bg-gradient-to-r from-cyan-500 to-sky-500
                    text-white
                    hover:opacity-90 active:scale-[0.98]
                    shadow-lg shadow-cyan-500/20 transition"
                  >
                    Start Call
                  </button>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ================= C: ACTIVE CALL ================= */}
        {stage === "C" && (
          <div className="absolute mt-48 inset-0 flex items-center justify-center px-4">
            <div
              className="w-full max-w-md flex flex-col
              text-white backdrop-blur-2xl rounded-3xl p-5
              bg-linear-to-b from-slate-900/70 to-cyan-950/60
              border border-cyan-400/10
              shadow-xl shadow-cyan-500/10
              transition-all duration-500"
            >

              {/* TOP BAR */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm font-semibold tracking-wide">
                    In Call
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">

                    {isMuted && (
                      <span
                        className="px-2 py-1 rounded-lg
                        bg-red-500/20 text-red-300
                        border border-red-400/20
                        text-[10px] tracking-wide"
                      >
                        MUTED
                      </span>
                    )}

                    {isLupaKataActive && (
                      <span
                        className="px-2 py-1 rounded-lg
                        bg-emerald-500/20 text-emerald-300
                        border border-emerald-400/20
                        text-[10px] tracking-wide"
                      >
                        TRANSLATE MODE
                      </span>
                    )}

                    {!isMuted && !isLupaKataActive && (
                      <span
                        className="px-2 py-1 rounded-lg
                        bg-cyan-500/20 text-cyan-300
                        border border-cyan-400/20
                        text-[10px] tracking-wide"
                      >
                        LIVE CALL
                      </span>
                    )}

                    {isRecording && !isMuted && (
                      <span
                        className="px-2 py-1 rounded-lg
                        bg-white/10 text-white/80
                        border border-white/10
                        text-[10px] tracking-wide animate-pulse"
                      >
                        LISTENING
                      </span>
                    )}

                  </div>
                </div>

                <button
                  onClick={() => {
                    endCall();
                    setStage("B");
                  }}
                  className="text-xs px-3! py-1! rounded-lg
                  bg-red-500/10! text-red-300
                  border border-red-500/20
                  hover:bg-red-500/20 transition"
                >
                  End
                </button>
              </div>

              {/* AVATAR / STATUS */}
              <div className="flex justify-center mb-6">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl border transition-all duration-300
                  ${
                    !isMuted
                      ? "bg-cyan-500/20 border-cyan-400 animate-pulse shadow-lg shadow-cyan-500/20"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  📞
                </div>
              </div>

              {/* CARDS */}
              <div className="space-y-3">

                {/* Live Caption (Partner) */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <p className="text-xs text-white/40 mb-1">Live Caption (Partner)</p>
                  <p className="text-sm text-white">
                    {remoteTranscript || "Waiting for speech..."}
                  </p>
                </div>

                {/* Translation */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <p className="text-xs text-white/40 mb-2">Translation</p>

                  {/* LIVE TRANSCRIPT */}
                  <div className="mb-2">
                    <p className="text-[10px] text-white/30 mb-1">
                      {isLupaKataActive ? "Listening..." : "Transcript"}
                    </p>

                    <p className="text-sm text-white">
                      {lupaKata?.lupaKataHeardText || "..."}
                    </p>
                  </div>

                  {/* TRANSLATED RESULT */}
                  {lupaKata?.translatedText && !isLupaKataActive && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] text-cyan-300/70 mb-1">
                        English Translation
                      </p>

                      <p className="text-sm text-cyan-100">
                        {lupaKata.translatedText}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Reply */}
                <div
                  className="bg-cyan-500/10 border border-cyan-400/20
                  p-3 rounded-xl shadow-sm shadow-cyan-500/10"
                >
                  <p className="text-xs text-cyan-300 mb-1">
                    AI Suggested Reply
                  </p>
                  <p className="text-sm text-white">
                    {aiReply || "..."}
                  </p>
                </div>
              </div>

              {/* CONTROLS */}
              <div className="flex gap-2 mt-5">

                <button
                  onClick={toggleMute}
                  className={`flex-1 py-2! rounded-xl border transition
                  ${
                    isMuted
                      ? "bg-yellow-500/20! text-yellow-300 border-yellow-400/30"
                      : "bg-red-500/10! text-red-300 border-red-500/20 hover:bg-red-500/20"
                  }`}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>

                <button
                  onClick={openLupaKata}
                  className={`flex-1 py-2! rounded-xl border transition ${
                    isLupaKataActive
                      ? "bg-emerald-500/20! text-emerald-300 border-emerald-400/30"
                      : "bg-white/5! text-white/60 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {isLupaKataActive ? "Translate ON" : "Translate"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
      
    </section>
  );
}