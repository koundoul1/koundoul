const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Badges prédéfinis
const PREDEFINED_BADGES = [
  {
    id: 'first-step',
    name: 'Premier Pas',
    description: 'Compléter votre première leçon',
    icon: '🎯',
    color: '#3B82F6',
    category: 'progress',
    requirement: 'complete_lesson:1'
  },
  {
    id: 'diligent-student',
    name: 'Étudiant Assidu',
    description: 'Compléter 10 leçons',
    icon: '📚',
    color: '#10B981',
    category: 'progress',
    requirement: 'complete_lesson:10'
  },
  {
    id: 'quiz-master',
    name: 'Maître des Quiz',
    description: 'Réussir 5 quiz',
    icon: '🏆',
    color: '#F59E0B',
    category: 'achievement',
    requirement: 'complete_quiz:5'
  },
  {
    id: 'streak-7',
    name: 'Série de 7',
    description: 'Maintenir une série de 7 jours',
    icon: '🔥',
    color: '#EF4444',
    category: 'streak',
    requirement: 'streak:7'
  },
  {
    id: 'level-5',
    name: 'Niveau 5',
    description: 'Atteindre le niveau 5',
    icon: '⭐',
    color: '#8B5CF6',
    category: 'level',
    requirement: 'level:5'
  }
];

// Initialize badges in database
async function initializeBadges() {
  for (const badge of PREDEFINED_BADGES) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {},
      create: badge
    });
  }
}

// Get all badges
router.get('/all', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    // Initialiser les badges si nécessaire
    await initializeBadges();

    // Récupérer tous les badges
    const allBadges = await prisma.badge.findMany({
      orderBy: { category: 'asc' }
    });

    // Si utilisateur connecté, récupérer ses badges débloqués
    let unlockedBadgeIds = [];
    if (userId) {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true }
      });
      unlockedBadgeIds = userBadges.map(ub => ub.badgeId);
    }

    // Mapper avec statut débloqué
    const badges = allBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      color: badge.color,
      category: badge.category,
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
      color: ub.badge.color,
      category: ub.badge.category,
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

    // Récupérer l'utilisateur
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

    const unlockedBadgeIds = user.badges.map(ub => ub.badgeId);
    const newlyUnlocked = [];

    // Vérifier chaque badge
    for (const badge of PREDEFINED_BADGES) {
      if (unlockedBadgeIds.includes(badge.id)) continue;

      let shouldUnlock = false;

      // Vérifier selon le type de requirement
      if (badge.requirement.startsWith('complete_lesson:')) {
        const count = parseInt(badge.requirement.split(':')[1]);
        const completions = await prisma.microLessonCompletion.count({
          where: { userId, completed: true }
        });
        shouldUnlock = completions >= count;
      } else if (badge.requirement.startsWith('complete_quiz:')) {
        const count = parseInt(badge.requirement.split(':')[1]);
        const attempts = await prisma.quizAttempt.count({
          where: { userId, completedAt: { not: null } }
        });
        shouldUnlock = attempts >= count;
      } else if (badge.requirement.startsWith('streak:')) {
        const days = parseInt(badge.requirement.split(':')[1]);
        shouldUnlock = user.streak >= days;
      } else if (badge.requirement.startsWith('level:')) {
        const level = parseInt(badge.requirement.split(':')[1]);
        shouldUnlock = user.level >= level;
      }

      if (shouldUnlock) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id
          }
        });

        // Ajouter XP bonus
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: 50 } }
        });

        newlyUnlocked.push(badge);
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
