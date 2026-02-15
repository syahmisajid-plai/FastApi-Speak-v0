import { useState } from "react";
import { linkBackend } from "../config";

export default function useSuggestions(chatHistory) {
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async () => {
    const lastUser = [...chatHistory].reverse().find((c) => c.sender === "You");
    const lastAI = [...chatHistory].reverse().find((c) => c.sender === "AI");

    if (!lastUser && !lastAI) return;

    const res = await fetch(`${linkBackend}/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        last_user_message: lastUser?.message || "",
        last_ai_reply: lastAI?.message || "",
      }),
    });

    const data = await res.json();
    setSuggestions(data.suggestions);
  };

  return { suggestions, fetchSuggestions };
}
