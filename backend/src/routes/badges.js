const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Badges prédéfinis
const PREDEFINED_BADGES = [
  {
    name: 'Premier Pas',
    description: 'Compléter votre première leçon',
    icon: '🎯',
    condition: 'complete_lesson:1',
    points: 50
  },
  {
    name: 'Étudiant Assidu',
    description: 'Compléter 10 leçons',
    icon: '📚',
    condition: 'complete_lesson:10',
    points: 100
  },
  {
    name: 'Maître des Quiz',
    description: 'Réussir 5 quiz',
    icon: '🏆',
    condition: 'complete_quiz:5',
    points: 100
  },
  {
    name: 'Série de 7',
    description: 'Maintenir une série de 7 jours',
    icon: '🔥',
    condition: 'streak:7',
    points: 75
  },
  {
    name: 'Niveau 5',
    description: 'Atteindre le niveau 5',
    icon: '⭐',
    condition: 'level:5',
    points: 150
  }
];

// Initialize badges in database
async function initializeBadges() {
  for (const badge of PREDEFINED_BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge
    });
  }
}

// Get all badges
router.get('/all', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    await initializeBadges();

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

    await initializeBadges();

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

    await initializeBadges();

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

// Check badges (trigger badge check)
router.post('/check', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await initializeBadges();

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

    const unlockedBadgeNames = user.badges.map(ub => ub.badge.name);
    const newlyUnlocked = [];

    for (const badge of PREDEFINED_BADGES) {
      if (unlockedBadgeNames.includes(badge.name)) continue;

      let shouldUnlock = false;

      if (badge.condition.startsWith('complete_lesson:')) {
        const count = parseInt(badge.condition.split(':')[1]);
        const completions = await prisma.microLessonCompletion.count({
          where: { userId, completed: true }
        });
        shouldUnlock = completions >= count;
      } else if (badge.condition.startsWith('complete_quiz:')) {
        const count = parseInt(badge.condition.split(':')[1]);
        const attempts = await prisma.quizAttempt.count({
          where: { userId, completedAt: { not: null } }
        });
        shouldUnlock = attempts >= count;
      } else if (badge.condition.startsWith('streak:')) {
        const days = parseInt(badge.condition.split(':')[1]);
        shouldUnlock = (user.streak || 0) >= days;
      } else if (badge.condition.startsWith('level:')) {
        const level = parseInt(badge.condition.split(':')[1]);
        shouldUnlock = user.level >= level;
      }

      if (shouldUnlock) {
        // Find the badge by name to get its DB id
        const dbBadge = await prisma.badge.findUnique({
          where: { name: badge.name }
        });

        if (dbBadge) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: dbBadge.id
            }
          });

          await prisma.user.update({
            where: { id: userId },
            data: { xp: { increment: badge.points || 50 } }
          });

          newlyUnlocked.push(badge);
        }
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
