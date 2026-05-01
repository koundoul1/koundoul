const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const prisma = require('../config/database');
const { processAction } = require('../services/gamification');

// Get all quizzes (question banks)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { subject, level, type } = req.query;

    const where = {};
    if (subject && subject !== 'Toutes les matières') where.subject = subject;
    if (level && level !== 'Tous les niveaux') where.level = level;
    if (type) where.type = type;

    const banks = await prisma.questionBank.findMany({
      where,
      include: {
        _count: {
          select: { qcm_questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = banks.map(bank => ({
      id: bank.id,
      title: bank.title,
      subject: bank.subject,
      level: bank.level,
      type: bank.type,
      totalQuestions: bank._count.qcm_questions || 0
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// Get quiz by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const bank = await prisma.questionBank.findUnique({
      where: { id },
      include: {
        _count: {
          select: { qcm_questions: true }
        }
      }
    });

    if (!bank) {
      return res.status(404).json({ error: 'Banque de questions non trouvée' });
    }

    res.json({
      success: true,
      data: {
        ...bank,
        totalQuestions: bank._count.qcm_questions || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Start quiz
router.post('/:id/start', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const bank = await prisma.questionBank.findUnique({
      where: { id }
    });

    if (!bank) {
      return res.status(404).json({ error: 'Banque de questions non trouvée' });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        bankId: id,
        score: 0,
        answers: {}
      }
    });

    res.json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
});

// Submit quiz attempt
router.post('/attempt/:attemptId/submit', authenticateToken, async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user.userId;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        bank: {
          include: {
            quiz_questions: true
          }
        }
      }
    });

    if (!attempt || attempt.userId !== userId) {
      return res.status(404).json({ error: 'Tentative non trouvée' });
    }

    if (attempt.completedAt) {
      return res.status(400).json({ error: 'Cette tentative est déjà complétée' });
    }

    // Calculer le score
    let correct = 0;
    const questions = attempt.bank.quiz_questions;
    let total = questions.length;

    for (const question of questions) {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined) {
        if (userAnswer === question.correctAnswer) {
          correct++;
        }
      }
    }

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Mettre à jour la tentative
    const updated = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        answers,
        completedAt: new Date()
      }
    });

    // XP: 10 per correct answer
    const xpEarned = correct * 10;
    const gamification = await processAction(userId, { type: 'submit_quiz', xp: xpEarned });

    res.json({
      success: true,
      data: {
        ...updated,
        correct,
        xpEarned,
        gamification
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get quiz attempts history
router.get('/attempts/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      include: {
        bank: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 20
    });

    res.json({ success: true, data: attempts });
  } catch (error) {
    next(error);
  }
});

// Get user quiz stats
router.get('/stats/user', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [totalAttempts, avgScore, bestScore] = await Promise.all([
      prisma.quizAttempt.count({
        where: { userId, completedAt: { not: null } }
      }),
      prisma.quizAttempt.aggregate({
        where: { userId, completedAt: { not: null } },
        _avg: { score: true }
      }),
      prisma.quizAttempt.findFirst({
        where: { userId, completedAt: { not: null } },
        orderBy: { score: 'desc' },
        select: { score: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalAttempts,
        averageScore: avgScore._avg.score ? Math.round(avgScore._avg.score) : 0,
        bestScore: bestScore?.score || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
