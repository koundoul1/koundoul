const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');

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
        invitationCode: true,
        parentId: true,
        parentInvitationCode: true,
        isParent: true,
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

    const [
      user,
      badgesCount,
      exercisesCompleted,
      quizAttempts,
      challengesCompleted,
      flashcardsCount
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          xp: true,
          level: true,
          streak: true,
          createdAt: true
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
      }),
      Promise.resolve(0),
      prisma.flashcardReview.count({
        where: { userId }
      })
    ]);

    const calculatedLevel = Math.floor((user?.xp || 0) / 1000) + 1;
    
    // Calculer les jours depuis l'inscription
    const daysSinceJoined = user?.createdAt 
      ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Calculer le temps d'étude estimé (en heures)
    const estimatedStudyTimeHours = Math.round(
      (exercisesCompleted * 0.25 +
        quizAttempts * 0.25 +
        challengesCompleted * 0.33 +
        flashcardsCount * 0.05) * 10
    ) / 10;

    res.json({
      success: true,
      data: {
        totalXp: user?.xp || 0,
        level: calculatedLevel,
        streak: user?.streak || 0,
        problemsSolved: exercisesCompleted + challengesCompleted,
        quizzesCompleted: quizAttempts,
        badgesEarned: badgesCount,
        daysSinceJoined,
        daysActiveLast30Days: daysSinceJoined, // Approximation
        estimatedStudyTimeHours,
        quizAverageScore: 0 // À calculer si nécessaire
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
      unlocked: true,
      unlockedAt: ub.unlockedAt
    }));

    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
});

// Generate invitation code
router.post('/generate-invitation-code', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Générer un code unique (8 caractères alphanumériques)
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let invitationCode;
    let isUnique = false;
    
    // Vérifier l'unicité du code
    while (!isUnique) {
      invitationCode = generateCode();
      const existing = await prisma.user.findUnique({
        where: { invitationCode }
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // Mettre à jour l'utilisateur avec le code
    await prisma.user.update({
      where: { id: userId },
      data: { invitationCode }
    });

    res.json({
      success: true,
      data: { invitationCode }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
