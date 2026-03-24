// ================== REACT CORE ==================
import { useEffect, useState, useRef } from "react";
import bgTree from "../assets/bg_tree.jpg";
import airport from "../assets/airport.png";
import interview from "../assets/interview.jpg";
import orderFood from "../assets/order_food.png";
import shopping from "../assets/shopping.jpg";

import easy_mode from "../assets/7AvxLpHYRtmcMPAtwJGRtQ.webp";
import medium_mode from "../assets/360_F_1487969412_OJJSsXoi9qcN72n06ZODBiX9BJAVKgPl.jpg";
import hard_mode from "../assets/ya_-re-dragon-vs.jpg";
import hard_mode2 from "../assets/knight-vs-dragon-battle-vector-59124162.avif";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-cards";

import { linkBackend } from "../config";

export default function RoleplayToggleSwipe({
  selectedScenario,
  onScenarioSelect,
  isOpen, // <-- dari parent
  setIsOpen, // <-- dari parent
  setMode, // <-- props baru
  lastUserMessage,
  onFinish,
  onChecklistUpdate,
  currentTurn,
  maxTurn,
}) {
  // const difficulties = [
  //   { id: 1, name: "Easy Mode", image: easy_mode },
  //   { id: 2, name: "Medium Mode", image: medium_mode },
  //   { id: 3, name: "Hard Mode", image: hard_mode },
  //   { id: 4, name: "Hard Mode", image: hard_mode2 },
  // ];

  const themes = [
    { id: 1, name: "Airport", image: easy_mode },
    { id: 2, name: "Restaurant", image: medium_mode },
    { id: 3, name: "Interview", image: hard_mode },
    { id: 4, name: "Shopping", image: hard_mode2 },
  ];

  useEffect(() => {
    if (!lastUserMessage || !activeChecklist) return;

    updateChecklistProgress(lastUserMessage);
  }, [lastUserMessage]);

  const handleSelect = (scenario) => {
    setIsOpen(false);
    if (onScenarioSelect) onScenarioSelect(scenario);
  };

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("theme");
  // const [selectedDifficulty, setSelectedTheme] = useState(null);
  const [SelectedTheme, setSelectedTheme] = useState(null);
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

      if (setMode) setMode("freeTalk");

      setActiveChecklist(null);
    }
  }, [
    activeChecklist,
    lastUserMessage, // 🔥 penting
    currentTurn,
    maxTurn,
    onFinish,
    hasFinished,
    setMode,
  ]);

  useEffect(() => {
    if (isOpen) {
      setStep("theme");
      setSelectedTheme(null);
      setMission(null);
      setHasFinished(false); // ✅ reset
    }
  }, [isOpen]);

  const dummyMission = {
    theme: "Restaurant",
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

      if (!scenario) {
        // tombol ❌
        if (setMode) setMode("freeTalk");
      }

      if (setIsOpen) setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dummyScenarioName = "Airport Check-in";

  return (
    <section
      className={`relative rounded-xl p-4 shadow transition-colors duration-500
      ${
        selectedScenario
          ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white"
          : "bg-slate-900/80 text-white border border-slate-700/40"
      }`}
    >
      <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
        {/* DATE & TIME */}
        <div className="absolute top-3 right-3 text-right text-[11px] text-white/70 leading-tight">
          <div>
            {now.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
          {/* <div className="font-medium">
            {now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div> */}
        </div>

        {/* ❌ CLOSE BUTTON */}
        {selectedScenario && (
          <button
            className="absolute -top-4 -right-4 w-8 h-8 flex items-center justify-center 
            rounded-full bg-white/10!! text-white text-sm transition"
            onClick={() => handleCloseOrSelect(null)}
          >
            ✕
          </button>
        )}
        {/* HEADER */}
        <div className="flex items-start gap-3 pr-10">
          {/* ICON */}
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 text-lg">
            {selectedScenario ? "🎭" : "💬"}
          </div>

          <div className="flex flex-col">
            {/* MODE BADGE */}
            <span className="text-[10px] uppercase tracking-wider text-white/70 mb-1">
              {selectedScenario ? "Roleplay Mode" : "Free Talk"}
            </span>

            {/* TITLE */}
            <p className="text-lg font-semibold leading-tight">
              {selectedScenario ? selectedScenario.name : "Start speaking"}
            </p>

            {/* HINT */}
            {!selectedScenario && (
              <p className="text-xs text-white/60 mt-1">
                Talk freely 🎙️ AI will respond
              </p>
            )}

            {/* Role */}
            {selectedScenario && (
              <p className="text-xs text-white/70 mt-1">
                🙂: {selectedScenario?.user_role} | 🤖:{" "}
                {selectedScenario?.ai_role}
              </p>
            )}
          </div>
        </div>

        {/* FLOATING ROLEPLAY BUTTON */}
        <button
          className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center
            rounded-full shadow-lg cursor-pointer
            bg-gradient-to-r from-purple-600 to-indigo-600 
            hover:scale-105 active:scale-95 transition"
          onClick={() => {
            setMode("roleplay");
            setStep("theme");
            setIsOpen(true);
          }}
        >
          🎭
        </button>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-[280px] h-[380px]  rounded-xl p-3">
            {/* STEP 1 — THEME SELECTION */}
            {step === "theme" && (
              <Swiper
                effect="cards"
                grabCursor={true}
                modules={[EffectCards]}
                className="h-full"
              >
                {themes.map((t) => (
                  <SwiperSlide key={t.id}>
                    <div
                      className="w-full h-full rounded-xl flex items-center justify-center text-xl font-semibold shadow-2xl cursor-pointer"
                      style={{
                        backgroundImage: `url(${t.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        color: "white",
                      }}
                      onClick={async () => {
                        setSelectedTheme(t);
                        setStep("randomizing");

                        const scenario = await onScenarioSelect(
                          t.name.toLowerCase(),
                        );

                        if (!scenario) return;

                        setMission(scenario);
                        setStep("mission");
                      }}
                    >
                      {t.name}
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
                      {mission?.theme}
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
                  }}
                >
                  Start Roleplay 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checklist */}
      {selectedScenario && activeChecklist && (
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
                <span className="text-sm">{item.done ? "✔" : "⬜"}</span>
                <span className="text-white/90 leading-snug">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
