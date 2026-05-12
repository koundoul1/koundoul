/**
 * Parent Coach IA — SSE streaming chat with general or contextualized mode.
 * Reuses the same SSE pattern as Coach (student).
 */

var express = require('express');
var router = express.Router();
var { authenticateToken } = require('../middlewares/auth');
var { checkAiQuota } = require('../middlewares/aiQuota');
var prisma = require('../config/database');
var { isConfigured, streamGenerate, GeminiError } = require('../services/geminiService');
var { PARENT_COACH_GENERAL, buildContextualizedPrompt } = require('../prompts/parentCoach');
var { incrementUsage } = require('../services/aiQuotaService');
var { checkChildAlerts } = require('../jobs/parentAlertsJob');

var MAX_HISTORY = 20;

// Helper: get child stats for contextualized mode
async function getChildStats(childId) {
  var child = await prisma.user.findUnique({
    where: { id: childId },
    select: { firstName: true, lastName: true, xp: true, level: true, streak: true, lastLoginAt: true }
  });
  if (!child) return null;

  var now = new Date();
  var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  var lessonsCompleted = 0;
  try { lessonsCompleted = await prisma.microLessonCompletion.count({ where: { userId: childId, completed: true } }); } catch (e) {}

  var quizAvgScore = 0;
  try {
    var quizzes = await prisma.quizAttempt.findMany({ where: { userId: childId, completedAt: { gte: sevenDaysAgo } }, select: { score: true } });
    if (quizzes.length > 0) quizAvgScore = Math.round(quizzes.reduce(function(s, q) { return s + (q.score || 0); }, 0) / quizzes.length);
  } catch (e) {}

  var duelsPlayed = 0, duelsWon = 0;
  try {
    duelsPlayed = await prisma.duel.count({ where: { OR: [{ challengerId: childId }, { opponentId: childId }], status: 'completed' } });
    duelsWon = await prisma.duel.count({ where: { winnerId: childId } });
  } catch (e) {}

  var flashcardsMastered = 0, flashcardsLearning = 0, flashcardsDue = 0;
  try {
    flashcardsMastered = await prisma.flashcardReview.count({ where: { userId: childId, status: 'mastered' } });
    flashcardsLearning = await prisma.flashcardReview.count({ where: { userId: childId, status: 'learning' } });
    flashcardsDue = await prisma.flashcardReview.count({ where: { userId: childId, nextReview: { lte: now } } });
  } catch (e) {}

  var alerts = [];
  try { alerts = await checkChildAlerts(childId); } catch (e) {}

  return {
    firstName: child.firstName,
    xp: child.xp,
    level: child.level,
    streak: child.streak,
    lastLoginAt: child.lastLoginAt,
    lessonsCompleted: lessonsCompleted,
    quizAvgScore: quizAvgScore,
    duelsPlayed: duelsPlayed,
    duelsWon: duelsWon,
    flashcardsMastered: flashcardsMastered,
    flashcardsLearning: flashcardsLearning,
    flashcardsDue: flashcardsDue,
    alerts: alerts
  };
}

// Helper: verify parent-child link
async function isLinked(parentId, childId) {
  var link = await prisma.parent_child_links.findFirst({
    where: { parent_id: parentId, child_id: childId, approved: true }
  });
  if (link) return true;
  var parent = await prisma.user.findUnique({ where: { id: parentId }, select: { invitationCode: true } });
  if (!parent || !parent.invitationCode) return false;
  var child = await prisma.user.findUnique({ where: { id: childId }, select: { parentInvitationCode: true } });
  return child && child.parentInvitationCode === parent.invitationCode;
}

// ── POST /chat — SSE streaming ───────────────────────────────────────

