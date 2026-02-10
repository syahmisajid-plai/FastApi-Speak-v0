import { useState } from "react";
import bgTree from "../assets/bg_tree.jpg";

export default function RoleplayCardsWithBgScrollable({ onScenarioSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [clickedCardId, setClickedCardId] = useState(null);
  const [page, setPage] = useState(0); // untuk carousel

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

  const CARDS_PER_PAGE = 4;
  const totalPages = Math.ceil(scenarios.length / CARDS_PER_PAGE);

  const handleSelect = (scenario) => setClickedCardId(scenario.id);

  const handleAnimationEnd = (scenario) => {
    setSelectedScenario(scenario);
    setIsOpen(false);
    setClickedCardId(null);
    if (onScenarioSelect) onScenarioSelect(scenario);
  };

  const handleNext = () =>
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 0));

  const currentScenarios = scenarios.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE,
  );

  return (
    <div className="flex flex-col items-center mt-4">
      {!selectedScenario ? (
        // Bola kecil di kanan bawah
        <div className="fixed right-6 top-62">
          <div
            className={`w-14 h-14 flex items-center justify-center rounded-full shadow-xl cursor-pointer
                  transition transform hover:scale-110
                  bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-2xl font-bold
                  `}
            onClick={() => setIsOpen(true)}
          >
            <span className="text-2xl">🎭</span> {/* text-4xl = lebih besar */}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {/* Tombol panjang scenario */}
          <button
            className="px-6 py-3 rounded-lg text-white font-bold bg-gradient-to-r from-purple-600 to-indigo-600
                   shadow-lg hover:scale-105 transform transition duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {`Scenario: ${selectedScenario.name}`}
          </button>

          {/* Tombol keluar */}
          <button
            className="px-4 py-2 rounded-lg text-white font-bold

                   shadow-lg hover:bg-red-600 transform transition duration-300"
            onClick={() => {
              setSelectedScenario(null);
              setIsOpen(false);
              setPage(0);
            }}
          >
            ❌
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="flex items-center p-4 max-h-[80vh]">
            {/* Tombol kiri */}
            <button
              onClick={handlePrev}
              disabled={page === 0}
              className="py-2 rounded-lg bg-gray-300/70 hover:bg-gray-400 disabled:opacity-50"
            >
              ◀
            </button>

            {/* Grid */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4 mx-3 w-84">
              {currentScenarios.map((s) => {
                const isClicked = clickedCardId === s.id;
                const isOther = clickedCardId && clickedCardId !== s.id;

                return (
                  <div
                    key={s.id}
                    className={`rounded-lg flex items-center justify-center text-xl font-semibold shadow-2xl transform hover:scale-105 transition-all
                  ${!clickedCardId ? "animate-pop-in" : ""}
                  ${isClicked ? "animate-click" : ""}
                  ${isOther ? "animate-fade-out-clean" : ""}`}
                    style={{
                      backgroundImage: `url(${bgTree})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      color: "white",
                      minHeight: "35vh",
                      width: "100%",
                    }}
                    onClick={() => handleSelect(s)}
                    onAnimationEnd={() => {
                      if (isClicked) handleAnimationEnd(s);
                    }}
                  >
                    {s.name}
                  </div>
                );
              })}
            </div>

            {/* Tombol kanan */}
            <button
              onClick={handleNext}
              disabled={page === totalPages - 1}
              className=" py-2 rounded-lg bg-gray-300/70 hover:bg-gray-400 disabled:opacity-50"
            >
              ▶
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pop-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out forwards;
        }

        @keyframes click {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0.85);
            opacity: 0.7;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
        .animate-click {
          animation: click 0.3s ease-in forwards;
        }

        @keyframes fade-out-clean {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        .animate-fade-out-clean {
          animation: fade-out-clean 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
