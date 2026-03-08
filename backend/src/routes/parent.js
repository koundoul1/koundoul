const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');

const MAX_CHILDREN = 5;
const INVITE_CODE_EXPIRY_DAYS = 7;

// Générer un code invitation unique pour le parent
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /invite — le parent génère son code d'invitation
router.post('/invite', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Vérifier si le parent a déjà un code non expiré
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { invitationCode: true, updatedAt: true }
    });

    // Si un code existe et n'est pas expiré, le retourner
    if (user?.invitationCode) {
      const codeAge = (Date.now() - new Date(user.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (codeAge < INVITE_CODE_EXPIRY_DAYS) {
        return res.json({
          success: true,
          data: {
            invitationCode: user.invitationCode,
            expiresAt: new Date(new Date(user.updatedAt).getTime() + INVITE_CODE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
          }
        });
      }
    }

    // Générer un nouveau code unique
    let invitationCode;
    let isUnique = false;
    while (!isUnique) {
      invitationCode = generateCode();
      const existing = await prisma.user.findFirst({
        where: { invitationCode }
      });
      if (!existing) isUnique = true;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        invitationCode,
        isParent: true,
        updatedAt: new Date()
      }
    });

    const expiresAt = new Date(Date.now() + INVITE_CODE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      data: { invitationCode, expiresAt }
    });
  } catch (error) {
    next(error);
  }
});

