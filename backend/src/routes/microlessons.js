const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

// Get all micro-lessons
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { subject, level, limit = 1000, offset = 0 } = req.query;
    const lessons = [];

    res.json({ success: true, data: lessons });
  } catch (error) {
    next(error);
  }
});

// Get micro-lesson by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

// Complete micro-lesson
router.post('/:id/complete', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timeSpent, score } = req.body;
    const userId = req.user.userId;

    res.json({ success: true, message: 'Leçon complétée' });
  } catch (error) {
    next(error);
  }
});

// Get completion status
router.get('/:id/completion', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const completion = {
      completed: false,
      score: null,
      timeSpent: 0
    };

    res.json({ success: true, data: completion });
  } catch (error) {
    next(error);
  }
});

// Get stats
router.get('/stats/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const stats = {
      total_completed: 0,
      total_xp_earned: 0,
      average_score: 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

