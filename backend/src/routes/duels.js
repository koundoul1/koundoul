const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');

// Get all duels
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { public: isPublic } = req.query;
    const userId = req.user?.userId;

    const duels = [];

    res.json({ success: true, data: duels });
  } catch (error) {
    next(error);
  }
});

// Get duel history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const duels = [];

    res.json({ success: true, data: duels });
  } catch (error) {
    next(error);
  }
});

// Create duel
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { opponentId, isPublic } = req.body;
    const userId = req.user.userId;

    const duel = {
      id: Date.now().toString(),
      challengerId: userId,
      opponentId,
      isPublic,
      status: 'pending'
    };

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

    const attempt = {
      id: Date.now().toString(),
      duelId: id,
      userId,
      startedAt: new Date()
    };

    res.json({ success: true, data: attempt });
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

    const result = {
      score: 0,
      winner: null
    };

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

