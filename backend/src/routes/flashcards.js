const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');

// ── SM-2 Algorithm ────────────────────────────────────────────────────

function calculateNextReview(quality, interval, easeFactor, repetitions) {
  // quality: 1=Again, 2=Hard, 3=Good, 4=Easy (mapped from frontend 1-3 to SM-2 scale)
  if (quality < 3) {
    return {
      interval: 1,
      repetitions: 0,
      easeFactor: Math.max(1.3, easeFactor - 0.2),
      status: 'learning'
    };
  }

  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  const newRepetitions = repetitions + 1;

  let newInterval;
  if (newRepetitions <= 1) {
    newInterval = 1;
  } else if (newRepetitions === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEaseFactor);
  }

  let status = 'learning';
  if (newRepetitions > 5 && newEaseFactor > 2.0) status = 'mastered';

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    status
  };
}

// ── GET /flashcards/banks — available card banks by subject/chapter ──

router.get('/banks', async (req, res, next) => {
  try {
    const banks = await prisma.$queryRaw`
      SELECT
        COALESCE(f.chapter, 'General') as chapter,
        f."subjectId" as "subjectId",
        s.name as subject,
        COUNT(*)::int as "totalCards",
        COUNT(*) FILTER (WHERE f.difficulty = 'FACILE')::int as easy,
        COUNT(*) FILTER (WHERE f.difficulty = 'MOYEN')::int as medium,
        COUNT(*) FILTER (WHERE f.difficulty = 'DIFFICILE')::int as hard
      FROM flashcards f
      LEFT JOIN subjects s ON s.id = f."subjectId"
      WHERE f."isOfficial" = true OR f."isOfficial" IS NULL
      GROUP BY f.chapter, f."subjectId", s.name
      ORDER BY s.name, f.chapter
    `;
    res.json({ success: true, data: banks });
  } catch (error) {
    next(error);
  }
});

