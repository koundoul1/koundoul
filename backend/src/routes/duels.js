const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');
const { sendNotification } = require('../utils/notificationService');
const { processAction } = require('../services/gamification');
const { getUserPlanInfo, countTodayUsage } = require('../middlewares/premiumCheck');

// GET / — Liste des duels publics disponibles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const isPublic = req.query.public === 'true';

    const now = new Date();
    const where = isPublic
      ? { isPublic: true, status: 'pending', opponentId: null, challengerId: { not: userId }, expiresAt: { gte: now } }
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

// GET /my — Mes duels (pending + active + completed)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const duels = await prisma.duel.findMany({
      where: { OR: [{ challengerId: userId }, { opponentId: userId }] },
      include: {
        challenger: { select: { id: true, username: true, level: true, country: true } },
        opponent: { select: { id: true, username: true, level: true, country: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Séparer par statut
    const pending = duels.filter(d => d.status === 'pending');
    const active = duels.filter(d => d.status === 'active' || d.status === 'in_progress');
    const completed = duels.filter(d => d.status === 'completed');

    // Stats
    const wins = completed.filter(d => d.winnerId === userId).length;
    const losses = completed.filter(d => d.winnerId && d.winnerId !== userId).length;
    const draws = completed.filter(d => !d.winnerId).length;

    res.json({
      success: true,
      data: { pending, active, completed, stats: { wins, losses, draws, total: completed.length } }
    });
  } catch (error) {
    console.error('Erreur GET /duels/my:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /history — Historique des duels terminés
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const duels = await prisma.duel.findMany({
      where: {
        OR: [{ challengerId: userId }, { opponentId: userId }],
        status: 'completed'
      },
      include: {
        challenger: { select: { id: true, username: true, level: true } },
        opponent: { select: { id: true, username: true, level: true } }
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
    const { subject, level, difficulty } = req.body;

    // Free users: max 3 duels/day
    var planInfo = await getUserPlanInfo(userId);
    if (!planInfo.isPremium) {
      var todayDuels = await countTodayUsage(userId, 'duel');
      if (todayDuels >= 3) {
        return res.status(403).json({ error: 'Maximum 3 duels par jour en plan gratuit. Passe Premium pour des duels illimites !', premiumRequired: true });
      }
    }

    // Piocher 10 questions QCM filtrees par matiere + difficulte
    const difficultyMap = { 'Facile': 1, 'Moyen': 2, 'Difficile': 3 };
    const diffLevel = difficultyMap[difficulty] || 2;
    const subjectName = subject || 'Mathematiques';

    // Find banks matching the requested subject
    const banks = await prisma.questionBank.findMany({
      where: { subject: { contains: subjectName, mode: 'insensitive' }, is_active: true },
      select: { id: true }
    });
    const bankIds = banks.map(b => b.id);

    // Query with subject filter if banks found, fallback to any subject
    const whereClause = { difficulty: { in: [diffLevel, diffLevel + 1] } };
    if (bankIds.length > 0) {
      whereClause.bank_id = { in: bankIds };
    }

    const allQuestions = await prisma.qcm_questions.findMany({
      where: whereClause,
      take: 30
    });

    // Shuffle and take 10
    const questions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 10);

    if (questions.length < 5) {
      return res.status(400).json({ success: false, error: 'Pas assez de questions en ' + subjectName + ' a cette difficulte' });
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

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const duel = await prisma.duel.create({
      data: {
        challengerId: userId,
        subject: subject || 'Mathématiques',
        level: level || 'Terminale',
        difficulty: difficulty || 'Moyen',
        timeLimit: 10,
        questions: formattedQuestions,
        xpReward: 200,
        isPublic: true,
        status: 'pending',
        expiresAt
      },
      include: {
        challenger: { select: { username: true, level: true } }
      }
    });

    const shareLink = `${process.env.FRONTEND_URL || 'https://koundoul.onrender.com'}/challenge?duel=${duel.inviteCode}`;

    res.json({
      success: true,
      data: {
        duelId: duel.id,
        inviteCode: duel.inviteCode,
        shareLink,
        subject: duel.subject,
        level: duel.level,
        difficulty: duel.difficulty,
        questions: formattedQuestions.length,
        expiresAt: duel.expiresAt
      }
    });
  } catch (error) {
    console.error('Erreur POST /duels:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /join/:inviteCode — Rejoindre un duel par code
router.post('/join/:inviteCode', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const duel = await prisma.duel.findUnique({
      where: { inviteCode: req.params.inviteCode },
      include: {
        challenger: { select: { username: true, level: true } }
      }
    });

    if (!duel) {
      return res.status(404).json({ success: false, error: 'Code de duel invalide' });
    }
    if (duel.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Ce duel n\'est plus disponible' });
    }
    if (new Date() > new Date(duel.expiresAt)) {
      return res.status(400).json({ success: false, error: 'Ce duel a expiré' });
    }
    if (duel.challengerId === userId) {
      return res.status(400).json({ success: false, error: 'Vous ne pouvez pas rejoindre votre propre duel' });
    }

    const updated = await prisma.duel.update({
      where: { id: duel.id },
      data: { opponentId: userId, status: 'active', startedAt: new Date() }
    });

    // Retourner les questions sans réponses
    const questionsArray = Array.isArray(duel.questions) ? duel.questions : [];
    const questionsWithoutAnswers = questionsArray.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      points: q.points || 10,
      time_limit_seconds: q.time_limit_seconds || 60
    }));

    // Notify the challenger that someone joined
    const joiner = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
    sendNotification(
      duel.challengerId,
      'duel_invite',
      'Duel accepté !',
      `${joiner?.username || 'Un joueur'} a rejoint ton duel en ${duel.subject}`,
      { duelId: duel.id }
    );

    res.json({
      success: true,
      data: {
        id: updated.id,
        subject: duel.subject,
        level: duel.level,
        difficulty: duel.difficulty,
        timeLimit: duel.timeLimit,
        xpReward: duel.xpReward,
        challenger: duel.challenger,
        questions: questionsWithoutAnswers
      }
    });
  } catch (error) {
    console.error('Erreur POST /duels/join:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /:id — Détails d'un duel
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const duel = await prisma.duel.findUnique({
      where: { id: req.params.id },
      include: {
        challenger: { select: { id: true, username: true, level: true, country: true } },
        opponent: { select: { id: true, username: true, level: true, country: true } }
      }
    });

    if (!duel) {
      return res.status(404).json({ success: false, error: 'Duel non trouvé' });
    }

    const isParticipant = duel.challengerId === userId || duel.opponentId === userId;

    // Ne pas envoyer les réponses correctes si le duel est en cours
    const data = { ...duel };
    if (duel.status !== 'completed') {
      data.questions = Array.isArray(duel.questions) ? duel.questions.length : 0;
      if (!isParticipant) {
        delete data.challengerAnswers;
        delete data.opponentAnswers;
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erreur GET /duels/:id:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /:id/accept — Accepter un duel public
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const duel = await prisma.duel.findUnique({ where: { id: req.params.id } });

    if (!duel) {
      return res.status(404).json({ success: false, error: 'Duel non trouvé' });
    }
    if (duel.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Ce duel n\'est plus disponible' });
    }
    if (new Date() > new Date(duel.expiresAt)) {
      return res.status(400).json({ success: false, error: 'Ce duel a expiré' });
    }
    if (duel.challengerId === userId) {
      return res.status(400).json({ success: false, error: 'Vous ne pouvez pas accepter votre propre duel' });
    }

    const updated = await prisma.duel.update({
      where: { id: req.params.id },
      data: { opponentId: userId, status: 'active', startedAt: new Date() }
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
        challenger: { select: { username: true, level: true } },
        opponent: { select: { username: true, level: true } }
      }
    });

    if (!duel) {
      return res.status(404).json({ success: false, error: 'Duel non trouvé' });
    }
    if (duel.challengerId !== userId && duel.opponentId !== userId) {
      return res.status(403).json({ success: false, error: 'Vous ne participez pas à ce duel' });
    }

    // Mettre en active/in_progress si nécessaire
    if (duel.status === 'pending' || duel.status === 'active') {
      await prisma.duel.update({
        where: { id: req.params.id },
        data: { status: 'active', startedAt: duel.startedAt || new Date() }
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
        level: duel.level,
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

    const duel = await prisma.duel.findUnique({
      where: { id: req.params.id },
      include: {
        challenger: { select: { id: true, username: true } },
        opponent: { select: { id: true, username: true } }
      }
    });

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

    // Calculer le score : 1 point par bonne réponse
    const questionsArray = Array.isArray(duel.questions) ? duel.questions : [];
    let score = 0;
    const results = [];

    if (answers && Array.isArray(answers)) {
      for (const q of questionsArray) {
        const userAnswerObj = answers.find(a => a.questionId === q.id);
        const userAnswer = userAnswerObj?.answer;
        const isCorrect = userAnswer !== undefined && userAnswer === q.correct_answer;
        if (isCorrect) score += 1;
        results.push({
          questionId: q.id,
          userAnswer,
          isCorrect,
          points: isCorrect ? 1 : 0,
          timeSpent: userAnswerObj?.timeSpent || 0
        });
      }
    }

    const totalTime = timeSpent || results.reduce((sum, r) => sum + (r.timeSpent || 0), 0);

    // Mettre à jour le duel
    const updateData = isChallenger
      ? { challengerScore: score, challengerAnswers: results, challengerTime: totalTime }
      : { opponentScore: score, opponentAnswers: results, opponentTime: totalTime };

    // Vérifier si les deux ont soumis → déterminer le gagnant
    const otherSubmitted = isChallenger ? duel.opponentAnswers : duel.challengerAnswers;
    let duelResult = null;

    if (otherSubmitted) {
      const cScore = isChallenger ? score : duel.challengerScore;
      const oScore = isChallenger ? duel.opponentScore : score;
      const cTime = isChallenger ? totalTime : duel.challengerTime;
      const oTime = isChallenger ? duel.opponentTime : totalTime;

      updateData.status = 'completed';
      updateData.completedAt = new Date();

      // Gagnant = meilleur score, à égalité = plus rapide
      if (cScore > oScore) {
        updateData.winnerId = duel.challengerId;
      } else if (oScore > cScore) {
        updateData.winnerId = duel.opponentId;
      } else if (cTime < oTime) {
        updateData.winnerId = duel.challengerId;
      } else if (oTime < cTime) {
        updateData.winnerId = duel.opponentId;
      }
      // Parfaite égalité : winnerId reste null

      // Award XP via gamification service: winner +200, loser +50, draw +100
      if (updateData.winnerId) {
        const loserId = updateData.winnerId === duel.challengerId ? duel.opponentId : duel.challengerId;
        await processAction(updateData.winnerId, { type: 'win_duel', xp: duel.xpReward });
        if (loserId) await processAction(loserId, { type: 'lose_duel', xp: 50 });
      } else if (duel.opponentId) {
        await processAction(duel.challengerId, { type: 'draw_duel', xp: 100 });
        await processAction(duel.opponentId, { type: 'draw_duel', xp: 100 });
      }

      duelResult = {
        winnerId: updateData.winnerId,
        challengerScore: cScore,
        opponentScore: oScore,
        challengerTime: cTime,
        opponentTime: oTime
      };
    }

    const updated = await prisma.duel.update({
      where: { id: req.params.id },
      data: updateData
    });

    // Send notifications when duel is completed
    if (updated.status === 'completed' && duelResult) {
      const [challenger, opponent] = await Promise.all([
        prisma.user.findUnique({ where: { id: duel.challengerId }, select: { username: true } }),
        duel.opponentId ? prisma.user.findUnique({ where: { id: duel.opponentId }, select: { username: true } }) : null
      ]);
      if (duelResult.winnerId) {
        const winnerName = duelResult.winnerId === duel.challengerId ? challenger?.username : opponent?.username;
        const loserId = duelResult.winnerId === duel.challengerId ? duel.opponentId : duel.challengerId;
        sendNotification(duelResult.winnerId, 'duel_invite', 'Duel gagné !', `Tu as remporté le duel ! +${duel.xpReward} XP`, { duelId: duel.id });
        if (loserId) sendNotification(loserId, 'duel_invite', 'Duel terminé', `${winnerName} a gagné le duel. +50 XP`, { duelId: duel.id });
      } else {
        sendNotification(duel.challengerId, 'duel_invite', 'Duel terminé', 'Match nul ! +100 XP', { duelId: duel.id });
        if (duel.opponentId) sendNotification(duel.opponentId, 'duel_invite', 'Duel terminé', 'Match nul ! +100 XP', { duelId: duel.id });
      }
    }

    res.json({
      success: true,
      data: {
        score,
        totalQuestions: questionsArray.length,
        totalTime,
        results,
        duelStatus: updated.status,
        duelResult
      }
    });
  } catch (error) {
    console.error('Erreur POST /duels/:id/submit:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
