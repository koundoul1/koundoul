/**
 * Regression tests for Flashcards backend (Phase 8 Bloc 1).
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

// ── SM-2 Algorithm ────────────────────────────────────────────────────

function calculateNextReview(quality, interval, easeFactor, repetitions) {
  if (quality < 3) {
    return {
      interval: 1,
      repetitions: 0,
      easeFactor: Math.max(1.3, easeFactor - 0.2),
      status: 'learning'
    };
  }

  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);
  const newRepetitions = repetitions + 1;

  let newInterval;
  if (newRepetitions <= 1) newInterval = 1;
  else if (newRepetitions === 2) newInterval = 6;
  else newInterval = Math.round(interval * newEaseFactor);

  let status = 'learning';
  if (newRepetitions > 5 && newEaseFactor > 2.0) status = 'mastered';

  return { interval: newInterval, repetitions: newRepetitions, easeFactor: newEaseFactor, status };
}

describe('SM-2 Algorithm', () => {
  it('quality=1 (Again) resets interval to 1 and repetitions to 0', () => {
    const result = calculateNextReview(2, 10, 2.5, 5);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
    expect(result.easeFactor).toBe(2.3);
    expect(result.status).toBe('learning');
  });

  it('quality=3 (Good) increases repetitions', () => {
    const result = calculateNextReview(3, 1, 2.5, 0);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.status).toBe('learning');
  });

  it('quality=4 (Good+) maintains or increases ease factor', () => {
    const result = calculateNextReview(4, 6, 2.5, 2);
    expect(result.easeFactor).toBeGreaterThanOrEqual(2.5);
    expect(result.repetitions).toBe(3);
  });

  it('quality=5 (Easy) gives maximum ease factor boost', () => {
    const result = calculateNextReview(5, 6, 2.5, 2);
    expect(result.easeFactor).toBe(2.6);
    expect(result.interval).toBeGreaterThan(6);
  });

  it('second successful review gives interval=6', () => {
    const result = calculateNextReview(4, 1, 2.5, 1);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it('third+ review uses ease factor multiplier', () => {
    const result = calculateNextReview(4, 6, 2.5, 2);
    expect(result.interval).toBe(Math.round(6 * result.easeFactor));
  });

  it('ease factor never goes below 1.3', () => {
    const result = calculateNextReview(2, 10, 1.3, 5);
    expect(result.easeFactor).toBe(1.3);
  });

  it('mastered status after 6+ reps with ease > 2.0', () => {
    const result = calculateNextReview(4, 30, 2.5, 5);
    expect(result.repetitions).toBe(6);
    expect(result.status).toBe('mastered');
  });

  it('learning status when reps <= 5', () => {
    const result = calculateNextReview(4, 6, 2.5, 3);
    expect(result.status).toBe('learning');
  });
})

// ── Route file validation ─────────────────────────────────────────────

describe('Flashcards route file', () => {
  const routeFile = fs.readFileSync(
    path.resolve(__dirname, '../../backend/src/routes/flashcards.js'), 'utf-8'
  );

  it('has /banks endpoint', () => {
    expect(routeFile).toContain("router.get('/banks'");
  });

  it('has /due endpoint with auth', () => {
    expect(routeFile).toContain("router.get('/due', authenticateToken");
  });

  it('has /start-deck endpoint with auth', () => {
    expect(routeFile).toContain("router.post('/start-deck', authenticateToken");
  });

  it('has /:id/review endpoint with SM-2', () => {
    expect(routeFile).toContain("router.post('/:id/review', authenticateToken");
    expect(routeFile).toContain('calculateNextReview');
  });

  it('has /stats endpoint', () => {
    expect(routeFile).toContain("router.get('/stats', authenticateToken");
  });

  it('has /my-decks endpoint', () => {
    expect(routeFile).toContain("router.get('/my-decks', authenticateToken");
  });

  it('awards XP via gamification on good review', () => {
    expect(routeFile).toContain('processAction');
    expect(routeFile).toContain('review_flashcard');
  });

  it('uses findFirst instead of buggy findUnique for compound key', () => {
    expect(routeFile).toContain('findFirst');
    expect(routeFile).not.toContain('flashcardId_userId');
  });

  it('has no curly quotes', () => {
    expect(routeFile).not.toMatch(/[\u2018\u2019\u201C\u201D]/);
  });
})

// ── Seed file validation ──────────────────────────────────────────────

describe('Flashcards seed file', () => {
  const seedPath = path.resolve(__dirname, '../../backend/src/scripts/seedFlashcards.js')

  it('seed file exists', () => {
    expect(fs.existsSync(seedPath)).toBe(true)
  })

  it('contains exactly 450 cards', () => {
    const content = fs.readFileSync(seedPath, 'utf-8')
    const count = (content.match(/question:/g) || []).length
    expect(count).toBe(450)
  })

  it('has no curly quotes', () => {
    const content = fs.readFileSync(seedPath, 'utf-8')
    expect(content).not.toMatch(/[\u2018\u2019\u201C\u201D]/)
  })

  it('covers 3 subjects', () => {
    const content = fs.readFileSync(seedPath, 'utf-8')
    expect(content).toContain("'Mathematiques'")
    expect(content).toContain("'Physique'")
    expect(content).toContain("'Chimie'")
  })
})

// ── Schema validation ─────────────────────────────────────────────────

describe('Prisma schema flashcard models', () => {
  const schema = fs.readFileSync(
    path.resolve(__dirname, '../../backend/prisma/schema.prisma'), 'utf-8'
  );

  it('has FlashcardDeck model', () => {
    expect(schema).toContain('model FlashcardDeck');
  });

  it('FlashcardReview has unique userId+flashcardId', () => {
    expect(schema).toContain('@@unique([userId, flashcardId])');
  });

  it('Flashcard has chapter field', () => {
    expect(schema).toMatch(/model Flashcard[\s\S]*?chapter\s+String/);
  });

  it('Flashcard has isOfficial field', () => {
    expect(schema).toMatch(/model Flashcard[\s\S]*?isOfficial\s+Boolean/);
  });
})
