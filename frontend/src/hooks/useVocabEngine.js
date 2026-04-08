import { useRef, useEffect, useState, useMemo } from "react";

// 🔥 fallback dummy
const defaultVocab = [
  {
    word: "happy",
    meaning: "merasa senang",
    examples: [
      "i am happy",
      "she is happy",
      "they are happy",
      "we feel happy",
      "i feel very happy",
    ],
  },
  {
    word: "eat",
    meaning: "makan",
    examples: [
      "i eat rice",
      "they eat together",
      "we eat lunch",
      "she eats fruit",
      "i eat breakfast",
    ],
  },
  {
    word: "go",
    meaning: "pergi",
    examples: [
      "i go home",
      "we go to school",
      "they go there",
      "she goes to market",
      "i go now",
    ],
  },
  {
    word: "like",
    meaning: "suka",
    examples: [
      "i like coffee",
      "i like music",
      "she likes tea",
      "they like it",
      "we like this game",
    ],
  },
];

export default function useVocabEngine(vocabList = null) {
  const data = vocabList?.length ? vocabList : defaultVocab;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("wordIntro");
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [showDice, setShowDice] = useState(false);

  // 🔥 NEW: track example progress
  const [exampleIndex, setExampleIndex] = useState(0);

  // =========================
  // SAFE VOCAB
  // =========================
  const vocab = data[index] || null;

  // =========================
  // SEQUENTIAL EXAMPLE (1 BY 1)
  // =========================
  const example = vocab?.examples?.[exampleIndex] || "";
  const examples = useMemo(() => vocab?.examples || [], [index]);

  // =========================
  // REFS (anti stale state)
  // =========================
  const phaseRef = useRef(phase);
  const vocabRef = useRef(vocab);
  const examplesRef = useRef(examples);
  const exampleIndexRef = useRef(exampleIndex);
  const attemptRef = useRef(attempt);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    vocabRef.current = vocab;
  }, [vocab]);

  useEffect(() => {
    examplesRef.current = examples;
  }, [examples]);

  useEffect(() => {
    exampleIndexRef.current = exampleIndex;
  }, [exampleIndex]);

  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);

  // =========================
  // NORMALIZE TEXT
  // =========================
  const normalize = (text) =>
    text
      ?.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

  // =========================
  // HANDLE SPEECH
  // =========================
  const handleSpeech = (text) => {
    const currentPhase = phaseRef.current;
    const currentVocab = vocabRef.current;
    const currentExamples = examplesRef.current;
    const currentExampleIndex = exampleIndexRef.current;
    const currentAttempt = attemptRef.current;

    if (!currentVocab) return;

    const user = normalize(text);
    const target = normalize(currentExamples[currentExampleIndex]);

    console.log("=== 🧠 VOCAB DEBUG ===");
    console.log("PHASE:", currentPhase);
    console.log("👤 USER:", user);
    console.log("🎯 TARGET:", target);
    console.log("📍 EXAMPLE INDEX:", currentExampleIndex);

    const isCorrect = user === target;

    console.log("✅ MATCH RESULT:", isCorrect);
    console.log("======================");

    // =========================
    // LISTEN EXAMPLE (SEQUENTIAL DRILL)
    // =========================
    if (currentPhase === "guidedPractice") {
      if (isCorrect) {
        setFeedback("✅ Benar!");

        const nextIndex = currentExampleIndex + 1;

        // 🔥 masih ada example berikutnya
        if (nextIndex < currentVocab.examples.length) {
          setExampleIndex(nextIndex);
          setAttempt(0);
          setFeedback("➡️ Lanjut example berikutnya");
        } else {
          // 🔥 selesai semua example
          setExampleIndex(0);
          setAttempt(0);
          setPhase("makeSentence");
          setFeedback("🎯 Semua example selesai!");
        }
      } else {
        if (currentAttempt === 0) {
          setFeedback("❌ Coba lagi");
          setAttempt(1);
        } else {
          const nextIndex = currentExampleIndex + 1;

          if (nextIndex < currentVocab.examples.length) {
            setExampleIndex(nextIndex);
            setAttempt(0);
            setFeedback("➡️ Lanjut example berikutnya");
          } else {
            setExampleIndex(0);
            setAttempt(0);
            setPhase("makeSentence");
            setFeedback("🎯 Lanjut ke sentence!");
          }
        }
      }
    }

    // =========================
    // MAKE SENTENCE
    // =========================
    else if (currentPhase === "makeSentence") {
      const containsWord = user.includes(currentVocab.word.toLowerCase());

      if (containsWord) {
        setFeedback("🔥 Bagus!");
      } else {
        setFeedback("👍 Oke, tapi coba pakai katanya ya");
      }

      setPhase("completed");
    }
  };

  // =========================
  // NEXT VOCAB
  // =========================
  const next = async () => {
    setShowDice(true);

    setFeedback("");
    setAttempt(0);
    setExampleIndex(0);
    setPhase("wordIntro");

    await new Promise((r) => setTimeout(r, 1000));

    setIndex((i) => i + 1);

    setShowDice(false);
  };

  const startSession = () => {
    setShowDice(true);

    setTimeout(() => {
      setShowDice(false);
    }, 1000);
  };

  // =========================
  // PROGRESS
  // =========================
  const progress = `${index + 1}/${data.length}`;

  return {
    vocab,
    example, // 🔥 single example for UI
    examples, // optional (kalau mau debug/list)
    exampleIndex, // 🔥 untuk UI progress
    phase,
    feedback,
    progress,

    handleSpeech,
    next,
    setPhase,
    showDice,
    startSession,
  };
}
