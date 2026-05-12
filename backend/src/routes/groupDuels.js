var express = require('express');
var router = express.Router();
var { authenticateToken } = require('../middlewares/auth');
var prisma = require('../config/database');
var crypto = require('crypto');
var { getUserPlanInfo } = require('../middlewares/premiumCheck');

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// ── POST / — create group duel (3 or 4 players) ─────────────────────

router.post('/', authenticateToken, async function(req, res, next) {
  try {
    var userId = req.user.userId;
    var subject = req.body.subject || 'Mathematiques';
    var maxPlayers = req.body.maxPlayers || 3;
    var difficulty = req.body.difficulty || 2;

    if (maxPlayers < 3 || maxPlayers > 4) {
      return res.status(400).json({ error: 'maxPlayers doit etre 3 ou 4' });
    }

    // Premium only
    var planInfo = await getUserPlanInfo(userId);
    if (!planInfo.isPremium) {
      return res.status(403).json({ error: 'Les duels de groupe sont reserves aux abonnes Premium', premiumRequired: true });
    }

    // Get questions from qcm_questions
    var questions = [];
    try {
      var banks = await prisma.questionBank.findMany({
        where: { subject: { contains: subject, mode: 'insensitive' } },
        select: { id: true }
      });
      if (banks.length > 0) {
        var bankIds = banks.map(function(b) { return b.id; });
        var allQcm = await prisma.qcm_questions.findMany({
          where: { questionBankId: { in: bankIds }, difficulty: difficulty },
          take: 50
        });
        // Shuffle and take 10
        for (var i = allQcm.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = allQcm[i]; allQcm[i] = allQcm[j]; allQcm[j] = tmp;
        }
        questions = allQcm.slice(0, 10).map(function(q) {
          return {
            id: q.id,
            question: q.question,
            options: q.options,
            points: q.points || 10
          };
        });
      }
    } catch (e) {
      console.error('[GroupDuel] Error fetching questions:', e.message);
    }

    if (questions.length === 0) {
      return res.status(400).json({ error: 'Pas assez de questions pour cette matiere' });
    }

    var inviteCode = generateInviteCode();
    var expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    var duel = await prisma.groupDuel.create({
      data: {
        creatorId: userId,
        subject: subject,
        difficulty: difficulty,
        maxPlayers: maxPlayers,
        questions: questions,
        inviteCode: inviteCode,
        expiresAt: expiresAt,
        status: 'waiting'
      }
    });

    // Auto-join creator
    await prisma.groupDuelParticipant.create({
      data: { groupDuelId: duel.id, userId: userId }
    });

    res.status(201).json({
      success: true,
      data: {
        id: duel.id,
        inviteCode: inviteCode,
        maxPlayers: maxPlayers,
        subject: subject,
        questionsCount: questions.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /join/:code — join group duel ───────────────────────────────

router.post('/join/:code', authenticateToken, async function(req, res, next) {
  try {
    var userId = req.user.userId;
    var code = req.params.code.toUpperCase();

    var duel = await prisma.groupDuel.findUnique({ where: { inviteCode: code } });
    if (!duel) return res.status(404).json({ error: 'Duel non trouve' });
    if (duel.status !== 'waiting') return res.status(400).json({ error: 'Ce duel a deja commence ou est termine' });
    if (new Date() > new Date(duel.expiresAt)) return res.status(400).json({ error: 'Ce duel a expire' });

    var participants = await prisma.groupDuelParticipant.count({ where: { groupDuelId: duel.id } });
    if (participants >= duel.maxPlayers) return res.status(400).json({ error: 'Duel complet' });

    // Check not already joined
    var existing = await prisma.groupDuelParticipant.findFirst({
      where: { groupDuelId: duel.id, userId: userId }
    });
    if (existing) return res.status(400).json({ error: 'Deja inscrit' });

    await prisma.groupDuelParticipant.create({
      data: { groupDuelId: duel.id, userId: userId }
    });

    var newCount = participants + 1;

    // Auto-start when all players joined
    if (newCount >= duel.maxPlayers) {
      await prisma.groupDuel.update({
        where: { id: duel.id },
        data: { status: 'active' }
      });
    }

    res.json({
      success: true,
      data: {
        duelId: duel.id,
        players: newCount + '/' + duel.maxPlayers,
        status: newCount >= duel.maxPlayers ? 'active' : 'waiting'
      }
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /:id — get group duel details ────────────────────────────────

router.get('/:id', authenticateToken, async function(req, res, next) {
  try {
    var duel = await prisma.groupDuel.findUnique({
      where: { id: req.params.id },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } },
          orderBy: { rank: 'asc' }
        }
      }
    });
    if (!duel) return res.status(404).json({ error: 'Duel non trouve' });

    // Hide correct answers if user hasn't completed
    var myParticipation = duel.participants.find(function(p) { return p.userId === req.user.userId; });
    var questions = duel.questions || [];
    if (!myParticipation || !myParticipation.completedAt) {
      questions = questions.map(function(q) {
        return { id: q.id, question: q.question, options: q.options, points: q.points };
      });
    }

    res.json({
      success: true,
      data: {
        id: duel.id,
        subject: duel.subject,
        maxPlayers: duel.maxPlayers,
        status: duel.status,
        inviteCode: duel.inviteCode,
        timeLimit: duel.timeLimit,
        questions: questions,
        participants: duel.participants.map(function(p) {
          return {
            userId: p.userId,
            name: p.user.firstName || p.user.username || '?',
            score: p.score,
            rank: p.rank,
            completed: !!p.completedAt
          };
        }),
        expiresAt: duel.expiresAt,
        myCompleted: !!(myParticipation && myParticipation.completedAt)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /:id/submit — submit answers ────────────────────────────────

router.post('/:id/submit', authenticateToken, async function(req, res, next) {
  try {
    var userId = req.user.userId;
    var duelId = req.params.id;
    var answers = req.body.answers || [];
    var timeSpent = req.body.timeSpent || 0;

    var duel = await prisma.groupDuel.findUnique({ where: { id: duelId } });
    if (!duel) return res.status(404).json({ error: 'Duel non trouve' });

    var participant = await prisma.groupDuelParticipant.findFirst({
      where: { groupDuelId: duelId, userId: userId }
    });
    if (!participant) return res.status(403).json({ error: 'Non inscrit a ce duel' });
    if (participant.completedAt) return res.status(400).json({ error: 'Deja soumis' });

    // Calculate score
    var questions = duel.questions || [];
    var score = 0;
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var userAnswer = answers[i];
      if (userAnswer !== undefined && q.correct_answer !== undefined && String(userAnswer) === String(q.correct_answer)) {
        score += (q.points || 10);
      }
    }

    // Update participant
    await prisma.groupDuelParticipant.update({
      where: { id: participant.id },
      data: { score: score, answers: answers, timeSpent: timeSpent, completedAt: new Date() }
    });

    // Check if all participants completed
    var allParticipants = await prisma.groupDuelParticipant.findMany({
      where: { groupDuelId: duelId },
      orderBy: { score: 'desc' }
    });

    var allCompleted = allParticipants.every(function(p) { return p.completedAt !== null; });

    if (allCompleted) {
      // Assign ranks and XP
      var sorted = allParticipants.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });
      for (var r = 0; r < sorted.length; r++) {
        var xp = r === 0 ? 200 : r === 1 ? 100 : 50;
        await prisma.groupDuelParticipant.update({
          where: { id: sorted[r].id },
          data: { rank: r + 1 }
        });
        try {
          var gamification = require('../services/gamification');
          await gamification.processAction(sorted[r].userId, { type: 'group_duel', xp: xp });
        } catch (e) {
          await prisma.user.update({ where: { id: sorted[r].userId }, data: { xp: { increment: xp } } });
        }
      }

      await prisma.groupDuel.update({
        where: { id: duelId },
        data: { status: 'completed', completedAt: new Date() }
      });
    }

    res.json({
      success: true,
      data: {
        score: score,
        totalPoints: questions.reduce(function(s, q) { return s + (q.points || 10); }, 0),
        allCompleted: allCompleted,
        rank: allCompleted ? sorted.findIndex(function(p) { return p.userId === userId; }) + 1 : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /my/list — my group duels ────────────────────────────────────

router.get('/my/list', authenticateToken, async function(req, res, next) {
  try {
    var userId = req.user.userId;

    var participations = await prisma.groupDuelParticipant.findMany({
      where: { userId: userId },
      include: {
        groupDuel: {
          include: {
            _count: { select: { participants: true } },
            creator: { select: { firstName: true, username: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    var duels = participations.map(function(p) {
      var d = p.groupDuel;
      return {
        id: d.id,
        subject: d.subject,
        maxPlayers: d.maxPlayers,
        currentPlayers: d._count.participants,
        status: d.status,
        inviteCode: d.inviteCode,
        myScore: p.score,
        myRank: p.rank,
        creator: d.creator.firstName || d.creator.username,
        createdAt: d.createdAt
      };
    });

    res.json({ success: true, data: duels });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
