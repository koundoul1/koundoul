/**
 * ✅ Validateur Intelligent - KOUNDOUL
 * Valide les réponses des élèves à plusieurs niveaux
 */

import errorDetector from './error-detector.js';

class SmartValidator {

  /**
   * Valide une réponse complète (syntaxe + mathématique + pédagogique)
   * @param {string} input - Réponse de l'élève
   * @param {any} expectedAnswer - Réponse attendue
   * @param {Object} problem - Problème en cours
   * @returns {Object} - Résultat de validation
   */
  async validate(input, expectedAnswer, problem) {
    const results = {
      syntax: this.validateSyntax(input),
      mathematical: await this.validateMathematical(input, expectedAnswer, problem),
      pedagogical: await this.validatePedagogical(input, problem),
      errors: []
    };

    // Détecter les erreurs courantes
    const detectedErrors = await errorDetector.detectErrors(input, problem.type);
    results.errors = detectedErrors.map(error => 
      errorDetector.generateErrorFeedback(error, input)
    );

    // Calculer le score global
    results.overallScore = this.calculateOverallScore(results);

    // Générer un feedback global
    results.feedback = this.generateOverallFeedback(results);

    return results;
  }

  /**
   * Validation syntaxique
   */
  validateSyntax(input) {
    const errors = errorDetector.detectSyntaxErrors(input);
    
    return {
      isValid: errors.length === 0,
      errors,
      severity: errors.length > 0 ? 'error' : 'correct'
    };
  }

  /**
   * Validation mathématique
   */
  async validateMathematical(input, expectedAnswer, problem) {
    try {
      // Normaliser les expressions pour comparer
      const normalizedInput = this.normalizeExpression(input);
      const normalizedExpected = this.normalizeExpression(expectedAnswer);

      // Vérifier l'équivalence mathématique
      const isMathematicallyEquivalent = this.areMathematicallyEquivalent(
        normalizedInput,
        normalizedExpected
      );

      if (isMathematicallyEquivalent) {
        return {
          isValid: true,
          feedback: {
            type: 'success',
            message: "🎉 Correct !",
            explanation: "Ta réponse est mathématiquement juste"
          },
          severity: 'correct'
        };
      }

      // Si pas équivalent, chercher si proche
      const isClose = this.isCloseEnough(normalizedInput, normalizedExpected);
      
      return {
        isValid: false,
        isClose,
        feedback: {
          type: 'warning',
          message: isClose ? "🤔 Presque !" : "❌ Ce n'est pas la bonne réponse",
          explanation: isClose 
            ? "Tu es proche mais il y a une petite erreur"
            : "Revois ton calcul étape par étape"
        },
        severity: isClose ? 'partially-correct' : 'wrong'
      };

    } catch (error) {
      return {
        isValid: false,
        feedback: {
          type: 'error',
          message: "❌ Impossible d'analyser ta réponse",
          explanation: "Vérifie que ton expression est bien formée"
        },
        severity: 'error'
      };
    }
  }

  /**
   * Validation pédagogique (méthode utilisée)
   */
  async validatePedagogical(input, problem) {
    const methodUsed = this.detectMethodUsed(input, problem);
    const recommendedMethod = problem.recommendedMethod || 'standard';

    if (methodUsed === recommendedMethod) {
      return {
        isValid: true,
        feedback: {
          type: 'success',
          message: "👏 Excellente méthode !",
          explanation: `Tu as utilisé ${methodUsed}, c'est la méthode optimale ici`
        },
        score: 100
      };
    }

    // Vérifier si méthode alternative valide
    const validAlternatives = problem.validAlternatives || [];
    if (validAlternatives.includes(methodUsed)) {
      return {
        isValid: true,
        feedback: {
          type: 'info',
          message: `✅ Méthode valide (${methodUsed})`,
          explanation: `Ta méthode fonctionne ! Note que ${recommendedMethod} serait plus rapide.`
        },
        score: 80
      };
    }

    return {
      isValid: false,
      feedback: {
        type: 'warning',
        message: "🤔 Méthode inadaptée",
        explanation: `${methodUsed} n'est pas la bonne approche pour ce problème`
      },
      score: 40
    };
  }

