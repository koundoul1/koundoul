const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { checkQuota } = require('../services/aiQuotaService');

// GET /ai-quota — returns current user's AI quota status
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const quota = await checkQuota(req.user.userId);
    res.json({ success: true, ...quota });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
