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
}) {
  const difficulties = [
    { id: 1, name: "Easy Mode", image: easy_mode },
    { id: 2, name: "Medium Mode", image: medium_mode },
    { id: 3, name: "Hard Mode", image: hard_mode },
    { id: 4, name: "Hard Mode", image: hard_mode2 },
  ];

  useEffect(() => {
    if (isOpen) {
      setStep("difficulty");
      setSelectedDifficulty(null);
      setMission(null);
    }
  }, [isOpen]);

  const handleSelect = (scenario) => {
    setIsOpen(false);
    if (onScenarioSelect) onScenarioSelect(scenario);
  };

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("difficulty");
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [mission, setMission] = useState(null);

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

            {/* SUBTITLE */}
            {selectedScenario && (
              <p className="text-xs text-white/70 mt-1">
                🎯 {selectedScenario?.theme}
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
            setStep("difficulty");
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
            {/* STEP 1 — DIFFICULTY */}
            {step === "difficulty" && (
              <Swiper
                effect="cards"
                grabCursor={true}
                modules={[EffectCards]}
                className="h-full"
              >
                {difficulties.map((s) => (
                  <SwiperSlide key={s.id}>
                    <div
                      className="w-full h-full rounded-xl flex items-center justify-center text-xl font-semibold shadow-2xl cursor-pointer"
                      style={{
                        backgroundImage: `url(${s.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        color: "white",
                      }}
                      onClick={async () => {
                        setSelectedDifficulty(s);
                        setStep("randomizing");

                        const difficultyMap = {
                          "Easy Mode": "easy",
                          "Medium Mode": "medium",
                          "Hard Mode": "hard",
                        };

                        const scenario = await onScenarioSelect(
                          difficultyMap[s.name],
                        );

                        if (!scenario) return;

                        setMission(scenario);
                        setStep("mission");
                      }}
                    >
                      {s.name}
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
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold">
                    🎯 {mission.theme} Mission
                  </h2>

                  <span className="text-xs px-2 py-0.5 mt-0.5 rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap">
                    {selectedDifficulty?.name}
                  </span>
                </div>

                <p className="text-[10px] text-gray-700">
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
                        <span className="text-green-350 mt-px">✔</span>
                        <span className="text-gray-800">
                          {typeof c === "string" ? c : c.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Start Button */}
                <button
                  className="mt-1 py-2! rounded-lg bg-indigo-500! text-white text-sm font-medium hover:bg-indigo-600! transition"
                  onClick={() => handleCloseOrSelect(mission)}
                >
                  Start Roleplay 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
