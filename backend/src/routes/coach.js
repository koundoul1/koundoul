const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { checkAiQuota } = require('../middlewares/aiQuota');
const prisma = require('../config/database');
const { isConfigured, streamGenerate, GeminiError } = require('../services/geminiService');
const { COACH_SYSTEM_PROMPT } = require('../prompts/coach');
const { incrementUsage } = require('../services/aiQuotaService');

// Max messages sent to Gemini as conversation history
const MAX_HISTORY_MESSAGES = 20;

// ── POST /chat — SSE streaming conversational endpoint ──────────────

router.post('/chat', authenticateToken, checkAiQuota, async (req, res) => {
  const userId = req.user.userId;
  const { message, conversationId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message requis' });
  }

  if (!isConfigured()) {
    return res.status(503).json({ error: 'Service IA non configuré. Contactez l\'administrateur.' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch {}
  };

  let conversation;

  try {
    if (conversationId) {
      // Load existing conversation
      conversation = await prisma.coachConversation.findUnique({
        where: { id: conversationId }
      });
      if (!conversation || conversation.userId !== userId) {
        sendEvent('error', { message: 'Conversation non trouvée' });
        res.end();
        return;
      }
    } else {
      // Create new conversation — title = first 50 chars of first message
      const title = message.trim().length > 50
        ? message.trim().slice(0, 50) + '...'
        : message.trim();
      conversation = await prisma.coachConversation.create({
        data: {
          userId,
          title,
          messages: []
        }
      });
    }
  } catch (err) {
    console.error('[Coach] Conversation load/create error:', err.message);
    sendEvent('error', { message: 'Erreur de session' });
    res.end();
    return;
  }

  // Append user message
  const userMessage = { role: 'user', content: message.trim(), createdAt: new Date().toISOString() };
  const allMessages = [...(conversation.messages || []), userMessage];

  // Persist user message immediately
  try {
    await prisma.coachConversation.update({
      where: { id: conversation.id },
      data: { messages: allMessages }
    });
  } catch (err) {
    console.error('[Coach] Message persist error:', err.message);
  }

  sendEvent('meta', { conversationId: conversation.id, status: 'streaming' });

  try {
    // Build Gemini history from last N messages (excluding the new one which becomes userPrompt)
    const recentMessages = allMessages.slice(-MAX_HISTORY_MESSAGES);
    const history = recentMessages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    const userPrompt = recentMessages[recentMessages.length - 1].content;

    // Stream the response
    let fullText = '';
    for await (const chunk of streamGenerate({
      role: 'coach',
      systemInstruction: COACH_SYSTEM_PROMPT,
      userPrompt,
      history,
      generationConfig: { temperature: 0.6, maxOutputTokens: 2048 }
    })) {
      fullText += chunk;
      sendEvent('chunk', { text: chunk });
    }

    // Persist assistant response
    const assistantMessage = { role: 'assistant', content: fullText, createdAt: new Date().toISOString() };
    const updatedMessages = [...allMessages, assistantMessage];

    try {
      await prisma.coachConversation.update({
        where: { id: conversation.id },
        data: { messages: updatedMessages }
      });
    } catch (err) {
      console.error('[Coach] Assistant message persist error:', err.message);
    }

    // Increment AI quota counter after successful completion
    try { await incrementUsage(userId); } catch (e) { console.warn('[Coach] incrementUsage error:', e.message); }

    sendEvent('done', { conversationId: conversation.id, status: 'completed' });
  } catch (err) {
    console.error('[Coach] Stream error:', err.message);
    const errMsg = err instanceof GeminiError
      ? err.message
      : 'Erreur lors de la réponse. Réessayez.';
    sendEvent('error', { message: errMsg });
  } finally {
    res.end();
  }
});

// ── GET /conversations — list user conversations ────────────────────

router.get('/conversations', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const take = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = Math.max(parseInt(req.query.offset) || 0, 0);

    const [conversations, total] = await Promise.all([
      prisma.coachConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take,
        skip,
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          messages: true
        }
      }),
      prisma.coachConversation.count({ where: { userId } })
    ]);

    // Return lightweight entries (message count, no full content)
    const data = conversations.map(c => ({
      id: c.id,
      title: c.title,
      messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
      lastMessageAt: c.updatedAt,
      createdAt: c.createdAt
    }));

    res.json({ success: true, data, total });
  } catch (error) {
    next(error);
  }
});

// ── GET /conversations/:id — full conversation with messages ────────

router.get('/conversations/:id', authenticateToken, async (req, res, next) => {
  try {
    const conversation = await prisma.coachConversation.findUnique({
      where: { id: req.params.id }
    });

    if (!conversation || conversation.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    res.json({
      success: true,
      data: {
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages || [],
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /conversations/:id — hard delete ─────────────────────────

router.delete('/conversations/:id', authenticateToken, async (req, res, next) => {
  try {
    const conversation = await prisma.coachConversation.findUnique({
      where: { id: req.params.id }
    });

    if (!conversation || conversation.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    await prisma.coachConversation.delete({ where: { id: req.params.id } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
