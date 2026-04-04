import { useState } from "react";
import { linkBackend } from "../config";

export default function useGrammarCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [result, setResult] = useState({
    highlighted: "",
    corrected: "",
    score: 100,
    hasError: false,
    errorCount: 0,
  });

  const checkGrammar = async (text) => {
    if (!text || text.trim() === "") return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${linkBackend}/daily-story/grammar/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          language: "en-US",
        }),
      });

      const data = await res.json();

      if (data.status !== "success") {
        throw new Error(data.message || "Grammar check failed");
      }

      const correction = data.data.correction;
      const meta = data.data.meta;

      setResult({
        highlighted: correction.highlighted_sentence,
        corrected: correction.corrected_sentence,
        score: meta.score,
        hasError: meta.has_error,
        errorCount: meta.error_count,
      });

      return data.data; // optional: kalau mau dipakai langsung
    } catch (err) {
      console.error("Grammar check error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    checkGrammar,
    result,
    loading,
    error,
  };
}