router.post('/chat', authenticateToken, checkAiQuota, async function(req, res) {
  var userId = req.user.userId;
  var message = req.body.message;
  var mode = req.body.mode || 'general';
  var childId = req.body.childId;
  var conversationId = req.body.conversationId;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message requis' });
  }

  if (!isConfigured()) {
    return res.status(503).json({ error: 'Service IA non configure.' });
  }

  // Verify parent is actually a parent
  var user = await prisma.user.findUnique({ where: { id: userId }, select: { isParent: true } });
  if (!user || !user.isParent) {
    return res.status(403).json({ error: 'Acces reserve aux parents' });
  }

  // If contextualized, verify link
  if (mode === 'contextualized') {
    if (!childId) return res.status(400).json({ error: 'childId requis en mode contextualise' });
    var linked = await isLinked(userId, childId);
    if (!linked) return res.status(403).json({ error: 'Enfant non lie a votre compte' });
  }

  // Build system prompt
  var systemPrompt = PARENT_COACH_GENERAL;
  if (mode === 'contextualized' && childId) {
    var childStats = await getChildStats(childId);
    if (childStats) {
      systemPrompt = buildContextualizedPrompt(childStats);
    }
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  var sendEvent = function(event, data) {
    try { res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n'); } catch (e) {}
  };

  var conversation;

  try {
    if (conversationId) {
      conversation = await prisma.coachConversation.findUnique({ where: { id: conversationId } });
      if (!conversation || conversation.userId !== userId) {
        sendEvent('error', { message: 'Conversation non trouvee' });
        res.end();
        return;
      }
    } else {
      var title = message.trim().length > 50 ? message.trim().slice(0, 50) + '...' : message.trim();
      conversation = await prisma.coachConversation.create({
        data: { userId: userId, title: '[Parent] ' + title, messages: [] }
      });
    }
  } catch (err) {
    sendEvent('error', { message: 'Erreur de session' });
    res.end();
    return;
  }

  var userMsg = { role: 'user', content: message.trim(), createdAt: new Date().toISOString() };
  var allMessages = [].concat(conversation.messages || [], [userMsg]);

  try {
    await prisma.coachConversation.update({ where: { id: conversation.id }, data: { messages: allMessages } });
  } catch (err) {}

  sendEvent('meta', { conversationId: conversation.id, status: 'streaming' });

  try {
    var recentMessages = allMessages.slice(-MAX_HISTORY);
    var history = recentMessages.slice(0, -1).map(function(m) {
      return { role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] };
    });
    var userPrompt = recentMessages[recentMessages.length - 1].content;

    var fullText = '';
    for await (var chunk of streamGenerate({
      role: 'coach',
      systemInstruction: systemPrompt,
      userPrompt: userPrompt,
      history: history,
      generationConfig: { temperature: 0.6, maxOutputTokens: 2048 }
    })) {
      fullText += chunk;
      sendEvent('chunk', { text: chunk });
    }

    var assistantMsg = { role: 'assistant', content: fullText, createdAt: new Date().toISOString() };
    var updatedMessages = [].concat(allMessages, [assistantMsg]);

    try {
      await prisma.coachConversation.update({ where: { id: conversation.id }, data: { messages: updatedMessages } });
    } catch (err) {}

    try { await incrementUsage(userId); } catch (e) {}

    sendEvent('done', { conversationId: conversation.id, status: 'completed' });
  } catch (err) {
    var errMsg = err instanceof GeminiError ? err.message : 'Erreur. Reessayez.';
    sendEvent('error', { message: errMsg });
  } finally {
    res.end();
  }
});

// ── GET /conversations — parent conversations ────────────────────────

router.get('/conversations', authenticateToken, async function(req, res, next) {
  try {
    var userId = req.user.userId;
    var limit = parseInt(req.query.limit) || 20;

    var conversations = await prisma.coachConversation.findMany({
      where: { userId: userId, title: { startsWith: '[Parent]' } },
      select: { id: true, title: true, messages: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });

    var formatted = conversations.map(function(c) {
      return {
        id: c.id,
        title: c.title.replace('[Parent] ', ''),
        messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /conversations/:id ────────────────────────────────────────

router.delete('/conversations/:id', authenticateToken, async function(req, res, next) {
  try {
    var conv = await prisma.coachConversation.findUnique({ where: { id: req.params.id } });
    if (!conv || conv.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Non autorise' });
    }
    await prisma.coachConversation.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
