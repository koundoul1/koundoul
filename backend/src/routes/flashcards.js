const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// SuperMemo 2 algorithm
function calculateNextReview(quality, interval, easeFactor, repetitions) {
  if (quality < 3) {
    // Incorrect answer - restart
    return {
      interval: 1,
      repetitions: 0,
      easeFactor: Math.max(1.3, easeFactor - 0.2)
    };
  }

  // Update ease factor
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  // Update repetitions
  let newRepetitions = repetitions;
  if (quality >= 3) {
    newRepetitions = repetitions + 1;
  }

  // Calculate new interval
  let newInterval;
  if (newRepetitions === 0) {
    newInterval = 1;
  } else if (newRepetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEaseFactor);
  }

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor
  };
}

// Get all flashcards
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { subject } = req.query;
    const userId = req.user.userId;

    const where = {};
    if (subject) where.subjectId = subject;

    const flashcards = await prisma.flashcard.findMany({
      where,
      include: {
        reviews: {
          where: { userId },
          take: 1,
          orderBy: { reviewedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = flashcards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      subject: card.subjectId,
      difficulty: card.difficulty,
      nextReview: card.reviews[0]?.nextReview || new Date(),
      mastered: card.reviews[0]?.repetitions >= 5
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// Get due flashcards
router.get('/due', authenticateToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.user.userId;

    const now = new Date();

    const reviews = await prisma.flashcardReview.findMany({
      where: {
        userId,
        nextReview: { lte: now }
      },
      include: {
        flashcard: true
      },
      orderBy: { nextReview: 'asc' },
      take: limit
    });

    const flashcards = reviews.map(review => ({
      id: review.flashcard.id,
      front: review.flashcard.front,
      back: review.flashcard.back,
      subject: review.flashcard.subjectId,
      review: {
        quality: review.quality,
        interval: review.interval,
        repetitions: review.repetitions
      }
    }));

    res.json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
});

// Create flashcard
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { front, back, subjectId, explanation } = req.body;
    const userId = req.user.userId;

    if (!front || !back || !subjectId) {
      return res.status(400).json({ error: 'Front, back et subjectId requis' });
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        front,
        back,
        subjectId,
        explanation: explanation || null,
        updatedAt: new Date()
      }
    });

    // Créer la première révision
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 1);

    await prisma.flashcardReview.create({
      data: {
        flashcardId: flashcard.id,
        userId,
        quality: 0,
        nextReview,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0
      }
    });

    res.status(201).json({ success: true, data: flashcard });
  } catch (error) {
    next(error);
  }
});

// Submit review
router.post('/:id/review', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quality, timeSpent = 0 } = req.body;
    const userId = req.user.userId;

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality doit être entre 0 et 5' });
    }

    // Récupérer ou créer la révision
    let review = await prisma.flashcardReview.findUnique({
      where: {
        flashcardId_userId: {
          flashcardId: id,
          userId
        }
      }
    });

    const now = new Date();
    let nextReviewDate = new Date();
    let interval = 1;
    let easeFactor = 2.5;
    let repetitions = 0;

    if (review) {
      const calculated = calculateNextReview(
        quality,
        review.interval,
        review.easeFactor,
        review.repetitions
      );
      interval = calculated.interval;
      easeFactor = calculated.easeFactor;
      repetitions = calculated.repetitions;
      nextReviewDate.setDate(now.getDate() + interval);
    } else {
      // Première révision
      if (quality >= 3) {
        interval = 1;
        repetitions = 1;
      }
      nextReviewDate.setDate(now.getDate() + interval);
    }

    // Mettre à jour ou créer
    if (review) {
      review = await prisma.flashcardReview.update({
        where: { id: review.id },
        data: {
          quality,
          nextReview: nextReviewDate,
          interval,
          easeFactor,
          repetitions,
          reviewedAt: now
        }
      });
    } else {
      review = await prisma.flashcardReview.create({
        data: {
          flashcardId: id,
          userId,
          quality,
          nextReview: nextReviewDate,
          interval,
          easeFactor,
          repetitions,
          reviewedAt: now
        }
      });
    }

    // Ajouter XP si qualité >= 4
    if (quality >= 4) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 10 } }
      });
    }

    res.json({
      success: true,
      data: {
        review,
        nextReview: nextReviewDate,
        xpEarned: quality >= 4 ? 10 : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [total, due, mastered] = await Promise.all([
      prisma.flashcardReview.count({ where: { userId } }),
      prisma.flashcardReview.count({
        where: {
          userId,
          nextReview: { lte: new Date() }
        }
      }),
      prisma.flashcardReview.count({
        where: {
          userId,
          repetitions: { gte: 5 }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        due,
        mastered
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
