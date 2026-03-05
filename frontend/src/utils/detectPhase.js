export function detectPhase(hour = new Date().getHours()) {
  if (hour < 11) return "morning";
  if (hour < 16) return "afternoon";
  if (hour < 19) return "evening";
  return "night";
}
