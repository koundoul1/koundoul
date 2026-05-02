const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const prisma = require('../config/database');
const { evaluateBadges } = require('../services/gamification');

// Get all badges (with user unlock status)
router.get('/all', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const allBadges = await prisma.badge.findMany({
      orderBy: { name: 'asc' }
    });

    let userBadgeMap = {};
    if (userId) {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true, unlockedAt: true }
      });
      userBadgeMap = Object.fromEntries(userBadges.map(ub => [ub.badgeId, ub.unlockedAt]));
    }

    const badges = allBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      condition: badge.condition,
      points: badge.points,
      unlocked: badge.id in userBadgeMap,
      unlockedAt: userBadgeMap[badge.id] || null
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
      include: { badge: true },
      orderBy: { unlockedAt: 'desc' }
    });

    const badges = userBadges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      condition: ub.badge.condition,
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
      prisma.userBadge.count({ where: { userId } })
    ]);

    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    res.json({ success: true, data: { total, unlocked, percentage } });
  } catch (error) {
    next(error);
  }
});

// Check badges — delegates to gamification service
router.post('/check', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { newBadges } = await evaluateBadges(userId);

    res.json({
      success: true,
      message: newBadges.length > 0 ? `${newBadges.length} badge(s) débloqué(s)` : 'Aucun nouveau badge',
      data: { newlyUnlocked: newBadges }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
