const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');

// GET / — Liste des duels (publics ou de l'utilisateur)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const isPublic = req.query.public === 'true';

    const where = isPublic
      ? { isPublic: true, status: 'PENDING', opponentId: null, challengerId: { not: userId } }
      : { OR: [{ challengerId: userId }, { opponentId: userId }] };

    const duels = await prisma.duel.findMany({
      where,
      include: {
        challenger: { select: { username: true, level: true, country: true } },
        opponent: { select: { username: true, level: true, country: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ success: true, data: duels });
  } catch (error) {
    console.error('Erreur GET /duels:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /history — Historique des duels de l'utilisateur
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const duels = await prisma.duel.findMany({
      where: {
        OR: [{ challengerId: userId }, { opponentId: userId }],
        status: { in: ['COMPLETED', 'EXPIRED'] }
      },
      include: {
        challenger: { select: { username: true, level: true } },
        opponent: { select: { username: true, level: true } }
      },
      orderBy: { completedAt: 'desc' },
      take: 20
    });

    res.json({ success: true, data: duels });
  } catch (error) {
    console.error('Erreur GET /duels/history:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST / — Créer un duel
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, difficulty, isPublic } = req.body;

    // Piocher 5 questions QCM aléatoires
    const difficultyMap = { 'Facile': 1, 'Moyen': 2, 'Difficile': 3 };
    const diffLevel = difficultyMap[difficulty] || 2;

    const questions = await prisma.qcm_questions.findMany({
      where: { difficulty: { in: [diffLevel, diffLevel + 1] } },
      take: 5,
      orderBy: { created_at: 'desc' }
    });

    if (questions.length === 0) {
      return res.status(400).json({ success: false, error: 'Pas assez de questions disponibles' });
    }

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      points: q.points || 10,
      time_limit_seconds: q.time_limit_seconds || 60
    }));

    const duel = await prisma.duel.create({
      data: {
        challengerId: userId,
        subject: subject || 'Mathématiques',
        difficulty: difficulty || 'Moyen',
        timeLimit: 10,
        questions: formattedQuestions,
        xpReward: 50,
        isPublic: isPublic !== false,
        status: 'PENDING'
      },
      include: {
        challenger: { select: { username: true, level: true } }
      }
    });

    res.json({ success: true, data: duel });
  } catch (error) {
    console.error('Erreur POST /duels:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /:id/accept — Accepter un duel
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const duel = await prisma.duel.findUnique({ where: { id: req.params.id } });

    if (!duel) {
      return res.status(404).json({ success: false, error: 'Duel non trouvé' });
    }
    if (duel.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: 'Ce duel n\'est plus disponible' });
    }
    if (duel.challengerId === userId) {
      return res.status(400).json({ success: false, error: 'Vous ne pouvez pas accepter votre propre duel' });
    }

    const updated = await prisma.duel.update({
      where: { id: req.params.id },
      data: { opponentId: userId, status: 'ACCEPTED' }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erreur POST /duels/:id/accept:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /:id/start — Démarrer un duel (retourne les questions)
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const duel = await prisma.duel.findUnique({
      where: { id: req.params.id },
      include: {
        challenger: { select: { username: true } },
        opponent: { select: { username: true } }
      }
    });

    if (!duel) {
      return res.status(404).json({ success: false, error: 'Duel non trouvé' });
    }
    if (duel.challengerId !== userId && duel.opponentId !== userId) {
      return res.status(403).json({ success: false, error: 'Vous ne participez pas à ce duel' });
    }

    // Mettre en IN_PROGRESS si c'est le premier à démarrer
    if (duel.status === 'ACCEPTED') {
      await prisma.duel.update({
        where: { id: req.params.id },
        data: { status: 'IN_PROGRESS' }
      });
    }

    const questionsArray = Array.isArray(duel.questions) ? duel.questions : [];
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
        id: duel.id,
        subject: duel.subject,
        difficulty: duel.difficulty,
        timeLimit: duel.timeLimit,
        xpReward: duel.xpReward,
        challenger: duel.challenger,
        opponent: duel.opponent,
        questions: questionsWithoutAnswers
      }
    });
  } catch (error) {
    console.error('Erreur POST /duels/:id/start:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /:id/submit — Soumettre les réponses d'un duel
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { answers, timeSpent } = req.body;

    const duel = await prisma.duel.findUnique({ where: { id: req.params.id } });

    if (!duel) {
      return res.status(404).json({ success: false, error: 'Duel non trouvé' });
    }

    const isChallenger = duel.challengerId === userId;
    const isOpponent = duel.opponentId === userId;
    if (!isChallenger && !isOpponent) {
      return res.status(403).json({ success: false, error: 'Vous ne participez pas à ce duel' });
    }

    // Vérifier si déjà soumis
    if (isChallenger && duel.challengerAnswers) {
      return res.status(400).json({ success: false, error: 'Vous avez déjà soumis vos réponses' });
    }
    if (isOpponent && duel.opponentAnswers) {
      return res.status(400).json({ success: false, error: 'Vous avez déjà soumis vos réponses' });
    }

    // Calculer le score
    const questionsArray = Array.isArray(duel.questions) ? duel.questions : [];
    let score = 0;
    const results = [];

    if (answers && typeof answers === 'object') {
      for (const q of questionsArray) {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer !== undefined && userAnswer === q.correct_answer;
        if (isCorrect) score += (q.points || 10);
        results.push({ questionId: q.id, userAnswer, isCorrect, points: isCorrect ? (q.points || 10) : 0 });
      }
    }

    // Mettre à jour le duel
    const updateData = isChallenger
      ? { challengerScore: score, challengerAnswers: results, challengerTime: timeSpent || null }
      : { opponentScore: score, opponentAnswers: results, opponentTime: timeSpent || null };

    // Vérifier si les deux ont soumis
    const otherSubmitted = isChallenger ? duel.opponentAnswers : duel.challengerAnswers;
    if (otherSubmitted) {
      const cScore = isChallenger ? score : duel.challengerScore;
      const oScore = isChallenger ? duel.opponentScore : score;
      updateData.status = 'COMPLETED';
      updateData.completedAt = new Date();
      if (cScore > oScore) updateData.winnerId = duel.challengerId;
      else if (oScore > cScore) updateData.winnerId = duel.opponentId;
      // Égalité: winnerId reste null

      // Attribuer XP au gagnant
      if (updateData.winnerId) {
        await prisma.user.update({
          where: { id: updateData.winnerId },
          data: { xp: { increment: duel.xpReward } }
        });
      }
    }

    const updated = await prisma.duel.update({
      where: { id: req.params.id },
      data: updateData
    });

    const maxScore = questionsArray.reduce((sum, q) => sum + (q.points || 10), 0);

    res.json({
      success: true,
      data: {
        score,
        maxScore,
        percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
        results,
        duelStatus: updated.status,
        winnerId: updated.winnerId
      }
    });
  } catch (error) {
    console.error('Erreur POST /duels/:id/submit:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
