const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');

// Solve problem with AI
router.post('/solve', authenticateToken, async (req, res, next) => {
  try {
    const { problem, subject, level } = req.body;
    const userId = req.user.userId;

    // Placeholder - intégrer avec l'IA réelle
    const solution = {
      steps: [
        { step: 1, description: 'Analyser le problème', content: '...' },
        { step: 2, description: 'Appliquer la méthode', content: '...' },
        { step: 3, description: 'Vérifier la solution', content: '...' }
      ],
      answer: 'Solution à implémenter avec IA',
      explanation: 'Explication détaillée de la solution'
    };

    res.json({ success: true, data: solution });
  } catch (error) {
    next(error);
  }
});

// Get solver history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const history = [];

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

// Get problems
router.get('/problems', authenticateToken, async (req, res, next) => {
  try {
    const { subject, level } = req.query;
    const problems = [];

    res.json({ success: true, data: problems });
  } catch (error) {
    next(error);
  }
});

// Save problem
router.post('/problems', authenticateToken, async (req, res, next) => {
  try {
    const { problem, solution } = req.body;
    const userId = req.user.userId;

    const saved = {
      id: Date.now().toString(),
      problem,
      solution,
      userId
    };

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

