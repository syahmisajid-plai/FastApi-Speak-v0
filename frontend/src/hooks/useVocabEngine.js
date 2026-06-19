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

  const [allVocab, setAllVocab] = useState([]);
  const [apiVocab, setApiVocab] = useState([]);

  const [chapterList, setChapterList] = useState([]);

  const [completedMap, setCompletedMap] = useState({});

  const [meaningOptions, setMeaningOptions] = useState([]);

  const [currentId, setCurrentId] = useState(null);

  const [currentChapter, setCurrentChapter] = useState(null);

  const [chapterCompleted, setChapterCompleted] = useState(false);

  const [chapterProgressMap, setChapterProgressMap] = useState({});

  const totalChapterVocab = apiVocab.length;
  const completedChapterVocab = useMemo(() => {
    return apiVocab.filter((v) => completedMap[v.id]).length;
  }, [apiVocab, completedMap]);
  const remainingChapterVocab = totalChapterVocab - completedChapterVocab;

  // =========================
  // SHUFFLE DATA
  // =========================
  // const [shuffledData, setShuffledData] = useState([]);

  // useEffect(() => {
  //   if (!apiVocab.length) return;

  //   const shuffled = [...apiVocab].sort(() => Math.random() - 0.5);
  //   setShuffledData(shuffled);
  // }, [apiVocab]);

  const filteredApiVocab = useMemo(() => {
    if (!apiVocab.length) return [];

    return apiVocab.filter((v) => !completedMap[v.id]);
  }, [apiVocab, completedMap]);

  const data = filteredApiVocab;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("wordIntro");
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [showDice, setShowDice] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);

  // =========================
  // CURRENT VOCAB
  // =========================
  // const vocab = useMemo(() => {
  //   if (!data.length) return null;

  //   let i = index;
  //   let tries = 0;

  //   while (completedMap[data[i % data.length]?.id] && tries < data.length) {
  //     i++;
  //     tries++;
  //   }

  //   return data[i % data.length];
  // }, [data, index, completedMap]);

  // =========================
  // NEW CURRENT VOCAB
  // =========================
  const vocab = useMemo(() => {
    if (!data.length) return null;
    return data.find((v) => v.id === currentId) || data[0];
  }, [data, currentId]);

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

  // =========================
  // ALL-VOCAB
  // =========================
  useEffect(() => {
    const fetchAllVocab = async () => {
      try {
        const res = await fetch(`${linkBackend}/vocab/all`);
        const json = await res.json();

        if (json?.data) {
          setAllVocab(json.data);
        }
      } catch (err) {
        console.log("❌ failed fetch all vocab:", err);
      }
    };

    fetchAllVocab();
  }, []);

  // =========================
  // CHAPTER-VOCAB
  // =========================
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        // console.log("📡 fetching chapters...");

        const res = await fetch(`${linkBackend}/vocab/chapters`);
        const json = await res.json();

        // console.log("📦 raw response:", json);

        if (json?.data?.length) {
          // setChapterList(json.data);
          setChapterList(
            json.data.map((c) => ({
              id: c[0],
              category: c[1],
              title: c[2],
              sort_order: c[3],
            })),
          );
        } else {
          console.log("⚠️ chapter data kosong");
        }
      } catch (err) {
        console.log("❌ failed fetch chapters:", err);
      }
    };

    fetchChapters();
  }, []);

  const [chapterStats, setChapterStats] = useState({
    total: 0,
    completed: 0,
    remaining: 0,
    units: [],
  });

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showModal, setShowModal] = useState(null);

  // =========================
  // GET CHAPTER STATS
  // =========================
  const getChapterStats = async (chapterId) => {
    try {
      const res = await fetch(`${linkBackend}/vocab/chapters/${chapterId}`);
      const json = await res.json();

      if (!json?.data?.length) {
        return {
          id: chapterId,
          total: 0,
          completed: 0,
          remaining: 0,
          units: [],
        };
      }

      const sorted = json.data
        .map((v) => ({
          id: v.id,
          position: v.position ?? 0,
        }))
        .sort((a, b) => a.position - b.position);

      const total = sorted.length;

      const completed = sorted.filter((v) => completedMap[v.id]).length;

      const units = [];

      for (let i = 0; i < sorted.length; i += 10) {
        const unitVocab = sorted.slice(i, i + 10);

        const unitCompleted = unitVocab.filter(
          (v) => completedMap[v.id],
        ).length;

        units.push({
          unit: units.length + 1,
          completed: unitCompleted,
          total: unitVocab.length,
        });
      }

      return {
        id: chapterId,
        total,
        completed,
        remaining: total - completed,
        units,
      };
    } catch (err) {
      console.log("❌ Failed get chapter stats:", err);

      return {
        id: chapterId,
        total: 0,
        completed: 0,
        remaining: 0,
        units: [],
      };
    }
  };

  // =========================
  // OPEN MODAL
  // =========================
  const openChapterModal = async (chapterId) => {
    const stats = await getChapterStats(chapterId);

    setSelectedChapter(chapterId);
    setChapterStats(stats);
    setShowModal(true);
  };

  // =========================
  // LOAD CHAPTER
  // =========================
  const loadChapter = async (chapterId) => {
    try {
      const res = await fetch(`${linkBackend}/vocab/chapters/${chapterId}`);
      const json = await res.json();

      console.log("🔥 RAW CHAPTER DATA:", json.data?.[0]);

      if (json?.data?.length) {
        const vocabData = json.data.map((v) => ({
          ...v,
          examples: v.examples || [],
        }));

        const totalVocab = vocabData.length;

        const completedVocab = vocabData.filter(
          (v) => completedMap[v.id],
        ).length;

        console.log("📚 total vocab:", totalVocab);
        console.log("✅ completed vocab:", completedVocab);
        console.log("⏳ remaining vocab:", totalVocab - completedVocab);

        setApiVocab(vocabData);

        // 🔥 ADD THIS
        setCurrentChapter({
          id: chapterId,
          title: chapterList.find((c) => c.id === chapterId)?.title || "",
        });
      }
    } catch (err) {
      console.log("❌ Failed load chapter:", err);
    }
  };

  // =========================
  // fetchAllProgress for Status Chapters
  // =========================
  const fetchAllProgress = async () => {
    const result = {};

    const promises = chapterList.map(async (chapter) => {
      const stats = await getChapterStats(chapter.id);
      result[chapter.id] = {
        completed: stats.completed,
        total: stats.total,
      };
    });

    await Promise.allSettled(promises);

    setChapterProgressMap(result);
  };

  // useEffect(() => {
  //   console.log("📦 filtered vocab (data):", data);
  // }, [data]);

  const goNextChapter = async () => {
    if (!currentChapter) return;

    const currentIndex = chapterList.findIndex(
      (c) => c.id === currentChapter.id,
    );

    const nextChapter = chapterList[currentIndex + 1];

    if (!nextChapter) {
      return; // chapter terakhir
    }

    await loadChapter(nextChapter.id);

    setChapterCompleted(false);
    setCurrentId(null);
    setFeedback("");
    setPhase("wordIntro");
  };

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

      const data = await res.json().catch(() => null);

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
  // const getNextIndex = (current) => {
  //   if (!data.length) return 0;

  //   let i = current + 1;
  //   let tries = 0;

  //   while (completedMap[data[i % data.length]?.id] && tries < data.length) {
  //     i++;
  //     tries++;
  //   }

  //   return i;
  // };

  // =========================
  // NEW NEXT VOCAB
  // =========================
  const getNextIndex = (current) => {
    if (!data.length) return 0;
    return (current + 1) % data.length;
  };

  const next = () => {
    setMeaningOptions([]);
    setFeedback("");
    setAttempt(0);
    setExampleIndex(0);
    setPhase("wordIntro");

    const currentIndex = data.findIndex((v) => v.id === currentId);
    const nextItem = data[(currentIndex + 1) % data.length];

    setCurrentId(nextItem?.id);
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

  const startSession = async (chapterId) => {
    await loadChapter(chapterId);

    setVocabStage("session");
    setIndex(0);
    setExampleIndex(0);
    setMeaningOptions([]);
    setPhase("wordIntro");
    setShowDice(true);

    setChapterCompleted(false);
  };

  const goToJourney = async (chapterId) => {
    await loadChapter(chapterId);

    setVocabStage("session");
    setIndex(0);
    setExampleIndex(0);
    setPhase("wordIntro");
    setFeedback("");

    setChapterCompleted(false);
  };

  // =========================
  // JUMLAH KATA SELESAI
  // =========================
  const completedCountVocab = useMemo(() => {
    return allVocab.filter((v) => completedMap[v.id]).length;
  }, [allVocab, completedMap]);

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
          v.id !== vocabRef.current.id && v.meaning && v.meaning !== correct,
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.meaning);

    const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

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

  useEffect(() => {
    if (apiVocab.length && filteredApiVocab.length === 0) {
      setChapterCompleted(true);
    }
  }, [apiVocab, filteredApiVocab]);

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

    chapterStats, // 👈 tambahkan ini
    openChapterModal, // 👈 kalau mau dipanggil dari UI
    chapterList,
    currentChapter,

    totalChapterVocab,
    completedChapterVocab,
    remainingChapterVocab,

    chapterCompleted,
    goNextChapter,
    chapterProgressMap,

    meaningOptions,
    startPractice,
    startVerifyMeaning,
    verifyMeaningAnswer,
    continuePractice,
  };
}
