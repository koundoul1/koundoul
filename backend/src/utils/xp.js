// Utilitaires pour le système XP et niveaux

/**
 * Calculer le niveau basé sur l'XP
 * Formule: niveau = floor(XP / 1000) + 1
 */
function calculateLevel(xp) {
  return Math.floor(xp / 1000) + 1;
}

/**
 * Calculer l'XP nécessaire pour le prochain niveau
 */
function xpForNextLevel(currentLevel) {
  return currentLevel * 1000;
}

/**
 * Calculer l'XP du niveau actuel
 */
function xpForCurrentLevel(currentLevel) {
  return (currentLevel - 1) * 1000;
}

/**
 * Calculer la progression vers le prochain niveau (0-100)
 */
function progressToNextLevel(xp, currentLevel) {
  const currentLevelXp = xpForCurrentLevel(currentLevel);
  const nextLevelXp = xpForNextLevel(currentLevel);
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Vérifier et mettre à jour la série quotidienne
 */
async function updateStreak(prisma, userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastStreakDate: true }
  });

  if (!user) return { streak: 0, isNew: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastStreakDate) {
    // Première connexion
    await prisma.user.update({
      where: { id: userId },
      data: { streak: 1, lastStreakDate: today }
    });
    return { streak: 1, isNew: true };
  }

  const lastDate = new Date(user.lastStreakDate);
  lastDate.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Même jour
    return { streak: user.streak, isNew: false };
  } else if (daysDiff === 1) {
    // Jour suivant - continuer la série
    const newStreak = user.streak + 1;
    await prisma.user.update({
      where: { id: userId },
      data: { streak: newStreak, lastStreakDate: today }
    });
    return { streak: newStreak, isNew: true };
  } else {
    // Série rompue - recommencer
    await prisma.user.update({
      where: { id: userId },
      data: { streak: 1, lastStreakDate: today }
    });
    return { streak: 1, isNew: true };
  }
}

/**
 * Ajouter XP et mettre à jour le niveau si nécessaire
 */
async function addXP(prisma, userId, amount) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true }
  });

  if (!user) return;

  const newXP = user.xp + amount;
  const newLevel = calculateLevel(newXP);

  const updateData = { xp: newXP };
  if (newLevel > user.level) {
    updateData.level = newLevel;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  return {
    xp: newXP,
    level: newLevel,
    leveledUp: newLevel > user.level
  };
}

module.exports = {
  calculateLevel,
  xpForNextLevel,
  xpForCurrentLevel,
  progressToNextLevel,
  updateStreak,
  addXP
};

