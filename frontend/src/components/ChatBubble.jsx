// components/ChatBubble.jsx
import { useState } from "react";
// import useTTS_Google from "../hooks/useTTS_Google";
import useTranslate from "../hooks/useTranslate";

import { cleanAIText, normalizeTTS } from "../utils/textUtils";

export default function ChatBubble({
  chat,
  toggleFavorite,
  autoCorrectionRef,
  speakText,
  mode,
}) {
  const [translated, setTranslated] = useState(null);
  // const { speakText } = useTTS_Google(userIdRef, mode );
  // console.log(chat);
  const { translate } = useTranslate();

  const speak = (text) =>
    speakText(autoCorrectionRef.current ? text : cleanAIText(text));

  /* =====================
  HELPER / LUPA KATA
  ===================== */
  if (chat.sender === "Helper") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] p-3 rounded-lg bg-emerald-100 text-gray-900 shadow text-sm">
          {chat.type === "prompt" && (
            <div className="italic">{chat.message}</div>
          )}

          {chat.type === "result" && (
            <div className="space-y-1">
              <div>🇮🇩 {chat.indo}</div>
              <div className="font-semibold">🇬🇧 {chat.english}</div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => speakText(chat.english)}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  🔊 Play
                </button>

                {/* <button
                  onClick={() => console.log("Use this:", chat.english)}
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  ➕ Pakai
                </button> */}

                {chat.history_id && (
                  <button
                    onClick={() =>
                      toggleFavorite(chat.history_id, chat.is_favorite ?? false)
                    }
                    className="text-sm ml-1 px-2 py-1 rounded bg-yellow-100 hover:bg-yellow-200 transition flex items-center gap-1"
                  >
                    {(chat.is_favorite ?? false)
                      ? "⭐ Favorited"
                      : "☆ Favorite"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =====================
     AI / User Chat Bubble
  ===================== */
  return (
    <div
      className={`flex ${chat.sender === "You" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] p-3 rounded-lg relative ${
          chat.sender === "You"
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        }`}
      >
        <div className="whitespace-pre-line">{chat.message}</div>

        {chat.sender === "You" &&
          autoCorrectionRef.current &&
          chat.alternative && (
            <div className="mt-2 text-xs bg-white/20 rounded p-2 border border-white/30">
              <div className="text-green-200 font-medium">
                {chat.alternative ? (
                  <>✨ {chat.alternative}</>
                ) : (
                  <span className="opacity-70 animate-pulse">
                    ✨ Thinking...
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Tombol hanya untuk AI */}
        {chat.sender === "AI" && (
          <>
            <button
              onClick={() => speak(chat.message)}
              className="absolute bottom-1 right-1 text-xs bg-gray-300 px-2 py-0.5 rounded hover:bg-gray-400"
            >
              🔊
            </button>

            <button
              onClick={async () => {
                // kalau sudah ada hasil → klik lagi untuk hide
                if (translated) {
                  setTranslated(null);
                  return;
                }

                const res = await translate(chat.message);

                if (res?.translated) {
                  setTranslated(res.translated);
                }
              }}
              className="absolute top-1 right-1 text-xs bg-gray-300 px-2 py-0.5 rounded hover:bg-gray-400"
            >
              🌐
            </button>
          </>
        )}

        {translated && chat.sender === "AI" && (
          <div className="mt-2 text-xs p-2 rounded-lg bg-blue-50 border-l-4 border-blue-400">
            <div className="text-[10px] text-gray-500 mb-1">
              🌐 English → Indonesia
            </div>
            <div className="italic text-blue-700">{translated}</div>
          </div>
        )}
      </div>
    </div>
  );
}
