export function cleanAIText(text) {
  return text
    .replace(/You could say\s*:?\s*"[^"]*"\s*/i, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function normalizeTTS(text) {
  return text
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\n/g, " ")
    .trim();
}