import { useEffect, useRef, useState } from "react";

export default function SmartCallUI({
  startRecording,
  stopRecording,
  isRecording,
  liveTranscript,

  openLupaKata,
  isLupaKataActive,
  lupaKata,
}) {
  const [started, setStarted] = useState(false);

  // ================= AI STATES =================
  const [remoteTranscript, setRemoteTranscript] = useState("");
  const [aiReply, setAiReply] = useState("");

  // ================= WEBRTC =================
  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);

  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // ================= GET MIC =================
  const getAudioStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current = stream;

    return stream;
  };

  // ================= ICE =================
  const setupICE = (pc) => {
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE CANDIDATE:");
        console.log(JSON.stringify(event.candidate));

        window._ice = window._ice || [];
        window._ice.push(event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(
        "CONNECTION STATE:",
        pc.connectionState
      );
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        "ICE STATE:",
        pc.iceConnectionState
      );
    };
  };

  // ================= START CALL =================
  const startCall = async () => {
    const stream = await getAudioStream();

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    pcRef.current = pc;

    // debug
    window.pc = pc;

    setupICE(pc);

    // ================= DATA CHANNEL =================
    const channel = pc.createDataChannel("chat");

    dataChannelRef.current = channel;

    channel.onopen = () => {
      console.log("DATA CHANNEL OPEN");
    };

    channel.onmessage = (event) => {
      console.log(
        "REMOTE TRANSCRIPT:",
        event.data
      );

      setRemoteTranscript(event.data);
    };

    // ================= LOCAL AUDIO =================
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // ================= REMOTE AUDIO =================
    pc.ontrack = (event) => {
      console.log("REMOTE AUDIO RECEIVED");

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject =
          event.streams[0];
      }
    };

    // ================= CREATE OFFER =================
    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);

    window._offer = offer;

    console.log("===== COPY OFFER =====");
    console.log(JSON.stringify(offer));
  };

  // ================= ANSWER CALL =================
  const answerCall = async (offer) => {
    const stream = await getAudioStream();

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    pcRef.current = pc;

    // debug
    window.pc = pc;

    setupICE(pc);

    // ================= RECEIVE DATA CHANNEL =================
    pc.ondatachannel = (event) => {
      const channel = event.channel;

      dataChannelRef.current = channel;

      channel.onopen = () => {
        console.log("DATA CHANNEL OPEN");
      };

      channel.onmessage = (event) => {
        console.log(
          "REMOTE TRANSCRIPT:",
          event.data
        );

        setRemoteTranscript(event.data);
      };
    };

    // ================= LOCAL AUDIO =================
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // ================= REMOTE AUDIO =================
    pc.ontrack = (event) => {
      console.log("REMOTE AUDIO RECEIVED");

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject =
          event.streams[0];
      }
    };

    // ================= SET OFFER =================
    await pc.setRemoteDescription(offer);

    // ================= CREATE ANSWER =================
    const answer = await pc.createAnswer();

    await pc.setLocalDescription(answer);

    window._answer = answer;

    console.log("===== COPY ANSWER =====");
    console.log(JSON.stringify(answer));
  };

  // ================= AUTOPLAY =================
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.autoplay = true;
    }
  }, []);

  // ================= AUTO RECORDING =================
  useEffect(() => {
    if (started) {
      startRecording?.();
    } else {
      stopRecording?.();
    }

    return () => stopRecording?.();
  }, [started]);

  // ================= SEND TRANSCRIPT =================
  useEffect(() => {
    if (!liveTranscript) return;

    // SEND TO REMOTE
    if (
      dataChannelRef.current &&
      dataChannelRef.current.readyState ===
        "open"
    ) {
      dataChannelRef.current.send(
        liveTranscript
      );
    }

    const text =
      liveTranscript.toLowerCase();

    // ================= AI REPLY =================
    if (
      text.includes("where are you from")
    ) {
      setAiReply("I'm from Indonesia");
    }
    else if (
      text.includes("how are you")
    ) {
      setAiReply(
        "I'm doing great today!"
      );
    }
    else if (
      text.includes("your name")
    ) {
      setAiReply(
        "My name is Syahmi"
      );
    }
    else if (
      text.includes("what do you do")
    ) {
      setAiReply(
        "I'm an AI Engineer"
      );
    }
    else {
      setAiReply("...");
    }

  }, [liveTranscript]);

  // ================= UI =================
  return (
    <section className="mx-4 mt-12">
      <div className="relative">

        {/* REMOTE AUDIO */}
        <audio
          ref={remoteAudioRef}
          autoPlay
        />

        {/* ================= BEFORE CALL ================= */}
        <div
          className={`transition-all duration-500 ${
            started
              ? "opacity-0 scale-95 pointer-events-none"
              : "opacity-100 scale-100"
          }`}
        >

          <div className="flex flex-col items-center">

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-2xl mb-4 border border-white/10">
              📞
            </div>

            <p className="text-sm font-semibold">
              SmartCall
            </p>

            <p className="text-xs text-white/60 mt-1 text-center">
              Talk with real people with AI
              assistance
            </p>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 space-y-2">

            {/* START */}
            <button
              onClick={() => {
                startCall();
                setStarted(true);
              }}
              className="w-full py-2! rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white"
            >
              Start Call (Caller)
            </button>

            {/* JOIN */}
            <button
              onClick={() => {
                const offer =
                  JSON.parse(
                    prompt(
                      "Paste OFFER JSON"
                    )
                  );

                answerCall(offer);

                setStarted(true);
              }}
              className="w-full py-2 rounded-xl bg-green-500/20 text-green-300"
            >
              Join Call (Receiver)
            </button>

          </div>
        </div>

        {/* ================= IN CALL ================= */}
        <div
          className={`absolute inset-0 p-6 flex flex-col transition-all duration-500 ${
            started
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >

          {/* TOP */}
          <div className="flex justify-between mb-5">

            <div>
              <p className="text-sm font-semibold">
                In Call...
              </p>

              <p className="text-xs text-white/50">
                {isRecording
                  ? "Listening..."
                  : "Idle"}
              </p>
            </div>

            <button
              onClick={() =>
                setStarted(false)
              }
              className="text-xs px-3! py-1! rounded-lg bg-red-500/20! text-red-300"
            >
              End
            </button>
          </div>

          {/* ICON */}
          <div className="flex justify-center mb-5">

            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl border transition-all ${
                isRecording
                  ? "bg-cyan-500/30 border-cyan-400 animate-pulse"
                  : "bg-white/10 border-white/10"
              }`}
            >
              📞
            </div>

          </div>

          {/* REMOTE SPEECH */}
          <div className="bg-white/5 p-3 rounded-xl mb-3">

            <p className="text-xs text-white/50 mb-1">
              Remote Speech
            </p>

            <p className="text-sm text-white">
              {remoteTranscript ||
                "Waiting for speech..."}
            </p>

          </div>

          {/* TRANSLATION */}
          <div className="bg-white/5 p-3 rounded-xl mb-3">

            <p className="text-xs text-white/50 mb-1">
              Translation
            </p>

            <p className="text-sm text-white">
              {lupaKata?.lupaKataHeardText ||
                "..."}
            </p>

          </div>

          {/* AI REPLY */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl mb-3">

            <p className="text-xs text-cyan-300 mb-1">
              AI Suggested Reply
            </p>

            <p className="text-sm text-white">
              {aiReply || "..."}
            </p>

          </div>

          {/* CONTROLS */}
          <div className="flex gap-2 mt-auto">

            {/* MIC */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 py-2! rounded-xl bg-green-500/20! text-green-300"
              >
                Start Mic
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 py-2! rounded-xl bg-red-500/20! text-red-300"
              >
                Stop Mic
              </button>
            )}

            {/* TRANSLATE */}
            <button
              onClick={openLupaKata}
              className={`flex-1 py-2! rounded-xl border transition ${
                isLupaKataActive
                  ? "bg-emerald-500/30! text-emerald-300 border-emerald-400"
                  : "bg-white/5! text-white/60 border-white/10"
              }`}
            >
              {isLupaKataActive
                ? "Translate ON"
                : "Translate"}
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}