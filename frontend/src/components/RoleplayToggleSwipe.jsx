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

  const handleCloseOrSelect = async (scenario = null) => {
    try {
      setLoading(true);

      if (scenario) {
        // ✅ gunakan endpoint /roleplay/start
        const res = await fetch(`${linkBackend}/roleplay/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: "some_session_id",
            scenario_id: scenario.id,
          }),
        });

        if (!res.ok) {
          console.error("Failed to start roleplay:", res.status);
          return;
        }

        if (onScenarioSelect) onScenarioSelect(scenario);
      } else {
        // tombol ❌
        if (onScenarioSelect) onScenarioSelect(null);
        if (setMode) setMode("freeTalk");
      }
      // tambahkan delay 10 detik sebelum close
      await new Promise((resolve) => setTimeout(resolve, 2800));

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
          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      {/* ❌ CLOSE BUTTON */}
      {selectedScenario && (
        <button
          className="absolute top-4 right-4 px-3 py-1 rounded-lg text-white font-bold"
          onClick={() => {
            handleCloseOrSelect(null);
          }}
        >
          ❌
        </button>
      )}

      <p className="text-xs opacity-80 mb-1">
        {selectedScenario ? "🎭 Roleplay Mission" : "💬 Free Talk"}
      </p>

      <p className="text-lg font-semibold mb-1">
        {selectedScenario ? selectedScenario.name : "Start a conversation"}
      </p>

      {selectedScenario && (
        <p className="text-sm opacity-80 mb-3">
          Scenario Mission: Airport Check-in
        </p>
      )}

      {/* tombol buka modal */}
      <div className="absolute right-4 bottom-4">
        <div
          className="w-12 h-7 flex items-center justify-center rounded-full shadow-xl cursor-pointer
        bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          onClick={() => {
            setMode("roleplay"); // ubah mode
            setStep("difficulty"); // reset step
            setIsOpen(true); // buka modal
          }}
        >
          🎭
        </div>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
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
                      onClick={() => {
                        setSelectedDifficulty(s);
                        setStep("randomizing");

                        setTimeout(() => {
                          setMission(dummyMission);
                          setStep("mission");
                        }, 2000);
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

                {/* Scenario */}
                <div className="rounded-md p-2">
                  <p className="text-[10px] font-medium text-black uppercase mb-0.5">
                    Scenario
                  </p>

                  <p className="text-xs text-gray-800 leading-snug">
                    {mission.scenario}
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
                    {mission.checklist.map((c, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-350 mt-[1px]">✔</span>
                        <span className="text-gray-800">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Start Button */}
                <button
                  className="mt-1 py-2! rounded-lg bg-indigo-500! text-white text-sm font-medium hover:bg-indigo-600! transition"
                  onClick={() =>
                    handleCloseOrSelect({
                      id: selectedDifficulty?.id,
                      name: selectedDifficulty?.name,
                    })
                  }
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
