const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');

// Get dashboard data
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Récupérer l'utilisateur avec stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Calculer le niveau basé sur XP (1000 XP par niveau)
    const calculatedLevel = Math.floor(user.xp / 1000) + 1;

    // Récupérer les stats
    const [exercisesCompleted, averageScore, recentQuizAttempts] = await Promise.all([
      prisma.quizAttempt.count({
        where: { userId, completedAt: { not: null } }
      }),
      prisma.quizAttempt.aggregate({
        where: { userId, completedAt: { not: null } },
        _avg: { score: true }
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          score: true,
          passed: true,
          startedAt: true
        }
      })
    ]);

    // Vérifier et mettre à jour la série
    let streak = user.streak || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.lastStreakDate) {
      const lastDate = new Date(user.lastStreakDate);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Continuer la série
        streak = user.streak + 1;
        await prisma.user.update({
          where: { id: userId },
          data: { streak, lastStreakDate: today }
        });
      } else if (daysDiff > 1) {
        // Série rompue
        streak = 1;
        await prisma.user.update({
          where: { id: userId },
          data: { streak: 1, lastStreakDate: today }
        });
      }
    } else {
      // Première connexion
      await prisma.user.update({
        where: { id: userId },
        data: { streak: 1, lastStreakDate: today }
      });
      streak = 1;
    }

    // Mettre à jour le niveau si nécessaire
    if (calculatedLevel > user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: calculatedLevel }
      });
    }

    const dashboard = {
      user: {
        ...user,
        level: calculatedLevel,
        streak
      },
      stats: {
        xp: user.xp,
        level: calculatedLevel,
        exercisesCompleted,
        averageScore: averageScore._avg.score ? Math.round(averageScore._avg.score) : 0,
        streak
      },
      recentActivity: recentQuizAttempts.map(attempt => ({
        id: attempt.id,
        type: 'quiz',
        score: attempt.score,
        passed: attempt.passed,
        date: attempt.startedAt
      })),
      recommendations: [
        {
          type: 'quiz',
          title: 'Continuez votre progression',
          description: 'Essayez un nouveau quiz pour gagner plus de XP'
        }
      ]
    };

    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
