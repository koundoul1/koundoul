const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../middlewares/auth');
const prisma = require('../config/database');
const { sendNotification } = require('../utils/notificationService');

// Helper to log admin actions (won't fail if table doesn't exist)
async function logAdminAction(adminId, action, target, targetId, details, ip) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        target: target || null,
        targetId: targetId || null,
        details: details || null,
        ip: ip || null
      }
    });
  } catch (err) {
    console.error('Failed to log admin action:', err.message);
  }
}

// Stats cache (5 min TTL)
let statsCache = null;
let statsCacheTime = 0;
const STATS_CACHE_TTL = 5 * 60 * 1000;

// ==================== STATS (11 metrics + charts) ====================

router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    // Return cached if fresh
    if (statsCache && Date.now() - statsCacheTime < STATS_CACHE_TTL) {
      return res.json(statsCache);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = todayStart.toISOString().slice(0, 10);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    // Level 1 — Basics
    const [totalUsers, dau, mau] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastLoginAt: { gte: todayStart } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } })
    ]);

    // Level 2 — Engagement
    let totalXpDistributed = 0;
    try {
      const xpAgg = await prisma.user.aggregate({ _sum: { xp: true } });
      totalXpDistributed = xpAgg._sum.xp || 0;
    } catch (e) { /* ignore */ }

    let aiCallsToday = 0;
    try {
      const aiAgg = await prisma.dailyAiUsage.aggregate({
        _sum: { count: true },
        where: { date: new Date(todayStr) }
      });
      aiCallsToday = aiAgg._sum.count || 0;
    } catch (e) { /* ignore */ }

    let duelsThisWeek = 0;
    try {
      duelsThisWeek = await prisma.duel.count({ where: { completedAt: { gte: weekStart } } });
    } catch (e) { /* ignore */ }

    const top10Users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, username: true, xp: true, level: true },
      orderBy: { xp: 'desc' },
      take: 10
    });

    // Level 3 — Revenue
    const [activeSubscriptions, monthlyRevenueResult] = await Promise.all([
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['COMPLETED', 'SUCCESS'] }, createdAt: { gte: monthStart } }
      })
    ]);
    const monthlyRevenue = monthlyRevenueResult._sum.amount || 0;

    let subsByPlan = [];
    try {
      const raw = await prisma.subscription.groupBy({ by: ['planId'], _count: true, where: { status: 'ACTIVE' } });
      const plans = await prisma.subscriptionPlan.findMany({ select: { id: true, name: true, displayName: true } });
      const planMap = {};
      plans.forEach(p => { planMap[p.id] = p.displayName || p.name; });
      subsByPlan = raw.map(r => ({ planId: r.planId, planName: planMap[r.planId] || r.planId, count: r._count }));
    } catch (e) { /* ignore */ }

    const freeUsers = Math.max(0, totalUsers - activeSubscriptions);

    let conversionRate = 0;
    try {
      const recentSubs = await prisma.subscription.count({ where: { status: 'ACTIVE', createdAt: { gte: thirtyDaysAgo } } });
      conversionRate = totalUsers > 0 ? Math.round((recentSubs / totalUsers) * 10000) / 100 : 0;
    } catch (e) { /* ignore */ }

    let geminiCostFCFA = 0;
    try {
      const aiMonth = await prisma.dailyAiUsage.aggregate({ _sum: { count: true }, where: { date: { gte: monthStart } } });
      geminiCostFCFA = (aiMonth._sum.count || 0) * 2;
    } catch (e) { /* ignore */ }

    // Charts — signups 30 days
    const recentSignupsRaw = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM users
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Revenue by month (6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const revenueByMonthRaw = await prisma.$queryRaw`
      SELECT TO_CHAR("created_at", 'YYYY-MM') as month, SUM(amount)::int as revenue
      FROM payments
      WHERE "created_at" >= ${sixMonthsAgo} AND status IN ('COMPLETED', 'SUCCESS')
      GROUP BY TO_CHAR("created_at", 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Recent activity
    const recentLogins = await prisma.user.findMany({
      where: { lastLoginAt: { not: null } },
      select: { id: true, firstName: true, lastName: true, email: true, lastLoginAt: true },
      orderBy: { lastLoginAt: 'desc' },
      take: 5
    });

    let recentCompletions = [];
    try {
      recentCompletions = await prisma.lesson_completions.findMany({
        select: {
          id: true, userId: true, lessonId: true, createdAt: true,
          users: { select: { firstName: true, lastName: true, email: true } },
          lessons: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
    } catch (e) { /* ignore */ }

    const recentActivity = [
      ...recentLogins.map(u => ({
        type: 'login', userId: u.id,
        userName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        timestamp: u.lastLoginAt
      })),
      ...recentCompletions.map(c => ({
        type: 'lesson_completed', userId: c.userId,
        userName: `${c.users?.firstName || ''} ${c.users?.lastName || ''}`.trim() || c.users?.email,
        lessonTitle: c.lessons?.title, timestamp: c.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    const result = {
      totalUsers, dau, mau,
      totalXpDistributed, aiCallsToday, duelsThisWeek, top10Users,
      monthlyRevenue, activeSubscriptions, subsByPlan, freeUsers, conversionRate, geminiCostFCFA,
      recentSignups: recentSignupsRaw, revenueByMonth: revenueByMonthRaw, recentActivity
    };

    statsCache = result;
    statsCacheTime = Date.now();
    res.json(result);
  } catch (error) {
    console.error('Admin stats error:', error);
    next(error);
  }
});

// ==================== USERS ====================

router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, status, sortBy } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'admin') {
      where.is_admin = true;
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'name') orderBy = { firstName: 'asc' };
    else if (sortBy === 'email') orderBy = { email: 'asc' };
    else if (sortBy === 'xp') orderBy = { xp: 'desc' };
    else if (sortBy === 'level') orderBy = { level: 'desc' };
    else if (sortBy === 'lastLogin') orderBy = { lastLoginAt: 'desc' };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          phoneNumber: true,
          level: true,
          xp: true,
          streak: true,
          is_admin: true,
          isActive: true,
          suspendedReason: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: { subscriptions: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    next(error);
  }
});

router.patch('/users/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_admin, isActive, suspendedReason } = req.body;

    const updateData = {};
    if (typeof is_admin === 'boolean') updateData.is_admin = is_admin;
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
      if (!isActive && suspendedReason) {
        updateData.suspendedReason = suspendedReason;
      }
      if (isActive) {
        updateData.suspendedReason = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        is_admin: true,
        isActive: true
      }
    });

    await logAdminAction(
      req.user.userId,
      'UPDATE_USER',
      'User',
      id,
      { changes: updateData },
      req.ip
    );

    res.json(updatedUser);
  } catch (error) {
    console.error('Admin update user error:', error);
    next(error);
  }
});

// Assign plan to user (create/update subscription)
router.post('/users/:id/assign-plan', requireAdmin, async (req, res, next) => {
  try {
    var userId = req.params.id;
    var planId = req.body.planId;

    if (!planId) return res.status(400).json({ error: 'planId requis' });

    var plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ error: 'Plan non trouve' });

    // Deactivate existing active subscriptions
    await prisma.subscription.updateMany({
      where: { userId: userId, status: 'ACTIVE' },
      data: { status: 'cancelled', cancelledAt: new Date() }
    });

    // Create new subscription
    var now = new Date();
    var endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (plan.duration || 30));

    var subscription = await prisma.subscription.create({
      data: {
        userId: userId,
        planId: planId,
        status: 'ACTIVE',
        startDate: now,
        endDate: endDate,
        autoRenew: false
      },
      include: { plan: true }
    });

    await logAdminAction(req.user.userId, 'ASSIGN_PLAN', 'Subscription', subscription.id, { userId: userId, planName: plan.name }, req.ip);

    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Admin assign plan error:', error);
    next(error);
  }
});

router.delete('/users/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { email: true, firstName: true, lastName: true }
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete related records in order to avoid FK constraints
    await prisma.$transaction(async (tx) => {
      await tx.flashcardReview.deleteMany({ where: { userId: id } });
      await tx.quizAttempt.deleteMany({ where: { userId: id } });
      await tx.lesson_completions.deleteMany({ where: { userId: id } });
      await tx.exercise_attempts.deleteMany({ where: { userId: id } });
      await tx.discussion_votes.deleteMany({ where: { userId: id } });
      await tx.reply_votes.deleteMany({ where: { userId: id } });
      await tx.forumReply.deleteMany({ where: { userId: id } });
      await tx.forumDiscussion.deleteMany({ where: { userId: id } });
      await tx.coachSession.deleteMany({ where: { userId: id } });
      await tx.user_masteries.deleteMany({ where: { userId: id } });
      await tx.userBadge.deleteMany({ where: { userId: id } });
      await tx.solutions.deleteMany({ where: { userId: id } });
      await tx.problems.deleteMany({ where: { userId: id } });
      await tx.parent_child_links.deleteMany({
        where: { OR: [{ parent_id: id }, { child_id: id }] }
      });
      await tx.payment.deleteMany({ where: { userId: id } });
      await tx.subscription.deleteMany({ where: { userId: id } });
      // Delete admin logs for this user (if they were an admin)
      try {
        await tx.adminLog.deleteMany({ where: { adminId: id } });
      } catch (e) { /* table might not exist yet */ }
      await tx.user.delete({ where: { id } });
    });

    await logAdminAction(
      req.user.userId,
      'DELETE_USER',
      'User',
      id,
      { deletedUser: userToDelete },
      req.ip
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    next(error);
  }
});

// ==================== SUBSCRIPTIONS ====================

router.get('/subscriptions', requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, planId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (planId) where.planId = planId;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          plan: {
            select: {
              id: true,
              name: true,
              displayName: true,
              price: true,
              currency: true,
              duration: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.subscription.count({ where })
    ]);

    res.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get subscriptions error:', error);
    next(error);
  }
});

router.patch('/subscriptions/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, endDate } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (endDate) updateData.endDate = new Date(endDate);

    const updated = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        plan: { select: { id: true, name: true } }
      }
    });

    await logAdminAction(
      req.user.userId,
      'UPDATE_SUBSCRIPTION',
      'Subscription',
      id,
      { changes: updateData },
      req.ip
    );

    res.json(updated);
  } catch (error) {
    console.error('Admin update subscription error:', error);
    next(error);
  }
});

// ==================== PAYMENTS ====================

router.get('/payments', requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, method, startDate, endDate } = req.query;

    const where = {};
    if (status) where.status = status;
    if (method) where.paymentMethod = method;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get payments error:', error);
    next(error);
  }
});

// ==================== CONTENT STATS ====================

router.get('/content/stats', requireAdmin, async (req, res, next) => {
  try {
    let microlessonsCount = 0;
    try {
      microlessonsCount = await prisma.microlessons.count();
    } catch (e) {
      // Table may not exist or be accessible
      microlessonsCount = 0;
    }

    const [
      lessonsCount,
      exercisesCount,
      quizzesCount,
      badgesCount,
      flashcardsCount
    ] = await Promise.all([
      prisma.lessons.count(),
      prisma.exercises.count(),
      prisma.quizzes.count(),
      prisma.badge.count(),
      prisma.flashcard.count()
    ]);

    // Counts by subject
    let countsBySubject = [];
    try {
      const subjects = await prisma.subjects.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              chapters: true,
              exercises: true,
              quizzes: true,
              flashcards: true
            }
          }
        }
      });
      countsBySubject = subjects.map(s => ({
        id: s.id,
        name: s.name,
        chapters: s._count.chapters,
        exercises: s._count.exercises,
        quizzes: s._count.quizzes,
        flashcards: s._count.flashcards
      }));
    } catch (e) {
      // ignore
    }

    res.json({
      microlessonsCount,
      lessonsCount,
      exercisesCount,
      quizzesCount,
      badgesCount,
      flashcardsCount,
      countsBySubject
    });
  } catch (error) {
    console.error('Admin content stats error:', error);
    next(error);
  }
});

// ==================== PLANS ====================

router.get('/plans', requireAdmin, async (req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(plans);
  } catch (error) {
    console.error('Admin get plans error:', error);
    next(error);
  }
});

router.post('/plans', requireAdmin, async (req, res, next) => {
  try {
    const { name, displayName, description, price, currency, duration, features, isActive, interval, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Plan name is required' });
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        displayName: displayName || name,
        description: description || null,
        price: price || 0,
        currency: currency || 'xof',
        duration: duration || 30,
        features: features || null,
        isActive: isActive !== undefined ? isActive : true,
        interval: interval || 'monthly',
        sortOrder: sortOrder || 0
      }
    });

    await logAdminAction(
      req.user.userId,
      'CREATE_PLAN',
      'SubscriptionPlan',
      plan.id,
      { name: plan.name },
      req.ip
    );

    res.status(201).json(plan);
  } catch (error) {
    console.error('Admin create plan error:', error);
    next(error);
  }
});

router.patch('/plans/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, displayName, description, price, currency, duration, features, isActive, interval, sortOrder } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (duration !== undefined) updateData.duration = duration;
    if (features !== undefined) updateData.features = features;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (interval !== undefined) updateData.interval = interval;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: updateData
    });

    await logAdminAction(
      req.user.userId,
      'UPDATE_PLAN',
      'SubscriptionPlan',
      id,
      { changes: updateData },
      req.ip
    );

    res.json(plan);
  } catch (error) {
    console.error('Admin update plan error:', error);
    next(error);
  }
});

router.delete('/plans/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check for active subscriptions
    const activeCount = await prisma.subscription.count({
      where: { planId: id, status: 'ACTIVE' }
    });

    if (activeCount > 0) {
      return res.status(400).json({
        error: `Cannot delete plan with ${activeCount} active subscription(s). Deactivate the plan instead.`
      });
    }

    await prisma.subscriptionPlan.delete({ where: { id } });

    await logAdminAction(
      req.user.userId,
      'DELETE_PLAN',
      'SubscriptionPlan',
      id,
      null,
      req.ip
    );

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Admin delete plan error:', error);
    next(error);
  }
});

// ==================== CREATE STUDENT ====================

router.post('/students', requireAdmin, async (req, res, next) => {
  try {
    const { email, username, password, firstName, lastName, level } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username and password are required' });
    }

    // Check for existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existing) {
      return res.status(409).json({ error: 'A user with this email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        level: level || 1,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        level: true,
        createdAt: true
      }
    });

    await logAdminAction(
      req.user.userId,
      'CREATE_STUDENT',
      'User',
      student.id,
      { email: student.email },
      req.ip
    );

    res.status(201).json(student);
  } catch (error) {
    console.error('Admin create student error:', error);
    next(error);
  }
});

// ==================== NOTIFICATIONS BROADCAST ====================

router.post('/notifications/broadcast', requireAdmin, async (req, res, next) => {
  try {
    const { title, message, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    // Get all active users with notifications enabled
    const users = await prisma.user.findMany({
      where: { isActive: true, notificationsEnabled: true },
      select: { id: true }
    });

    const BATCH = 50;
    let sent = 0;

    for (let i = 0; i < users.length; i += BATCH) {
      const batch = users.slice(i, i + BATCH);
      await Promise.all(batch.map(u =>
        sendNotification(u.id, 'admin_broadcast', title, message, link ? { link } : null)
      ));
      sent += batch.length;
    }

    await logAdminAction(
      req.user.userId,
      'BROADCAST_NOTIFICATION',
      'Notification',
      null,
      { title, recipientCount: sent },
      req.ip
    );

    res.json({ success: true, sent });
  } catch (error) {
    console.error('Admin broadcast error:', error);
    next(error);
  }
});

// ==================== ADMIN LOGS ====================

router.get('/logs', requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        include: {
          admin: { select: { id: true, firstName: true, lastName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.adminLog.count()
    ]);

    res.json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Admin logs error:', error);
    next(error);
  }
});

// ==================== FORUM MODERATION ====================

router.get('/forum/discussions', requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [discussions, total] = await Promise.all([
      prisma.forumDiscussion.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true, email: true } },
          _count: { select: { replies: true, discussion_votes: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.forumDiscussion.count({ where })
    ]);

    res.json({
      discussions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Admin forum discussions error:', error);
    next(error);
  }
});

router.delete('/forum/discussions/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const disc = await prisma.forumDiscussion.findUnique({
      where: { id },
      select: { title: true, userId: true }
    });

    if (!disc) return res.status(404).json({ error: 'Discussion not found' });

    // Cascade: votes + replies (+ reply votes) are cascade-deleted by Prisma
    await prisma.$transaction(async (tx) => {
      await tx.discussion_votes.deleteMany({ where: { discussionId: id } });
      // Delete reply votes first, then replies
      const replyIds = await tx.forumReply.findMany({ where: { discussionId: id }, select: { id: true } });
      if (replyIds.length > 0) {
        await tx.reply_votes.deleteMany({ where: { replyId: { in: replyIds.map(r => r.id) } } });
      }
      await tx.forumReply.deleteMany({ where: { discussionId: id } });
      await tx.forumDiscussion.delete({ where: { id } });
    });

    await logAdminAction(req.user.userId, 'DELETE_DISCUSSION', 'ForumDiscussion', id, { title: disc.title }, req.ip);
    res.json({ message: 'Discussion deleted' });
  } catch (error) {
    console.error('Admin delete discussion error:', error);
    next(error);
  }
});

router.delete('/forum/replies/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const reply = await prisma.forumReply.findUnique({
      where: { id },
      select: { content: true, userId: true, discussionId: true }
    });

    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    await prisma.$transaction(async (tx) => {
      await tx.reply_votes.deleteMany({ where: { replyId: id } });
      await tx.forumReply.delete({ where: { id } });
    });

    await logAdminAction(req.user.userId, 'DELETE_REPLY', 'ForumReply', id, { discussionId: reply.discussionId }, req.ip);
    res.json({ message: 'Reply deleted' });
  } catch (error) {
    console.error('Admin delete reply error:', error);
    next(error);
  }
});

// ==================== COACH SESSIONS ====================

router.get('/coach/conversations', requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.coachConversation.findMany({
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true, email: true } }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.coachConversation.count()
    ]);

    // Add message count without sending full messages
    const formatted = conversations.map(c => ({
      id: c.id,
      userId: c.userId,
      user: c.user,
      title: c.title,
      messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    res.json({
      conversations: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Admin coach conversations error:', error);
    next(error);
  }
});

router.get('/coach/conversations/:id', requireAdmin, async (req, res, next) => {
  try {
    const conv = await prisma.coachConversation.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, username: true, email: true } }
      }
    });

    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conv);
  } catch (error) {
    console.error('Admin get conversation error:', error);
    next(error);
  }
});

module.exports = router;
