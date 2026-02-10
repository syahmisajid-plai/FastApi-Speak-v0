import { useState } from "react";
import useTTS_Google from "../hooks/useTTS_Google";

export default function ChatBubble({ chat }) {
  const [translated, setTranslated] = useState(null);
  const { speakText } = useTTS_Google();

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

                <button
                  onClick={() => console.log("Use this:", chat.english)}
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  ➕ Pakai
                </button>
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
        {chat.message}

        {/* Tombol hanya untuk AI */}
        {chat.sender === "AI" && (
          <>
            <button
              onClick={() => speakText(chat.message)}
              className="absolute bottom-1 right-1 text-xs bg-gray-300 px-2 py-0.5 rounded hover:bg-gray-400"
            >
              🔊
            </button>

            <button
              onClick={() => toggleTranslate(chat.message)}
              className="absolute top-1 right-1 text-xs bg-gray-300 px-2 py-0.5 rounded hover:bg-gray-400"
            >
              🌐
            </button>
          </>
        )}

        {translated && chat.sender === "AI" && (
          <div className="mt-2 text-xs italic text-green-700">{translated}</div>
        )}
      </div>
    </div>
  );
}
