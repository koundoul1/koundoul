const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const prisma = require('../config/database');
const { getSupabase, isSupabaseConfigured } = require('../config/supabase');

// Get all badges
router.get('/all', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const allBadges = await prisma.badge.findMany({
      orderBy: { name: 'asc' }
    });

    let unlockedBadgeIds = [];
    if (userId) {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true }
      });
      unlockedBadgeIds = userBadges.map(ub => ub.badgeId);
    }

    const badges = allBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      points: badge.points,
      unlocked: unlockedBadgeIds.includes(badge.id),
      unlockedAt: null
    }));

    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
});

// Get user badges
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: { unlockedAt: 'desc' }
    });

    const badges = userBadges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      points: ub.badge.points,
      unlocked: true,
      unlockedAt: ub.unlockedAt
    }));

    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
});

// Get badge stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [total, unlocked] = await Promise.all([
      prisma.badge.count(),
      prisma.userBadge.count({
        where: { userId }
      })
    ]);

    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        unlocked,
        percentage
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper: get count of user's completed microlessons matching a Supabase filter.
 * Returns the count, or 0 if Supabase is not configured.
 */
async function getFilteredLessonCount(userId, filterField, filterValue) {
  // Get all completed lesson IDs from Prisma
  const completions = await prisma.microLessonCompletion.findMany({
    where: { userId, completed: true },
    select: { lessonId: true }
  });

  if (completions.length === 0) return 0;

  const lessonIds = completions.map(c => c.lessonId);

  if (!isSupabaseConfigured()) return 0;

  const supabase = getSupabase();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from('microlessons')
    .select('id', { count: 'exact', head: true })
    .in('id', lessonIds)
    .eq(filterField, filterValue);

  if (error) {
    console.error(`[Badges] Supabase query error (${filterField}=${filterValue}):`, error.message);
    return 0;
  }

  return count || 0;
}

// Check badges (trigger badge check)
router.post('/check', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          include: { badge: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const unlockedBadgeIds = new Set(user.badges.map(ub => ub.badge.id));

    // Load all active badges from DB
    const allBadges = await prisma.badge.findMany({
      where: { isActive: true }
    });

    const newlyUnlocked = [];

    for (const badge of allBadges) {
      if (unlockedBadgeIds.has(badge.id)) continue;

      let shouldUnlock = false;
      const condition = badge.condition;

      if (condition.startsWith('complete_lesson:')) {
        const count = parseInt(condition.split(':')[1]);
        const completions = await prisma.microLessonCompletion.count({
          where: { userId, completed: true }
        });
        shouldUnlock = completions >= count;

      } else if (condition.startsWith('complete_quiz:')) {
        const count = parseInt(condition.split(':')[1]);
        const attempts = await prisma.quizAttempt.count({
          where: { userId, completedAt: { not: null } }
        });
        shouldUnlock = attempts >= count;

      } else if (condition.startsWith('streak:')) {
        const days = parseInt(condition.split(':')[1]);
        shouldUnlock = (user.streak || 0) >= days;

      } else if (condition.startsWith('level:')) {
        const level = parseInt(condition.split(':')[1]);
        shouldUnlock = user.level >= level;

      } else if (condition.startsWith('subject:')) {
        // Format: subject:SubjectName:N
        const parts = condition.split(':');
        const subjectName = parts[1];
        const count = parseInt(parts[2]);
        const completed = await getFilteredLessonCount(userId, 'subject', subjectName);
        shouldUnlock = completed >= count;

      } else if (condition.startsWith('level_mastery:')) {
        // Format: level_mastery:LevelName:N
        const parts = condition.split(':');
        const levelName = parts[1];
        const count = parseInt(parts[2]);
        const completed = await getFilteredLessonCount(userId, 'level', levelName);
        shouldUnlock = completed >= count;

      } else if (condition.startsWith('perfect_quiz:')) {
        const count = parseInt(condition.split(':')[1]);
        const perfectQuizzes = await prisma.quizAttempt.count({
          where: { userId, score: 100, completedAt: { not: null } }
        });
        shouldUnlock = perfectQuizzes >= count;
      }

      if (shouldUnlock) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id
          }
        });

        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: badge.points || 50 } }
        });

        newlyUnlocked.push({
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          points: badge.points
        });
      }
    }

    res.json({
      success: true,
      message: newlyUnlocked.length > 0 ? `${newlyUnlocked.length} badge(s) débloqué(s)` : 'Aucun nouveau badge',
      data: { newlyUnlocked }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
