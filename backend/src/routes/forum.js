const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

// Get discussions
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, subject, level } = req.query;
    const discussions = [];

    res.json({ success: true, data: discussions, pagination: { page, limit, total: 0 } });
  } catch (error) {
    next(error);
  }
});

// Get discussion by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

// Create discussion
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, subject, level } = req.body;
    const userId = req.user.userId;

    const discussion = {
      id: Date.now().toString(),
      title,
      content,
      subject,
      level,
      authorId: userId,
      createdAt: new Date()
    };

    res.status(201).json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
});

// Reply to discussion
router.post('/:id/reply', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const reply = {
      id: Date.now().toString(),
      discussionId: id,
      content,
      authorId: userId,
      createdAt: new Date()
    };

    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

