import { useEffect, useRef, useMemo, useState } from "react";
import useSmartCall from "../hooks/useSmartCall";
import useTranslate from "../hooks/useTranslate";

import SmartCallSummaryModal from "./SmartCallSummaryModal";

export default function SmartCallUI({
  startRecording,
  stopRecording,
  isRecording,
  currentTranscript,

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
    toggleTranslated,

    peerName,

    setMicEnabled,

    roomId,
    joinedRoom,
    roomInput,

    roomStatus,
    usersInRoom,
    users,
    canStartCall,

    setRoomInput,

    createRoom,
    joinRoom,
    startCall,
    endCall,

    requestStartCall,

    remoteAudioRef,

    connectionState,
    callEndedBy,

    peerState,

    roomError,
    setRoomError,

    roomFailed,
    setRoomFailed,
    
  } = useSmartCall({
    startRecording,
    stopRecording,
    currentTranscript,
    user,

    isLupaKataActive,
  });

  const [stage, setStage] = useState("A"); // A | B | C | D

  const [partnerTranslatedText, setPartnerTranslatedText] = useState(null);
  const [isPartnerTranslating, setIsPartnerTranslating] = useState(false);

  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomMode, setRoomMode] = useState(null);
  // const [readyToCall, setReadyToCall] = useState(false);
  const [endMessage, setEndMessage] = useState("");

  const [isHost, setIsHost] = useState(false);

  const [callUIStarted, setCallUIStarted] = useState(false);

  const [showSummary, setShowSummary] = useState(false);
  const [showCoach, setShowCoach] = useState(false);



  const { translate } = useTranslate();

  const connectionLabel = {
    new: "Idle",
    connecting: "Connecting...",
    connected: "Live",
    disconnected: "Reconnecting...",
    failed: "Connection Lost",
    closed: "Call Ended",
  };

  const handleCreateRoom = async () => {
    try {
      await createRoom(); // pastikan backend sukses

      setIsHost(true);
      setStage("C");

    } catch (err) {
      console.log("CREATE ROOM FAILED", err);
    }
  };

  const handlePartnerTranslate = async (text) => {
    console.log("🟡 RAW TEXT CLICKED:", text);

    if (!text || text === "Waiting for speech...") {
      console.log("❌ Invalid text, skip translate");
      return;
    }

    setIsPartnerTranslating(true);

    const res = await translate(text);

    console.log("🟢 TRANSLATE RESPONSE:", res);

    setIsPartnerTranslating(false);

    if (res?.translated) {
      setPartnerTranslatedText(res.translated);
    } else {
      console.log("❌ No translatedText in response");
    }
  };

  function normalizeSTT(text) {
    if (!text) return "";

    const words = text.split(" ");

    const cleaned = [];
    for (let i = 0; i < words.length; i++) {
      if (words[i] !== words[i - 1]) {
        cleaned.push(words[i]);
      }
    }

    return cleaned.join(" ").replace(/\s+/g, " ").trim();
  }

  const lastStableRef = useRef("");

  const cleanLupaKataText = useMemo(() => {
    const raw = lupaKata?.lupaKataHeardText || "";

    const cleaned = normalizeSTT(raw);

    // prevent unnecessary UI re-render noise
    if (cleaned === lastStableRef.current) {
      return lastStableRef.current;
    }

    lastStableRef.current = cleaned;
    return cleaned;
  }, [lupaKata?.lupaKataHeardText]);

  // ================= Control Mute When Translate ON =================
  const handleToggleMute = () => {
    if (isLupaKataActive) return; // ❌ benar-benar dikunci

    toggleMute();
  };

  useEffect(() => {
    toggleTranslated(isLupaKataActive);
  }, [isLupaKataActive]);

  useEffect(() => {
    console.log("📡 peerState UPDATED:", peerState);
  }, [peerState]);

  useEffect(() => {
    if (stage !== "D") return;
    if (connectionState !== "connected") return;

    // delay kecil biar audio stream ready
    const t = setTimeout(() => {
      startRecording();
    }, 600);

    return () => clearTimeout(t);
  }, [stage, connectionState]);

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

  useEffect(() => {
    if (roomStatus === "ready" && joinedRoom) {
      setStage("C");
    }
  }, [roomStatus, joinedRoom]);

  useEffect(() => {

  // call selesai -> balik idle UI
  if (!started && !joinedRoom && !roomFailed) {

    setStage("A");

    setShowJoinInput(false);

    setRoomMode(null);

    // setReadyToCall(false);
  }

}, [started, joinedRoom]);

  useEffect(() => {

    if (started) {
      setStage("D");
    }

  }, [started]);

  useEffect(() => {

    console.log("📞 callEndedBy changed:", callEndedBy);

    if (!callEndedBy) {
      console.log("❌ callEndedBy kosong");
      return;
    }


    if (callEndedBy !== user?.username) {


      setEndMessage(
        `${callEndedBy} ended the call`
      );

    } else {

      setEndMessage(
        "Call ended"
      );

      console.log("❌ Pesan CALL ENDED:", endMessage);

    }

    console.log("✅ SHOW SUMMARY");
    setShowSummary(true);

    const timeout = setTimeout(() => {
      setEndMessage("");
    }, 3000);

    return () => clearTimeout(timeout);

  }, [callEndedBy, user]);

  return (
    <section
      className={`
        mt-24 md:mb-90 text-white flex items-center justify-center
        bg-linear-to-b from-slate-900 to-cyan-950
        ${(stage === "A" || stage === "B") ? "mx-4" : ""}
      `}
    >
        <div className="w-full max-w-md relative">

        {/* End Call Message */}
        {endMessage && (
          <div
            className="absolute -top-14 left-1/2 -translate-x-1/2
            px-4 py-2 rounded-xl
            bg-red-500/20 border border-red-400/20
            text-red-200 text-sm backdrop-blur-xl
            animate-in fade-in duration-300
            z-55"
          >
            {endMessage}
          </div>
        )}
        
        {/* AUDIO */}
        <audio ref={remoteAudioRef} autoPlay />

        {/* ================= SHARED CONTAINER A & B================= */}
        {(stage === "A" || stage === "B") && (
          <section
            className={`absolute w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              roomMode === "join"
                ? "mt-12"
                : stage === "A"
                ? "mt-12"
                : "mt-14"
            }`}
          >
            <div
              className="text-white border border-cyan-400/10 backdrop-blur-xl rounded-3xl p-6
              bg-linear-to-b from-slate-900/80 to-cyan-950/70
              shadow-lg shadow-cyan-500/10 flex flex-col justify-center
              transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >

              {/* ================= CONTENT WRAPPER ================= */}
              <div
                className={`relative transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                ${
                  roomFailed
                    ? "min-h-[320px]"
                    : roomMode === "join"
                    ? "min-h-[280px]"
                    : stage === "A"
                    ? "min-h-[200px]"
                    : "min-h-[120px]"
                }`}
              >

                {/* ================= A ================= */}
                <div
                  className={`absolute inset-0 flex flex-col items-center text-center
                  transition-all duration-400 ease-out
                  ${
                    stage === "A"
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 text-2xl mb-4 flex items-center justify-center">
                    📞
                  </div>

                  <p className="text-base font-semibold tracking-wide">
                    SmartCall
                  </p>

                  <p className="text-xs text-white/60 mt-1">
                    Talk with friends in real-time, with AI support when needed
                  </p>

                  <button
                    onClick={() => setStage("B")}
                    className="mt-4 w-full py-2.5! rounded-xl
                    bg-cyan-400! text-black text-sm font-medium
                    hover:bg-white transition active:scale-[0.98]"
                  >
                    Start Voice Room
                  </button>
                </div>

              {/* ================= B ================= */}
              <div
                className={`absolute inset-0 transition-all duration-500 ease-out
                ${
                  stage === "B"
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                }`}
              >
                {/* HEADER */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 text-cyan-300 flex items-center justify-center text-lg">
                    📞
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Voice Lobby
                    </h2>
                    <p className="text-[11px] text-white/40">
                      Create or join a room
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* CREATE */}
                  <button
                    onClick={() => {
                      setRoomMode("create");
                      setShowJoinInput(false);
                      setRoomInput("");

                      handleCreateRoom();
                    }}
                    className="py-3! rounded-2xl
                    bg-gradient-to-r from-cyan-500 to-cyan-400
                    text-black font-medium text-sm
                    hover:opacity-90 active:scale-[0.98]
                    transition"
                  >
                    Create Room
                  </button>

                  {/* JOIN */}
                  <button
                    onClick={() => {
                      setRoomMode("join");
                      setShowJoinInput(true);
                      setRoomInput("");
                    }}
                    className="py-3! rounded-2xl
                    bg-gradient-to-r from-white/5 to-white/10
                    text-white/80 text-sm font-medium
                    border border-white/10
                    backdrop-blur-md
                    hover:bg-white/10 hover:border-cyan-400/20
                    transition active:scale-[0.98]"
                  >
                    🔑 Join Room
                  </button>

                </div>

                {/* DIVIDER */}
                <div className="my-5 h-px bg-white/5" />

                {/* JOIN INPUT (SMOOTH EXPAND) */}
                <div
                  className={`
                    overflow-hidden transition-all duration-300 ease-out
                    ${showJoinInput
                      ? "max-h-48 opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
                    }
                  `}
                >
                  {/* LABEL */}
                  <p className="text-[10px] text-white/40 mb-1 ml-1">
                    Room ID
                  </p>

                  {/* INPUT */}
                  <input
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    placeholder="e.g. abc123 or paste invite code"
                    className="w-full px-3 py-2.5 rounded-xl
                    bg-black/20 text-white text-sm
                    border border-white/10
                    placeholder:text-white/25
                    outline-none
                    transition
                    focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/10"
                  />

                  {roomError && (
                    <div className="mt-3 text-red-300 text-xs bg-red-500/10 border border-red-400/20 p-2 rounded-lg">
                      {roomError}
                    </div>
                  )}

                  {/* JOIN BUTTON */}
                  <button
                    disabled={!roomInput.trim()}
                    onClick={async () => {
                      if (!roomInput.trim()) return;
                        setRoomError("");
                        setRoomFailed(false);

                      await joinRoom(roomInput.trim());

                      setIsHost(false);
                      // setStage("C");
                    }}
                    className={`mt-3 w-full py-2.5! rounded-xl text-md! font-medium
                    transition active:scale-[0.98] 
                    ${
                      roomInput.trim()
                        ? "bg-cyan-500/10! text-cyan-200 border border-cyan-400/20 hover:bg-cyan-500/20"
                        : "bg-white/5! text-white/40 border border-white/10 cursor-not-allowed"
                    }`}
                  >
                    Join Room
                  </button>
                </div>
              </div>

              </div>
            </div>
          </section>
        )}
        

        {/* ================= C: WAITING ROOM ================= */}
        {stage === "C" && (() => {

          const peerUser = users?.find(
            (u) => u.username !== user?.username
          );

          const displayRoomId = roomId || "ROOM-4821";

          return (

            <div className="absolute inset-0 flex items-center justify-center px-4 mt-42">
              <div className="w-full max-w-md text-white bg-white/5 border border-cyan-400/20 
                  rounded-2xl p-4 space-y-3
                  shadow-[0_0_20px_rgba(34,211,238,0.3)]">

                {/* HEADER */}
                <div className="text-center mb-4 relative">

                  {/* BACK BUTTON */}
                  <button
                    onClick={() => {
                      setRoomMode(null);
                      setShowJoinInput(false);
                      setStage("B");
                    }}
                    className="absolute left-0 top-0 text-white/60 hover:text-white text-lg"
                  >
                    ← Back
                  </button>

                  <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-400/20 flex items-center justify-center animate-pulse">
                    ⏳
                  </div>

                  <h2 className="mt-2 text-lg font-semibold">Waiting Room</h2>
                  <p className="text-xs text-white/50">
                    Waiting for participants...
                  </p>
                </div>

                {/* MAIN CARD (gabungan semua info) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">

                  {/* ROOM ID */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/40">Room ID</p>
                      <p className="text-cyan-300 font-mono text-sm tracking-widest">
                        {displayRoomId}
                      </p>
                    </div>

                    <button
                      onClick={() => navigator.clipboard.writeText(displayRoomId)}
                      className="text-white/50 hover:text-white"
                    >
                      📑
                    </button>
                  </div>

                  {/* STATUS BAR */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${
                      canStartCall ? "bg-emerald-400" : "bg-yellow-400 animate-pulse"
                    }`} />
                    <p className={canStartCall ? "text-emerald-300" : "text-yellow-300"}>
                      {canStartCall ? "Ready" : "Waiting for participant"}
                    </p>
                  </div>

                  {/* PARTICIPANTS (lebih compact) */}
                  <div className="space-y-2">

                    {/* HOST */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/20 flex items-center justify-center text-xs font-semibold">
                          {(user?.username || "Y")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm">{user?.username || "You"}</p>
                          <p className="text-[10px] text-cyan-300">Host</p>
                        </div>
                      </div>

                      <span className="text-[10px] text-white/50">Joined</span>
                    </div>

                    {/* PEER */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold border ${
                          peerUser
                            ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-200"
                            : "bg-white/5 border-white/10 text-white/40"
                        }`}>
                          {peerUser?.username ? peerUser.username[0].toUpperCase() : "?"}
                        </div>

                        <div>
                          <p className="text-sm">
                            {peerUser?.username || "Waiting..."}
                          </p>
                          <p className="text-[10px] text-white/40">Participant</p>
                        </div>
                      </div>

                      <span className="text-[10px] text-white/50">
                        {canStartCall ? "Joined" : "Waiting"}
                      </span>
                    </div>

                  </div>
                </div>

                {/* BUTTON (lebih dekat ke card) */}
                <div className="mt-3">
                  {isHost ? (
                    <button
                      onClick={requestStartCall}
                      disabled={!canStartCall}
                      className={`w-full py-3! rounded-2xl text-sm font-medium transition
                      ${canStartCall
                        ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white"
                        : "bg-white/5! text-white/30 border border-white/10"
                      }`}
                    >
                      {canStartCall ? "Start Call" : "Waiting..."}
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-center text-sm text-white/50">
                      Waiting for host...
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()}

        {/* ================= D: ACTIVE CALL ================= */}
        {stage === "D" && (() => {

          const peerUser = users?.find(
            (u) => u.username !== user?.username
          );
          
          return (
          <div>
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
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-11 h-11 rounded-2xl
                        bg-cyan-500/20 border border-cyan-400/20
                        flex items-center justify-center
                        text-cyan-200 font-semibold text-sm"
                      >
                        {peerUser?.username?.charAt(0)?.toUpperCase() || "?"}
                      </div>

                      {/* User Info */}
                      <div className="flex flex-col">
                        
                        <p className="text-sm font-semibold text-white tracking-wide">
                          {peerUser?.username || "Connecting..."}
                        </p>

                        <div className="flex items-center gap-2 mt-0.5">

                          <span
                            className={`w-2 h-2 rounded-full ${
                              connectionState === "connected"
                                ? "bg-emerald-400"
                                : connectionState === "connecting"
                                ? "bg-yellow-400 animate-pulse"
                                : "bg-white/30"
                            }`}
                          />

                          <p className="text-[11px] text-white/45">
                            {connectionLabel[connectionState] || "Waiting"}
                          </p>

                        </div>
                      </div>

                    </div>


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
                      setShowSummary(true);
                      endCall();
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
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl border transition-all duration-300 relative
                    ${
                      peerState?.translated
                        ? "bg-emerald-500/15 border-emerald-400"
                        : peerState?.muted
                        ? "bg-red-500/10 border-red-400/30"
                        : "bg-cyan-500/20 border-cyan-400 animate-pulse"
                    }`}
                  >
                      {peerState?.translated
                        ? "🌐"
                        : peerState?.muted
                        ? "🔇"
                        : "📞"}

                    {/* small dot indicator */}
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900
                      ${peerState?.muted ? "bg-red-400" : "bg-emerald-400"}`}
                    />
                  </div>
                </div>

                {/* CARDS */}
                <div className="space-y-3">

                  {/* Live Caption (Partner) */}
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-xs text-white/40 mb-1">Live Caption (Partner)</p>
                    <div>
                      <p
                        className="text-sm text-white cursor-pointer hover:bg-white/5 p-1 rounded"
                        onClick={() => handlePartnerTranslate(remoteTranscript)}
                      >
                        {remoteTranscript || "Waiting for speech..."}
                      </p>

                      {isPartnerTranslating && (
                        <p className="text-xs text-white/40 mt-1 animate-pulse">
                          Translating...
                        </p>
                      )}

                      {partnerTranslatedText && !isPartnerTranslating && (
                        <p className="text-sm text-cyan-200 mt-2 border-t border-white/10 pt-2">
                          {partnerTranslatedText}
                        </p>
                      )}
                    </div>
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
                        {cleanLupaKataText || "..."}
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

                  {/* AI Speaking Coach */}
                  <div
                    className="bg-cyan-500/10 border border-cyan-400/20
                    p-3 rounded-xl shadow-sm shadow-cyan-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-cyan-300">
                        AI Speaking Coach
                      </p>

                      <button
                        onClick={() => setShowCoach((v) => !v)}
                        className="text-[11px]! px-2! py-1! rounded-md
                        bg-white/5! hover:bg-white/10
                        text-white/60 transition"
                      >
                        {showCoach ? "Hide" : "💡 Need Help"}
                      </button>
                    </div>

                    {showCoach ? (
                      <p className="text-sm text-white">
                        {aiReply || "..."}
                      </p>
                    ) : (
                      <p className="text-xs text-white/40 italic">
                        Try responding on your own first.
                      </p>
                    )}
                  </div>
                </div>

                {/* CONTROLS */}
                <div className="flex gap-2 mt-5">

                  <button
                    onClick={handleToggleMute}
                    disabled={isLupaKataActive}
                    className={`flex-1 py-2! rounded-xl border transition relative
                      ${
                        isLupaKataActive
                          ? "bg-white/5 text-white/40 border-white/10 cursor-not-allowed"
                          : isMuted
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                          : "bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20"
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      
                      {/* ICON */}
                      {isLupaKataActive ? (
                        <span className="text-sm">🔒</span>
                      ) : (
                        <span className="text-sm">🎤</span>
                      )}

                      {/* TEXT */}
                      {isLupaKataActive
                        ? "Muted (Locked)"
                        : isMuted
                        ? "Unmute"
                        : "Mute"}
                    </div>
                  </button>

                  <button
                    onClick={openLupaKata}
                    className={`flex-1 py-2! rounded-xl border transition ${
                      isLupaKataActive
                        ? "bg-emerald-500/20! text-emerald-300 border-emerald-400/30"
                        : "bg-white/5! text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {isLupaKataActive ? "🔒 Translate ON" : "🌐 Translate"}
                  </button>

                </div>

              </div>
            </div>

            <div clas></div>
          </div>
          )
        })()}

      </div>
      
      {/* Summary Modal */}
      <SmartCallSummaryModal
        open={showSummary}
        onClose={() => {
          setShowSummary(false);
        }}
      />
    </section>
  );
}