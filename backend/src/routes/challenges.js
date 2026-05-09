const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const prisma = require('../config/database');
const { processAction } = require('../services/gamification');

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

// GET /weekly — All active weekly challenges (up to 3) with user status
router.get('/weekly', optionalAuth, async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user?.userId || null;

    const activeChallenges = await prisma.challenge.findMany({
      where: {
        status: 'active',
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { difficulty: 'asc' }
    });

    if (activeChallenges.length === 0) {
      return res.json({
        success: true,
        data: { weekStart: null, weekEnd: null, timeRemaining: 0, challenges: [] }
      });
    }

    // Get user attempts for these challenges
    let userAttempts = [];
    if (userId) {
      userAttempts = await prisma.challengeAttempt.findMany({
        where: { userId, challengeId: { in: activeChallenges.map(c => c.id) } }
      });
    }
    const attemptMap = Object.fromEntries(userAttempts.map(a => [a.challengeId, a]));

    // Get participant counts
    const participantCounts = await Promise.all(
      activeChallenges.map(c => prisma.challengeAttempt.count({ where: { challengeId: c.id } }))
    );

    const weekEnd = activeChallenges[0].endDate;
    const challenges = activeChallenges.map((c, i) => {
      const attempt = attemptMap[c.id];
      const questionsArray = Array.isArray(c.questions) ? c.questions : [];
      let userStatus = 'not_started';
      let userScore = null;
      if (attempt?.completedAt) {
        userStatus = 'completed';
        const maxScore = questionsArray.reduce((sum, q) => sum + (q.points || 10), 0);
        userScore = { score: attempt.score, maxScore };
      } else if (attempt) {
        userStatus = 'in_progress';
      }

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        subject: c.subject,
        difficulty: c.difficulty,
        timeLimit: c.timeLimit,
        xpReward: c.xpReward,
        prize: c.prize,
        questionCount: questionsArray.length,
        participants: participantCounts[i],
        startDate: c.startDate,
        endDate: c.endDate,
        userStatus,
        userScore
      };
    });

    res.json({
      success: true,
      data: {
        weekStart: activeChallenges[0].startDate,
        weekEnd,
        timeRemaining: Math.max(0, new Date(weekEnd).getTime() - now.getTime()),
        challenges
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

    // XP if score > 50%
    const maxScore = questionsArray.reduce((sum, q) => sum + (q.points || 10), 0);
    const xpEarned = score > maxScore * 0.5 ? challenge.xpReward : 0;
    let gamification = null;
    if (xpEarned > 0) {
      gamification = await processAction(userId, { type: 'submit_challenge', xp: xpEarned });
    }

    res.json({
      success: true,
      data: {
        score,
        maxScore,
        percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
        xpEarned,
        results,
        gamification
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