// POST /link — l'enfant entre le code du parent pour se lier
router.post('/link', authenticateToken, async (req, res, next) => {
  try {
    const childId = req.user.userId;
    const { code } = req.body;

    if (!code || code.length !== 8) {
      return res.status(400).json({
        success: false,
        error: 'Code d\'invitation invalide (8 caractères requis)'
      });
    }

    // Trouver le parent par son code
    const parent = await prisma.user.findFirst({
      where: { invitationCode: code.toUpperCase() }
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        error: 'Code d\'invitation introuvable ou expiré'
      });
    }

    // Vérifier expiration (7 jours)
    const codeAge = (Date.now() - new Date(parent.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (codeAge > INVITE_CODE_EXPIRY_DAYS) {
      return res.status(410).json({
        success: false,
        error: 'Ce code d\'invitation a expiré. Demandez un nouveau code au parent.'
      });
    }

    // Vérifier que l'enfant n'est pas déjà lié à un parent
    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentInvitationCode: true, parentId: true }
    });

    if (child?.parentId || child?.parentInvitationCode) {
      return res.status(409).json({
        success: false,
        error: 'Vous êtes déjà lié à un parent. Déliez-vous d\'abord.'
      });
    }

    // Empêcher de se lier à soi-même
    if (parent.id === childId) {
      return res.status(400).json({
        success: false,
        error: 'Vous ne pouvez pas utiliser votre propre code'
      });
    }

    // Vérifier max 5 enfants
    const childrenCount = await prisma.user.count({
      where: { parentInvitationCode: code.toUpperCase() }
    });

    if (childrenCount >= MAX_CHILDREN) {
      return res.status(409).json({
        success: false,
        error: `Ce parent a déjà atteint la limite de ${MAX_CHILDREN} enfants`
      });
    }

    // Créer le lien : mise à jour User + insert parent_child_links
    await prisma.$transaction([
      prisma.user.update({
        where: { id: childId },
        data: {
          parentInvitationCode: code.toUpperCase(),
          parentId: parent.id
        }
      }),
      prisma.parent_child_links.upsert({
        where: {
          parent_id_child_id: {
            parent_id: parent.id,
            child_id: childId
          }
        },
        update: { approved: true, updated_at: new Date() },
        create: {
          parent_id: parent.id,
          child_id: childId,
          approved: true
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Lien parent-enfant établi avec succès',
      data: {
        parentName: `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || parent.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /unlink/:childId — le parent délie un enfant
router.delete('/unlink/:childId', authenticateToken, async (req, res, next) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;

    // Vérifier que l'enfant est bien lié à ce parent
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      select: { invitationCode: true }
    });

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentInvitationCode: true, parentId: true }
    });

    if (!child || child.parentId !== parentId) {
      return res.status(403).json({
        success: false,
        error: 'Cet enfant n\'est pas lié à votre compte'
      });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: childId },
        data: {
          parentInvitationCode: null,
          parentId: null
        }
      }),
      prisma.parent_child_links.deleteMany({
        where: {
          parent_id: parentId,
          child_id: childId
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Enfant délié avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /unlink-self — l'enfant se délie de son parent
router.delete('/unlink-self', authenticateToken, async (req, res, next) => {
  try {
    const childId = req.user.userId;

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentId: true, parentInvitationCode: true }
    });

    if (!child?.parentId) {
      return res.status(404).json({
        success: false,
        error: 'Vous n\'êtes lié à aucun parent'
      });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: childId },
        data: {
          parentInvitationCode: null,
          parentId: null
        }
      }),
      prisma.parent_child_links.deleteMany({
        where: {
          parent_id: child.parentId,
          child_id: childId
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Vous avez été délié de votre parent'
    });
  } catch (error) {
    next(error);
  }
});

// GET /children — le parent voit ses enfants avec progression
router.get('/children', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { invitationCode: true }
    });

    if (!user?.invitationCode) {
      return res.json({ success: true, data: [] });
    }

    const children = await prisma.user.findMany({
      where: { parentInvitationCode: user.invitationCode },
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

    // Enrichir avec les stats de chaque enfant
    const enriched = await Promise.all(children.map(async (child) => {
      const [lessonsCompleted, badgeCount] = await Promise.all([
        prisma.microLessonCompletion.count({
          where: { userId: child.id, completed: true }
        }),
        prisma.userBadge.count({
          where: { userId: child.id }
        })
      ]);

      return {
        ...child,
        lessonsCompleted,
        badgeCount
      };
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
});

// GET /child/:id/stats — stats détaillées d'un enfant
router.get('/child/:id/stats', authenticateToken, async (req, res, next) => {
  try {
    const parentId = req.user.userId;
    const childId = req.params.id;
    const timeRange = req.query.timeRange || 'week';

    // Vérifier le lien parent-enfant
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      select: { invitationCode: true }
    });

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: {
        parentInvitationCode: true,
        xp: true,
        level: true,
        streak: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    if (!child || child.parentInvitationCode !== parent?.invitationCode) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }

    const now = new Date();
    let startDate = new Date(now);
    if (timeRange === 'day') startDate.setHours(0, 0, 0, 0);
    else if (timeRange === 'month') startDate.setMonth(now.getMonth() - 1);
    else startDate.setDate(now.getDate() - 7);

    const [lessonsCompleted, totalLessons, badges, quizAttempts, recentLessons] = await Promise.all([
      prisma.microLessonCompletion.count({
        where: { userId: childId, completed: true }
      }),
      prisma.microLessonCompletion.count({
        where: {
          userId: childId,
          completed: true,
          completedAt: { gte: startDate }
        }
      }),
      prisma.userBadge.findMany({
        where: { userId: childId },
        include: { badge: true },
        orderBy: { unlockedAt: 'desc' },
        take: 5
      }),
      prisma.quizAttempt.findMany({
        where: {
          userId: childId,
          completedAt: { gte: startDate }
        },
        orderBy: { completedAt: 'desc' },
        take: 10
      }),
      prisma.microLessonCompletion.findMany({
        where: {
          userId: childId,
          completed: true,
          completedAt: { gte: startDate }
        },
        orderBy: { completedAt: 'desc' },
        take: 10
      })
    ]);

    const avgQuizScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, q) => sum + (q.score || 0), 0) / quizAttempts.length)
      : null;

    res.json({
      success: true,
      data: {
        child: {
          firstName: child.firstName,
          lastName: child.lastName,
          xp: child.xp || 0,
          level: child.level || 1,
          streak: child.streak || 0,
          memberSince: child.createdAt
        },
        period: {
          timeRange,
          lessonsThisPeriod: totalLessons,
          quizzesThisPeriod: quizAttempts.length,
          avgQuizScore
        },
        totals: {
          lessonsCompleted,
          badges: badges.length
        },
        recentBadges: badges.map(ub => ({
          name: ub.badge.name,
          icon: ub.badge.icon,
          unlockedAt: ub.unlockedAt
        })),
        recentLessons: recentLessons.map(l => ({
          lessonId: l.lessonId,
          score: l.score,
          completedAt: l.completedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /dashboard/:childId — dashboard complet (legacy, garde compatibilité)
router.get('/dashboard/:childId', authenticateToken, async (req, res, next) => {
  try {
    const { childId } = req.params;
    const timeRange = req.query.timeRange || 'week';

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { invitationCode: true }
    });

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentInvitationCode: true }
    });

    if (!child || child.parentInvitationCode !== user?.invitationCode) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }

    const now = new Date();
    let startDate = new Date(now);
    if (timeRange === 'day') startDate.setHours(0, 0, 0, 0);
    else if (timeRange === 'month') startDate.setMonth(now.getMonth() - 1);
    else startDate.setDate(now.getDate() - 7);

    const [stats, userBadges, quizAttempts, challenges, flashcards] = await Promise.all([
      prisma.user.findUnique({
        where: { id: childId },
        select: { xp: true, level: true, streak: true, createdAt: true }
      }),
      prisma.userBadge.findMany({
        where: { userId: childId, unlockedAt: { gte: startDate } },
        include: { badge: true },
        orderBy: { unlockedAt: 'desc' },
        take: 10
      }),
      prisma.quizAttempt.findMany({
        where: { userId: childId, completedAt: { gte: startDate } },
        orderBy: { completedAt: 'desc' },
        take: 10
      }),
      prisma.challengeAttempt.findMany({
        where: { userId: childId, completedAt: { gte: startDate } },
        orderBy: { completedAt: 'desc' },
        take: 10
      }),
      prisma.flashcardReview.findMany({
        where: { userId: childId, reviewedAt: { gte: startDate } },
        include: { flashcard: true },
        orderBy: { reviewedAt: 'desc' },
        take: 10
      })
    ]);

    const estimatedStudyTime = (quizAttempts.length * 15) + (challenges.length * 20) + (flashcards.length * 2);

    res.json({
      success: true,
      data: {
        stats: {
          xp: stats?.xp || 0,
          level: stats?.level || 1,
          streak: stats?.streak || 0,
          daysSinceJoined: Math.floor((now - new Date(stats?.createdAt || now)) / (1000 * 60 * 60 * 24))
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
    next(error);
  }
});

// GET /notifications/:childId
router.get('/notifications/:childId', authenticateToken, async (req, res, next) => {
  try {
    const { childId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { invitationCode: true }
    });

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentInvitationCode: true }
    });

    if (!child || child.parentInvitationCode !== user?.invitationCode) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }

    // Notifications basées sur les dernières activités
    const recentCompletions = await prisma.microLessonCompletion.findMany({
      where: {
        userId: childId,
        completed: true,
        completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    });

    const notifications = recentCompletions.map(c => ({
      type: 'lesson_completed',
      message: `Leçon ${c.lessonId} complétée${c.score ? ` (score: ${c.score}%)` : ''}`,
      date: c.completedAt
    }));

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
});

// PUT /notifications/:childId
router.put('/notifications/:childId', authenticateToken, async (req, res, next) => {
  try {
    const { childId } = req.params;
    const { level } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { invitationCode: true }
    });

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentInvitationCode: true }
    });

    if (!child || child.parentInvitationCode !== user?.invitationCode) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }

    res.json({ success: true, data: { level } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
