export function detectPhase(hour = new Date().getHours()) {
  if (hour < 11) return "morning";
  if (hour < 16) return "afternoon";
  if (hour < 19) return "evening";
  return "night";
}

export function getCurrentPhaseFromProgress(data) {
  if (!data) {
    // console.warn("⚠️ Progress data undefined");
    return "morning"; // fallback aman
  }

  const order = ["morning", "afternoon", "evening", "night"];

  for (let i = 0; i < order.length; i++) {
    if (!data[order[i]]) {
      return order[i];
    }
  }

  return "done";
}
