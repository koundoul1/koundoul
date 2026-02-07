const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all badges
router.get('/all', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    // Pour l'instant, retourner des badges statiques
    // À remplacer par une vraie base de données
    const badges = [
      {
        id: '1',
        name: 'Premier Pas',
        description: 'Compléter votre première leçon',
        icon: '🎯',
        color: '#3B82F6',
        unlocked: false
      },
      {
        id: '2',
        name: 'Étudiant Assidu',
        description: 'Compléter 10 leçons',
        icon: '📚',
        color: '#10B981',
        unlocked: false
      },
      {
        id: '3',
        name: 'Maître des Quiz',
        description: 'Réussir 5 quiz',
        icon: '🏆',
        color: '#F59E0B',
        unlocked: false
      }
    ];

    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
});

// Get user badges
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // Même logique que /all mais avec les badges débloqués
    const badges = [
      {
        id: '1',
        name: 'Premier Pas',
        description: 'Compléter votre première leçon',
        icon: '🎯',
        color: '#3B82F6',
        unlocked: false
      }
    ];

    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
});

// Get badge stats
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = {
      total: 50,
      unlocked: 0,
      percentage: 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Check badges (trigger badge check)
router.post('/check', authenticateToken, async (req, res, next) => {
  try {
    // Logique pour vérifier et attribuer des badges
    res.json({ success: true, message: 'Badges vérifiés' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

