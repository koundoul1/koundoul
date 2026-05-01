/**
 * Gamification Service — centralized XP, streak, badge logic.
 *
 * Level formula: level = floor(xp / 1000) + 1  (linear, 1000 XP per level).
 * Streak: UTC-based day comparison. See STATUS.md for timezone debt.
 */

const prisma = require('../config/database');
const { getSupabase, isSupabaseConfigured } = require('../config/supabase');
const { sendNotification } = require('../utils/notificationService');

const XP_PER_LEVEL = 1000;

// ── helpers ──────────────────────────────────────────────────────────

function calculateLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** Truncate a Date to midnight UTC */
function toUTCMidnight(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// ── awardXP ──────────────────────────────────────────────────────────

/**
 * Credit XP and update level. Works inside an existing Prisma transaction
 * when `db` is provided, otherwise uses the default client.
 */
async function awardXP(userId, amount, source, db) {
  const client = db || prisma;

  const user = await client.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true }
  });
  if (!user) return null;

  const newXp = user.xp + amount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > user.level;

  await client.user.update({
    where: { id: userId },
    data: { xp: newXp, level: newLevel }
  });

  if (leveledUp) {
    // Fire-and-forget notification (outside tx is fine)
    sendNotification(
      userId,
      'level_up',
      `Niveau ${newLevel} !`,
      `Bravo, tu passes au niveau ${newLevel} avec ${newXp} XP !`,
      { level: newLevel, xp: newXp, source }
    );
  }

  return { newXp, newLevel, leveledUp };
}

// ── updateStreak ─────────────────────────────────────────────────────

/**
 * Update daily streak using UTC-based day comparison.
 * Returns { newStreak, streakBroken }.
 */
async function updateStreak(userId, db) {
  const client = db || prisma;

  const user = await client.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastStreakDate: true }
  });
  if (!user) return { newStreak: 0, streakBroken: false };

  const todayUTC = toUTCMidnight(new Date());

  if (!user.lastStreakDate) {
    await client.user.update({
      where: { id: userId },
      data: { streak: 1, lastStreakDate: todayUTC }
    });
    return { newStreak: 1, streakBroken: false };
  }

  const lastUTC = toUTCMidnight(new Date(user.lastStreakDate));
  const daysDiff = Math.round((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    return { newStreak: user.streak || 1, streakBroken: false };
  }

  if (daysDiff === 1) {
    const newStreak = (user.streak || 0) + 1;
    await client.user.update({
      where: { id: userId },
      data: { streak: newStreak, lastStreakDate: todayUTC }
    });
    return { newStreak, streakBroken: false };
  }

  // daysDiff >= 2 — streak broken, restart at 1
  await client.user.update({
    where: { id: userId },
    data: { streak: 1, lastStreakDate: todayUTC }
  });
  return { newStreak: 1, streakBroken: true };
}

// ── evaluateBadges ───────────────────────────────────────────────────

/**
 * Check all badge conditions and unlock any that are newly met.
 * Returns { newBadges: [{ name, description, icon, points }] }.
 */
async function evaluateBadges(userId, db) {
  const client = db || prisma;

  const user = await client.user.findUnique({
    where: { id: userId },
    select: {
      xp: true, level: true, streak: true,
      badges: { select: { badgeId: true } }
    }
  });
  if (!user) return { newBadges: [] };

  const unlockedIds = new Set(user.badges.map(ub => ub.badgeId));
  const allBadges = await client.badge.findMany({ where: { isActive: true } });

  const newBadges = [];

  for (const badge of allBadges) {
    if (unlockedIds.has(badge.id)) continue;

    const shouldUnlock = await checkCondition(badge.condition, userId, user, client);
    if (!shouldUnlock) continue;

    await client.userBadge.create({
      data: { userId, badgeId: badge.id }
    });

    // Bonus XP for badge (separate from the action XP)
    await client.user.update({
      where: { id: userId },
      data: { xp: { increment: badge.points || 50 } }
    });

    newBadges.push({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      points: badge.points
    });

    // Notification
    sendNotification(
      userId,
      'badge_earned',
      `Badge débloqué : ${badge.name}`,
      badge.description,
      { badgeId: badge.id, icon: badge.icon }
    );
  }

  return { newBadges };
}

async function checkCondition(condition, userId, user, client) {
  if (condition.startsWith('complete_lesson:')) {
    const target = parseInt(condition.split(':')[1]);
    const count = await client.microLessonCompletion.count({
      where: { userId, completed: true }
    });
    return count >= target;
  }

  if (condition.startsWith('complete_quiz:')) {
    const target = parseInt(condition.split(':')[1]);
    const count = await client.quizAttempt.count({
      where: { userId, completedAt: { not: null } }
    });
    return count >= target;
  }

  if (condition.startsWith('streak:')) {
    const target = parseInt(condition.split(':')[1]);
    return (user.streak || 0) >= target;
  }

  if (condition.startsWith('level:')) {
    const target = parseInt(condition.split(':')[1]);
    return (user.level || 1) >= target;
  }

  if (condition.startsWith('perfect_quiz:')) {
    const target = parseInt(condition.split(':')[1]);
    const count = await client.quizAttempt.count({
      where: { userId, score: 100, completedAt: { not: null } }
    });
    return count >= target;
  }

  if (condition.startsWith('subject:')) {
    const parts = condition.split(':');
    return await checkFilteredLessonCount(userId, 'subject', parts[1], parseInt(parts[2]), client);
  }

  if (condition.startsWith('level_mastery:')) {
    const parts = condition.split(':');
    return await checkFilteredLessonCount(userId, 'level', parts[1], parseInt(parts[2]), client);
  }

  return false;
}

async function checkFilteredLessonCount(userId, filterField, filterValue, target, client) {
  const completions = await client.microLessonCompletion.findMany({
    where: { userId, completed: true },
    select: { lessonId: true }
  });
  if (completions.length === 0) return false;

  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabase();
  if (!supabase) return false;

  const ids = completions.map(c => c.lessonId);
  const { count, error } = await supabase
    .from('microlessons')
    .select('id', { count: 'exact', head: true })
    .in('id', ids)
    .eq(filterField, filterValue);

  if (error) return false;
  return (count || 0) >= target;
}

// ── processAction (facade) ───────────────────────────────────────────

/**
 * Orchestrate XP + streak + badges after a user action.
 * @param {string} userId
 * @param {{ type: string, xp: number }} action
 * @returns {Promise<{ xpGained, totalXp, newLevel, leveledUp, newStreak, streakBroken, newBadges }>}
 */
async function processAction(userId, action) {
  const xpResult = await awardXP(userId, action.xp, action.type);
  const streakResult = await updateStreak(userId);
  const badgeResult = await evaluateBadges(userId);

  // Re-read totalXp in case badge bonus XP was added
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true }
  });

  return {
    xpGained: action.xp,
    totalXp: user?.xp ?? xpResult?.newXp ?? 0,
    newLevel: user ? calculateLevel(user.xp) : xpResult?.newLevel ?? 1,
    leveledUp: xpResult?.leveledUp ?? false,
    newStreak: streakResult.newStreak,
    streakBroken: streakResult.streakBroken,
    newBadges: badgeResult.newBadges
  };
}

module.exports = {
  calculateLevel,
  XP_PER_LEVEL,
  awardXP,
  updateStreak,
  evaluateBadges,
  processAction
};
