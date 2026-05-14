/**
 * Gemini AI Service — shared client for Solver and Coach.
 *
 * Models (stable as of 2026-05):
 *   - Solver: gemini-2.5-pro  (GOOGLE_AI_MODEL_SOLVER)
 *   - Coach:  gemini-2.5-flash (GOOGLE_AI_MODEL_COACH)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Error classes ────────────────────────────────────────────────────

class GeminiError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'GeminiError';
    this.cause = cause;
  }
}

class GeminiQuotaError extends GeminiError {
  constructor(message, cause) {
    super(message, cause);
    this.name = 'GeminiQuotaError';
  }
}

class GeminiTimeoutError extends GeminiError {
  constructor(message) {
    super(message);
    this.name = 'GeminiTimeoutError';
  }
}

// ── Client singleton ─────────────────────────────────────────────────

let client = null;

function getClient() {
  if (!process.env.GOOGLE_AI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }
  return client;
}

function isConfigured() {
  return !!process.env.GOOGLE_AI_API_KEY;
}

// ── Model factory ────────────────────────────────────────────────────

const MODEL_DEFAULTS = {
  solver: 'gemini-2.5-pro',
  coach: 'gemini-2.5-flash'
};

function getModel(role, systemInstruction, generationConfig) {
  const ai = getClient();
  if (!ai) return null;

  const modelName = role === 'coach'
    ? (process.env.GOOGLE_AI_MODEL_COACH || MODEL_DEFAULTS.coach)
    : (process.env.GOOGLE_AI_MODEL_SOLVER || MODEL_DEFAULTS.solver);

  const config = { model: modelName };
  if (systemInstruction) config.systemInstruction = systemInstruction;
  if (generationConfig) config.generationConfig = generationConfig;

  return ai.getGenerativeModel(config);
}

// ── Retry helper ─────────────────────────────────────────────────────

async function withRetry(fn, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.status || err?.httpMetadata?.status;
      const isRetryable = status === 503 || status === 429 || err.message?.includes('rate limit');

      if (!isRetryable || attempt === maxRetries) {
        if (status === 429 || err.message?.includes('quota')) {
          throw new GeminiQuotaError('Quota API Gemini atteinte. Reessayez plus tard.', err);
        }
        throw new GeminiError(err.message || 'Erreur Gemini inconnue', err);
      }

      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ── Timeout wrapper ──────────────────────────────────────────────────

function withTimeout(promise, ms = 120000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new GeminiTimeoutError(`Gemini timeout after ${ms}ms`)), ms)
    )
  ]);
}

// ── generate (non-stream) ────────────────────────────────────────────

/**
 * @param {{ role: 'solver'|'coach', systemInstruction: string, userPrompt: string, history?: Array, generationConfig?: object }} opts
 * @returns {Promise<string>} The generated text
 */
async function generate({ role, systemInstruction, userPrompt, history, generationConfig }) {
  const model = getModel(role, systemInstruction, generationConfig);
  if (!model) throw new GeminiError('Gemini non configure (GOOGLE_AI_API_KEY absent)');

  const start = Date.now();

  const result = await withRetry(async () => {
    if (history && history.length > 0) {
      const chat = model.startChat({ history });
      return withTimeout(chat.sendMessage(userPrompt));
    }
    return withTimeout(model.generateContent(userPrompt));
  });

  const text = result.response.text();
  const duration = Date.now() - start;
  const tokens = result.response.usageMetadata;

  console.log(`[Gemini] role=${role} prompt=${userPrompt.length}chars duration=${duration}ms` +
    (tokens ? ` input=${tokens.promptTokenCount} output=${tokens.candidatesTokenCount}` : ''));

  return text;
}

// ── streamGenerate (async generator) ─────────────────────────────────

/**
 * @param {{ role: 'solver'|'coach', systemInstruction: string, userPrompt: string, history?: Array, generationConfig?: object }} opts
 * @yields {string} text chunks
 */
async function* streamGenerate({ role, systemInstruction, userPrompt, history, generationConfig }) {
  const model = getModel(role, systemInstruction, generationConfig);
  if (!model) throw new GeminiError('Gemini non configure (GOOGLE_AI_API_KEY absent)');

  const start = Date.now();

  let stream;
  if (history && history.length > 0) {
    const chat = model.startChat({ history });
    const result = await withRetry(() => chat.sendMessageStream(userPrompt));
    stream = result.stream;
  } else {
    const result = await withRetry(() => model.generateContentStream(userPrompt));
    stream = result.stream;
  }

  let totalChars = 0;
  let chunkCount = 0;
  let lastFinishReason = null;
  for await (const chunk of stream) {
    chunkCount++;
    const text = chunk.text();
    if (text) {
      totalChars += text.length;
      yield text;
    }
    // Capture finish reason from the last chunk (Gemini SDK exposes it on candidates)
    const candidates = chunk.candidates;
    if (candidates && candidates[0]?.finishReason) {
      lastFinishReason = candidates[0].finishReason;
    }
  }

  const duration = Date.now() - start;
  console.log(`[Gemini] stream role=${role} prompt=${userPrompt.length}chars total=${totalChars}chars chunks=${chunkCount} finishReason=${lastFinishReason || 'unknown'} duration=${duration}ms`);
}

module.exports = {
  isConfigured,
  getModel,
  generate,
  streamGenerate,
  GeminiError,
  GeminiQuotaError,
  GeminiTimeoutError
};
