const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middlewares/auth');

// Get all question banks
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { type, subject, level } = req.query;

    // Placeholder - retourner des banques de questions
    const banks = [];

    res.json({ success: true, data: banks });
  } catch (error) {
    next(error);
  }
});

// Get question bank by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

// Get QCM from bank
router.get('/:id/qcm', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit, difficulty } = req.query;

    // Placeholder
    const questions = [];

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

    // Placeholder
    const questions = [];

    res.json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

