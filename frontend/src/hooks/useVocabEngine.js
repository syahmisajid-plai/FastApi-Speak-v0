import { useRef, useEffect, useState, useMemo } from "react";

// =========================
// FALLBACK VOCAB
// =========================
const defaultVocab = [
  {
    id: 1,
    word: "happy",
    meaning: "merasa senang",
    type: "adjective",
    level: "A1",
    examples: [
      "i am happy",
      "she is very happy",
      "they are happy with the result",
    ],
  },
  {
    id: 2,
    word: "eat",
    meaning: "makan",
    type: "verb",
    level: "A1",
    examples: ["i eat rice", "they eat together", "she eats fruit"],
  },
  {
    id: 3,
    word: "go",
    meaning: "pergi",
    type: "verb",
    level: "A1",
    examples: ["i go home", "we go to school", "she goes to market"],
  },
  {
    id: 4,
    word: "like",
    meaning: "suka",
    type: "verb",
    level: "A1",
    examples: ["i like coffee", "she likes tea", "we like this game"],
  },
];

// =========================
// ENGINE
// =========================
export default function useVocabEngine(vocabList = null) {
  const data = vocabList?.length ? vocabList : defaultVocab;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("wordIntro");
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [showDice, setShowDice] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);

  // =========================
  // CURRENT VOCAB
  // =========================
  const vocab = data[index] || null;
  const examples = useMemo(() => vocab?.examples || [], [vocab?.id]);
  const example = examples[exampleIndex] || "";

  // =========================
  // REFS (avoid stale state)
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
  // NORMALIZE
  // =========================
  const normalize = (text) =>
    text
      ?.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

  // =========================
  // SPEECH HANDLER
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

    const isCorrect = user === target;

    // =========================
    // GUIDED PRACTICE
    // =========================
    if (currentPhase === "guidedPractice") {
      if (isCorrect) {
        const nextIndex = currentExampleIndex + 1;

        setFeedback("✅ Correct!");
        setAttempt(0);

        if (nextIndex < currentExamples.length) {
          setExampleIndex(nextIndex);
        } else {
          setExampleIndex(0);
          setPhase("makeSentence");
          setFeedback("🎯 All examples done!");
        }
      } else {
        if (currentAttempt === 0) {
          setFeedback("❌ Try again");
          setAttempt(1);
        } else {
          const nextIndex = currentExampleIndex + 1;

          setAttempt(0);

          if (nextIndex < currentExamples.length) {
            setExampleIndex(nextIndex);
            setFeedback("➡️ Next example");
          } else {
            setExampleIndex(0);
            setPhase("makeSentence");
            setFeedback("🎯 Move to sentence");
          }
        }
      }
    }

    // =========================
    // MAKE SENTENCE
    // =========================
    else if (currentPhase === "makeSentence") {
      const containsWord = user.includes(currentVocab.word.toLowerCase());

      setFeedback(containsWord ? "🔥 Good!" : "👍 Try using the target word");

      setPhase("completed");
    }
  };

  // =========================
  // NEXT VOCAB
  // =========================
  const next = () => {
    setShowDice(true);

    setFeedback("");
    setAttempt(0);
    setExampleIndex(0);
    setPhase("wordIntro");

    setTimeout(() => {
      setIndex((i) => i + 1);
    }, 1000);
  };

  // =========================
  // DICE TIMER
  // =========================
  useEffect(() => {
    if (!showDice) return;

    const t = setTimeout(() => {
      setShowDice(false);
    }, 1000);

    return () => clearTimeout(t);
  }, [showDice]);

  const startSession = () => {
    setShowDice(true);
  };

  // =========================
  // PROGRESS
  // =========================
  const progress = `${index + 1}/${data.length}`;

  return {
    vocab,
    example,
    examples,
    exampleIndex,
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
