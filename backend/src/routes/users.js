const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Calculer le niveau réel
    const calculatedLevel = Math.floor(user.xp / 1000) + 1;

    res.json({
      success: true,
      data: {
        ...user,
        level: calculatedLevel
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, lastName, username } = req.body;

    // Vérifier username si fourni
    if (username) {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: req.user.userId }
        }
      });
      if (existingUsername) {
        return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(username !== undefined && { username })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        xp: true,
        level: true,
        streak: true
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Get user stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [user, badgesCount, exercisesCompleted, quizAttempts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          xp: true,
          level: true,
          streak: true
        }
      }),
      prisma.userBadge.count({
        where: { userId }
      }),
      prisma.microLessonCompletion.count({
        where: { userId, completed: true }
      }),
      prisma.quizAttempt.count({
        where: { userId, completedAt: { not: null } }
      })
    ]);

    const calculatedLevel = Math.floor((user?.xp || 0) / 1000) + 1;

    res.json({
      success: true,
      data: {
        xp: user?.xp || 0,
        level: calculatedLevel,
        exercisesCompleted,
        badgesUnlocked: badgesCount,
        quizAttempts
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user badges
router.get('/badges', authenticateToken, async (req, res, next) => {
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
      color: ub.badge.color,
      unlocked: true,
      unlockedAt: ub.unlockedAt
    }));

    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
