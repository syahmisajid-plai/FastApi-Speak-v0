import {
  useEffect,
  useRef,
  useState,
} from "react";

import { linkBackend } from "../config";

export default function useSmartCall({
  startRecording,
  stopRecording,
  liveTranscript,
  user,
}) {

  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("new");

  // ================= STATES =================
  const [started, setStarted] =
    useState(false);

  const [
    remoteTranscript,
    setRemoteTranscript,
  ] = useState("");

  const [aiReply, setAiReply] =
    useState("");

  const [isMuted, setIsMuted] =
    useState(false);

  // ================= ROOM =================
  const [roomId, setRoomId] =
    useState("");

  const [joinedRoom, setJoinedRoom] =
    useState(false);

  const [roomInput, setRoomInput] =
    useState("");

  // ================= REFS =================
  const wsRef = useRef(null);

  const pcRef = useRef(null);

  const dataChannelRef =
    useRef(null);

  const localStreamRef =
    useRef(null);

  const remoteAudioRef =
    useRef(null);

  // ================= WS URL =================
  const wsBackend = linkBackend
    .replace("https://", "wss://")
    .replace("http://", "ws://");

  // ================= CREATE ROOM =================
  const createRoom = () => {

    const id = Math.random()
      .toString(36)
      .substring(2, 8);

    setRoomId(id);

    setJoinedRoom(true);

    console.log(
      "ROOM CREATED:",
      id
    );
  };

  // ================= JOIN ROOM =================
  const joinRoom = () => {

    if (!roomInput) return;

    setRoomId(roomInput);

    setJoinedRoom(true);

    console.log(
      "JOIN ROOM:",
      roomInput
    );
  };

  // ================= GET AUDIO =================
  const getAudioStream =
    async () => {

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
            video: false,
          }
        );

      localStreamRef.current =
        stream;

      return stream;
    };

  // ================= ICE =================
  const setupICE = (pc) => {

    pc.onicecandidate = (
      event
    ) => {

      if (event.candidate) {

        console.log(
          "SEND ICE"
        );

        wsRef.current?.send(
          JSON.stringify({
            type: "ice",
            candidate:
              event.candidate,
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;

      console.log("CONNECTION STATE:", state);
      setConnectionState(state);
    };

    pc.oniceconnectionstatechange =
      () => {

        console.log(
          "ICE STATE:",
          pc.iceConnectionState
        );
      };
  };

  // ================= START CALL =================
  const startCall = async () => {

    console.log(
      "START CALL"
    );

    const stream =
      await getAudioStream();

    const pc =
      new RTCPeerConnection({
        iceServers: [
          {
            urls:
              "stun:stun.l.google.com:19302",
          },
        ],
      });

    pcRef.current = pc;

    setupICE(pc);

    // ================= DATA CHANNEL =================
    const channel =
      pc.createDataChannel(
        "chat"
      );

    dataChannelRef.current =
      channel;

    channel.onopen = () => {
    console.log("DATA CHANNEL OPEN (CALLER)");

    setIsPeerConnected(true);

    console.log("✅ BOTH USERS CONNECTED (CALLER READY)");
    };

    channel.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        setRemoteTranscript(`${data.from}: ${data.text}`);
    } catch {
        setRemoteTranscript(event.data);
    }
    };

    // ================= LOCAL AUDIO =================
    stream
      .getTracks()
      .forEach((track) => {

        pc.addTrack(
          track,
          stream
        );

      });

    // ================= REMOTE AUDIO =================
    pc.ontrack = (event) => {

      console.log(
        "REMOTE AUDIO RECEIVED"
      );

      if (
        remoteAudioRef.current
      ) {

        remoteAudioRef.current.srcObject =
          event.streams[0];
      }
    };

    // ================= OFFER =================
    const offer =
      await pc.createOffer();

    await pc.setLocalDescription(
      offer
    );

    console.log(
      "SEND OFFER"
    );

    wsRef.current?.send(
      JSON.stringify({
        type: "offer",
        offer,
      })
    );

    setStarted(true);
  };

  // ================= ANSWER CALL =================
  const answerCall = async (
    offer
  ) => {

    console.log(
      "ANSWER CALL"
    );

    const stream =
      await getAudioStream();

    const pc =
      new RTCPeerConnection({
        iceServers: [
          {
            urls:
              "stun:stun.l.google.com:19302",
          },
        ],
      });

    pcRef.current = pc;

    setupICE(pc);

    // ================= RECEIVE DATA CHANNEL =================
    pc.ondatachannel = (
      event
    ) => {

      const channel =
        event.channel;

      dataChannelRef.current =
        channel;

        channel.onopen = () => {
        console.log("DATA CHANNEL OPEN (CALLEE)");

        setIsPeerConnected(true);

        console.log("✅ BOTH USERS CONNECTED (CALLEE READY)");
        };

        channel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setRemoteTranscript(`${data.from}: ${data.text}`);
            } catch {
                setRemoteTranscript(event.data);
            }
        };
    };

    // ================= LOCAL AUDIO =================
    stream
      .getTracks()
      .forEach((track) => {

        pc.addTrack(
          track,
          stream
        );

      });

    // ================= REMOTE AUDIO =================
    pc.ontrack = (event) => {

      console.log(
        "REMOTE AUDIO RECEIVED"
      );

      if (
        remoteAudioRef.current
      ) {

        remoteAudioRef.current.srcObject =
          event.streams[0];
      }
    };

    // ================= SET OFFER =================
    await pc.setRemoteDescription(
      offer
    );

    // ================= CREATE ANSWER =================
    const answer =
      await pc.createAnswer();

    await pc.setLocalDescription(
      answer
    );

    console.log(
      "SEND ANSWER"
    );

    wsRef.current?.send(
      JSON.stringify({
        type: "answer",
        answer,
      })
    );
  };

  // ================= TOGGLE MUTE =================
  const toggleMute = () => {

    const stream =
      localStreamRef.current;

    if (!stream) return;

    const nextMuted =
      !isMuted;

    stream
      .getAudioTracks()
      .forEach((track) => {

        track.enabled =
          !nextMuted;

      });

    setIsMuted(nextMuted);

    // transcript juga stop
    if (nextMuted) {

      stopRecording?.();

    }
    else {

      startRecording?.();

    }
  };

  // ================= END CALL =================
  const endCall = () => {

    setStarted(false);
    setIsMuted(false);

    pcRef.current?.close();

    wsRef.current?.close();

    localStreamRef.current
      ?.getTracks()
      ?.forEach((track) =>
        track.stop()
      );

    pcRef.current = null;

    wsRef.current = null;

    dataChannelRef.current =
      null;

    localStreamRef.current =
      null;
  };

    useEffect(() => {
    if (isPeerConnected) {
        console.log("🚀 WEBRTC FULL CONNECTION ESTABLISHED");
    }
    }, [isPeerConnected]);

  // ================= WS CONNECT =================
  const username = user?.username ?? "Guest";
  useEffect(() => {

    if (!joinedRoom || !roomId)
      return;

    const ws = new WebSocket(
    `${wsBackend}/ws/${roomId}?username=${username}`
    );

    wsRef.current = ws;

    ws.onopen = () => {

      console.log(
        "WS CONNECTED"
      );
    };

    ws.onmessage = async (
      event
    ) => {

      const data = JSON.parse(
        event.data
      );

      console.log(
        "WS MESSAGE:",
        data
      );

      // ================= OFFER =================
      if (data.type === "offer") {

        console.log(
          "RECEIVED OFFER"
        );

        await answerCall(
          data.offer
        );

        setStarted(true);
      }

      // ================= ANSWER =================
      else if (
        data.type === "answer"
      ) {

        console.log(
          "RECEIVED ANSWER"
        );

        await pcRef.current?.setRemoteDescription(
          data.answer
        );
      }

      // ================= ICE =================
      else if (
        data.type === "ice"
      ) {

        console.log(
          "RECEIVED ICE"
        );

        try {

          await pcRef.current?.addIceCandidate(
            data.candidate
          );

        }
        catch (err) {

          console.log(err);

        }
      }
    };

    ws.onclose = () => {

      console.log(
        "WS CLOSED"
      );
    };

    return () => {

      ws.close();

    };

  }, [joinedRoom, roomId, username]);

  // ================= AUTOPLAY =================
  useEffect(() => {

    if (
      remoteAudioRef.current
    ) {

      remoteAudioRef.current.autoplay =
        true;
    }

  }, []);

  // ================= AUTO RECORD =================
  useEffect(() => {

    if (started) {

      startRecording?.();

    }
    else {

      stopRecording?.();

    }

    return () =>
      stopRecording?.();

  }, [started]);

  // ================= SEND TRANSCRIPT =================
  useEffect(() => {

    if (!liveTranscript)
      return;

    // SEND TO REMOTE
    if (
      dataChannelRef.current &&
      dataChannelRef.current
        .readyState === "open"
    ) {

    dataChannelRef.current.send(
    JSON.stringify({
        from: username,
        text: liveTranscript,
    })
    );
    }

    // AI REPLY PLACEHOLDER
    setAiReply("...");

  }, [liveTranscript]);

  // ================= SET MIC ENABLED =================
  const setMicEnabled = (
    enabled
  ) => {

    const stream =
      localStreamRef.current;

    if (!stream) return;

    stream
      .getAudioTracks()
      .forEach((track) => {

        track.enabled =
          enabled;

      });

    setIsMuted(!enabled);
  };

  return {
    // STATES
    started,
    remoteTranscript,
    aiReply,
    isMuted,

    roomId,
    joinedRoom,
    roomInput,

    // SETTERS
    setRoomInput,

    // ACTIONS
    createRoom,
    joinRoom,
    startCall,
    endCall,
    toggleMute,

    setMicEnabled,

    // REFS
    remoteAudioRef,


    connectionState,
  };
}