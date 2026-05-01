// Pure XP/level calculation helpers (no DB calls).
// For DB-aware operations, use services/gamification.js instead.

const XP_PER_LEVEL = 1000;

function calculateLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function xpForNextLevel(currentLevel) {
  return currentLevel * XP_PER_LEVEL;
}

function xpForCurrentLevel(currentLevel) {
  return (currentLevel - 1) * XP_PER_LEVEL;
}

function progressToNextLevel(xp, currentLevel) {
  const currentLevelXp = xpForCurrentLevel(currentLevel);
  const nextLevelXp = xpForNextLevel(currentLevel);
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return Math.min(100, Math.max(0, progress));
}

module.exports = {
  calculateLevel,
  xpForNextLevel,
  xpForCurrentLevel,
  progressToNextLevel,
  XP_PER_LEVEL
};
