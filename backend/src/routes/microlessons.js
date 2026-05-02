const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
const { getSupabase, isSupabaseConfigured } = require('../config/supabase');
const { filterStatic, getStaticById } = require('../data/microLessonsFallback');
const prisma = require('../config/database');
const { processAction } = require('../services/gamification');
const TABLE_MICRO_LESSONS = 'microlessons';

console.log('[microlessons] SUPABASE_URL:', !!process.env.SUPABASE_URL);
console.log('[microlessons] SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('[microlessons] SUPABASE_ANON_KEY:', !!process.env.SUPABASE_ANON_KEY);
console.log('[microlessons] isSupabaseConfigured():', isSupabaseConfigured());

if (!isSupabaseConfigured()) {
  console.warn('[microlessons] ⚠️ SUPABASE_URL/SUPABASE_ANON_KEY not set — using static fallback (3 lessons only)');
}

function mapSupabaseRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    chapter: row.chapter,
    level: row.level,
    difficulty: row.difficulty ?? 1,
    duration_min: row.duration_min ?? 10,
    xp_reward: row.xp_reward ?? 50,
    content_sections: row.content_sections ?? []
  };
}

// Get all micro-lessons (Supabase en priorité, fallback statique)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { subject, level, limit = 1000, offset = 0 } = req.query;
    const userId = req.user?.userId;
    const limitNum = Math.min(Number(limit) || 1000, 1000);
    const offsetNum = Math.max(0, Number(offset) || 0);

    let paginatedLessons = [];

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          let query = supabase
            .from(TABLE_MICRO_LESSONS)
            .select('id, title, subject, chapter, level, difficulty, duration_min, xp_reward, content_sections');
          if (subject && subject !== 'all') query = query.eq('subject', subject);
          if (level && level !== 'all') query = query.eq('level', level);
          const { data, error } = await query
            .order('id', { ascending: true })
            .range(offsetNum, offsetNum + limitNum - 1);

          if (error) {
            console.error('[microlessons] Supabase query error:', error.message);
          } else if (!data || data.length === 0) {
            console.warn('[microlessons] Supabase returned empty data for filters:', { subject, level });
          } else {
            paginatedLessons = data.map(mapSupabaseRow);
          }
        } catch (err) {
          console.warn('[microlessons] Supabase list error, using fallback:', err.message);
        }
      }
    }

    if (paginatedLessons.length === 0) {
      const filtered = filterStatic(subject, level);
      paginatedLessons = filtered.slice(offsetNum, offsetNum + limitNum);
    }

    let completions = {};
    if (userId) {
      const userCompletions = await prisma.microLessonCompletion.findMany({
        where: { userId },
        select: {
          lessonId: true,
          completed: true,
          score: true,
          timeSpent: true
        }
      });
      completions = userCompletions.reduce((acc, comp) => {
        acc[comp.lessonId] = {
          completed: comp.completed,
          score: comp.score,
          timeSpent: comp.timeSpent
        };
        return acc;
      }, {});
    }

    res.json({ success: true, data: paginatedLessons, completions });
  } catch (error) {
    next(error);
  }
});

// Get micro-lesson by ID (Supabase en priorité, fallback statique)
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    let lesson = null;

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from(TABLE_MICRO_LESSONS)
            .select('id, title, subject, chapter, level, difficulty, duration_min, xp_reward, content_sections')
            .eq('id', id)
            .maybeSingle();

          if (!error && data) {
            lesson = mapSupabaseRow(data);
          }
        } catch (err) {
          console.warn('[microlessons] Supabase get error, using fallback:', err.message);
        }
      }
    }

    if (!lesson) {
      lesson = getStaticById(id);
    }

    let completion = null;
    if (userId) {
      completion = await prisma.microLessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId: id
          }
        }
      });
    }

    res.json({ success: true, data: lesson, completion });
  } catch (error) {
    next(error);
  }
});

// Complete micro-lesson
router.post('/:id/complete', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timeSpent, score } = req.body;
    const userId = req.user.userId;

    // Check if already completed — prevent XP duplication
    const existing = await prisma.microLessonCompletion.findUnique({
      where: { userId_lessonId: { userId, lessonId: id } }
    });

    if (existing && existing.completed) {
      return res.json({
        success: true,
        data: existing,
        alreadyCompleted: true,
        xpEarned: 0,
        gamification: null
      });
    }

    let xpEarned = 50;
    if (score !== undefined) {
      xpEarned = 50 + Math.round((score / 100) * 50);
    }

    const completion = await prisma.microLessonCompletion.upsert({
      where: {
        userId_lessonId: { userId, lessonId: id }
      },
      update: {
        completed: true,
        score: score || null,
        timeSpent: timeSpent || 0,
        completedAt: new Date()
      },
      create: {
        userId,
        lessonId: id,
        completed: true,
        score: score || null,
        timeSpent: timeSpent || 0,
        completedAt: new Date()
      }
    });

    const gamification = await processAction(userId, { type: 'complete_lesson', xp: xpEarned });

    res.json({
      success: true,
      data: completion,
      alreadyCompleted: false,
      xpEarned,
      gamification
    });
  } catch (error) {
    next(error);
  }
});

// Get completion status
router.get('/:id/completion', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const completion = await prisma.microLessonCompletion.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: id
        }
      }
    });

    const result = {
      completed: completion?.completed || false,
      score: completion?.score || null,
      timeSpent: completion?.timeSpent || 0
    };

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get stats
router.get('/stats/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [totalCompleted, avgScore] = await Promise.all([
      prisma.microLessonCompletion.count({
        where: { userId, completed: true }
      }),
      prisma.microLessonCompletion.aggregate({
        where: { userId, completed: true, score: { not: null } },
        _avg: { score: true }
      })
    ]);

    // Estimer l'XP gagné (50 XP par micro-leçon complétée)
    const estimatedXp = totalCompleted * 50;

    res.json({
      success: true,
      data: {
        total_completed: totalCompleted,
        total_xp_earned: estimatedXp,
        average_score: avgScore._avg.score ? Math.round(avgScore._avg.score) : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get next lesson in the same chapter (by id order), fallback to next chapter
router.get('/:id/next', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured()) {
      return res.json({ success: true, data: null });
    }

    const supabase = getSupabase();
    if (!supabase) return res.json({ success: true, data: null });

    // Get current lesson
    const { data: current } = await supabase
      .from(TABLE_MICRO_LESSONS)
      .select('id, subject, chapter, level')
      .eq('id', id)
      .maybeSingle();

    if (!current) return res.json({ success: true, data: null });

    // Next lesson in same chapter (id > current, same subject+chapter)
    const { data: nextInChapter } = await supabase
      .from(TABLE_MICRO_LESSONS)
      .select('id, title, subject, chapter, level, difficulty, xp_reward')
      .eq('subject', current.subject)
      .eq('chapter', current.chapter)
      .gt('id', id)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextInChapter) {
      return res.json({ success: true, data: nextInChapter });
    }

    // Fallback: first lesson of the next chapter in same subject+level
    const { data: nextInSubject } = await supabase
      .from(TABLE_MICRO_LESSONS)
      .select('id, title, subject, chapter, level, difficulty, xp_reward')
      .eq('subject', current.subject)
      .eq('level', current.level)
      .gt('chapter', current.chapter)
      .order('chapter', { ascending: true })
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    res.json({ success: true, data: nextInSubject || null });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
