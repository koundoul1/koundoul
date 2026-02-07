const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Solve problem with AI
router.post('/solve', authenticateToken, async (req, res, next) => {
  try {
    const { problem, subject, level } = req.body;
    const userId = req.user.userId;

    if (!problem) {
      return res.status(400).json({ error: 'Problème requis' });
    }

    // Placeholder pour l'intégration IA réelle
    // Ici vous intégrerez votre service IA (OpenAI, Claude, etc.)
    const solution = {
      steps: [
        {
          step: 1,
          description: 'Analyser le problème',
          content: 'Identifier les données connues et inconnues du problème.'
        },
        {
          step: 2,
          description: 'Appliquer la méthode appropriée',
          content: 'Utiliser les formules et méthodes adaptées à ce type de problème.'
        },
        {
          step: 3,
          description: 'Résoudre étape par étape',
          content: 'Effectuer les calculs nécessaires de manière progressive.'
        },
        {
          step: 4,
          description: 'Vérifier la solution',
          content: 'S\'assurer que la réponse est cohérente et complète.'
        }
      ],
      answer: 'Solution à calculer avec l\'IA',
      explanation: 'Explication détaillée de la méthode utilisée et des étapes de résolution.'
    };

    // Sauvegarder dans l'historique
    const history = await prisma.solverHistory.create({
      data: {
        userId,
        problem,
        subject: subject || null,
        level: level || null,
        solution
      }
    });

    res.json({
      success: true,
      data: {
        ...solution,
        historyId: history.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get solver history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    const history = await prisma.solverHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

// Get problems
router.get('/problems', authenticateToken, async (req, res, next) => {
  try {
    const { subject, level } = req.query;
    const userId = req.user.userId;

    const where = { userId };
    if (subject) where.subject = subject;
    if (level) where.level = level;

    const problems = await prisma.solverHistory.findMany({
      where,
      select: {
        id: true,
        problem: true,
        subject: true,
        level: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: problems });
  } catch (error) {
    next(error);
  }
});

// Save problem
router.post('/problems', authenticateToken, async (req, res, next) => {
  try {
    const { problem, solution, subject, level } = req.body;
    const userId = req.user.userId;

    if (!problem) {
      return res.status(400).json({ error: 'Problème requis' });
    }

    const saved = await prisma.solverHistory.create({
      data: {
        userId,
        problem,
        solution: solution || {},
        subject: subject || null,
        level: level || null
      }
    });

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
