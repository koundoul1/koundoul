const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get discussions
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, subject, level } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (subject) where.subject = subject;
    if (level) where.level = level;

    const [discussions, total] = await Promise.all([
      prisma.forumDiscussion.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: { replies: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.forumDiscussion.count({ where })
    ]);

    const formatted = discussions.map(disc => ({
      id: disc.id,
      title: disc.title,
      content: disc.content,
      subject: disc.subject,
      level: disc.level,
      author: {
        id: disc.user.id,
        username: disc.user.username || disc.user.email,
        name: disc.user.firstName || disc.user.lastName
          ? `${disc.user.firstName || ''} ${disc.user.lastName || ''}`.trim()
          : null
      },
      views: disc.views,
      votes: disc.votes,
      repliesCount: disc._count.replies,
      createdAt: disc.createdAt,
      updatedAt: disc.updatedAt
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get discussion by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Incrémenter les vues
    await prisma.forumDiscussion.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    const discussion = await prisma.forumDiscussion.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        replies: {
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
            { isBestAnswer: 'desc' },
            { votes: 'desc' },
            { createdAt: 'asc' }
          ]
        }
      }
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }

    res.json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
});

// Create discussion
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, subject, level } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ error: 'Titre et contenu requis' });
    }

    const discussion = await prisma.forumDiscussion.create({
      data: {
        userId,
        title,
        content,
        subject: subject || null,
        level: level || null
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
      }
    });

    res.status(201).json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
});

// Reply to discussion
router.post('/:id/reply', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: 'Contenu requis' });
    }

    // Vérifier que la discussion existe
    const discussion = await prisma.forumDiscussion.findUnique({
      where: { id }
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }

    const reply = await prisma.forumReply.create({
      data: {
        discussionId: id,
        userId,
        content
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
      }
    });

    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    next(error);
  }
});

// Vote discussion
router.post('/:id/vote', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = req.body; // 1 ou -1

    await prisma.forumDiscussion.update({
      where: { id },
      data: { votes: { increment: value || 1 } }
    });

    res.json({ success: true, message: 'Vote enregistré' });
  } catch (error) {
    next(error);
  }
});

// Vote reply
router.post('/reply/:id/vote', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    await prisma.forumReply.update({
      where: { id },
      data: { votes: { increment: value || 1 } }
    });

    res.json({ success: true, message: 'Vote enregistré' });
  } catch (error) {
    next(error);
  }
});

// Mark best answer
router.post('/:discussionId/best-answer/:replyId', authenticateToken, async (req, res, next) => {
  try {
    const { discussionId, replyId } = req.params;
    const userId = req.user.userId;

    // Vérifier que l'utilisateur est l'auteur de la discussion
    const discussion = await prisma.forumDiscussion.findUnique({
      where: { id: discussionId }
    });

    if (!discussion || discussion.userId !== userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à marquer la meilleure réponse' });
    }

    // Désactiver les autres meilleures réponses
    await prisma.forumReply.updateMany({
      where: {
        discussionId,
        isBestAnswer: true
      },
      data: { isBestAnswer: false }
    });

    // Marquer cette réponse comme meilleure
    await prisma.forumReply.update({
      where: { id: replyId },
      data: { isBestAnswer: true }
    });

    await prisma.forumDiscussion.update({
      where: { id: discussionId },
      data: { bestAnswerId: replyId }
    });

    res.json({ success: true, message: 'Meilleure réponse marquée' });
  } catch (error) {
    next(error);
  }
});

// Get user discussions
router.get('/user/discussions', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const discussions = await prisma.forumDiscussion.findMany({
      where: { userId },
      include: {
        _count: {
          select: { replies: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: discussions });
  } catch (error) {
    next(error);
  }
});

// Get user replies
router.get('/user/replies', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const replies = await prisma.forumReply.findMany({
      where: { userId },
      include: {
        discussion: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: replies });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