  /**
   * Normalise une expression mathématique
   */
  normalizeExpression(expr) {
    if (typeof expr !== 'string') return expr;

    return expr
      .toLowerCase()
      .replace(/\s+/g, '')           // Retirer espaces
      .replace(/\*\*/g, '^')         // ** → ^
      .replace(/(\d+)\s*x\s*/g, '$1x') // 2x au lieu de 2 x
      .trim();
  }

  /**
   * Vérifie l'équivalence mathématique
   */
  areMathematicallyEquivalent(input, expected) {
    // Normaliser d'abord
    const normInput = this.normalizeExpression(input);
    const normExpected = this.normalizeExpression(expected);

    // Comparaison exacte
    if (normInput === normExpected) return true;

    // Détecter les formulations équivalentes
    // Ex: "2*x" vs "2x", "x=2" vs "x = 2", etc.
    
    // Extraction des solutions pour équations
    const solutionsInput = this.extractSolutions(normInput);
    const solutionsExpected = this.extractSolutions(normExpected);
    
    if (solutionsInput.length > 0 && solutionsExpected.length > 0) {
      return this.arraysEqual(solutionsInput.sort(), solutionsExpected.sort());
    }

    return false;
  }

  /**
   * Vérifie si une réponse est proche de la bonne réponse
   */
  isCloseEnough(input, expected) {
    // Pour les calculs numériques, accepter une tolérance
    const numInput = parseFloat(input);
    const numExpected = parseFloat(expected);

    if (!isNaN(numInput) && !isNaN(numExpected)) {
      const diff = Math.abs(numInput - numExpected);
      const tolerance = 0.1; // Tolérance de 10%
      return diff / Math.abs(numExpected) < tolerance;
    }

    return false;
  }

  /**
   * Extrait les solutions d'une réponse
   */
  extractSolutions(input) {
    const solutions = [];
    const matches = input.matchAll(/x\s*=\s*([+-]?\d+(?:\.\d+)?)/g);
    
    for (const match of matches) {
      solutions.push(parseFloat(match[1]));
    }

    return solutions;
  }

  /**
   * Compare deux tableaux
   */
  arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, i) => Math.abs(val - arr2[i]) < 0.01);
  }

  /**
   * Détecte la méthode utilisée par l'élève
   */
  detectMethodUsed(input, problem) {
    // Détection basée sur des patterns
    if (input.includes('delta') || input.includes('discriminant')) {
      return 'discriminant';
    }
    
    if (input.includes('facto') || input.match(/\([^)]+\)\s*\([^)]+\)/)) {
      return 'factorization';
    }
    
    if (input.includes('derivé') || input.match(/'/)) {
      return 'derivation';
    }

    return 'unknown';
  }

  /**
   * Calcule le score global
   */
  calculateOverallScore(results) {
    let score = 100;

    // Pénalités pour syntaxe
    if (!results.syntax.isValid) {
      score -= 20;
    }

    // Pénalités pour mathématique
    if (!results.mathematical.isValid) {
      score -= 40;
    } else if (results.mathematical.severity === 'partially-correct') {
      score -= 10;
    }

    // Pénalités pour pédagogique
    if (!results.pedagogical.isValid) {
      score -= 20;
    } else {
      score = Math.min(score, results.pedagogical.score);
    }

    // Pénalités pour erreurs détectées
    score -= results.errors.length * 5;

    return Math.max(0, score);
  }

  /**
   * Génère un feedback global
   */
  generateOverallFeedback(results) {
    if (results.overallScore >= 90) {
      return {
        type: 'success',
        message: "🎉 Excellent travail !",
        explanation: "Ta réponse est correcte et ta méthode est appropriée."
      };
    }

    if (results.overallScore >= 70) {
      return {
        type: 'info',
        message: "✅ Bien joué !",
        explanation: "Ta réponse est correcte mais quelques améliorations sont possibles."
      };
    }

    if (results.overallScore >= 50) {
      return {
        type: 'warning',
        message: "🤔 Tu es sur la bonne voie",
        explanation: "Revoyons ensemble les points à améliorer."
      };
    }

    return {
      type: 'error',
      message: "📚 C'est un bon moment pour apprendre",
      explanation: "Nous allons reprendre les notions essentielles ensemble."
    };
  }
}

export default new SmartValidator();