// ── GET /flashcards — all cards (with user review state) ─────────────

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { subject, chapter } = req.query;
    const userId = req.user.userId;

    const where = {};
    if (subject) where.subjectId = subject;
    if (chapter) where.chapter = chapter;

    const flashcards = await prisma.flashcard.findMany({
      where,
      include: {
        reviews: {
          where: { userId },
          take: 1,
          orderBy: { reviewedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const formatted = flashcards.map(function(card) {
      var review = card.reviews[0];
      return {
        id: card.id,
        front: card.front,
        back: card.back,
        subject: card.subjectId,
        chapter: card.chapter,
        difficulty: card.difficulty,
        isOfficial: card.isOfficial,
        nextReview: review ? review.nextReview : new Date(),
        status: review ? review.status : 'new',
        mastered: review ? review.repetitions >= 5 : false
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// ── GET /flashcards/due — cards due for review today ─────────────────

router.get('/due', authenticateToken, async (req, res, next) => {
  try {
    var limit = parseInt(req.query.limit) || 20;
    var userId = req.user.userId;
    var now = new Date();

    var reviews = await prisma.flashcardReview.findMany({
      where: {
        userId: userId,
        nextReview: { lte: now }
      },
      include: { flashcard: true },
      orderBy: { nextReview: 'asc' },
      take: limit
    });

    var flashcards = reviews.map(function(review) {
      return {
        id: review.flashcard.id,
        front: review.flashcard.front,
        back: review.flashcard.back,
        subject: review.flashcard.subjectId,
        chapter: review.flashcard.chapter,
        difficulty: review.flashcard.difficulty,
        reviewId: review.id,
        status: review.status,
        repetitions: review.repetitions,
        interval: review.interval
      };
    });

    res.json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
});

// ── POST /flashcards/start-deck — assign official cards to user ──────

router.post('/start-deck', authenticateToken, async (req, res, next) => {
  try {
    var userId = req.user.userId;
    var subject = req.body.subject;
    var chapter = req.body.chapter;
    var deckId = req.body.deckId;

    if (!subject && !deckId) {
      return res.status(400).json({ error: 'Subject ou deckId requis' });
    }

    var where = {};
    if (subject) {
      // subject can be a name or an ID — try to resolve
      var subjectRecord = await prisma.subjects.findFirst({
        where: { OR: [{ id: subject }, { name: { contains: subject, mode: 'insensitive' } }] }
      });
      where.subjectId = subjectRecord ? subjectRecord.id : subject;
      if (chapter) where.chapter = chapter;
    }

    // Get official cards matching filters
    var cards = await prisma.flashcard.findMany({
      where: where,
      select: { id: true },
      take: 20
    });

    if (cards.length === 0) {
      return res.json({ success: true, created: 0, message: 'Aucune carte trouvee' });
    }

    // Create user reviews for cards not yet assigned
    var now = new Date();
    var created = 0;

    for (var i = 0; i < cards.length; i++) {
      try {
        await prisma.flashcardReview.create({
          data: {
            userId: userId,
            flashcardId: cards[i].id,
            deckId: deckId || null,
            quality: 0,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            status: 'new',
            nextReview: now,
            reviewedAt: now
          }
        });
        created++;
      } catch (e) {
        // Ignore duplicate (unique constraint userId+flashcardId)
      }
    }

    res.json({ success: true, created: created });
  } catch (error) {
    next(error);
  }
});

// ── POST /flashcards/:id/review — submit review with SM-2 ───────────

router.post('/:id/review', authenticateToken, async (req, res, next) => {
  try {
    var flashcardId = req.params.id;
    var quality = req.body.quality;
    var timeSpent = req.body.timeSpent || 0;
    var userId = req.user.userId;

    if (quality === undefined || quality < 1 || quality > 4) {
      return res.status(400).json({ error: 'Quality doit etre entre 1 et 4' });
    }

    // Map quality 1-4 to SM-2 scale 1-5
    var sm2Quality = quality + 1; // 1->2, 2->3, 3->4, 4->5

    var now = new Date();

    // Find existing review
    var review = await prisma.flashcardReview.findFirst({
      where: { userId: userId, flashcardId: flashcardId }
    });

    var interval = review ? review.interval : 1;
    var easeFactor = review ? review.easeFactor : 2.5;
    var repetitions = review ? review.repetitions : 0;

    var calculated = calculateNextReview(sm2Quality, interval, easeFactor, repetitions);

    var nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + calculated.interval);

    var data = {
      quality: sm2Quality,
      interval: calculated.interval,
      easeFactor: calculated.easeFactor,
      repetitions: calculated.repetitions,
      status: calculated.status,
      nextReview: nextReviewDate,
      reviewedAt: now
    };
    if (timeSpent) data.timeSpent = timeSpent;

    if (review) {
      review = await prisma.flashcardReview.update({
        where: { id: review.id },
        data: data
      });
    } else {
      review = await prisma.flashcardReview.create({
        data: Object.assign({
          userId: userId,
          flashcardId: flashcardId
        }, data)
      });
    }

    // Award XP via gamification if quality >= 3 (Good or Easy)
    var xpEarned = 0;
    if (quality >= 2) {
      try {
        var gamification = require('../services/gamification');
        var result = await gamification.processAction(userId, { type: 'review_flashcard', xp: 5 });
        xpEarned = result.xpEarned || 5;
      } catch (e) {
        // Gamification may not be available
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: 5 } }
        });
        xpEarned = 5;
      }
    }

    res.json({
      success: true,
      data: {
        nextReview: nextReviewDate,
        interval: calculated.interval,
        status: calculated.status,
        repetitions: calculated.repetitions,
        xpEarned: xpEarned
      }
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /flashcards — create user card ──────────────────────────────

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    var front = req.body.front;
    var back = req.body.back;
    var subjectId = req.body.subjectId || req.body.subject;
    var chapter = req.body.chapter;
    var userId = req.user.userId;

    if (!front || !back) {
      return res.status(400).json({ error: 'Question et reponse requises' });
    }

    // Default subject if not provided
    if (!subjectId) subjectId = 'math';

    var flashcard = await prisma.flashcard.create({
      data: {
        front: front,
        back: back,
        subjectId: subjectId,
        chapter: chapter || 'Personnel',
        isOfficial: false,
        createdById: userId,
        updatedAt: new Date()
      }
    });

    // Auto-assign to user
    var now = new Date();
    await prisma.flashcardReview.create({
      data: {
        userId: userId,
        flashcardId: flashcard.id,
        quality: 0,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        status: 'new',
        nextReview: now,
        reviewedAt: now
      }
    });

    res.status(201).json({ success: true, data: flashcard });
  } catch (error) {
    next(error);
  }
});

// ── GET /flashcards/stats — user review statistics ───────────────────

router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    var userId = req.user.userId;
    var now = new Date();

    var counts = await Promise.all([
      prisma.flashcardReview.count({ where: { userId: userId } }),
      prisma.flashcardReview.count({ where: { userId: userId, nextReview: { lte: now } } }),
      prisma.flashcardReview.count({ where: { userId: userId, status: 'mastered' } }),
      prisma.flashcardReview.count({ where: { userId: userId, status: 'learning' } }),
      prisma.flashcardReview.count({ where: { userId: userId, status: 'new' } })
    ]);

    var total = counts[0];
    var due = counts[1];
    var mastered = counts[2];
    var learning = counts[3];
    var newCards = counts[4];
    var retentionRate = total > 0 ? Math.round((mastered / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total: total,
        dueCount: due,
        mastered: mastered,
        learning: learning,
        newCount: newCards,
        retentionRate: retentionRate,
        streak: 0,
        totalReviews: total
      }
    });
  } catch (error) {
    next(error);
  }
});

// ── Decks CRUD ───────────────────────────────────────────────────────

router.get('/my-decks', authenticateToken, async (req, res, next) => {
  try {
    var userId = req.user.userId;
    var decks = await prisma.flashcardDeck.findMany({
      where: { userId: userId },
      include: {
        _count: { select: { cards: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, data: decks });
  } catch (error) {
    next(error);
  }
});

router.post('/decks', authenticateToken, async (req, res, next) => {
  try {
    var name = req.body.name;
    var description = req.body.description;
    var userId = req.user.userId;

    if (!name) return res.status(400).json({ error: 'Nom requis' });

    var deck = await prisma.flashcardDeck.create({
      data: { name: name, description: description || null, userId: userId }
    });
    res.status(201).json({ success: true, data: deck });
  } catch (error) {
    next(error);
  }
});

router.delete('/decks/:id', authenticateToken, async (req, res, next) => {
  try {
    var userId = req.user.userId;
    var deck = await prisma.flashcardDeck.findUnique({ where: { id: req.params.id } });
    if (!deck || deck.userId !== userId) return res.status(403).json({ error: 'Non autorise' });
    await prisma.flashcardDeck.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
