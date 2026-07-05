import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";

import food from "../assets/food.jpg";
import work from "../assets/work.png";
import daily_life from "../assets/Daily_Life.avif";
import travel from "../assets/travel.avif";
import shopping from "../assets/Shopping.avif";
import health from "../assets/Health.png";

import "swiper/css";
import "swiper/css/effect-cards";

export default function RoleplayModalCard({
  isOpen,
  setIsOpen,
  started,
  mission,
  setMission,
  onScenarioSelect,
  setActiveChecklist,
  onChecklistUpdate,
  sendInitialMessage,
  setActiveScenario,
}) {
  const [step, setStep] = useState("category");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loading, setLoading] = useState(false);

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

  const category = [
    { id: 1, name: "Food", image: food },
    { id: 2, name: "Work", image: work },
    { id: 3, name: "Daily Life", image: daily_life },
    { id: 4, name: "Travel", image: travel },
    { id: 5, name: "Shopping", image: shopping },
    { id: 6, name: "Health", image: health },
  ];

  if (!isOpen || !started) return null;

  return createPortal(
    <div>
      {/* MODAL */}
      {isOpen && started && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-[280px] h-[380px] rounded-xl p-3">
            {/* STEP 1 — category SELECTION */}
            {step === "category" && (
              <Swiper
                effect="cards"
                grabCursor={true}
                modules={[EffectCards]}
                className="h-11/12 w-10/12"
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
    </div>,
    document.body,
  );
}
