// RoleplayToggleSwipe.jsx

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

import useChecklistRoleplay from "../hooks/useChecklistRoleplay";
import RoleplayModalCard from "./RoleplayModalCard";

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
  activeChecklist,
  setActiveChecklist,

  // mission,
  // setMission,
}) {
  // const difficulties = [
  //   { id: 1, name: "Easy Mode", image: easy_mode },
  //   { id: 2, name: "Medium Mode", image: medium_mode },
  //   { id: 3, name: "Hard Mode", image: hard_mode },
  //   { id: 4, name: "Hard Mode", image: hard_mode2 },
  // ];

  // console.log("📍 currentTurn", currentTurn);

  // Checklist Selesai
  const { updateProgress, currentStep, progress, finished, resetFinished } =
    useChecklistRoleplay({
      activeChecklist,
      setActiveChecklist,
      currentTurn,
      maxTurn,
      onChecklistUpdate,
    });

  // console.log("📍 progress", progress);

  useEffect(() => {
    if (!lastUserMessage || !activeChecklist) return;

    updateProgress(lastUserMessage);
  }, [lastUserMessage]);

  useEffect(() => {
    if (!finished) return;

    onFinish(progress);

    setActiveChecklist(null);

    resetFinished();
  }, [finished]);

  const handleSelect = (scenario) => {
    setIsOpen(false);
    if (onScenarioSelect) onScenarioSelect(scenario);
  };

  // const [loading, setLoading] = useState(false);
  // const [step, setStep] = useState("category");
  // const [selectedDifficulty, setSelectedCategory] = useState(null);
  // const [selectedCategory, setSelectedCategory] = useState(null);
  const [mission, setMission] = useState(null);
  // const [activeChecklist, setActiveChecklist] = useState(null);

  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // setStep("category");
      // setSelectedCategory(null);
      setMission(null);
      resetFinished();
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

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // const handleCloseOrSelect = async (scenario = null) => {
  //   try {
  //     setLoading(true);

  //     if (setIsOpen) setIsOpen(false);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const dummyScenarioName = "Airport Check-in";

  return (
    <>
      {/* // ================== MAIN ================== */}
      <section
        className={`mx-4 transition-all duration-500 ${
          started ? "mt-4" : "mt-36 md:mt-12"
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
                onClick={() => {
                  setStarted(true);
                  setIsOpen(true);
                }}
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
                  {/* HEADER + TOGGLE */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsMissionOpen(!isMissionOpen)}
                  >
                    <p className="text-[11px] uppercase tracking-wide text-white/60">
                      🎯 Mission
                    </p>

                    {/* ICON PANAH (rotate animasi) */}
                    <span
                      className={`text-white/60 text-sm transition-transform duration-300 ${
                        isMissionOpen ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      ▼
                    </span>
                  </div>

                  {/* CONTENT */}
                  {isMissionOpen && (
                    <>
                      {/* CONTEXT: Situation + Goal */}
                      {(mission?.situation || mission?.goal) && (
                        <div className="mt-3 mb-3 space-y-2">
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
                            className={`
                              flex items-center gap-2 rounded-md px-2 py-1 transition
                              ${item.done ? "opacity-60" : "opacity-100"}
                              ${
                                i === progress.totalDone
                                  ? "bg-yellow-400/20 border border-yellow-400"
                                  : ""
                              }
      `}
                          >
                            <span className="text-sm">
                              {item.done ? "✔" : "⬜"}
                            </span>

                            <span
                              className={`leading-snug ${
                                i === progress.totalDone
                                  ? "text-yellow-300 font-semibold"
                                  : "text-white/90"
                              }`}
                            >
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <RoleplayModalCard
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        started={started}
        mission={mission}
        setMission={setMission}
        onScenarioSelect={onScenarioSelect}
        setActiveChecklist={setActiveChecklist}
        onChecklistUpdate={onChecklistUpdate}
        sendInitialMessage={sendInitialMessage}
        setActiveScenario={setActiveScenario}
      />
    </>
  );
}
