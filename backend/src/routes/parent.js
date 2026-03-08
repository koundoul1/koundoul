const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');

// Obtenir la liste des enfants liés à un parent (via invitationCode)
router.get('/children', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { invitationCode: true }
    });

    if (!user || !user.invitationCode) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Trouver les utilisateurs qui ont utilisé ce code d'invitation
    const children = await prisma.user.findMany({
      where: {
        parentInvitationCode: user.invitationCode
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: children
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des enfants:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des enfants'
    });
  }
});

// Obtenir le dashboard d'un enfant
router.get('/dashboard/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    const timeRange = req.query.timeRange || 'week';

    // Vérifier que l'enfant appartient au parent
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { invitationCode: true }
    });

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentInvitationCode: true }
    });

    if (!child || child.parentInvitationCode !== user.invitationCode) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    // Calculer les dates selon timeRange
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    // Récupérer les statistiques
    const [stats, userBadges, quizAttempts, challenges, flashcards] = await Promise.all([
      // Stats générales
      prisma.user.findUnique({
        where: { id: childId },
        select: {
          xp: true,
          level: true,
          streak: true,
          createdAt: true
        }
      }),

      // Badges obtenus (via UserBadge)
      prisma.userBadge.findMany({
        where: {
          userId: childId,
          unlockedAt: { gte: startDate }
        },
        include: {
          badge: true
        },
        orderBy: { unlockedAt: 'desc' },
        take: 10
      }),

      // Tentatives de quiz
      prisma.quizAttempt.findMany({
        where: {
          userId: childId,
          completedAt: { gte: startDate }
        },
        orderBy: { completedAt: 'desc' },
        take: 10
      }),

      // Challenges (tentatives de challenge de l'enfant)
      prisma.challengeAttempt.findMany({
        where: {
          userId: childId,
          completedAt: { gte: startDate }
        },
        orderBy: { completedAt: 'desc' },
        take: 10
      }),

      // Flashcards (révisions de l'enfant)
      prisma.flashcardReview.findMany({
        where: {
          userId: childId,
          reviewedAt: { gte: startDate }
        },
        include: {
          flashcard: true
        },
        orderBy: { reviewedAt: 'desc' },
        take: 10
      })
    ]);

    // Calculer le temps d'étude estimé
    const estimatedStudyTime = (
      (quizAttempts.length * 15) + // 15 min par quiz
      (challenges.length * 20) + // 20 min par challenge
      (flashcards.length * 2) // 2 min par flashcard
    );

    res.json({
      success: true,
      data: {
        stats: {
          xp: stats?.xp || 0,
          level: stats?.level || 1,
          streak: stats?.streak || 0,
          daysSinceJoined: Math.floor(
            (now - new Date(stats?.createdAt || now)) / (1000 * 60 * 60 * 24)
          )
        },
        badges: userBadges.length,
        recentBadges: userBadges.slice(0, 5),
        quizAttempts: quizAttempts.length,
        recentQuizAttempts: quizAttempts.slice(0, 5),
        challenges: challenges.length,
        recentChallenges: challenges.slice(0, 5),
        flashcardsReviewed: flashcards.length,
        estimatedStudyTimeHours: Math.round(estimatedStudyTime / 60 * 10) / 10,
        timeRange
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du dashboard'
    });
  }
});

// Obtenir les notifications pour un enfant
router.get('/notifications/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;

    // Vérifier que l'enfant appartient au parent
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { invitationCode: true }
    });

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentInvitationCode: true }
    });

    if (!child || child.parentInvitationCode !== user.invitationCode) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    // Pour l'instant, retourner des notifications basiques
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des notifications'
    });
  }
});

// Mettre à jour le niveau de notification
router.put('/notifications/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    const { level } = req.body;

    // Vérifier que l'enfant appartient au parent
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { invitationCode: true }
    });

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentInvitationCode: true }
    });

    if (!child || child.parentInvitationCode !== user.invitationCode) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    // Pour l'instant, juste retourner un succès
    res.json({
      success: true,
      data: { level }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour des notifications'
    });
  }
});

module.exports = router;


