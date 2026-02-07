const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all micro-lessons
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { subject, level, limit = 1000, offset = 0 } = req.query;
    const userId = req.user?.userId;

    // Note: Les micro-leçons sont stockées dans Supabase
    // Cette route sert de proxy/placeholder
    // En production, vous devrez connecter à Supabase ici
    
    const lessons = [];

    // Si utilisateur connecté, récupérer les complétions
    let completions = {};
    if (userId) {
      const userCompletions = await prisma.microLessonCompletion.findMany({
        where: { userId },
        select: {
          lessonId: true,
          completed: true,
          score: true,
          timeSpent: true
        }
      });
      completions = userCompletions.reduce((acc, comp) => {
        acc[comp.lessonId] = {
          completed: comp.completed,
          score: comp.score,
          timeSpent: comp.timeSpent
        };
        return acc;
      }, {});
    }

    res.json({ success: true, data: lessons, completions });
  } catch (error) {
    next(error);
  }
});

// Get micro-lesson by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Récupérer depuis Supabase ou retourner placeholder
    const lesson = null; // À implémenter avec Supabase

    // Récupérer la complétion si utilisateur connecté
    let completion = null;
    if (userId) {
      completion = await prisma.microLessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId: id
          }
        }
      });
    }

    res.json({ success: true, data: lesson, completion });
  } catch (error) {
    next(error);
  }
});

// Complete micro-lesson
router.post('/:id/complete', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timeSpent, score } = req.body;
    const userId = req.user.userId;

    // Calculer XP (base: 50 XP, bonus selon score)
    let xpEarned = 50;
    if (score !== undefined) {
      xpEarned = 50 + Math.round((score / 100) * 50); // Jusqu'à 100 XP pour 100%
    }

    // Créer ou mettre à jour la complétion
    const completion = await prisma.microLessonCompletion.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: id
        }
      },
      update: {
        completed: true,
        score: score || null,
        timeSpent: timeSpent || 0,
        xpEarned,
        completedAt: new Date()
      },
      create: {
        userId,
        lessonId: id,
        completed: true,
        score: score || null,
        timeSpent: timeSpent || 0,
        xpEarned,
        completedAt: new Date()
      }
    });

    // Ajouter XP à l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xpEarned } }
    });

    // Vérifier les badges
    const completionsCount = await prisma.microLessonCompletion.count({
      where: { userId, completed: true }
    });

    // Débloquer badge "Premier Pas" si première leçon
    if (completionsCount === 1) {
      const firstStepBadge = await prisma.badge.findUnique({
        where: { id: 'first-step' }
      });
      if (firstStepBadge) {
        await prisma.userBadge.upsert({
          where: {
            userId_badgeId: {
              userId,
              badgeId: 'first-step'
            }
          },
          update: {},
          create: {
            userId,
            badgeId: 'first-step'
          }
        });
      }
    }

    res.json({
      success: true,
      data: completion,
      xpEarned
    });
  } catch (error) {
    next(error);
  }
});

// Get completion status
router.get('/:id/completion', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const completion = await prisma.microLessonCompletion.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: id
        }
      }
    });

    const result = {
      completed: completion?.completed || false,
      score: completion?.score || null,
      timeSpent: completion?.timeSpent || 0
    };

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get stats
router.get('/stats/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [totalCompleted, totalXp, avgScore] = await Promise.all([
      prisma.microLessonCompletion.count({
        where: { userId, completed: true }
      }),
      prisma.microLessonCompletion.aggregate({
        where: { userId, completed: true },
        _sum: { xpEarned: true }
      }),
      prisma.microLessonCompletion.aggregate({
        where: { userId, completed: true, score: { not: null } },
        _avg: { score: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        total_completed: totalCompleted,
        total_xp_earned: totalXp._sum.xpEarned || 0,
        average_score: avgScore._avg.score ? Math.round(avgScore._avg.score) : null
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
