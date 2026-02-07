const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get dashboard data
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Récupérer les stats de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true
      }
    });

    // Stats basiques (à compléter avec les vraies données)
    const dashboard = {
      user,
      stats: {
        xp: 0,
        level: 1,
        exercisesCompleted: 0,
        averageScore: 0,
        streak: 0
      },
      recentActivity: [],
      recommendations: []
    };

    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

