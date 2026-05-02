const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const prisma = require('../config/database');
const { isConfigured, streamGenerate, generate, GeminiError } = require('../services/geminiService');
const { SOLVER_SYSTEM_PROMPT, SOLVER_STRUCTURED_PROMPT, parseStructured } = require('../prompts/solver');

// ── POST /solve — SSE streaming endpoint ─────────────────────────────

router.post('/solve', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { problem, domain, level } = req.body;

  if (!problem || !problem.trim()) {
    return res.status(400).json({ error: 'Probleme requis' });
  }

  if (!isConfigured()) {
    return res.status(503).json({ error: 'Service IA non configure. Contactez l\'administrateur.' });
  }

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

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

    for await (const chunk of streamGenerate({
      role: 'solver',
      systemInstruction: SOLVER_SYSTEM_PROMPT,
      userPrompt,
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
    })) {
      fullText += chunk;
      sendEvent('chunk', { text: chunk });
    }

    // Post-process: extract structured data via second call (low temperature for deterministic JSON)
    let structured;
    try {
      const jsonPrompt = SOLVER_STRUCTURED_PROMPT
        .replace('{problem}', problem.trim().slice(0, 500))
        .replace('{solution}', fullText.slice(0, 3000));

      const jsonText = await generate({
        role: 'solver',
        systemInstruction: 'Tu retournes uniquement du JSON valide. Aucun markdown, aucun backtick, aucun commentaire.',
        userPrompt: jsonPrompt,
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
      });
      structured = parseStructured(jsonText);
    } catch (err) {
      console.warn('[Solver] Structured extraction failed, using defaults:', err.message);
      structured = parseStructured(null);
    }

    sendEvent('structured', structured);

    // Persist
    await updateHistory({
      status: 'completed',
      solution: JSON.stringify({ text: fullText, ...structured }),
      completedAt: new Date()
    });

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
    const take = Math.min(parseInt(req.query.limit) || 20, 50);
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
