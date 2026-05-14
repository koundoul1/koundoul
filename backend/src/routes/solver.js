const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { checkAiQuota } = require('../middlewares/aiQuota');
const prisma = require('../config/database');
const { isConfigured, streamGenerate, GeminiError } = require('../services/geminiService');
const { SOLVER_SYSTEM_PROMPT } = require('../prompts/solver');
const { incrementUsage } = require('../services/aiQuotaService');
const { getUserPlanInfo } = require('../middlewares/premiumCheck');

// ── POST /extract-from-image — extract problem text from photo ───────

router.post('/extract-from-image', authenticateToken, async (req, res, next) => {
  try {
    var userId = req.user.userId;
    var imageData = req.body.image; // base64 string
    if (!imageData) {
      return res.status(400).json({ error: 'Image requise (base64)' });
    }

    // Free users: max 1 photo extraction/day
    var planInfo = await getUserPlanInfo(userId);
    if (!planInfo.isPremium) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var todayExtracts = await prisma.solverHistory.count({
        where: { userId: userId, domain: 'photo_extract', createdAt: { gte: today } }
      });
      if (todayExtracts >= 1) {
        return res.status(403).json({ error: 'Maximum 1 photo par jour en plan gratuit. Passe Premium pour des photos illimitees !', premiumRequired: true });
      }
    }

    if (!isConfigured()) {
      return res.status(503).json({ error: 'Service IA non configure' });
    }

    // Use Gemini to extract text from image
    var { GoogleGenerativeAI } = require('@google/generative-ai');
    var genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    var model = genAI.getGenerativeModel({ model: process.env.GOOGLE_AI_MODEL_SOLVER || 'gemini-2.5-flash' });

    // Remove data:image/...;base64, prefix if present
    var base64 = imageData.replace(/^data:image\/\w+;base64,/, '');

    var result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64
        }
      },
      'Extrais le texte de cet exercice ou probleme de maths/physique/chimie. Retourne UNIQUEMENT le texte du probleme, sans commentaire. Si l\'image contient des formules mathematiques, ecris-les en notation standard (par exemple x^2 + 3x - 5 = 0). Si tu ne vois pas de probleme scolaire, reponds "Aucun probleme detecte dans cette image."'
    ]);

    var text = result.response.text().trim();

    // Log extraction for daily count
    try {
      await prisma.solverHistory.create({
        data: { userId: userId, problem: 'Photo extraction', domain: 'photo_extract', status: 'completed', completedAt: new Date() }
      });
    } catch (e) { /* ignore */ }

    res.json({ success: true, data: { extractedText: text } });
  } catch (error) {
    console.error('[Solver] Image extraction error:', error.message);
    res.status(500).json({ error: 'Erreur lors de l\'extraction du texte' });
  }
});

// ── POST /solve — SSE streaming endpoint ─────────────────────────────

