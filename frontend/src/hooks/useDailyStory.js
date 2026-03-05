import { useState } from "react";

export default function useDailyStory() {
  const [dailyStory, setDailyStory] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
  });

  const toggleDailyPhase = (phase) => {
    setDailyStory((prev) => ({
      ...prev,
      [phase]: !prev[phase],
    }));
  };

  const markPhaseComplete = (phase) => {
    setDailyStory((prev) => ({
      ...prev,
      [phase]: true,
    }));
  };

  const completedCount = Object.values(dailyStory).filter(Boolean).length;

  return {
    dailyStory,
    toggleDailyPhase,
    markPhaseComplete,
    completedCount,
  };
}
