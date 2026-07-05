// hooks/useChecklistRoleplay.js

import { useState, useEffect } from "react";

export default function useChecklistRoleplay({
  activeChecklist,
  setActiveChecklist,
  lastUserMessage,
  currentTurn,
  maxTurn,
  onChecklistUpdate,
}) {
  const [hasFinished, setHasFinished] = useState(false);

  const getCurrentStep = (checklist) => {
    return checklist.find((item) => !item.done);
  };

  const updateProgress = (input) => {
    if (!input) return;

    const text = input.toLowerCase();

    setActiveChecklist((prev) => {
      if (!prev) return prev;

      let changed = false;
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
          changed = true;
          updated[i] = {
            ...item,
            done: true,
          };
        }

        break;
      }

      if (!changed) {
        return prev;
      }

      const currentStep = getCurrentStep(updated);
      onChecklistUpdate?.(updated, currentStep);

      return updated;
    });
  };

  useEffect(() => {
    if (!activeChecklist || hasFinished) return;

    const totalDone = activeChecklist.filter((x) => x.done).length;
    const totalChecklist = activeChecklist.length;

    const isAllDone = totalChecklist > 0 && totalDone === totalChecklist;

    const isTurnFinished = maxTurn > 0 && currentTurn >= maxTurn;

    if (isAllDone || isTurnFinished) {
      setHasFinished(true);
    }
  }, [activeChecklist, currentTurn, maxTurn, hasFinished]);

  return {
    updateProgress,

    currentStep: getCurrentStep(activeChecklist ?? []),

    progress: {
      totalDone: activeChecklist?.filter((x) => x.done).length ?? 0,
      totalChecklist: activeChecklist?.length ?? 0,
    },

    finished: hasFinished,

    resetFinished: () => setHasFinished(false),
  };
}
