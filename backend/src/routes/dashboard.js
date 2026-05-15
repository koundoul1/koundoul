const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');
const { getSupabase, isSupabaseConfigured } = require('../config/supabase');
const { updateStreak, calculateLevel, XP_PER_LEVEL } = require('../services/gamification');

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // 1. User profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        username: true, xp: true, level: true, streak: true,
        lastStreakDate: true, createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const xp = user.xp || 0;
    const calculatedLevel = calculateLevel(xp);
    const xpInCurrentLevel = xp % XP_PER_LEVEL;
    const xpForNextLevel = XP_PER_LEVEL;

    // 2. Streak — delegate to gamification service (UTC-based)
    const streakResult = await updateStreak(userId);
    const streak = streakResult.newStreak;

    // Update level if needed
    if (calculatedLevel > (user.level || 1)) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: calculatedLevel }
      });
    }

    // 3. Parallel queries for all stats
    const [
      lessonsCompleted,
      lessonCompletions,
      quizCount,
      quizAvg,
      recentLessons,
      userBadges,
      allBadgesCount,
      totalLessonsAvailable
    ] = await Promise.all([
      // Total lessons completed
      prisma.microLessonCompletion.count({
        where: { userId, completed: true }
      }),
      // All completions with lessonId for subject breakdown
      prisma.microLessonCompletion.findMany({
        where: { userId, completed: true },
        select: { lessonId: true, score: true, timeSpent: true, completedAt: true }
      }),
      // Quiz count
      prisma.quizAttempt.count({
        where: { userId, completedAt: { not: null } }
      }),
      // Quiz avg score
      prisma.quizAttempt.aggregate({
        where: { userId, completedAt: { not: null } },
        _avg: { score: true }
      }),
      // Recent 5 lesson completions
      prisma.microLessonCompletion.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: { lessonId: true, completed: true, score: true, completedAt: true }
      }),
      // User badges
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { unlockedAt: 'desc' }
      }),
      // Total badges
      prisma.badge.count({ where: { isActive: true } }),
      // We'll get total from Supabase below
      Promise.resolve(395)
    ]);

    // 4. Subject breakdown via Supabase
    let subjectStats = {
      'Mathématiques': { completed: 0, total: 0 },
      'Physique': { completed: 0, total: 0 },
      'Chimie': { completed: 0, total: 0 }
    };

    if (isSupabaseConfigured() && lessonCompletions.length > 0) {
      const supabase = getSupabase();
      if (supabase) {
        const completedIds = lessonCompletions.map(c => c.lessonId);

        // Get subject for completed lessons
        const { data: completedLessons } = await supabase
          .from('microlessons')
          .select('id, subject')
          .in('id', completedIds);

        if (completedLessons) {
          for (const lesson of completedLessons) {
            if (subjectStats[lesson.subject]) {
              subjectStats[lesson.subject].completed++;
            }
          }
        }

        // Get totals per subject
        for (const subject of ['Mathématiques', 'Physique', 'Chimie']) {
          const { count } = await supabase
            .from('microlessons')
            .select('id', { count: 'exact', head: true })
            .eq('subject', subject);
          if (count !== null) {
            subjectStats[subject].total = count;
          }
        }
      }
    } else if (isSupabaseConfigured()) {
      // No completions yet, just get totals
      const supabase = getSupabase();
      if (supabase) {
        for (const subject of ['Mathématiques', 'Physique', 'Chimie']) {
          const { count } = await supabase
            .from('microlessons')
            .select('id', { count: 'exact', head: true })
            .eq('subject', subject);
          if (count !== null) {
            subjectStats[subject].total = count;
          }
        }
      }
    }

    // 5. Estimated study time (minutes)
    const totalTimeSpent = lessonCompletions.reduce((sum, c) => sum + (c.timeSpent || 10), 0);

    // 6. Average success rate
    const lessonScores = lessonCompletions.filter(c => c.score !== null).map(c => c.score);
    const quizAvgScore = quizAvg._avg.score ? Math.round(quizAvg._avg.score) : null;
    const lessonAvgScore = lessonScores.length > 0
      ? Math.round(lessonScores.reduce((a, b) => a + b, 0) / lessonScores.length)
      : null;
    const averageScore = lessonAvgScore || quizAvgScore || 0;

    // 7. Recent activity — enrich with Supabase lesson titles
    let recentActivity = [];
    if (recentLessons.length > 0 && isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        const ids = recentLessons.map(l => l.lessonId);
        const { data: lessonDetails } = await supabase
          .from('microlessons')
          .select('id, title, subject')
          .in('id', ids);

        const detailMap = {};
        if (lessonDetails) {
          for (const d of lessonDetails) detailMap[d.id] = d;
        }

        recentActivity = recentLessons.map(l => {
          const detail = detailMap[l.lessonId];
          return {
            lessonId: l.lessonId,
            title: detail?.title || `Leçon ${l.lessonId}`,
            subject: detail?.subject || 'Inconnu',
            completed: l.completed,
            score: l.score,
            completedAt: l.completedAt
          };
        });
      }
    }

    // 8. Badges
    const recentBadges = userBadges.slice(0, 3).map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      icon: ub.badge.icon,
      description: ub.badge.description,
      unlockedAt: ub.unlockedAt
    }));

    // Next badge to unlock
    const unlockedIds = new Set(userBadges.map(ub => ub.badgeId));
    const nextBadge = await prisma.badge.findFirst({
      where: {
        isActive: true,
        id: { notIn: [...unlockedIds] }
      },
      orderBy: { points: 'asc' }
    });

    let nextBadgeProgress = null;
    if (nextBadge) {
      const condition = nextBadge.condition;
      let current = 0;
      let target = 1;

      if (condition.startsWith('complete_lesson:')) {
        target = parseInt(condition.split(':')[1]);
        current = lessonsCompleted;
      } else if (condition.startsWith('streak:')) {
        target = parseInt(condition.split(':')[1]);
        current = streak;
      } else if (condition.startsWith('complete_quiz:')) {
        target = parseInt(condition.split(':')[1]);
        current = quizCount;
      }

      nextBadgeProgress = {
        id: nextBadge.id,
        name: nextBadge.name,
        icon: nextBadge.icon,
        description: nextBadge.description,
        points: nextBadge.points,
        current: Math.min(current, target),
        target
      };
    }

    // 9. Recommendations
    let recommendations = [];
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        const completedIds = lessonCompletions.map(c => c.lessonId);

        if (completedIds.length === 0) {
          // New student: suggest beginner lessons
          const { data } = await supabase
            .from('microlessons')
            .select('id, title, subject, level, difficulty')
            .eq('difficulty', 1)
            .order('id', { ascending: true })
            .limit(3);
          if (data) {
            recommendations = data.map(l => ({
              lessonId: l.id,
              title: l.title,
              subject: l.subject,
              level: l.level,
              reason: 'beginner'
            }));
          }
        } else {
          // Find the last completed subject and suggest next lessons in it
          const lastSubject = recentActivity[0]?.subject || 'Mathématiques';
          const { data } = await supabase
            .from('microlessons')
            .select('id, title, subject, level, difficulty')
            .eq('subject', lastSubject)
            .not('id', 'in', `(${completedIds.join(',')})`)
            .order('difficulty', { ascending: true })
            .limit(3);
          if (data && data.length > 0) {
            recommendations = data.map(l => ({
              lessonId: l.id,
              title: l.title,
              subject: l.subject,
              level: l.level,
              reason: 'continue'
            }));
          } else {
            // Suggest from other subjects
            const { data: other } = await supabase
              .from('microlessons')
              .select('id, title, subject, level, difficulty')
              .not('id', 'in', `(${completedIds.join(',')})`)
              .order('difficulty', { ascending: true })
              .limit(3);
            if (other) {
              recommendations = other.map(l => ({
                lessonId: l.id,
                title: l.title,
                subject: l.subject,
                level: l.level,
                reason: 'explore'
              }));
            }
          }
        }
      }
    }

    // 10. Mastery level per subject
    const getMasteryLabel = (completed, total) => {
      if (total === 0) return 'none';
      const pct = (completed / total) * 100;
      if (pct >= 60) return 'advanced';
      if (pct >= 25) return 'intermediate';
      if (pct > 0) return 'beginner';
      return 'none';
    };

    const subjectProgress = Object.entries(subjectStats).map(([name, s]) => ({
      name,
      completed: s.completed,
      total: s.total,
      percentage: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
      mastery: getMasteryLabel(s.completed, s.total)
    }));

    // Build response
    const dashboard = {
      profile: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        xp,
        level: calculatedLevel,
        xpInCurrentLevel,
        xpForNextLevel,
        streak
      },
      stats: {
        lessonsCompleted,
        totalLessons: subjectProgress.reduce((s, p) => s + p.total, 0),
        exercisesCompleted: quizCount,
        totalStudyTimeMinutes: totalTimeSpent,
        averageScore,
        streak
      },
      subjectProgress,
      badges: {
        total: allBadgesCount,
        unlocked: userBadges.length,
        recent: recentBadges,
        next: nextBadgeProgress
      },
      recentActivity,
      recommendations
    };

    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
});

