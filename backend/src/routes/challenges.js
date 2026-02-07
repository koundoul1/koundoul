const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all challenges
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({ success: true, data: challenges });
  } catch (error) {
    next(error);
  }
});

// Get weekly challenge
router.get('/weekly', optionalAuth, async (req, res, next) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    let challenge = await prisma.challenge.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { startDate: 'desc' }
    });

    // Si pas de challenge actif, créer un placeholder
    if (!challenge) {
      challenge = {
        id: 'weekly-placeholder',
        title: 'Aucun challenge actif',
        description: 'Il n\'y a pas de challenge hebdomadaire actif pour le moment.',
        subject: 'Mathématiques',
        difficulty: 'Moyen',
        timeLimit: 20,
        participants: 0,
        isActive: false,
        startDate: startOfWeek,
        endDate: endOfWeek
      };
    } else {
      // Compter les participants
      const participants = await prisma.challengeAttempt.count({
        where: { challengeId: challenge.id }
      });
      challenge.participants = participants;
    }

    res.json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
});

// Get challenge by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attempts: true }
        }
      }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge non trouvé' });
    }

    res.json({
      success: true,
      data: {
        ...challenge,
        participants: challenge._count.attempts
      }
    });
  } catch (error) {
    next(error);
  }
});

// Start challenge
router.post('/:id/start', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const challenge = await prisma.challenge.findUnique({
      where: { id }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge non trouvé' });
    }

    if (!challenge.isActive) {
      return res.status(400).json({ error: 'Ce challenge n\'est pas actif' });
    }

    // Vérifier si l'utilisateur a déjà commencé
    const existingAttempt = await prisma.challengeAttempt.findFirst({
      where: {
        challengeId: id,
        userId,
        completedAt: null
      }
    });

    if (existingAttempt) {
      return res.json({ success: true, data: existingAttempt });
    }

    const attempt = await prisma.challengeAttempt.create({
      data: {
        challengeId: id,
        userId,
        score: 0,
        answers: {},
        timeSpent: 0
      }
    });

    res.json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
});

// Submit challenge
router.post('/:id/submit', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.userId;

    const challenge = await prisma.challenge.findUnique({
      where: { id }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge non trouvé' });
    }

    // Trouver ou créer la tentative
    let attempt = await prisma.challengeAttempt.findFirst({
      where: {
        challengeId: id,
        userId,
        completedAt: null
      }
    });

    if (!attempt) {
      attempt = await prisma.challengeAttempt.create({
        data: {
          challengeId: id,
          userId,
          score: 0,
          answers: {},
          timeSpent: 0
        }
      });
    }

    // Calculer le score (placeholder - à adapter selon les questions)
    const score = Object.keys(answers).length * 10; // 10 points par réponse

    // Mettre à jour la tentative
    const updated = await prisma.challengeAttempt.update({
      where: { id: attempt.id },
      data: {
        score,
        answers,
        timeSpent: timeSpent || 0,
        completedAt: new Date()
      }
    });

    // Calculer le rang
    const rank = await prisma.challengeAttempt.count({
      where: {
        challengeId: id,
        score: { gt: score }
      }
    }) + 1;

    // Mettre à jour le rang
    await prisma.challengeAttempt.update({
      where: { id: attempt.id },
      data: { rank }
    });

    // Ajouter XP
    const xpEarned = score;
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xpEarned } }
    });

    res.json({
      success: true,
      data: {
        ...updated,
        rank,
        xpEarned
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/:id/leaderboard', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scope = 'international' } = req.query;

    const attempts = await prisma.challengeAttempt.findMany({
      where: {
        challengeId: id,
        completedAt: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { timeSpent: 'asc' }
      ],
      take: 100
    });

    const leaderboard = attempts.map((attempt, index) => ({
      rank: index + 1,
      user: {
        id: attempt.user.id,
        username: attempt.user.username || attempt.user.email,
        name: attempt.user.firstName || attempt.user.lastName 
          ? `${attempt.user.firstName || ''} ${attempt.user.lastName || ''}`.trim()
          : null
      },
      score: attempt.score,
      timeSpent: attempt.timeSpent
    }));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

// Get user rank
router.get('/:id/rank', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scope = 'international' } = req.query;
    const userId = req.user.userId;

    const userAttempt = await prisma.challengeAttempt.findFirst({
      where: {
        challengeId: id,
        userId,
        completedAt: { not: null }
      },
      orderBy: { score: 'desc' }
    });

    if (!userAttempt) {
      return res.json({
        success: true,
        data: {
          rank: null,
          score: 0
        }
      });
    }

    const rank = await prisma.challengeAttempt.count({
      where: {
        challengeId: id,
        score: { gt: userAttempt.score }
      }
    }) + 1;

    res.json({
      success: true,
      data: {
        rank,
        score: userAttempt.score
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
