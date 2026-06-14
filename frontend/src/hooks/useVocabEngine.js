// useVocabEngine.js
import { useRef, useEffect, useState, useMemo } from "react";
import { linkBackend } from "../config";

// =========================
// ENGINE
// =========================
export default function useVocabEngine(userIdRef) {
  //   const data = apiVocab?.length ? apiVocab : defaultVocab;

  const [vocabStage, setVocabStage] = useState("idle");
  // idle | journey | session

  const [apiVocab, setApiVocab] = useState([]);
  const [loading, setLoading] = useState(true);

  const [completedMap, setCompletedMap] = useState({});

  // const filteredData = useMemo(() => {
  //   if (!apiVocab.length) return [];

  //   return apiVocab.filter((v) => !completedMap[v.id]);
  // }, [apiVocab, completedMap]);

  const [shuffledData, setShuffledData] = useState([]);

  const [meaningOptions, setMeaningOptions] = useState([]);

  // useEffect(() => {
  //   if (!filteredData.length) return;

  //   const shuffled = [...filteredData].sort(() => Math.random() - 0.5);
  //   setShuffledData(shuffled);
  // }, [filteredData]);

  useEffect(() => {
    if (!apiVocab.length) return;

    const shuffled = [...apiVocab].sort(() => Math.random() - 0.5);
    setShuffledData(shuffled);
  }, [apiVocab]);

  const data = shuffledData;

  // useEffect(() => {
  //   setIndex(0);
  // }, [shuffledData]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("wordIntro");
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [showDice, setShowDice] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);

  // =========================
  // CURRENT VOCAB
  // =========================
  const vocab = useMemo(() => {
    if (!data.length) return null;

    let i = index;
    let tries = 0;

    while (completedMap[data[i % data.length]?.id] && tries < data.length) {
      i++;
      tries++;
    }

    return data[i % data.length];
  }, [data, index, completedMap]);
  const examples = useMemo(() => vocab?.examples || [], [vocab]);
  const exampleObj = examples[exampleIndex] || {};
  const example = exampleObj.en || "";
  const translation = exampleObj.id || "";

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

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const res = await fetch(`${linkBackend}/vocab/all`);
        const json = await res.json();

        if (json?.data?.length) {
          setApiVocab(json.data);
        }
      } catch (err) {
        console.log("❌ Failed to fetch vocab:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVocab();
  }, []);

  useEffect(() => {
    const userId = userIdRef?.current;
    if (!userId) return;

    const fetchCompleted = async () => {
      try {
        const res = await fetch(`${linkBackend}/vocab/completed-ids/${userId}`);
        const json = await res.json();

        const map = {};
        json.completed_vocab_ids.forEach((item) => {
          map[item.vocab_id] = item.status;
        });

        setCompletedMap(map);
      } catch (err) {
        console.log("❌ failed fetch completed:", err);
      }
    };

    fetchCompleted();
  }, [userIdRef?.current]); // 🔥 penting

  useEffect(() => {
    if (apiVocab.length) {
      setIndex(0);
      setExampleIndex(0);
      setPhase("wordIntro");
    }
  }, [apiVocab]);

  // =========================
  // UPDATE VOCAB USER
  // =========================
  const markCompleted = async (userId, vocabId) => {
    try {
      console.log("🔥 [MARK COMPLETED] REQUEST:");
      console.log("➡️ userId:", userId);
      console.log("➡️ vocabId:", vocabId);
      console.log("➡️ payload:", {
        user_id: userId,
        vocab_id: vocabId,
      });

      const res = await fetch(`${linkBackend}/vocab/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          vocab_id: vocabId,
        }),
      });

      console.log("📡 response status:", res.status);

      const data = await res.json().catch(() => null);

      console.log("📦 response body:", data);

      setCompletedMap((prev) => ({
        ...prev,
        [vocabId]: "completed",
      }));
    } catch (err) {
      console.log("❌ mark completed error:", err);
    }
  };

  const hasMarkedRef = useRef(false);

  useEffect(() => {
    if (phase !== "completed") {
      hasMarkedRef.current = false;
      return;
    }

    if (hasMarkedRef.current) return;

    hasMarkedRef.current = true;

    const vocabId = vocabRef.current?.id;
    const userId = userIdRef?.current;

    if (vocabId) {
      markCompleted(userId, vocabId);
    }
  }, [phase]);

  // ==========================
  // NORMALIZE
  // ==========================
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

    if (!currentExamples[currentExampleIndex]) return;

    const user = normalize(text);
    const target = normalize(currentExamples[currentExampleIndex]?.en);

    const isCorrect =
      user === target || user.includes(target) || target.includes(user);

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

      setFeedback(containsWord ? "🔥 Good!" : "👍 Good!");

      setPhase("completed");
    }
  };

  // =========================
  // NEXT VOCAB
  // =========================
  const getNextIndex = (current) => {
    if (!data.length) return 0;

    let i = current + 1;
    let tries = 0;

    while (completedMap[data[i % data.length]?.id] && tries < data.length) {
      i++;
      tries++;
    }

    return i;
  };

  const next = () => {
    setIndex((i) => getNextIndex(i));

    setMeaningOptions([]);
    setFeedback("");
    setAttempt(0);
    setExampleIndex(0);
    setPhase("wordIntro");

    setTimeout(() => {
      setShowDice(true);
    }, 0);
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
    setVocabStage("session");

    setIndex(0);
    setExampleIndex(0);
    setMeaningOptions([]);
    setPhase("wordIntro");
    setShowDice(true);
  };

  const goToJourney = () => {
    setVocabStage("journey");

    setIndex(0);
    setExampleIndex(0);
    setPhase("wordIntro");
    setFeedback("");
  };

  // =========================
  // JUMLAH KATA SELESAI
  // =========================
  const completedCountVocab = useMemo(() => {
    return Object.keys(completedMap).length;
  }, [completedMap]);

  // =========================
  // SKIP BUTTON
  // =========================
  const markKnown = async (userId, vocabId) => {
    try {
      const res = await fetch(`${linkBackend}/vocab/known`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          vocab_id: vocabId,
        }),
      });

      const data = await res.json().catch(() => null);
    } catch (err) {
      console.log("❌ mark known error:", err);
    }
  };

  // const skipbutton = () => {
  //   const vocabId = vocabRef.current?.id;
  //   const userId = userIdRef?.current;

  //   // 🔥 update UI dulu
  //   setCompletedMap((prev) => ({
  //     ...prev,
  //     [vocabId]: "known",
  //   }));

  //   next();
  //   markKnown(userId, vocabId);
  // };

  const resetVocab = () => {
    setIndex(0);
    setExampleIndex(0);
    setAttempt(0);
    setFeedback("");
    setMeaningOptions([]);
    setPhase("wordIntro");

    setVocabStage("idle");
  };

  // =========================
  // MEANING QUIZ
  // =========================
  const generateMeaningQuiz = () => {
    if (!vocabRef.current) return;

    const correct = vocabRef.current.meaning;

    const distractors = data
      .filter(
        (v) =>
          v.id !== vocabRef.current.id &&
          v.meaning &&
          v.meaning !== correct
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.meaning);

    const options = [correct, ...distractors]
      .sort(() => Math.random() - 0.5);

    setMeaningOptions(options);
  };

  const startPractice = () => {
    setPhase("showMeaning");
  };

  const startVerifyMeaning = () => {
    generateMeaningQuiz();
    setPhase("verifyMeaning");
  };

  const verifyMeaningAnswer = (answer) => {
    const correct = vocabRef.current?.meaning;

    if (answer === correct) {
      const vocabId = vocabRef.current?.id;
      const userId = userIdRef?.current;

      setCompletedMap((prev) => ({
        ...prev,
        [vocabId]: "known",
      }));
      
      markKnown(userId, vocabId);
      next();
    } else {
      setPhase("showMeaning");
    }
  };

  const continuePractice = () => {
    setPhase("guidedPractice");
  };

  // =========================
  // PROGRESS
  // =========================
  const progress = data.length ? `${index + 1}/${data.length}` : "0/0";
  return {
    vocab,
    example,
    translation,
    examples,
    exampleIndex,
    phase,
    feedback,
    progress,

    handleSpeech,
    next,
    setPhase,
    showDice,
    vocabStage,
    setVocabStage,
    startSession,
    goToJourney,
    completedCountVocab,
    // skipbutton,
    resetVocab,

    meaningOptions,
    startPractice,
    startVerifyMeaning,
    verifyMeaningAnswer,
    continuePractice,
  };
}
