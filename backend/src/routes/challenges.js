const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const prisma = require('../config/database');

// GET / — Tous les challenges actifs
router.get('/', optionalAuth, async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { status: 'active' },
      orderBy: { startDate: 'desc' }
    });

    const data = challenges.map(c => ({
      ...c,
      questions: c.questions?.length || 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erreur GET /challenges:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /weekly — Challenge hebdomadaire actif
router.get('/weekly', optionalAuth, async (req, res) => {
  try {
    const now = new Date();

    const challenge = await prisma.challenge.findFirst({
      where: {
        status: 'active',
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!challenge) {
      return res.json({
        success: true,
        data: {
          id: null,
          title: 'Aucun challenge actif',
          description: 'Il n\'y a pas de challenge hebdomadaire actif pour le moment.',
          subject: 'Mathématiques',
          difficulty: 'Moyen',
          timeLimit: 20,
          participants: 0,
          isActive: false,
          startDate: now,
          endDate: now,
          questions: 0
        }
      });
    }

    // Compter les participants
    const participants = await prisma.challengeAttempt.count({
      where: { challengeId: challenge.id }
    });

    const questionsArray = Array.isArray(challenge.questions) ? challenge.questions : [];

    res.json({
      success: true,
      data: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        subject: challenge.subject,
        difficulty: challenge.difficulty,
        timeLimit: challenge.timeLimit,
        participants,
        isActive: true,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        prize: challenge.prize,
        xpReward: challenge.xpReward,
        questions: questionsArray.length
      }
    });
  } catch (error) {
    console.error('Erreur GET /challenges/weekly:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /:id — Détail d'un challenge
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.id }
    });

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge non trouvé' });
    }

    const participants = await prisma.challengeAttempt.count({
      where: { challengeId: challenge.id }
    });

    const questionsArray = Array.isArray(challenge.questions) ? challenge.questions : [];

    res.json({
      success: true,
      data: {
        ...challenge,
        participants,
        isActive: challenge.status === 'active' && new Date() <= new Date(challenge.endDate),
        questions: questionsArray.length
      }
    });
  } catch (error) {
    console.error('Erreur GET /challenges/:id:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /:id/start — Démarrer un challenge (retourne les questions)
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.id }
    });

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge non trouvé' });
    }

    if (challenge.status !== 'active' || new Date() > new Date(challenge.endDate)) {
      return res.status(400).json({ success: false, error: 'Ce challenge n\'est plus actif' });
    }

    // Vérifier si l'user a déjà participé
    const existing = await prisma.challengeAttempt.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } }
    });

    if (existing && existing.completedAt) {
      return res.status(400).json({ success: false, error: 'Vous avez déjà complété ce challenge' });
    }

    // Créer ou récupérer l'attempt
    const attempt = existing || await prisma.challengeAttempt.create({
      data: { userId, challengeId: challenge.id }
    });

    const questionsArray = Array.isArray(challenge.questions) ? challenge.questions : [];

    // Retourner les questions sans les réponses correctes
    const questionsWithoutAnswers = questionsArray.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      points: q.points || 10,
      time_limit_seconds: q.time_limit_seconds || 60
    }));

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        challenge: {
          id: challenge.id,
          title: challenge.title,
          subject: challenge.subject,
          timeLimit: challenge.timeLimit
        },
        quiz: {
          id: attempt.id,
          questions: questionsWithoutAnswers,
          timeLimit: challenge.timeLimit
        }
      }
    });
  } catch (error) {
    console.error('Erreur POST /challenges/:id/start:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /:id/submit — Soumettre les réponses
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { answers, timeSpent } = req.body;

    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.id }
    });

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge non trouvé' });
    }

    const attempt = await prisma.challengeAttempt.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } }
    });

    if (!attempt) {
      return res.status(400).json({ success: false, error: 'Vous n\'avez pas commencé ce challenge' });
    }

    if (attempt.completedAt) {
      return res.status(400).json({ success: false, error: 'Challenge déjà soumis' });
    }

    // Calculer le score
    const questionsArray = Array.isArray(challenge.questions) ? challenge.questions : [];
    let score = 0;
    const results = [];

    if (answers && typeof answers === 'object') {
      for (const q of questionsArray) {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer !== undefined && userAnswer === q.correct_answer;
        if (isCorrect) score += (q.points || 10);
        results.push({
          questionId: q.id,
          userAnswer,
          correctAnswer: q.correct_answer,
          isCorrect,
          points: isCorrect ? (q.points || 10) : 0
        });
      }
    }

    // Mettre à jour l'attempt
    const updated = await prisma.challengeAttempt.update({
      where: { id: attempt.id },
      data: {
        score,
        answers: results,
        timeSpent: timeSpent || null,
        completedAt: new Date()
      }
    });

    // Ajouter XP si score > 50%
    const maxScore = questionsArray.reduce((sum, q) => sum + (q.points || 10), 0);
    if (score > maxScore * 0.5) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: challenge.xpReward } }
      });
    }

    res.json({
      success: true,
      data: {
        score,
        maxScore,
        percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
        xpEarned: score > maxScore * 0.5 ? challenge.xpReward : 0,
        results
      }
    });
  } catch (error) {
    console.error('Erreur POST /challenges/:id/submit:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /:id/leaderboard — Classement du challenge
router.get('/:id/leaderboard', optionalAuth, async (req, res) => {
  try {
    const attempts = await prisma.challengeAttempt.findMany({
      where: {
        challengeId: req.params.id,
        completedAt: { not: null }
      },
      include: {
        user: {
          select: { username: true, country: true, level: true }
        }
      },
      orderBy: { score: 'desc' },
      take: 50
    });

    const rankings = attempts.map((a, index) => ({
      rank: index + 1,
      username: a.user.username ? `***${a.user.username.slice(0, 4)}***` : 'Anonyme',
      score: a.score,
      level: `Niveau ${a.user.level || 1}`,
      country: a.user.country || 'SN',
      school: '***',
      region: a.user.country || 'SN'
    }));

    res.json({ success: true, data: rankings });
  } catch (error) {
    console.error('Erreur GET /challenges/:id/leaderboard:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /:id/rank — Rang de l'utilisateur
router.get('/:id/rank', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const attempt = await prisma.challengeAttempt.findUnique({
      where: { userId_challengeId: { userId, challengeId: req.params.id } }
    });

    if (!attempt || !attempt.completedAt) {
      return res.json({ success: true, data: { rank: null, score: 0 } });
    }

    // Compter combien de personnes ont un score supérieur
    const betterCount = await prisma.challengeAttempt.count({
      where: {
        challengeId: req.params.id,
        completedAt: { not: null },
        score: { gt: attempt.score }
      }
    });

    res.json({
      success: true,
      data: { rank: betterCount + 1, score: attempt.score }
    });
  } catch (error) {
    console.error('Erreur GET /challenges/:id/rank:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
