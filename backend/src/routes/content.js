const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Cache: simple in-memory, 5 minute TTL
let countsCache = null;
let countsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

// GET /content/counts — Aggregated content counts by difficulty and subject
router.get('/counts', async (req, res, next) => {
  try {
    const now = Date.now();
    if (countsCache && (now - countsCacheTime) < CACHE_TTL) {
      return res.json({ success: true, data: countsCache });
    }

    const [qcmByDiff, exByDiff] = await Promise.all([
      prisma.$queryRaw`
        SELECT difficulty, count(*)::int as count
        FROM qcm_questions
        WHERE difficulty IS NOT NULL
        GROUP BY difficulty
        ORDER BY difficulty
      `,
      prisma.$queryRaw`
        SELECT difficulty, count(*)::int as count
        FROM exercise_problems
        WHERE difficulty IS NOT NULL
        GROUP BY difficulty
        ORDER BY difficulty
      `
    ]);

    const toDiffMap = (rows) => {
      const map = { 1: 0, 2: 0, 3: 0 };
      for (const r of rows) {
        const d = r.difficulty;
        if (d >= 3) map[3] = (map[3] || 0) + r.count;
        else if (map[d] !== undefined) map[d] = r.count;
      }
      return map;
    };

    const counts = {
      qcm: {
        total: qcmByDiff.reduce((s, r) => s + r.count, 0),
        byDifficulty: toDiffMap(qcmByDiff)
      },
      exercises: {
        total: exByDiff.reduce((s, r) => s + r.count, 0),
        byDifficulty: toDiffMap(exByDiff)
      }
    };

    countsCache = counts;
    countsCacheTime = now;

    res.json({ success: true, data: counts });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
