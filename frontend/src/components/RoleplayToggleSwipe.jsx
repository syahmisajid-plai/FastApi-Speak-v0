// ================== REACT CORE ==================
import { useEffect, useState, useRef } from "react";
import bgTree from "../assets/bg_tree.jpg";
import airport from "../assets/airport.png";
import interview from "../assets/interview.jpg";
import orderFood from "../assets/order_food.png";
import xshopping from "../assets/shopping.jpg";

import easy_mode from "../assets/7AvxLpHYRtmcMPAtwJGRtQ.webp";
import medium_mode from "../assets/360_F_1487969412_OJJSsXoi9qcN72n06ZODBiX9BJAVKgPl.jpg";
import hard_mode from "../assets/ya_-re-dragon-vs.jpg";
import hard_mode2 from "../assets/knight-vs-dragon-battle-vector-59124162.avif";

import food from "../assets/food.jpg";
import work from "../assets/work.png";
import daily_life from "../assets/Daily_Life.avif";
import travel from "../assets/travel.avif";
import shopping from "../assets/Shopping.avif";
import health from "../assets/Health.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-cards";

import { linkBackend } from "../config";

export default function RoleplayToggleSwipe({
  started,
  setStarted,
  selectedScenario,
  onScenarioSelect,
  isOpen, // <-- dari parent
  setIsOpen, // <-- dari parent
  lastUserMessage,
  onFinish,
  onChecklistUpdate,
  currentTurn,
  maxTurn,
  sendInitialMessage,
}) {
  // const difficulties = [
  //   { id: 1, name: "Easy Mode", image: easy_mode },
  //   { id: 2, name: "Medium Mode", image: medium_mode },
  //   { id: 3, name: "Hard Mode", image: hard_mode },
  //   { id: 4, name: "Hard Mode", image: hard_mode2 },
  // ];

  const category = [
    { id: 1, name: "Food", image: food },
    { id: 2, name: "Work", image: work },
    { id: 3, name: "Daily Life", image: daily_life },
    { id: 4, name: "Travel", image: travel },
    { id: 5, name: "Shopping", image: shopping },
    { id: 6, name: "Health", image: health },
  ];

  useEffect(() => {
    if (!lastUserMessage || !activeChecklist) return;

    updateChecklistProgress(lastUserMessage);
  }, [lastUserMessage]);

  const handleSelect = (scenario) => {
    setIsOpen(false);
    if (onScenarioSelect) onScenarioSelect(scenario);
  };

  const [activeScenario, setActiveScenario] = useState(null);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("category");
  // const [selectedDifficulty, setSelectedCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mission, setMission] = useState(null);
  const [activeChecklist, setActiveChecklist] = useState(null);

  const [hasFinished, setHasFinished] = useState(false);

  // Checklist Selesai
  useEffect(() => {
    if (!activeChecklist || !onFinish || hasFinished) return;

    let latestChecklist = [...activeChecklist];

    // 🔥 RE-CHECK last message biar tidak miss
    if (lastUserMessage) {
      const text = lastUserMessage.toLowerCase();

      for (let i = 0; i < latestChecklist.length; i++) {
        const item = latestChecklist[i];

        if (item.done) continue;

        const prevDone = i === 0 || latestChecklist[i - 1].done;
        if (!prevDone) break;

        const matched = item.keywords.some((kw) => {
          const regex = new RegExp(`\\b${kw}\\b`, "i");
          return regex.test(text);
        });

        if (matched) {
          latestChecklist[i] = { ...item, done: true };
        }

        break;
      }
    }

    const totalDone = latestChecklist.filter((item) => item.done).length;
    const totalChecklist = latestChecklist.length;

    const isAllDone = totalChecklist > 0 && totalDone === totalChecklist;
    const isTurnFinished = maxTurn > 0 && currentTurn >= maxTurn;

    if (isAllDone || isTurnFinished) {
      setHasFinished(true);

      console.log("Checklist Progress:");
      console.log("Total Done:", totalDone);
      console.log("Total Checklist:", totalChecklist);
      console.log("Turn:", currentTurn, "/", maxTurn);

      onFinish({ totalDone, totalChecklist });

      setActiveChecklist(null);
    }
  }, [
    activeChecklist,
    lastUserMessage, // 🔥 penting
    currentTurn,
    maxTurn,
    onFinish,
    hasFinished,
  ]);

  useEffect(() => {
    if (isOpen) {
      setStep("category");
      setSelectedCategory(null);
      setMission(null);
      setHasFinished(false); // ✅ reset
    }
  }, [isOpen]);

  const dummyMission = {
    category: "Restaurant",
    difficulty: "Medium",
    scenario: "You are asking the waiter for food recommendations.",
    goal: "Order a meal and confirm the price.",
    checklist: [
      "Greet the waiter",
      "Ask for recommendation",
      "Ask about ingredients",
      "Order food",
      "Confirm the price",
    ],
  };

  const getCurrentStep = (checklist) => {
    return checklist.find((item) => !item.done);
  };

  const updateChecklistProgress = (input) => {
    const text = input.toLowerCase();

    setActiveChecklist((prev) => {
      if (!prev) return prev;

      const updated = [...prev];

      for (let i = 0; i < updated.length; i++) {
        const item = updated[i];

        if (item.done) continue;

        const prevDone = i === 0 || updated[i - 1].done;
        if (!prevDone) break;

        const matched = item.keywords.some((kw) => {
          const regex = new RegExp(`\\b${kw}\\b`, "i");
          return regex.test(text);
        });

        if (matched) {
          updated[i] = { ...item, done: true };
        }

        break;
      }

      // 🔥 TAMBAHKAN INI
      const currentStep = getCurrentStep(updated);

      // 🔥 KIRIM KE PARENT
      if (onChecklistUpdate) {
        onChecklistUpdate(updated, currentStep);
      }

      return updated;
    });
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCloseOrSelect = async (scenario = null) => {
    try {
      setLoading(true);

      if (setIsOpen) setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dummyScenarioName = "Airport Check-in";

  return (
    <>
      {/* // ================== MAIN ================== */}
      <section
        className={`mx-4 transition-all duration-500 ${
          started ? "mt-4" : "mt-36"
        }`}
      >
        <div
          className={`text-white border border-white/10 backdrop-blur-md transition-all duration-500
        ${
          started
            ? "rounded-2xl p-4 bg-gradient-to-r from-purple-600/70 via-indigo-600/70 to-blue-600/70"
            : "rounded-3xl p-6 bg-slate-900/70 text-center"
        }`}
        >
          {/* ================= BEFORE START ================= */}
          {!started && (
            <>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl mb-4">
                  🎭
                </div>

                <p className="text-sm font-semibold">Roleplay Mode</p>
                <p className="text-xs text-white/60 mt-1">
                  Practice real-life conversations with AI
                </p>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="mt-4 w-full py-2.5! rounded-xl bg-white! text-black text-sm font-medium active:scale-[0.98] transition"
              >
                Start Roleplay
              </button>
            </>
          )}

          {/* ================= AFTER START ================= */}
          {started && (
            <>
              {/* HEADER */}
              <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                {/* DATE */}
                <div className="absolute top-3 right-3 text-[11px] text-white/70">
                  {now.toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>

                {/* TITLE */}
                <div className="flex items-start gap-3 pr-10">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 text-lg">
                    🎭
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-white/70">
                      Roleplay Mode
                    </span>

                    <p className="text-lg font-semibold leading-tight">
                      {activeScenario?.name || "Choose a scenario"}
                    </p>

                    {activeScenario && (
                      <p className="text-xs text-white/70 mt-1">
                        🙂: {activeScenario?.user_role} | 🤖:{" "}
                        {activeScenario?.ai_role}
                      </p>
                    )}
                  </div>
                </div>

                {/* FLOAT BUTTON */}
                <button
                  className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center
                  rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 
                  hover:scale-105 active:scale-95 transition"
                  onClick={() => {
                    setIsOpen(true);
                  }}
                >
                  🎭
                </button>
              </div>

              {/* Checklist */}
              {activeScenario && activeChecklist && (
                <div className="mt-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-sm">
                  {/* HEADER */}
                  <p className="text-[11px] uppercase tracking-wide text-white/60 mb-2">
                    🎯 Mission
                  </p>

                  {/* CONTEXT: Situation + Goal */}
                  {(mission?.situation || mission?.goal) && (
                    <div className="mb-3 space-y-2">
                      {mission?.situation && (
                        <div className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-[10px] uppercase text-white/40 mb-[2px]">
                            Situation
                          </p>
                          <p className="text-xs text-white/85 leading-snug">
                            {mission.situation}
                          </p>
                        </div>
                      )}

                      {mission?.goal && (
                        <div className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-[10px] uppercase text-white/40 mb-[2px]">
                            Goal
                          </p>
                          <p className="text-xs text-white/90 font-medium leading-snug">
                            {mission.goal}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DIVIDER */}
                  <div className="h-px bg-white/10 my-2" />

                  {/* CHECKLIST */}
                  <ul className="flex flex-col gap-1.5 text-xs">
                    {activeChecklist.map((item, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 transition ${
                          item.done ? "opacity-60" : "opacity-100"
                        }`}
                      >
                        <span className="text-sm">
                          {item.done ? "✔" : "⬜"}
                        </span>
                        <span className="text-white/90 leading-snug">
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {/* MODAL */}
      {isOpen && started && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-[280px] h-[380px]  rounded-xl p-3">
            {/* STEP 1 — category SELECTION */}
            {step === "category" && (
              <Swiper
                effect="cards"
                grabCursor={true}
                modules={[EffectCards]}
                className="h-full"
              >
                {category.map((t) => (
                  <SwiperSlide key={t.id}>
                    <div
                      className="relative w-full h-full rounded-xl flex items-center justify-center text-xl font-semibold shadow-2xl cursor-pointer overflow-hidden"
                      style={{
                        backgroundImage: `url(${t.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      onClick={async () => {
                        setSelectedCategory(t);
                        setStep("randomizing");

                        const scenario = await onScenarioSelect(
                          t.name.toLowerCase(),
                        );

                        if (!scenario) return;

                        setMission(scenario);
                        setStep("mission");
                      }}
                    >
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/30" />

                      {/* Text */}
                      <span
                        className="relative z-10 text-white text-center px-2"
                        style={{
                          WebkitTextStroke: "0.5px black",
                        }}
                      >
                        {t.name}
                      </span>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {/* STEP 2 — RANDOMIZING */}
            {step === "randomizing" && (
              <div className="flex flex-col items-center justify-center h-full text-white bg-black/40 rounded-2xl">
                <div className="text-4xl animate-spin">🎲</div>

                <p className="mt-4 text-lg font-semibold">
                  Finding your mission...
                </p>

                <p className="text-sm opacity-80">
                  Preparing roleplay scenario
                </p>
              </div>
            )}

            {/* STEP 3 — MISSION CARD */}
            {step === "mission" && mission && (
              <div className="bg-linear-to-br from-indigo-400 to-purple-400 rounded-xl shadow-md border border-gray-100 p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  {/* Header */}
                  <h2 className="text-md font-semibold leading-snug">
                    🎯 {mission.name}
                  </h2>

                  {/* Category */}
                  <div className="flex gap-1 whitespace-nowrap">
                    <span className="text-[10px] px-2 py-0.5 mt-0.5 rounded-full bg-white/80 text-indigo-700">
                      {mission.category}
                    </span>

                    {/* Difficulty */}
                    <span className="text-xs px-2 py-0.5 mt-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {mission?.difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-700">
                  You: {mission.user_role} | AI: {mission.ai_role}
                </p>

                {/* Scenario */}
                <div className="rounded-md p-2">
                  <p className="text-[10px] font-medium text-black uppercase mb-0.5">
                    Scenario
                  </p>

                  <p className="text-xs text-gray-800 leading-snug">
                    {mission.situation}
                  </p>
                </div>

                {/* Goal */}
                <div className="rounded-md p-2">
                  <p className="text-[10px] font-medium text-black uppercase mb-0.5">
                    Goal
                  </p>

                  <p className="text-xs text-gray-800 leading-snug">
                    {mission.goal}
                  </p>
                </div>

                {/* Checklist */}
                <div className="p-2">
                  <p className="text-[10px] font-medium text-black uppercase mb-1">
                    Checklist
                  </p>

                  <ul className="flex flex-col gap-[3px] text-xs">
                    {mission?.checklist?.map((c, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-gray-400 mt-px">⬜</span>
                        <span className="text-gray-800">{c.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Start Button */}
                <button
                  className="mt-1 py-2! rounded-lg bg-indigo-500! text-white text-sm font-medium hover:bg-indigo-600! transition"
                  onClick={() => {
                    const normalizedChecklist = mission.checklist.map(
                      (item) => ({
                        step_key: item.step_key,
                        text: item.description,
                        keywords: item.keywords ?? [],
                        done: false,
                        context_type: item.context_type ?? null, // 🔥 penting
                        context_data: item.context_data ?? null, // 🔥 penting
                      }),
                    );

                    setActiveChecklist(normalizedChecklist);

                    // 🔥 KIRIM STEP PERTAMA
                    const firstStep = normalizedChecklist[0];
                    if (onChecklistUpdate) {
                      onChecklistUpdate(normalizedChecklist, firstStep);
                    }
                    handleCloseOrSelect(mission);

                    // 🔥 INI KUNCI (UI only)
                    setActiveScenario(mission);

                    sendInitialMessage(mission);
                  }}
                >
                  Start Roleplay 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
