const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const prisma = require('../config/database');

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const VALID_SUBJECTS = ['Mathématiques', 'Physique', 'Chimie'];
const VALID_LEVELS   = ['Seconde', 'Première', 'Terminale'];
const MAX_TITLE      = 200;
const MAX_CONTENT    = 10000;
const MIN_CONTENT    = 20;
const MIN_REPLY      = 5;

// ─── ROUTES STATIQUES (avant /:id pour éviter le route shadowing) ─────────────

// GET /forum/user/discussions — discussions de l'utilisateur connecté
router.get('/user/discussions', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const discussions = await prisma.forumDiscussion.findMany({
      where: { userId },
      include: {
        _count: { select: { replies: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: discussions });
  } catch (error) {
    next(error);
  }
});

// GET /forum/user/replies — réponses de l'utilisateur connecté
router.get('/user/replies', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const replies = await prisma.forumReply.findMany({
      where: { userId },
      include: {
        discussion: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: replies });
  } catch (error) {
    next(error);
  }
});

// ─── LISTE DES DISCUSSIONS ────────────────────────────────────────────────────

// GET /forum — liste paginée avec filtres
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, subject, level, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (subject && VALID_SUBJECTS.includes(subject)) where.subject = subject;
    if (level   && VALID_LEVELS.includes(level))     where.level   = level;
    if (search?.trim()) {
      where.OR = [
        { title:   { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    const [discussions, total] = await Promise.all([
      prisma.forumDiscussion.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, firstName: true, lastName: true }
          },
          _count: { select: { replies: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.forumDiscussion.count({ where })
    ]);

    const formatted = discussions.map(disc => ({
      id:           disc.id,
      title:        disc.title,
      content:      disc.content,
      subject:      disc.subject,
      level:        disc.level,
      solved:       disc.solved,
      isPinned:     disc.isPinned,
      author: {
        id:       disc.user.id,
        username: disc.user.username || disc.user.email,
        name:     disc.user.firstName || disc.user.lastName
          ? `${disc.user.firstName || ''} ${disc.user.lastName || ''}`.trim()
          : null
      },
      views:        disc.views,
      votes:        disc.votes,
      repliesCount: disc._count.replies,
      createdAt:    disc.createdAt,
      updatedAt:    disc.updatedAt
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─── DÉTAIL D'UNE DISCUSSION ──────────────────────────────────────────────────

// GET /forum/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérifier l'existence avant d'incrémenter les vues
    const exists = await prisma.forumDiscussion.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!exists) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }

    // Incrémenter les vues + récupérer la discussion en une seule requête
    const discussion = await prisma.forumDiscussion.update({
      where: { id },
      data:  { views: { increment: 1 } },
      include: {
        user: {
          select: { id: true, username: true, firstName: true, lastName: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, username: true, firstName: true, lastName: true }
            }
          },
          orderBy: [
            { isBestAnswer: 'desc' },
            { votes:        'desc' },
            { createdAt:    'asc'  }
          ]
        }
      }
    });

    res.json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
});

// ─── CRÉER UNE DISCUSSION ─────────────────────────────────────────────────────

// POST /forum
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, subject, level } = req.body;
    const userId = req.user.userId;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Titre et contenu requis' });
    }
    if (title.trim().length > MAX_TITLE) {
      return res.status(400).json({ error: `Titre trop long (max ${MAX_TITLE} caractères)` });
    }
    if (content.trim().length < MIN_CONTENT) {
      return res.status(400).json({ error: `Contenu trop court (min ${MIN_CONTENT} caractères)` });
    }
    if (content.trim().length > MAX_CONTENT) {
      return res.status(400).json({ error: `Contenu trop long (max ${MAX_CONTENT} caractères)` });
    }

    const discussion = await prisma.forumDiscussion.create({
      data: {
        userId,
        title:   title.trim(),
        content: content.trim(),
        subject: subject && VALID_SUBJECTS.includes(subject) ? subject : null,
        level:   level   && VALID_LEVELS.includes(level)     ? level   : null
      },
      include: {
        user: {
          select: { id: true, username: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
});

// ─── RÉPONDRE À UNE DISCUSSION ────────────────────────────────────────────────

// POST /forum/:id/reply
router.post('/:id/reply', authenticateToken, async (req, res, next) => {
  try {
    const { id }      = req.params;
    const { content } = req.body;
    const userId      = req.user.userId;

    if (!content?.trim() || content.trim().length < MIN_REPLY) {
      return res.status(400).json({ error: `Réponse trop courte (min ${MIN_REPLY} caractères)` });
    }
    if (content.trim().length > MAX_CONTENT) {
      return res.status(400).json({ error: `Réponse trop longue (max ${MAX_CONTENT} caractères)` });
    }

    const discussion = await prisma.forumDiscussion.findUnique({ where: { id } });
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }

    const reply = await prisma.forumReply.create({
      data: { discussionId: id, userId, content: content.trim() },
      include: {
        user: {
          select: { id: true, username: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    next(error);
  }
});

// ─── VOTER UNE DISCUSSION ─────────────────────────────────────────────────────

// POST /forum/:id/vote
router.post('/:id/vote', authenticateToken, async (req, res, next) => {
  try {
    const { id }    = req.params;
    const userId    = req.user.userId;
    const rawValue  = parseInt(req.body.value);
    const value     = rawValue >= 0 ? 1 : -1; // borné à ±1

    const discussion = await prisma.forumDiscussion.findUnique({
      where:  { id },
      select: { id: true }
    });
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }

    // Récupérer le vote existant
    const existing = await prisma.discussion_votes.findUnique({
      where: { discussionId_userId: { discussionId: id, userId } }
    });

    let delta = 0;
    if (!existing) {
      // Nouveau vote
      await prisma.discussion_votes.create({ data: { discussionId: id, userId, value } });
      delta = value;
    } else if (existing.value === value) {
      // Annuler le vote (re-clic)
      await prisma.discussion_votes.delete({
        where: { discussionId_userId: { discussionId: id, userId } }
      });
      delta = -value;
    } else {
      // Changer de vote (+1 → -1 ou inverse)
      await prisma.discussion_votes.update({
        where: { discussionId_userId: { discussionId: id, userId } },
        data:  { value }
      });
      delta = value * 2;
    }

    const updated = await prisma.forumDiscussion.update({
      where: { id },
      data:  { votes: { increment: delta } },
      select: { votes: true }
    });

    res.json({ success: true, votes: updated.votes, userVote: delta === 0 ? null : value });
  } catch (error) {
    next(error);
  }
});

// ─── VOTER UNE RÉPONSE ────────────────────────────────────────────────────────

// POST /forum/reply/:id/vote
router.post('/reply/:id/vote', authenticateToken, async (req, res, next) => {
  try {
    const { id }   = req.params;
    const userId   = req.user.userId;
    const rawValue = parseInt(req.body.value);
    const value    = rawValue >= 0 ? 1 : -1;

    const reply = await prisma.forumReply.findUnique({
      where:  { id },
      select: { id: true }
    });
    if (!reply) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }

    const existing = await prisma.reply_votes.findUnique({
      where: { replyId_userId: { replyId: id, userId } }
    });

    let delta = 0;
    if (!existing) {
      await prisma.reply_votes.create({ data: { replyId: id, userId, value } });
      delta = value;
    } else if (existing.value === value) {
      await prisma.reply_votes.delete({
        where: { replyId_userId: { replyId: id, userId } }
      });
      delta = -value;
    } else {
      await prisma.reply_votes.update({
        where: { replyId_userId: { replyId: id, userId } },
        data:  { value }
      });
      delta = value * 2;
    }

    const updated = await prisma.forumReply.update({
      where: { id },
      data:  { votes: { increment: delta } },
      select: { votes: true }
    });

    res.json({ success: true, votes: updated.votes, userVote: delta === 0 ? null : value });
  } catch (error) {
    next(error);
  }
});

// ─── MARQUER LA MEILLEURE RÉPONSE ─────────────────────────────────────────────

// POST /forum/:discussionId/best-answer/:replyId
router.post('/:discussionId/best-answer/:replyId', authenticateToken, async (req, res, next) => {
  try {
    const { discussionId, replyId } = req.params;
    const userId = req.user.userId;

    const discussion = await prisma.forumDiscussion.findUnique({
      where: { id: discussionId }
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion non trouvée' });
    }
    if (discussion.userId !== userId) {
      return res.status(403).json({ error: 'Seul l\'auteur peut marquer la meilleure réponse' });
    }

    const reply = await prisma.forumReply.findUnique({
      where:  { id: replyId },
      select: { id: true, discussionId: true }
    });
    if (!reply || reply.discussionId !== discussionId) {
      return res.status(404).json({ error: 'Réponse introuvable dans cette discussion' });
    }

    // Désactiver les autres meilleures réponses, activer celle-ci, marquer la discussion comme résolue
    await prisma.$transaction([
      prisma.forumReply.updateMany({
        where: { discussionId, isBestAnswer: true },
        data:  { isBestAnswer: false }
      }),
      prisma.forumReply.update({
        where: { id: replyId },
        data:  { isBestAnswer: true }
      }),
      prisma.forumDiscussion.update({
        where: { id: discussionId },
        data:  { solved: true }
      })
    ]);

    res.json({ success: true, message: 'Meilleure réponse marquée' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