// GET /activity?days=7 — Aggregated activity per day for the 7-day grid
router.get('/activity', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const [lessonRows, quizRows] = await Promise.all([
      prisma.microLessonCompletion.findMany({
        where: { userId, completed: true, completedAt: { gte: since } },
        select: { completedAt: true }
      }),
      prisma.quizAttempt.findMany({
        where: { userId, completedAt: { gte: since, not: null } },
        select: { completedAt: true }
      })
    ]);

    // Bucket by UTC date string
    const buckets = {};
    for (let d = 0; d < days; d++) {
      const dt = new Date(since);
      dt.setUTCDate(dt.getUTCDate() + d);
      buckets[dt.toISOString().slice(0, 10)] = 0;
    }

    for (const row of [...lessonRows, ...quizRows]) {
      if (row.completedAt) {
        const key = new Date(row.completedAt).toISOString().slice(0, 10);
        if (key in buckets) buckets[key]++;
      }
    }

    const activity = Object.entries(buckets).map(([date, count]) => ({ date, count }));
    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
});

// ── GET /advanced-stats — premium only stats ─────────────────────────

router.get('/advanced-stats', authenticateToken, async (req, res, next) => {
  try {
    var userId = req.user.userId;

    // Check if user has active subscription (premium)
    var now = new Date();
    var activeSub = await prisma.subscription.findFirst({
      where: { userId: userId, status: { in: ['ACTIVE', 'active'] }, endDate: { gte: now } },
      include: { plan: true }
    });

    var isPremium = !!activeSub;

    if (!isPremium) {
      return res.json({
        success: true,
        data: { locked: true, message: 'Abonnez-vous pour voir les statistiques avancees' }
      });
    }

    var thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Daily activity for 30 days (progression chart)
    var dailyActivity = [];
    try {
      dailyActivity = await prisma.$queryRaw`
        SELECT DATE("completedAt") as date, COUNT(*)::int as count,
               AVG(score)::int as "avgScore"
        FROM microlesson_completions
        WHERE "userId" = ${userId} AND "completedAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("completedAt")
        ORDER BY date ASC
      `;
    } catch (e) { /* ignore */ }

    // 2. Quiz scores over time
    var quizHistory = [];
    try {
      quizHistory = await prisma.$queryRaw`
        SELECT DATE("completedAt") as date, COUNT(*)::int as count,
               AVG(score)::int as "avgScore"
        FROM quiz_attempts
        WHERE "userId" = ${userId} AND "completedAt" >= ${thirtyDaysAgo}
              AND "completedAt" IS NOT NULL
        GROUP BY DATE("completedAt")
        ORDER BY date ASC
      `;
    } catch (e) { /* ignore */ }

    // 3. XP by subject (via lesson completions + microlessons)
    var xpBySubject = [];
    try {
      xpBySubject = await prisma.$queryRaw`
        SELECT s.name as subject, COUNT(mc.id)::int as "lessonsCompleted",
               AVG(mc.score)::int as "avgScore",
               COUNT(mc.id)::int * 50 as "estimatedXp"
        FROM microlesson_completions mc
        JOIN microlessons m ON m.id = mc."lessonId"
        JOIN chapters c ON c.id = m."chapterId"
        JOIN subjects s ON s.id = c."subjectId"
        WHERE mc."userId" = ${userId} AND mc.completed = true
        GROUP BY s.name
        ORDER BY "estimatedXp" DESC
      `;
    } catch (e) { /* ignore */ }

    // 4. Study time by week (last 4 weeks)
    var weeklyStudyTime = [];
    try {
      weeklyStudyTime = await prisma.$queryRaw`
        SELECT DATE_TRUNC('week', "completedAt") as week,
               COUNT(*)::int as activities,
               SUM(COALESCE("timeSpent", 10))::int as "totalMinutes"
        FROM microlesson_completions
        WHERE "userId" = ${userId} AND "completedAt" >= ${thirtyDaysAgo}
        GROUP BY DATE_TRUNC('week', "completedAt")
        ORDER BY week ASC
      `;
    } catch (e) { /* ignore */ }

    // 5. Flashcard mastery breakdown
    var flashcardStats = { mastered: 0, learning: 0, newCards: 0 };
    try {
      var fc = await Promise.all([
        prisma.flashcardReview.count({ where: { userId: userId, status: 'mastered' } }),
        prisma.flashcardReview.count({ where: { userId: userId, status: 'learning' } }),
        prisma.flashcardReview.count({ where: { userId: userId, status: 'new' } })
      ]);
      flashcardStats = { mastered: fc[0], learning: fc[1], newCards: fc[2] };
    } catch (e) { /* ignore */ }

    // 6. AI usage this month
    var aiUsageMonth = 0;
    try {
      var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      var aiAgg = await prisma.dailyAiUsage.aggregate({
        _sum: { count: true },
        where: { userId: userId, date: { gte: monthStart } }
      });
      aiUsageMonth = aiAgg._sum.count || 0;
    } catch (e) { /* ignore */ }

    res.json({
      success: true,
      data: {
        locked: false,
        plan: activeSub.plan.displayName || activeSub.plan.name,
        dailyActivity: dailyActivity,
        quizHistory: quizHistory,
        xpBySubject: xpBySubject,
        weeklyStudyTime: weeklyStudyTime,
        flashcardStats: flashcardStats,
        aiUsageMonth: aiUsageMonth
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
