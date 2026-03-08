const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');

// Duel and DuelParticipation models don't exist in database yet.
// All routes return placeholder/empty data until tables are created.

router.get('/', authenticateToken, async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/history', authenticateToken, async (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', authenticateToken, async (req, res) => {
  res.status(404).json({ error: 'Les duels ne sont pas encore disponibles' });
});

router.post('/:id/accept', authenticateToken, async (req, res) => {
  res.status(404).json({ error: 'Les duels ne sont pas encore disponibles' });
});

router.post('/:id/start', authenticateToken, async (req, res) => {
  res.status(404).json({ error: 'Les duels ne sont pas encore disponibles' });
});

router.post('/:id/submit', authenticateToken, async (req, res) => {
  res.status(404).json({ error: 'Les duels ne sont pas encore disponibles' });
});

module.exports = router;
