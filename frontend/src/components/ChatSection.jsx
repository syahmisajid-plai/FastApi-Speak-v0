import { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import rewardSound from "../assets/sound/freesound_community-positive-response-81640.mp3";

export default function ChatSection({
  chatHistory,
  liveTranscript,
  lupaKata,
  bottomRef,
  disabled = false,
  mode,
  data,
  toggleFavorite,
  autoCorrectionRef,
  speakText,

  isTranscribing,
  isRecording,
}) {
  const [floatingRewards, setFloatingRewards] = useState([]);

  // 🔊 pakai ref supaya tidak recreate tiap render
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(rewardSound);
    audioRef.current.volume = 0.3;
  }, []);

  const playRewardSound = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  // ✨ TRIGGER REWARD
  useEffect(() => {
    if (chatHistory.length === 0) return;

    const lastChat = chatHistory[chatHistory.length - 1];

    if (lastChat.sender === "You") {
      const rewards = ["+5 Fluency", "+2 Confidence"];

      // 🔊 PLAY SOUND ONCE
      playRewardSound();

      rewards.forEach((text, index) => {
        const id = Date.now() + index;

        setFloatingRewards((prev) => [...prev, { id, text }]);

        setTimeout(() => {
          setFloatingRewards((prev) => prev.filter((r) => r.id !== id));
        }, 1800);
      });
    }
  }, [chatHistory]);

  return (
    <section className="relative rounded-xl p-4 shadow flex flex-col space-y-2 max-h-max overflow-y-auto">
      {/* ✨ FLOATING REWARDS */}
      <div className="absolute bottom-16 right-1/4 flex flex-col gap-2 z-50 pointer-events-none">
        {floatingRewards.map((reward) => (
          <div
            key={reward.id}
            className="
              animate-reward
              bg-white/10
              backdrop-blur-md
              text-white
              px-3 py-1
              rounded-full
              text-sm
              shadow-lg
              border border-white/10
            "
          >
            ✨ {reward.text}
          </div>
        ))}
      </div>

      {/* Overlay */}
      {mode === "dailyStory" && disabled && (
        <div className="absolute inset-0 z-25 bg-black/70 flex flex-col items-center justify-center text-center p-4 rounded-xl">
          <h2 className="text-white text-lg font-bold mb-2">
            🎉 Daily hari ini sudah complete!
          </h2>

          <p className="text-gray-200 text-sm mb-4">
            Terima kasih telah menyelesaikan semua phase hari ini.
          </p>
        </div>
      )}

      {/* Chat history */}
      {chatHistory.map((chat, idx) => {
        if (chat.type === "phase") {
          return (
            <div key={idx} className="flex items-center my-4">
              <div className="flex-1 h-[1px] bg-white/20"></div>

              <div className="px-3 text-[11px] text-white/60">
                {chat.phase?.toUpperCase() || "[UNKNOWN PHASE]"}
              </div>

              <div className="flex-1 h-[1px] bg-white/20"></div>
            </div>
          );
        }

        return (
          <ChatBubble
            key={idx}
            chat={chat}
            data={data}
            toggleFavorite={toggleFavorite}
            autoCorrectionRef={autoCorrectionRef}
            speakText={speakText}
            mode={mode}
          />
        );
      })}

      {/* Live transcript */}
      {liveTranscript && (
        <div className="flex justify-end">
          <div className="max-w-[75%] p-3 rounded-lg bg-yellow-100 text-gray-900 italic">
            🎤 {liveTranscript}
            {isTranscribing && (
              <span className="ml-1 inline-flex">
                <span className="animate-pulse">...</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Whisper processing */}
      {isTranscribing && !liveTranscript && isRecording && (
        <div className="flex justify-end">
          <div className="max-w-[75%] p-3 rounded-lg bg-blue-500 text-white rounded-br-none">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:150ms]"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:300ms]"></span>
            </div>
          </div>
        </div>
      )}

      {/* LUPA KATA */}
      {lupaKata.lupaKataHeardText && (
        <div className="flex justify-end">
          <div className="max-w-[75%] p-3 rounded-lg bg-orange-100 text-gray-900 italic">
            🤔 “{lupaKata.lupaKataHeardText}”
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </section>
  );
}
