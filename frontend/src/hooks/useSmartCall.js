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

  // ================= WAITING ROOM =================
  const [roomStatus, setRoomStatus] = useState("waiting");
  const [usersInRoom, setUsersInRoom] = useState(1);
  const [users, setUsers] = useState([]);
  const [canStartCall, setCanStartCall] = useState(false);

  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("new");
  const [peerName, setPeerName] = useState(null);
  const [callEndedBy, setCallEndedBy] = useState(null);

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

  const [peerState, setPeerState] = useState({
    muted: false,
  });

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

  const isCleaningRef = useRef(false);

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
  const joinRoom = (roomInput) => {

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

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current?.send(
            JSON.stringify({
              type: "ice",
              candidate:
                event.candidate,
            })
          );
        }
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
    if (pcRef.current) {
      console.log("CALL ALREADY EXISTS");
      return;
    }

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

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(
        JSON.stringify({
          type: "offer",
          offer,
        })
      );
    }

    setStarted(true);
  };

  // ================= RequestSTART CALL =================
  const requestStartCall = () => {

    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      return;
    }

    console.log("REQUEST START CALL");

    wsRef.current.send(
      JSON.stringify({
        type: "start-call",
      })
    );
  };

  // ================= ANSWER CALL =================
  const answerCall = async (
    offer
  ) => {

    if (pcRef.current) {
      console.log("PEER CONNECTION ALREADY EXISTS");
      return;
    }

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

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(
        JSON.stringify({
          type: "answer",
          answer,
        })
      );
    }
  };

  // ================= TOGGLE MUTE =================
  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextMuted = !isMuted;

    stream.getAudioTracks().forEach(track => {
      track.enabled = !nextMuted;
    });

    setIsMuted(nextMuted);

    // 🔥 SEND STATE KE PEER (MATCH BACKEND)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "peer-state",
          state: {
            muted: nextMuted,
          },
        })
      );
    }

    if (nextMuted) {
      stopRecording?.();
    } else {
      startRecording?.();
    }
  };

  // ================= Reset CALL State =================
  const resetCallState = () => {

    if (isCleaningRef.current) return;

    isCleaningRef.current = true;

    console.log("RESET CALL STATE");

    setStarted(false);

    setIsMuted(false);

    setIsPeerConnected(false);

    setConnectionState("new");

    setRemoteTranscript("");

    setAiReply("");

    setJoinedRoom(false);

    setPeerName(null);

    setRoomId("");

    setRoomInput("");

    // setCallEndedBy(null);

    // close pc
    pcRef.current?.close();

    // close ws
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.close();
    }

    // stop mic
    localStreamRef.current
      ?.getTracks()
      ?.forEach((track) =>
        track.stop()
      );

    // clear refs
    pcRef.current = null;

    wsRef.current = null;

    dataChannelRef.current = null;

    localStreamRef.current = null;

    // clear remote audio
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setTimeout(() => {
      isCleaningRef.current = false;
    }, 500);
  };

  // ================= END CALL =================
  const endCall = () => {

    console.log("END CALL");

    // kasih tahu backend
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(
        JSON.stringify({
          type: "end-call",
        })
      );
    }

    // local cleanup
    setTimeout(() => {
      resetCallState();
    }, 100);
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

      const data = JSON.parse(event.data);

      if (data.type === "peer-state") {
        if (data.from !== username) {
          setPeerState?.(data.state); // atau setRemotePeerState
        }
        return;
      }

      console.log("WS MESSAGE:", data);

      if (data.from && data.from !== username) {
        setPeerName(data.from);
      }

      // ================= CALL ENDED =================
      if (data.type === "call-ended") {

        console.log("CALL ENDED FROM SERVER");

        setCallEndedBy(data.by);

        // apakah peer yang mengakhiri?
        if (data.by !== username) {

          console.log(`${data.by} ended the call`);

        }

        setTimeout(() => {
          resetCallState();
        }, 100);

        return;
      }

      // ================= ROOM STATE =================
      if (data.type === "room-state") {

        console.log("ROOM STATE RECEIVED:", data);

        setRoomStatus(data.status);

        setUsersInRoom(data.usersCount || 0);

        setUsers(data.users || []);

        setCanStartCall(data.canStartCall || false);

        return;
      }

      // ================= USER LIST =================
      if (data.type === "user-list") {

        setUsers(data.users || []);

        return;
      }

      // ================= ROOM READY =================
      if (data.type === "room-ready") {

        setRoomStatus("ready");

        setCanStartCall(true);

        return;
      }

      // ================= START CALL =================
      if (data.type === "start-call") {

        console.log("START CALL SIGNAL RECEIVED");

        // participant pindah ke active call
        if (data.from !== username) {

          console.log("HOST STARTED THE CALL");

          setStarted(true);

        }

        return;
      }

      // ================= SYNC STATE =================
      if (data.type === "sync-state") {

        console.log("SYNC STATE:", data.states);

        return;
      }

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

      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }

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

    peerName,
    
    roomId,
    joinedRoom,
    roomInput,

    roomStatus,
    usersInRoom,
    users,
    canStartCall,

    // SETTERS
    setRoomInput,

    // ACTIONS
    createRoom,
    joinRoom,
    startCall,
    endCall,
    toggleMute,

    requestStartCall,

    setMicEnabled,

    // REFS
    remoteAudioRef,

    connectionState,
    callEndedBy,

    peerState,
  };
}