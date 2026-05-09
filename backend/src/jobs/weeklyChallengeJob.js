/**
 * Weekly Challenge Job — generates 3 challenges every Monday 00:00 UTC.
 * One per subject (Maths/Physique/Chimie), each with a different difficulty.
 * Also runs at startup as catch-up if challenges are missing for this week.
 */

const cron = require('node-cron');
const prisma = require('../config/database');
const { sendNotification } = require('../utils/notificationService');

// Difficulty config: XP rewards + labels
const DIFFICULTIES = [
  { level: 1, label: 'Facile', xpReward: 50 },
  { level: 2, label: 'Moyen', xpReward: 100 },
  { level: 3, label: 'Difficile', xpReward: 200 }
];

const SUBJECTS = ['Mathématiques', 'Physique', 'Chimie'];

/**
 * Get Monday 00:00 UTC and Sunday 23:59:59 UTC for the current week.
 */
function getCurrentWeekWindow() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday, 0, 0, 0, 0));
  const sunday = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6, 23, 59, 59, 999));

  return { monday, sunday };
}

/**
 * Pull random QCM questions for a subject + difficulty.
 * Falls back to adjacent difficulties if not enough questions.
 */
async function pullQuestions(subject, difficultyLevel, count = 5) {
  // Find banks for this subject
  const banks = await prisma.questionBank.findMany({
    where: { subject: { contains: subject, mode: 'insensitive' }, is_active: true },
    select: { id: true }
  });
  const bankIds = banks.map(b => b.id);

  if (bankIds.length === 0) {
    console.warn(`[WeeklyChallenge] No question banks for subject "${subject}"`);
    return [];
  }

  // Try exact difficulty, then ±1
  for (const diff of [difficultyLevel, difficultyLevel + 1, difficultyLevel - 1]) {
    if (diff < 1 || diff > 4) continue;
    const questions = await prisma.qcm_questions.findMany({
      where: { bank_id: { in: bankIds }, difficulty: diff },
      take: count * 3 // overfetch for randomization
    });
    if (questions.length >= count) {
      // Shuffle and take
      const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, count);
      return shuffled.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        points: q.points || 10,
        time_limit_seconds: q.time_limit_seconds || 60
      }));
    }
  }

  console.warn(`[WeeklyChallenge] Not enough QCM for "${subject}" at difficulty ~${difficultyLevel}`);
  return [];
}

/**
 * Generate 3 weekly challenges. Idempotent — skips if 3 already exist this week.
 * @param {boolean} isStartupCatchup - if true, skip mass notifications
 */
async function generateWeeklyChallenges(isStartupCatchup = false) {
  const { monday, sunday } = getCurrentWeekWindow();

  // Idempotence: check existing challenges this week
  const existing = await prisma.challenge.count({
    where: {
      status: 'active',
      startDate: { gte: monday },
      endDate: { lte: new Date(sunday.getTime() + 1000) } // small margin
    }
  });

  if (existing >= 3) {
    console.log('[WeeklyChallenge] 3 challenges already exist this week, skipping.');
    return 0;
  }

  // Rotate difficulties across subjects using week number for variety
  const weekNum = Math.floor((monday.getTime() / 604800000)) % 6;
  const permutations = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]
  ];
  const diffOrder = permutations[weekNum];

  let created = 0;

  for (let i = 0; i < SUBJECTS.length; i++) {
    const subject = SUBJECTS[i];
    const diff = DIFFICULTIES[diffOrder[i]];

    const questions = await pullQuestions(subject, diff.level, 5);
    if (questions.length < 3) {
      console.warn(`[WeeklyChallenge] Skipping "${subject}" — only ${questions.length} questions found.`);
      continue;
    }

    await prisma.challenge.create({
      data: {
        title: `Challenge ${subject} — ${diff.label}`,
        description: `Challenge hebdomadaire de ${subject.toLowerCase()} (${diff.label}). ${questions.length} questions en 20 minutes.`,
        subject,
        difficulty: diff.label,
        timeLimit: 20,
        questions,
        status: 'active',
        xpReward: diff.xpReward,
        prize: `${diff.xpReward} XP`,
        startDate: monday,
        endDate: sunday
      }
    });

    created++;
    console.log(`✅ Challenge créé: ${subject} (${diff.label}, ${diff.xpReward} XP)`);
  }

  // Send notifications (skip on startup catch-up if week is >24h old)
  if (created > 0 && !isStartupCatchup) {
    notifyAllUsers().catch(err => console.error('[WeeklyChallenge] Notification error:', err.message));
  }

  console.log(`[WeeklyChallenge] ${created} challenge(s) créé(s) pour la semaine ${monday.toISOString().slice(0, 10)}.`);
  return created;
}

/**
 * Notify all active users about new challenges (batched by 50).
 */
async function notifyAllUsers() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true }
  });

  const BATCH = 50;
  for (let i = 0; i < users.length; i += BATCH) {
    const batch = users.slice(i, i + BATCH);
    await Promise.all(batch.map(u =>
      sendNotification(
        u.id,
        'challenge_start',
        'Nouveaux challenges hebdomadaires !',
        '3 nouveaux challenges sont disponibles cette semaine. Maths, Physique, Chimie. À toi de jouer !',
        { link: '/challenge' }
      )
    ));
  }

  console.log(`[WeeklyChallenge] ${users.length} utilisateur(s) notifié(s).`);
}

/**
 * Schedule cron + run startup catch-up.
 */
function setupWeeklyChallengeJob() {
  // Cron: every Monday at 00:00 UTC
  cron.schedule('0 0 * * 1', () => {
    console.log('[Cron] Monday 00:00 UTC — generating weekly challenges...');
    generateWeeklyChallenges(false).catch(err => console.error('[Cron] Error:', err.message));
  }, { timezone: 'UTC' });

  console.log('⏰ Weekly challenge cron scheduled (Monday 00:00 UTC)');

  // Startup catch-up: generate if missing this week
  const { monday } = getCurrentWeekWindow();
  const hoursSinceMonday = (Date.now() - monday.getTime()) / 3600000;
  const isLate = hoursSinceMonday > 24;

  generateWeeklyChallenges(isLate).catch(err => console.error('[WeeklyChallenge] Catch-up error:', err.message));
}

module.exports = { generateWeeklyChallenges, setupWeeklyChallengeJob, getCurrentWeekWindow };
