import { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import Topic from "./components/Topic";
import ChatSection from "./components/ChatSection";
import RecordingSection from "./components/RecordingSection";
import SuggestionSection from "./components/SuggestionSection";
import ControlSection from "./components/ControlSection";
import "./App.css";

import api from "./api"; // ⬅️ pakai axios instance

// ======================
// CONSTANTS
// ======================

const IDLE_TIMEOUT = 15000; // 5 detik tanpa interaksi

// ======================
// UTILITY FUNCTIONS
// ======================

const normalizeForTTS = (text) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\n+/g, ". ")
    // .replace(/([!?])+/g, ",") // 🔥 ubah ! dan ? jadi titik
    // .replace(/\.\s*\./g, ".")
    .trim();

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const splitSentences = (text) => text.match(/[^.!?]+[.!?]+/g) || [text];

const waitForVoices = () =>
  new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    speechSynthesis.onvoiceschanged = () =>
      resolve(speechSynthesis.getVoices());
  });

export default function SpeakingApp() {
  // ======================
  // REFS
  // ======================

  // Lupa Kata flow
  const isPausedForLupaKataRef = useRef(false);

  // UI helpers
  const bottomRef = useRef(null);
  const utteranceRef = useRef(null);

  // (commented — tetap dihitung sebagai milik struktur)
  // const wasRecordingBeforeLupaKataRef = useRef(false);
  // const lupaKataRecognitionRef = useRef(null);
  // const lupaKataHasResultRef = useRef(false);

  // ======================
  // STATE
  // ======================

  // Transcript & chat
  const [chatHistory, setChatHistory] = useState([]);

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);

  // Lupa Kata
  const [isLupaKataActive, setIsLupaKataActive] = useState(false);
  const [isProcessingLupaKata, setIsProcessingLupaKata] = useState(false);
  const [lupaKataHeardText, setLupaKataHeardText] = useState("");

  // (commented — tetap bagian dari desain)
  // const [lupaKataResult, setLupaKataResult] = useState(null);

  // ======================
  // BACKEND PING
  // ======================
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/api/ping");
        console.log("✅ Backend connected:", response.data);
      } catch (error) {
        console.error("❌ Backend NOT connected:", error);
      }
    };

    checkBackend();
  }, []);

  // ======================
  // ERUDA (DEBUG MOBILE)
  // ======================
  useEffect(() => {
    // Hanya pasang Eruda jika di browser (client-side)
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.eruda.init();
        console.log("🛠️ Eruda Loaded! Klik ikon gear di kanan bawah.");
      };
    }
  }, []);

  // ======================
  // IDLE HANDLER
  // ======================

  // REF: timer idle
  const idleTimerRef = useRef(null);

  // STATE: idle status
  const [isIdle, setIsIdle] = useState(true);

  // RESET IDLE TIMER
  const resetIdle = () => {
    // jangan reset idle saat recording atau Lupa Kata aktif
    if (isRecording || isLupaKataActive) return;

    // user dianggap aktif
    setIsIdle(false);

    // clear timer lama jika ada
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // set timer baru → idle setelah timeout
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, IDLE_TIMEOUT);
  };

  // CLEANUP saat component unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  // ======================
  // TEXT TO SPEECH (TTS)
  // ======================

  // MAIN PLAY AUDIO (dipakai oleh Suggestion, dll)
  const playAudio = (text) => {
    if (!text) return;

    // ❗ stop suara sebelumnya
    speechSynthesis.cancel();

    const getVoices = () =>
      new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length) return resolve(voices);
        speechSynthesis.onvoiceschanged = () =>
          resolve(speechSynthesis.getVoices());
      });

    const speakWithVoice = async () => {
      const voices = await getVoices();
      const voice =
        voices.find((v) => v.name === "Google US English") || voices[0];

      const utterance = new SpeechSynthesisUtterance(normalizeForTTS(text));

      utterance.lang = voice.lang;
      utterance.voice = voice;
      utterance.rate = 0.95;

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    };

    speakWithVoice();
  };

  // ======================
  // STREAMED / LONG TTS (AI RESPONSE)
  // ======================

  const speakText = async (text) => {
    if (!text) return;

    // pastikan voices sudah siap
    const voices = await waitForVoices();
    const voice =
      voices.find((v) => v.name === "Google US English") || voices[0];

    const sentences = splitSentences(normalizeForTTS(text));

    // hentikan suara sebelumnya
    speechSynthesis.cancel();

    const speakNext = () => {
      if (!sentences.length) return;

      const u = new SpeechSynthesisUtterance(sentences.shift());
      u.lang = voice.lang;
      u.voice = voice;
      u.rate = 0.95;

      // chaining antar kalimat
      u.onend = speakNext;

      speechSynthesis.speak(u);
    };

    speakNext();
  };

  // ======================
  // SPEECH RECOGNITION (STT)
  // ======================

  // Web Speech API
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  // REFS
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  // STATE
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // ======================
  // LUPA KATA
  // ======================

  const sendAudioToWhisper = async (blob) => {
    console.log("⚠️ sendAudioToWhisper belum diimplementasi", blob);
    setIsProcessingLupaKata(false);
    setIsLupaKataActive(false);
    isPausedForLupaKataRef.current = false;
  };

  const startLupaKata = async () => {
    console.log("▶️ startLupaKata (recording)");

    // 🧹 reset teks lupa kata sebelumnya
    setLupaKataHeardText("");

    // ⛔ PAUSE SpeechRecognition utama
    if (isRecording) {
      isPausedForLupaKataRef.current = true;
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    // 🟡 aktifkan UI Lupa Kata
    setIsLupaKataActive(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 4000); // ⏱️ 3–5 detik

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunks, { type: "audio/webm" });

      console.log("🎧 Audio size:", blob.size);

      if (blob.size === 0) {
        console.error("❌ Audio kosong");
        return;
      }

      // ✅ AUDIO SUDAH TERTANGKAP
      setIsProcessingLupaKata(true);

      await sendAudioToWhisper(blob);
    };
  };

  // ======================
  // RECORDING CONTROLS
  // ======================

  const startRecording = () => {
    resetIdle();
    transcriptRef.current = "";
    setLiveTranscript("");
    setIsCanceled(false);
    recognitionRef.current?.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsCanceled(false);
    recognitionRef.current?.stop();
  };

  const cancelRecording = () => {
    resetIdle();
    setIsCanceled(true);
    transcriptRef.current = "";
    setLiveTranscript("");
    recognitionRef.current?.stop();
  };

  // ======================
  // CLEANUP IDLE TIMER
  // ======================

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  // ======================
  // INIT SPEECH RECOGNITION
  // ======================

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      if (isCanceled || isLupaKataActive) return;

      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcriptRef.current += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      setLiveTranscript(transcriptRef.current + interim);
    };

    recognition.onend = () => {
      console.log("🟥 ONEND FIRED");
      console.log("paused?", isPausedForLupaKataRef.current);
      console.log("raw transcript:", transcriptRef.current);

      // ⏸ Pause karena Lupa Kata → JANGAN kirim
      if (isPausedForLupaKataRef.current) {
        console.log(
          "⏸ Recording paused for Lupa Kata, transcript tidak dikirim",
        );
        return;
      }

      const finalText = normalizeText(transcriptRef.current);
      console.log("🟨 FINAL TEXT:", finalText);

      setLiveTranscript("");

      if (!isCanceled && finalText) {
        sendTextToBackend(finalText);
      }

      transcriptRef.current = "";
      setIsCanceled(false);
      setIsRecording(false);

      resetIdle();
    };

    recognition.onerror = (event) => {
      console.error("STT error:", event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  // ======================
  // BACKEND AI STREAM
  // ======================

  const SESSION_ID = "user-123"; // HARUS konsisten

  const sendTextToBackend = async (text) => {
    console.log("🚀 SEND TO AI:", text);

    // 1️⃣ tampilkan user message
    setChatHistory((prev) => [...prev, { sender: "You", message: text }]);

    // 2️⃣ POST streaming ke backend
    const res = await fetch(
      "https://fastapi-speak-v0-production.up.railway.app/stream_answer",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: SESSION_ID,
          input: text,
        }),
      },
    );

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let aiText = "";

    // 3️⃣ baca stream token demi token
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      aiText += chunk.replace(/^data:\s*/gm, "");

      setChatHistory((prev) => {
        const withoutTemp = prev.filter((c) => c.sender !== "AI-temp");
        return [...withoutTemp, { sender: "AI-temp", message: aiText }];
      });
    }

    // 4️⃣ finalisasi pesan AI
    setChatHistory((prev) =>
      prev.map((c) =>
        c.sender === "AI-temp" ? { sender: "AI", message: aiText } : c,
      ),
    );

    // 5️⃣ TTS DIPANGGIL SEKALI (SETELAH STREAM SELESAI)
    speakText(normalizeForTTS(aiText));
  };

  // ======================
  // RECORD CONTROLS
  // ======================

  // STATE
  const [micReady, setMicReady] = useState(false);
  const [micError, setMicError] = useState(null);
  const [speakerReady, setSpeakerReady] = useState(false);
  const [speakerError, setSpeakerError] = useState(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ======================
  // SUGGESTION TOGGLE
  // ======================

  const toggleSuggestion = () => {
    resetIdle();
    if (!showSuggestions) fetchSuggestions();
    setShowSuggestions(!showSuggestions);
  };

  // ======================
  // AUDIO PERMISSION
  // ======================

  const requestAudioPermission = async () => {
    // 🎤 MICROPHONE
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicReady(true);
      setMicError(null);
      console.log("🎤 Microphone permission granted");
    } catch (err) {
      console.error("❌ Microphone permission denied", err);
      setMicError("Microphone access is required.");
      return;
    }

    // 🔊 SPEAKER
    try {
      const utterance = new SpeechSynthesisUtterance("Speaker enabled");
      utterance.lang = "en-US";

      const voices = speechSynthesis.getVoices();
      const voice =
        voices.find((v) => v.name === "Google US English") || voices[0];
      utterance.voice = voice;

      speechSynthesis.speak(utterance);
      setSpeakerReady(true);
      console.log("🔊 Speaker enabled");
    } catch (err) {
      console.error("❌ Speaker error", err);
      setSpeakerError("Speaker access is required to play sound.");
    }
  };

  const fetchSuggestions = async () => {
    const lastUser = [...chatHistory].reverse().find((c) => c.sender === "You");
    const lastAI = [...chatHistory].reverse().find((c) => c.sender === "AI");

    if (!lastUser && !lastAI) return;

    try {
      const res = await fetch(
        "https://fastapi-speak-v0-production.up.railway.app/suggestions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            last_user_message: lastUser?.message || "",
            last_ai_reply: lastAI?.message || "",
          }),
        },
      );

      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  return (
    <div className="min-h-screen lg:w-full flex justify-center bg-linear-to-b from-slate-900 to-blue-950 p-4">
      <div
        className="w-full max-w-md space-y-6 flex flex-col"
        onClick={resetIdle}
        onWheel={resetIdle}
      >
        <Header />
        <Topic />
        <ChatSection
          chatHistory={chatHistory}
          liveTranscript={liveTranscript}
          bottomRef={bottomRef}
        />

        <div className="fixed bottom-20 lg:bottom-20 left-0 lg:w-full px-4 space-y-4">
          {isLupaKataActive && (
            <div className="fixed bottom-70 left-0 w-full flex justify-center z-50">
              <div className="w-full max-w-md px-4">
                <div className="bg-yellow-500/90 text-black rounded-xl px-4 py-3 text-center shadow-lg space-y-1">
                  {!isProcessingLupaKata ? (
                    <>
                      <div className="font-semibold animate-pulse">
                        🎧 Suara tertangkap, sedang mendengarkan
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <div className="font-semibold">⏳ Memproses suara</div>

                        <div className="flex justify-center text-xl font-bold tracking-widest">
                          <span className="dot">•</span>
                          <span className="dot">•</span>
                          <span className="dot">•</span>
                        </div>

                        <div className="text-xs opacity-80">
                          Using AI to recognize your speech…
                        </div>
                      </div>
                    </>
                  )}

                  {lupaKataHeardText && (
                    <div className="text-sm italic">“{lupaKataHeardText}”</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isRecording && <RecordingSection />}
          {showSuggestions && (
            <SuggestionSection
              suggestions={suggestions}
              playAudio={playAudio}
            />
          )}

          <ControlSection
            isRecording={isRecording}
            micReady={micReady}
            startRecording={startRecording}
            stopRecording={stopRecording}
            cancelRecording={cancelRecording}
            requestAudioPermission={requestAudioPermission}
            toggleSuggestion={toggleSuggestion}
            isIdle={isIdle}
            openLupaKata={startLupaKata}
            speakerReady={speakerReady}
          />
        </div>

        <div className="mb-48"></div>
      </div>

      {/* ⚠️ STYLE TIDAK DIUBAH */}
      <style>
        {`
            @keyframes wave {
              0%, 100% { height: 0.25rem; }
              50% { height: 1.5rem; }
            }
            .animate-wave {
              animation: wave 1s infinite ease-in-out;
            }
            .delay-200 { animation-delay: 0.2s; }
            .delay-400 { animation-delay: 0.4s; }
            .delay-600 { animation-delay: 0.6s; }
            .delay-800 { animation-delay: 0.8s; }
  
            @keyframes typing {
              0% { opacity: 0.2; }
              20% { opacity: 1; }
              100% { opacity: 0.2; }
            }
  
            .dot {
              animation: typing 1.4s infinite;
            }
  
            .dot:nth-child(2) {
              animation-delay: 0.2s;
            }
  
            .dot:nth-child(3) {
              animation-delay: 0.4s;
            }
  
          `}
      </style>
    </div>
  );
}
