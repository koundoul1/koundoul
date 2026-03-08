const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all question banks
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { type, subject, level } = req.query;

    const where = {};
    if (type) where.type = type;
    if (subject && subject !== 'Toutes les matières') where.subject = subject;
    if (level && level !== 'Tous les niveaux') where.level = level;

    const banks = await prisma.questionBank.findMany({
      where,
      include: {
        _count: {
          select: { qcm_questions: true, exercise_problems: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = banks.map(bank => ({
      id: bank.id,
      title: bank.title,
      subject: bank.subject,
      level: bank.level,
      type: bank.type,
      totalQuestions: (bank._count.qcm_questions || 0) + (bank._count.exercise_problems || 0),
      createdAt: bank.createdAt
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// Get question bank by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const bank = await prisma.questionBank.findUnique({
      where: { id },
      include: {
        _count: {
          select: { qcm_questions: true, exercise_problems: true }
        }
      }
    });

    if (!bank) {
      return res.status(404).json({ error: 'Banque de questions non trouvée' });
    }

    res.json({
      success: true,
      data: {
        ...bank,
        totalQuestions: (bank._count.qcm_questions || 0) + (bank._count.exercise_problems || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get QCM from bank
router.get('/:id/qcm', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 1000, difficulty } = req.query;

    const where = { bank_id: id };
    if (difficulty) {
      const diffNum = parseInt(difficulty);
      if (!isNaN(diffNum)) {
        where.difficulty = diffNum;
      }
    }

    const questions = await prisma.qcm_questions.findMany({
      where,
      take: parseInt(limit),
      orderBy: { created_at: 'asc' }
    });

    res.json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
});

// Get random QCM
router.get('/:id/qcm/random', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { count = 20, difficulty } = req.query;

    const where = { bank_id: id };
    if (difficulty) {
      const diffNum = parseInt(difficulty);
      if (!isNaN(diffNum)) {
        where.difficulty = diffNum;
      }
    }

    const allQuestions = await prisma.qcm_questions.findMany({ where });
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, parseInt(count));

    res.json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
});

// Get exercises from bank
router.get('/:id/exercises', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 1000, difficulty } = req.query;

    const where = { bank_id: id };
    if (difficulty) {
      const diffNum = parseInt(difficulty);
      if (!isNaN(diffNum)) {
        where.difficulty = diffNum;
      }
    }

    const exercises = await prisma.exercise_problems.findMany({
      where,
      take: parseInt(limit),
      orderBy: { created_at: 'asc' }
    });

    res.json({ success: true, data: exercises });
  } catch (error) {
    next(error);
  }
});

// Get random exercises
router.get('/:id/exercises/random', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { count = 10, difficulty } = req.query;

    const where = { bank_id: id };
    if (difficulty) {
      const diffNum = parseInt(difficulty);
      if (!isNaN(diffNum)) {
        where.difficulty = diffNum;
      }
    }

    const allExercises = await prisma.exercise_problems.findMany({ where });
    const shuffled = allExercises.sort(() => Math.random() - 0.5);
    const exercises = shuffled.slice(0, parseInt(count));

    res.json({ success: true, data: exercises });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
