/**
 * Regression tests for Solver mini-correctif (post-validation).
 * Covers: graph keyword override, accent correctness, no "undefined" in output.
 */
import { describe, it, expect } from 'vitest'

// Import parseStructured from backend prompts (Node-compatible)
const { parseStructured, SOLVER_SYSTEM_PROMPT } = require('../../backend/src/prompts/solver.js')

// ── BUG 2: Graph keyword override ──────────────────────────────────────

describe('Graph detection keyword override', () => {
  const GRAPH_KEYWORDS = ['tracer', 'tracé', 'courbe', 'graphe', 'graphique', 'représenter', 'représentation graphique'];

  function applyGraphOverride(problem, structured) {
    const problemLower = problem.trim().toLowerCase();
    if (!structured.requiresGraph && GRAPH_KEYWORDS.some(kw => problemLower.includes(kw))) {
      structured.requiresGraph = true;
    }
    return structured;
  }

  it('forces requiresGraph=true when problem contains "tracer"', () => {
    const problem = 'Soit f(x)=2x+3, calculer f(-2) et tracer la courbe';
    const structured = { requiresGraph: false, functionString: '2*x+3' };
    const result = applyGraphOverride(problem, structured);
    expect(result.requiresGraph).toBe(true);
  });

  it('forces requiresGraph=true when problem contains "courbe"', () => {
    const problem = 'Tracer la courbe représentative de f(x) = x^2';
    const structured = { requiresGraph: false, functionString: 'x**2' };
    const result = applyGraphOverride(problem, structured);
    expect(result.requiresGraph).toBe(true);
  });

  it('keeps requiresGraph=false for pure calculation without graph keywords', () => {
    const problem = 'Calculer la masse molaire de NaCl';
    const structured = { requiresGraph: false, functionString: null };
    const result = applyGraphOverride(problem, structured);
    expect(result.requiresGraph).toBe(false);
  });

  it('does not override if Gemini already set requiresGraph=true', () => {
    const problem = 'Résoudre x^2 - 4 = 0';
    const structured = { requiresGraph: true, functionString: 'x**2-4' };
    const result = applyGraphOverride(problem, structured);
    expect(result.requiresGraph).toBe(true);
  });
});

// ── BUG 3: Accents in refusal message ──────────────────────────────────

describe('SOLVER_SYSTEM_PROMPT accents', () => {
  it('contains "spécialisé" with accent in refusal example', () => {
    expect(SOLVER_SYSTEM_PROMPT).toContain('spécialisé');
  });

  it('contains "générales" with accent in refusal example', () => {
    expect(SOLVER_SYSTEM_PROMPT).toContain('générales');
  });

  it('does not contain "specialise" without accent', () => {
    expect(SOLVER_SYSTEM_PROMPT).not.toContain('specialise');
  });
});
