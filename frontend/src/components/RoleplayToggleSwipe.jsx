import { useState } from "react";
import bgTree from "../assets/bg_tree.jpg";
import airport from "../assets/airport.png";
import interview from "../assets/interview.jpg";
import orderFood from "../assets/order_food.png";
import shopping from "../assets/shopping.jpg";

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
  const scenarios = [
    { id: 1, name: "Ordering at a Restaurant", image: orderFood },
    { id: 2, name: "Job Interview", image: interview },
    { id: 3, name: "Traveling at the Airport", image: airport },
    { id: 4, name: "Shopping in a Mall", image: shopping },
  ];

  const handleSelect = (scenario) => {
    setIsOpen(false);
    if (onScenarioSelect) onScenarioSelect(scenario);
  };

  const [loading, setLoading] = useState(false);

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

      <p className="text-sm mb-1">
        {selectedScenario ? "🎭 Selected Scenario" : "💬 Scenario"}
      </p>

      <p className="text-base font-medium mb-4">
        {selectedScenario
          ? `Scenario: ${selectedScenario.name}`
          : "Main Scenario"}
      </p>

      {/* tombol buka modal */}
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
            {loading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: "1rem",
                  zIndex: 50,
                  gap: "0.5rem",
                }}
              >
                {/* Orang berjalan */}
                <div
                  style={{
                    position: "relative",
                    width: "32px",
                    height: "32px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      fontSize: "2rem",
                      animation: "walk 1s linear infinite alternate",
                    }}
                  >
                    🚶
                  </div>
                </div>

                {/* Teks loading */}
                <span
                  style={{
                    color: "#ffffff", // putih murni
                    fontWeight: 700, // lebih tebal
                    textShadow: "0 0 6px rgba(0,0,0,0.7)", // agar menonjol di background gelap
                    fontSize: "1rem",
                  }}
                >
                  {selectedScenario
                    ? `Moving to: ${selectedScenario.name} 🚶‍♂️`
                    : "Getting ready... 👣"}
                </span>

                {/* Keyframes inline */}
                <style>
                  {`
                  @keyframes walk {
                    0% { transform: translateX(20px); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(-20px); }
                  }
                `}
                </style>
              </div>
            )}
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
                      backgroundImage: `url(${s.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      color: "white",
                    }}
                    onClick={() => handleCloseOrSelect(s)}
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
