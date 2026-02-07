const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all flashcards
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { subject, level } = req.query;
    const userId = req.user.userId;

    // Placeholder - à implémenter avec la vraie base de données
    const flashcards = [];

    res.json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
});

// Get due flashcards
router.get('/due', authenticateToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.user.userId;

    // Placeholder
    const flashcards = [];

    res.json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
});

// Create flashcard
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { front, back, subject, level } = req.body;
    const userId = req.user.userId;

    // Placeholder
    const flashcard = {
      id: Date.now().toString(),
      front,
      back,
      subject,
      level,
      userId
    };

    res.status(201).json({ success: true, data: flashcard });
  } catch (error) {
    next(error);
  }
});

// Submit review
router.post('/:id/review', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quality, timeSpent } = req.body;
    const userId = req.user.userId;

    // Placeholder - algorithme de révision espacée
    res.json({ success: true, message: 'Révision enregistrée' });
  } catch (error) {
    next(error);
  }
});

// Get stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = {
      total: 0,
      due: 0,
      mastered: 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

