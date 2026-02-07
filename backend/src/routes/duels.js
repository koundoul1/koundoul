const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all duels
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { public: isPublic } = req.query;
    const userId = req.user.userId;

    const where = {};
    if (isPublic === 'true') {
      where.isPublic = true;
      where.status = { in: ['pending', 'accepted'] };
    } else {
      // Duels de l'utilisateur
      where.OR = [
        { challengerId: userId },
        { opponentId: userId }
      ];
    }

    const duels = await prisma.duel.findMany({
      where,
      include: {
        participations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const formatted = duels.map(duel => ({
      id: duel.id,
      challengerId: duel.challengerId,
      opponentId: duel.opponentId,
      isPublic: duel.isPublic,
      status: duel.status,
      winnerId: duel.winnerId,
      participations: duel.participations,
      startedAt: duel.startedAt,
      completedAt: duel.completedAt
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// Get duel history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const duels = await prisma.duel.findMany({
      where: {
        OR: [
          { challengerId: userId },
          { opponentId: userId }
        ],
        status: 'completed'
      },
      include: {
        participations: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 20
    });

    res.json({ success: true, data: duels });
  } catch (error) {
    next(error);
  }
});

// Create duel
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { opponentId, isPublic = false } = req.body;
    const userId = req.user.userId;

    if (opponentId && opponentId === userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous défier vous-même' });
    }

    const duel = await prisma.duel.create({
      data: {
        challengerId: userId,
        opponentId: opponentId || null,
        isPublic,
        status: 'pending',
        questions: []
      }
    });

    // Créer la participation du challenger
    await prisma.duelParticipation.create({
      data: {
        duelId: duel.id,
        userId
      }
    });

    res.status(201).json({ success: true, data: duel });
  } catch (error) {
    next(error);
  }
});

// Accept duel
router.post('/:id/accept', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const duel = await prisma.duel.findUnique({
      where: { id }
    });

    if (!duel) {
      return res.status(404).json({ error: 'Duel non trouvé' });
    }

    if (duel.opponentId !== userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas l\'opposant de ce duel' });
    }

    if (duel.status !== 'pending') {
      return res.status(400).json({ error: 'Ce duel ne peut plus être accepté' });
    }

    // Mettre à jour le statut
    await prisma.duel.update({
      where: { id },
      data: { status: 'accepted' }
    });

    // Créer la participation de l'opposant
    await prisma.duelParticipation.create({
      data: {
        duelId: id,
        userId
      }
    });

    res.json({ success: true, message: 'Duel accepté' });
  } catch (error) {
    next(error);
  }
});

// Start duel
router.post('/:id/start', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const duel = await prisma.duel.findUnique({
      where: { id },
      include: {
        participations: true
      }
    });

    if (!duel) {
      return res.status(404).json({ error: 'Duel non trouvé' });
    }

    // Vérifier que l'utilisateur participe
    const participation = duel.participations.find(p => p.userId === userId);
    if (!participation) {
      return res.status(403).json({ error: 'Vous ne participez pas à ce duel' });
    }

    if (duel.status === 'completed') {
      return res.status(400).json({ error: 'Ce duel est déjà terminé' });
    }

    // Mettre à jour le statut si nécessaire
    if (duel.status === 'accepted') {
      await prisma.duel.update({
        where: { id },
        data: {
          status: 'started',
          startedAt: new Date()
        }
      });
    }

    res.json({ success: true, data: { duelId: id, participation } });
  } catch (error) {
    next(error);
  }
});

// Submit duel
router.post('/:id/submit', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.userId;

    const duel = await prisma.duel.findUnique({
      where: { id },
      include: {
        participations: true
      }
    });

    if (!duel) {
      return res.status(404).json({ error: 'Duel non trouvé' });
    }

    const participation = duel.participations.find(p => p.userId === userId);
    if (!participation) {
      return res.status(403).json({ error: 'Vous ne participez pas à ce duel' });
    }

    // Calculer le score (placeholder)
    const score = Object.keys(answers || {}).length * 10;

    // Mettre à jour la participation
    await prisma.duelParticipation.update({
      where: { id: participation.id },
      data: {
        score,
        answers,
        completed: true
      }
    });

    // Vérifier si tous les participants ont terminé
    const allCompleted = duel.participations.every(p => p.completed || p.userId === userId);
    
    if (allCompleted) {
      // Déterminer le gagnant
      const scores = duel.participations.map(p => ({ userId: p.userId, score: p.score }));
      const winner = scores.reduce((max, p) => p.score > max.score ? p : max, scores[0]);

      await prisma.duel.update({
        where: { id },
        data: {
          status: 'completed',
          winnerId: winner.userId,
          completedAt: new Date()
        }
      });

      // Ajouter XP au gagnant
      await prisma.user.update({
        where: { id: winner.userId },
        data: { xp: { increment: 100 } }
      });
    }

    res.json({
      success: true,
      data: {
        score,
        completed: allCompleted,
        winnerId: allCompleted ? winner.userId : null
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


