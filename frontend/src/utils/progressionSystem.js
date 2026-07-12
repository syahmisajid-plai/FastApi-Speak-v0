// ================================
// SPEAKEASY PROGRESSION SYSTEM
// ================================

// ================================
// TITLE LEVEL
// ================================

export const TITLE_LEVELS = [
  {
    level: 1,
    name: "🌱 Language Beginner",
  },
  {
    level: 2,
    name: "📚 Vocabulary Explorer",
  },
  {
    level: 3,
    name: "✍️ Sentence Creator",
  },
  {
    level: 4,
    name: "💬 Conversation Learner",
  },
  {
    level: 5,
    name: "🗣️ Confident Speaker",
  },
  {
    level: 6,
    name: "🌍 Communication Builder",
  },
  {
    level: 7,
    name: "🚀 Advanced Speaker",
  },
  {
    level: 8,
    name: "🎯 Fluent Communicator",
  },
  {
    level: 9,
    name: "👑 English Expert",
  },
  {
    level: 10,
    name: "✨ English Legend",
  },
];

// ================================
// REQUIRED XP
// ================================
// ================================
// XP REQUIRED PER LEVEL
// ================================

const LEVEL_XP_RULES = [
  {
    minLevel: 1,
    maxLevel: 5,
    xp: 500,
  },
  {
    minLevel: 6,
    maxLevel: 10,
    xp: 750,
  },
  {
    minLevel: 11,
    maxLevel: 15,
    xp: 1000,
  },
  {
    minLevel: 16,
    maxLevel: 20,
    xp: 1500,
  },
  {
    minLevel: 21,
    maxLevel: 25,
    xp: 2000,
  },
  {
    minLevel: 26,
    maxLevel: 30,
    xp: 2500,
  },
  {
    minLevel: 31,
    maxLevel: 35,
    xp: 3000,
  },
  {
    minLevel: 36,
    maxLevel: 40,
    xp: 4000,
  },
  {
    minLevel: 41,
    maxLevel: 45,
    xp: 5000,
  },
  {
    minLevel: 46,
    maxLevel: 50,
    xp: 7000,
  },
];

export function getRequiredXP(level) {
  const rule = LEVEL_XP_RULES.find(
    (item) => level >= item.minLevel && level <= item.maxLevel,
  );

  return rule?.xp ?? 7000;
}

// ================================
// TITLE NAME
// ================================

export function getTitleName(titleLevel) {
  const title = TITLE_LEVELS.find((item) => item.level === titleLevel);

  return title?.name ?? "🌱 Language Beginner";
}

// ================================
// PROGRESS BAR
// ================================

export function calculateProgress(xp, level) {
  const requiredXP = getRequiredXP(level);

  return Math.min(Math.round((xp / requiredXP) * 100), 100);
}

// ================================
// PROMOTION CHECK
// ================================

export function isPromotionReady(xp, level) {
  const requiredXP = getRequiredXP(level);

  return xp >= requiredXP;
}