router.post('/solve', authenticateToken, checkAiQuota, async (req, res) => {
  const userId = req.user.userId;
  const { problem, domain, level } = req.body;

  if (!problem || !problem.trim()) {
    return res.status(400).json({ error: 'Probleme requis' });
  }

  if (!isConfigured()) {
    return res.status(503).json({ error: 'Service IA non configure. Contactez l\'administrateur.' });
  }

  // SSE headers — use setHeader (not writeHead) to preserve CORS headers from Express middleware
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch {}
  };

  // Create history record
  let historyId = null;
  try {
    const record = await prisma.solverHistory.create({
      data: { userId, problem: problem.trim(), domain: domain || 'general', status: 'pending' }
    });
    historyId = record.id;
  } catch (err) {
    console.error('[Solver] History create error:', err.message);
  }

  sendEvent('meta', { historyId, status: 'streaming' });

  // SSE heartbeat to prevent proxy disconnects (Render, Cloudflare, etc.)
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch (e) { clearInterval(heartbeat); }
  }, 15000);
  req.on('close', () => clearInterval(heartbeat));
  res.on('finish', () => clearInterval(heartbeat));

  // Update status helper
  const updateHistory = async (data) => {
    if (!historyId) return;
    try { await prisma.solverHistory.update({ where: { id: historyId }, data }); } catch {}
  };

  await updateHistory({ status: 'streaming' });

  try {
    // Stream the solution text with calibrated prompt
    const userPrompt = `Resous ce probleme de ${domain || 'mathematiques'} (niveau ${level || 'lycee'}):\n\n${problem.trim()}`;
    let fullText = '';
    let chunkCount = 0;

    console.log(`[Solver] Starting stream for user=${userId} problem=${problem.trim().length}chars domain=${domain || 'general'}`);

    for await (const chunk of streamGenerate({
      role: 'solver',
      systemInstruction: SOLVER_SYSTEM_PROMPT,
      userPrompt,
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
    })) {
      chunkCount++;
      fullText += chunk;
      sendEvent('chunk', { text: chunk });
    }

    console.log(`[Solver] Stream complete: chunks=${chunkCount} totalChars=${fullText.length} (~${Math.round(fullText.length / 5)} words)`);

    // Detect domain and graph requirement from content (no 2nd Gemini call)
    const problemLower = problem.trim().toLowerCase();
    const GRAPH_KEYWORDS = ['tracer', 'tracé', 'courbe', 'graphe', 'graphique', 'représenter', 'représentation graphique'];
    const requiresGraph = GRAPH_KEYWORDS.some(kw => problemLower.includes(kw));

    let detectedDomain = 'math';
    const PHYSICS_KW = ['vitesse', 'acceleration', 'force', 'energie', 'newton', 'joule', 'watt', 'volt', 'ampere', 'projectile', 'trajectoire', 'cinetique', 'lorentz', 'champ', 'potentiel'];
    const CHEMISTRY_KW = ['mole', 'reaction', 'acide', 'base', 'oxydation', 'reduction', 'concentration', 'titrage', 'element', 'atome', 'ion'];
    if (PHYSICS_KW.some(kw => problemLower.includes(kw))) detectedDomain = 'physics';
    else if (CHEMISTRY_KW.some(kw => problemLower.includes(kw))) detectedDomain = 'chemistry';

    const structured = {
      steps: [],
      requiresGraph,
      functionString: null,
      functionName: null,
      hints: [],
      points: fullText.length > 5000 ? 15 : 10,
      detectedDomain
    };

    sendEvent('structured', structured);

    // Persist full markdown text
    await updateHistory({
      status: 'completed',
      solution: JSON.stringify({ text: fullText, ...structured }),
      completedAt: new Date()
    });

    // Increment AI quota counter after successful completion
    try { await incrementUsage(userId); } catch (e) { console.warn('[Solver] incrementUsage error:', e.message); }

    sendEvent('done', { historyId, status: 'completed' });
  } catch (err) {
    console.error('[Solver] Stream error:', err.message);
    const message = err instanceof GeminiError
      ? err.message
      : 'Erreur lors de la resolution. Reessayez.';

    await updateHistory({ status: 'failed', errorMessage: message });
    sendEvent('error', { message });
  } finally {
    res.end();
  }
});

// ── GET /history — paginated user history ────────────────────────────

router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    // Free users: max 5 history entries
    var planInfo = await getUserPlanInfo(userId);
    var maxEntries = planInfo.isPremium ? 50 : 5;
    const take = Math.min(parseInt(req.query.limit) || 20, maxEntries);
    const skip = Math.max(parseInt(req.query.offset) || 0, 0);

    const [entries, total] = await Promise.all([
      prisma.solverHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        select: { id: true, problem: true, domain: true, status: true, createdAt: true, completedAt: true }
      }),
      prisma.solverHistory.count({ where: { userId } })
    ]);

    res.json({ success: true, data: entries, total });
  } catch (error) {
    next(error);
  }
});

// ── GET /history/:id — single entry detail ───────────────────────────

router.get('/history/:id', authenticateToken, async (req, res, next) => {
  try {
    const entry = await prisma.solverHistory.findUnique({
      where: { id: req.params.id }
    });

    if (!entry || entry.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Entree non trouvee' });
    }

    // Parse solution JSON if stored
    let solution = null;
    if (entry.solution) {
      try { solution = JSON.parse(entry.solution); } catch { solution = entry.solution; }
    }

    res.json({ success: true, data: { ...entry, solution } });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /history/:id — soft delete ────────────────────────────────

router.delete('/history/:id', authenticateToken, async (req, res, next) => {
  try {
    const entry = await prisma.solverHistory.findUnique({
      where: { id: req.params.id }
    });

    if (!entry || entry.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Entree non trouvee' });
    }

    // Hard delete (no deletedAt column for simplicity)
    await prisma.solverHistory.delete({ where: { id: req.params.id } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
