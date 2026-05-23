import { useState } from "react";

import DailyStoryIndicator from "./DailyStoryIndicator";
import DailyStoryContinue from "./DailyStoryContinue";

import RoleplayToggleSwipe from "./RoleplayToggleSwipe";

export default function ScenariosUI({
  dailyStoryProps,
  roleplayProps,
  modeScenario,
  setModeScenario,
}) {
  const [started, setStarted] = useState(false);

  return (
    <section
    className={`mx-4 transition-all duration-500 ${
        modeScenario === "idle" ? "mt-36" : ""
    }`}
    >
      <div className="relative">
        {/* ================= MAIN UI ================= */}
        {modeScenario === "idle" && (
            <div
            className={`text-white border border-white/10 backdrop-blur-xl rounded-3xl p-6 
            bg-linear-to-b from-slate-900/80 to-purple-900/60 
            shadow-lg shadow-black/30 flex flex-col justify-center
            transition-all duration-300 ease-out
            ${
                modeScenario !== "idle"
                ? "opacity-0 scale-[0.98] translate-y-1 pointer-events-none"
                : "opacity-100 scale-100"
            }`}
            >
            {/* ================= BEFORE ================= */}
            <div
                className={`transition-all duration-500 ${
                started
                    ? "opacity-0 -translate-y-3 pointer-events-none absolute"
                    : "opacity-100 translate-y-0"
                }`}
            >
                <div className="flex flex-col items-center">
                <div
                    className="w-14 h-14 rounded-2xl 
                    bg-gradient-to-br from-purple-500/20 to-white/10 
                    flex items-center justify-center text-2xl mb-4 
                    border border-white/10"
                >
                    🎭
                </div>

                <p className="text-sm font-semibold tracking-wide">
                    Scenarios Mode
                </p>

                <p className="text-xs text-white/60 mt-1 text-center">
                    Practice speaking through immersive situations
                </p>
                </div>

                <button
                onClick={() => setStarted(true)}
                className="mt-5 w-full py-2.5! rounded-xl 
                bg-gradient-to-r from-purple-500 to-purple-600 
                text-white text-sm font-medium 
                active:scale-[0.98] transition-all duration-200
                shadow-md shadow-purple-900/40"
                >
                Start Scenario
                </button>
            </div>

            {/* ================= AFTER ================= */}
            <div
                className={`transition-all duration-500 ${
                started
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3 pointer-events-none absolute"
                }`}
            >
                {/* HEADER */}
                <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl 
                    bg-gradient-to-br from-purple-500/20 to-white/10 
                    flex items-center justify-center text-base 
                    border border-white/10"
                >
                    🎭
                </div>

                <div className="leading-tight">
                    <p className="text-sm font-semibold">
                    Choose Your Scenario
                    </p>

                    <p className="text-xs text-white/60">
                    Pick how you want to practice
                    </p>
                </div>
                </div>

                {/* OPTIONS */}
                <div className="grid grid-cols-2 gap-3">
                {/* DAILY STORY */}
                <button
                    onClick={() => setModeScenario("daily_story")}
                    className="bg-white/5 rounded-xl p-4 text-center 
                    hover:bg-white/10 transition border border-white/10
                    active:scale-[0.98]"
                >
                    <div className="text-2xl mb-2">📖</div>

                    <p className="text-sm font-medium">Daily Story</p>

                    <p className="text-[10px] text-white/50 mt-1">
                    Share your day naturally
                    </p>
                </button>

                {/* ROLEPLAY */}
                <button
                    onClick={() => setModeScenario("roleplay")}
                    className="bg-gradient-to-br from-purple-500/10 to-white/5 
                    rounded-xl p-4 text-center 
                    hover:scale-[1.02] transition border border-purple-500/20
                    active:scale-[0.98]"
                >
                    <div className="text-2xl mb-2">🎬</div>

                    <p className="text-sm font-medium">Roleplay</p>

                    <p className="text-[10px] text-white/50 mt-1">
                    Simulate conversations
                    </p>
                </button>
                </div>
            </div>
            </div>
        )}

        {/* ================= DAILY STORY OVERLAY ================= */}
        <div
          className={`absolute inset-0 transition-all duration-300 ease-out ${
            modeScenario === "daily_story"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {modeScenario === "daily_story" && (
            <>
              <DailyStoryIndicator
                progressData={dailyStoryProps.progressData}
                isDailyLocked={dailyStoryProps.isDailyLocked}
                started={dailyStoryProps.started}
                setStarted={dailyStoryProps.setStarted}
                isDailyEmpty={dailyStoryProps.isDailyEmpty}
              />

              <DailyStoryContinue
                readyToContinue={dailyStoryProps.readyToContinue}
                currentStoryPhase={dailyStoryProps.currentStoryPhase}
                activePhase={dailyStoryProps.activePhase}
                expanded={dailyStoryProps.expanded}
                setExpanded={dailyStoryProps.setExpanded}
                sessionId={dailyStoryProps.sessionId}
                userId={dailyStoryProps.userId}
                setActivePhase={dailyStoryProps.setActivePhase}
                setReadyToContinue={dailyStoryProps.setReadyToContinue}
                setChatHistory={dailyStoryProps.setChatHistory}
                setProgressData={dailyStoryProps.setProgressData}
                nextPhaseRequest={dailyStoryProps.nextPhaseRequest}
                markPhaseComplete={dailyStoryProps.markPhaseComplete}
                generateSummary={dailyStoryProps.generateSummary}
              />
            </>
          )}
        </div>

        {/* ================= ROLEPLAY OVERLAY ================= */}
        <div
        className={`transition-all duration-300 ease-out ${
            modeScenario === "roleplay"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        >
        {modeScenario === "roleplay" && (
            <RoleplayToggleSwipe {...roleplayProps} />
        )}
        </div>

        {/* FLOATING CONTEXT BUTTON */}
        {modeScenario === "roleplay" &&
        roleplayProps.selectedScenario &&
        roleplayProps.activeContext &&
        !roleplayProps.showContext && (
            <button
            onClick={() => roleplayProps.setShowContext(true)}
            className="
                fixed
                bottom-65
                right-4
                z-[9999]

                text-sm
                bg-blue-600!
                text-white
                px-4! py-3!
                rounded-full
                shadow-lg

                hover:scale-105
                active:scale-95
            "
            >
            📌
            </button>
        )}
      </div>
    </section>
  );
}