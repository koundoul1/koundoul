const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');

// Analyze exercise
router.post('/analyze', authenticateToken, async (req, res, next) => {
  try {
    const { imageData, text } = req.body;
    const userId = req.user.userId;

    // Placeholder - intégrer avec l'IA réelle
    const analysis = {
      equation: text || 'Équation détectée',
      steps: [],
      guidance: 'beginner'
    };

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// Start step session
router.post('/steps/start', authenticateToken, async (req, res, next) => {
  try {
    const { equation, guidanceLevel } = req.body;
    const userId = req.user.userId;

    const session = {
      id: Date.now().toString(),
      equation,
      guidanceLevel,
      userId,
      startedAt: new Date()
    };

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

// Get session history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const sessions = [];

    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

// Get coach stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = {
      totalSessions: 0,
      averageScore: 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

