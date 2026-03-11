const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const prisma = require('../config/database');

// GET /api/leaderboard — Top 100 users sorted by XP with geographic filters
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      type = 'global',
      country,
      region,
      school,
      period = 'alltime',
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause based on filters
    const where = { isActive: true };

    if (type === 'country' && country) {
      where.country = country;
    } else if (type === 'region' && region) {
      where.region = region;
    } else if (type === 'school' && school) {
      where.school = school;
    }

    // Period filter
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      where.lastLoginAt = { gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      where.lastLoginAt = { gte: monthAgo };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          xp: true,
          streak: true,
          country: true,
          region: true,
          school: true,
          badges: { select: { id: true } }
        },
        orderBy: { xp: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.user.count({ where })
    ]);

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      xp: user.xp || 0,
      streak: user.streak || 0,
      country: user.country,
      region: user.region,
      school: user.school,
      badgesCount: user.badges.length
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/leaderboard/my-rank — Current user's rank in each scope
router.get('/my-rank', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        xp: true,
        streak: true,
        country: true,
        region: true,
        school: true,
        badges: { select: { id: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Count users with more XP for each scope
    const [globalRank, countryRank, regionRank, schoolRank] = await Promise.all([
      prisma.user.count({
        where: { isActive: true, xp: { gt: user.xp || 0 } }
      }),
      user.country
        ? prisma.user.count({
            where: { isActive: true, country: user.country, xp: { gt: user.xp || 0 } }
          })
        : Promise.resolve(null),
      user.region
        ? prisma.user.count({
            where: { isActive: true, region: user.region, xp: { gt: user.xp || 0 } }
          })
        : Promise.resolve(null),
      user.school
        ? prisma.user.count({
            where: { isActive: true, school: user.school, xp: { gt: user.xp || 0 } }
          })
        : Promise.resolve(null)
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          xp: user.xp || 0,
          streak: user.streak || 0,
          country: user.country,
          region: user.region,
          school: user.school,
          badgesCount: user.badges.length
        },
        ranks: {
          global: globalRank + 1,
          country: countryRank !== null ? countryRank + 1 : null,
          region: regionRank !== null ? regionRank + 1 : null,
          school: schoolRank !== null ? schoolRank + 1 : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
