import { useState } from "react";
import bgTree from "../assets/bg_tree.jpg";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-cards";

export default function RoleplayToggleSwipe({ onScenarioSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const scenarios = [
    { id: 1, name: "Ordering at a Restaurant" },
    { id: 2, name: "Job Interview" },
    { id: 3, name: "Traveling at the Airport" },
    { id: 4, name: "Shopping in a Mall" },
    { id: 5, name: "Visiting a Doctor" },
    { id: 6, name: "Asking Directions" },
    { id: 7, name: "Hotel Check-in" },
    { id: 8, name: "Bank Transaction" },
  ];

  const handleSelect = (scenario) => {
    setSelectedScenario(scenario);
    setIsOpen(false);
    if (onScenarioSelect) onScenarioSelect(scenario);
  };

  return (
    <section
      className={`relative rounded-xl p-4 shadow transition-colors duration-500
      ${
        selectedScenario
          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      {/* CLOSE */}
      {selectedScenario && (
        <button
          className="absolute top-4 right-4 px-3 py-1 rounded-lg text-white font-bold"
          onClick={() => setSelectedScenario(null)}
        >
          ❌
        </button>
      )}

      <p className="text-sm mb-1">
        {selectedScenario ? "🎭 Selected Scenario" : "💬 Scenario"}
      </p>

      <p className="text-base font-medium mb-4">
        {selectedScenario
          ? `Scenario: ${selectedScenario.name}`
          : "Main Scenario"}
      </p>

      {/* tombol buka */}
      {!selectedScenario && (
        <div className="absolute right-4 bottom-4">
          <div
            className="w-12 h-7 flex items-center justify-center rounded-full shadow-xl cursor-pointer
            bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            onClick={() => setIsOpen(true)}
          >
            🎭
          </div>
        </div>
      )}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[280px] h-[380px]">
            <Swiper
              effect="cards"
              grabCursor={true}
              modules={[EffectCards]}
              className="h-full"
            >
              {scenarios.map((s) => (
                <SwiperSlide key={s.id}>
                  <div
                    className="w-full h-full rounded-xl flex items-center justify-center text-xl font-semibold shadow-2xl cursor-pointer"
                    style={{
                      backgroundImage: `url(${bgTree})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      color: "white",
                    }}
                    onClick={() => handleSelect(s)}
                  >
                    {s.name}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </section>
  );
}
