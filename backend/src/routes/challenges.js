const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

// Challenge and ChallengeAttempt models don't exist in database yet.
// All routes return placeholder/empty data until tables are created.

router.get('/', optionalAuth, async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/weekly', optionalAuth, async (req, res) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  res.json({
    success: true,
    data: {
      id: 'weekly-placeholder',
      title: 'Aucun challenge actif',
      description: 'Il n\'y a pas de challenge hebdomadaire actif pour le moment.',
      subject: 'Mathématiques',
      difficulty: 'Moyen',
      timeLimit: 20,
      participants: 0,
      isActive: false,
      startDate: startOfWeek,
      endDate: endOfWeek
    }
  });
});

router.get('/:id', optionalAuth, async (req, res) => {
  res.status(404).json({ error: 'Challenge non trouvé' });
});

router.post('/:id/start', authenticateToken, async (req, res) => {
  res.status(404).json({ error: 'Les challenges ne sont pas encore disponibles' });
});

router.post('/:id/submit', authenticateToken, async (req, res) => {
  res.status(404).json({ error: 'Les challenges ne sont pas encore disponibles' });
});

router.get('/:id/leaderboard', optionalAuth, async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/:id/rank', authenticateToken, async (req, res) => {
  res.json({ success: true, data: { rank: null, score: 0 } });
});

module.exports = router;
