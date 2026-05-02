const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');
const { processAction } = require('../services/gamification');

// GET /content/exercises/:id — Load exercise detail
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const exercise = await prisma.exercise_problems.findUnique({
      where: { id: req.params.id }
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }

    res.json({
      success: true,
      data: {
        id: exercise.id,
        chapter: exercise.chapter,
        difficulty: exercise.difficulty,
        points: exercise.points || 10,
        timeLimitMinutes: exercise.time_limit_minutes,
        problem: exercise.problem,
        hints: exercise.hints || [],
        solution: exercise.solution
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /content/exercises/:id/submit — Submit exercise with self-evaluation
router.post('/:id/submit', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { userAnswer, selfEvaluation, timeSpent } = req.body;

    if (!userAnswer || !selfEvaluation) {
      return res.status(400).json({ error: 'userAnswer et selfEvaluation requis' });
    }

    if (!['correct', 'partial', 'incorrect'].includes(selfEvaluation)) {
      return res.status(400).json({ error: 'selfEvaluation doit être correct, partial ou incorrect' });
    }

    const exercise = await prisma.exercise_problems.findUnique({
      where: { id }
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }

    const basePoints = exercise.points || 10;
    const xpMultiplier = { correct: 1, partial: 0.5, incorrect: 0.25 };
    const xpEarned = Math.floor(basePoints * xpMultiplier[selfEvaluation]);

    // Note: exercise_attempts.exerciseId FK references `exercises` table (5-row legacy),
    // not `exercise_problems` (900-row main table). Skip attempt recording for now.
    // TODO: migrate FK to exercise_problems or create a new attempt table.

    const gamification = await processAction(userId, { type: 'complete_exercise', xp: xpEarned });

    res.json({
      success: true,
      data: {
        xpEarned,
        selfEvaluation,
        solution: exercise.solution,
        gamification
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
