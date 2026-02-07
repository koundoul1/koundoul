const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

// Get all challenges
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const challenges = [];
    res.json({ success: true, data: challenges });
  } catch (error) {
    next(error);
  }
});

// Get weekly challenge
router.get('/weekly', optionalAuth, async (req, res, next) => {
  try {
    // Placeholder - challenge hebdomadaire
    const challenge = {
      id: 'weekly-1',
      title: 'Challenge Hebdomadaire',
      description: 'Testez vos connaissances cette semaine',
      subject: 'Mathématiques',
      difficulty: 'Moyen',
      timeLimit: 20,
      participants: 0,
      isActive: true
    };

    res.json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
});

// Get challenge by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

// Start challenge
router.post('/:id/start', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const attempt = {
      id: Date.now().toString(),
      challengeId: id,
      userId,
      startedAt: new Date()
    };

    res.json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
});

// Submit challenge
router.post('/:id/submit', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.userId;

    const result = {
      score: 0,
      rank: 0
    };

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/:id/leaderboard', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scope = 'international' } = req.query;

    const leaderboard = [];

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

// Get user rank
router.get('/:id/rank', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scope = 'international' } = req.query;
    const userId = req.user.userId;

    const rank = {
      rank: null,
      score: 0
    };

    res.json({ success: true, data: rank });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

