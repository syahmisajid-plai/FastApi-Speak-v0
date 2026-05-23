export const phaseOrder = [
  "morning",
  "afternoon",
  "evening",
  "night",
];

export const getNextPhase = (phase) => {
  if (!phase) return "morning";

  const index = phaseOrder.indexOf(phase);

  // ✅ kalau sudah terakhir
  if (index === phaseOrder.length - 1) {
    return null;
  }

  return phaseOrder[index + 1];
};