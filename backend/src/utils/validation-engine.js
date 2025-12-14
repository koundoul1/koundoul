/**
 * 🔍 Validation Engine - KOUNDOUL
 * Système de validation intelligente pour réponses mathématiques/physiques
 * Supporte: équivalences symboliques, tolérances numériques, détection d'erreurs
 */

import { evaluate, create, all } from 'mathjs';

const math = create(all);

/**
 * Compare deux expressions mathématiques pour équivalence
 * Supporte: 2x/(x²+1) ≡ 2x*(x²+1)^(-1) ≡ 2x/(x^2+1)
 */
function areEquationsEquivalent(answer, expected, options = {}) {
  try {
    // Normaliser les deux expressions
    const normalizedAnswer = normalizeExpression(answer);
    const normalizedExpected = normalizeExpression(expected);
    
    // Si identiques après normalisation, c'est bon
    if (normalizedAnswer === normalizedExpected) {
      return { isEquivalent: true, confidence: 1.0 };
    }
    
    // Essayer une comparaison symbolique avec mathjs
    try {
      // Simplifier les deux expressions
      const simplifiedAnswer = math.simplify(normalizedAnswer, {}, { exactFractions: false });
      const simplifiedExpected = math.simplify(normalizedExpected, {}, { exactFractions: false });
      
      // Comparer en soustrayant et vérifiant si = 0
      const diff = math.subtract(simplifiedAnswer, simplifiedExpected);
      const diffSimplified = math.simplify(diff, {}, { exactFractions: false });
      
      // Si la différence se simplifie à 0, elles sont équivalentes
      const diffString = diffSimplified.toString();
      if (diffString === '0' || diffString === '') {
        return { isEquivalent: true, confidence: 0.95 };
      }
      
      // Test avec des valeurs numériques aléatoires
      const testValues = [1, 2, 3, -1, -2, 0.5, -0.5];
      let matches = 0;
      
      for (const testValue of testValues) {
        try {
          const scope = { x: testValue, y: testValue };
          const evalAnswer = math.evaluate(normalizedAnswer.replace(/x/g, testValue.toString()), scope);
          const evalExpected = math.evaluate(normalizedExpected.replace(/x/g, testValue.toString()), scope);
          
          const tolerance = options.tolerance?.absolute || 1e-9;
          if (Math.abs(evalAnswer - evalExpected) < tolerance) {
            matches++;
          }
        } catch {
          // Ignorer les erreurs d'évaluation
        }
      }
      
      const confidence = matches / testValues.length;
      return {
        isEquivalent: confidence > 0.8, // Au moins 80% de correspondance
        confidence
      };
    } catch {
      // Si simplification échoue, fallback sur comparaison textuelle améliorée
      return compareTextual(normalizedAnswer, normalizedExpected);
    }
  } catch (error) {
    console.warn('Erreur validation symbolique:', error);
    return { isEquivalent: false, confidence: 0 };
  }
}

/**
 * Normalise une expression mathématique
 */
function normalizeExpression(expr) {
  if (!expr || typeof expr !== 'string') return '';
  
  return expr
    .trim()
    .replace(/\s+/g, '') // Supprimer espaces
    .replace(/\²/g, '^2') // Convertir ² en ^2
    .replace(/\³/g, '^3') // Convertir ³ en ^3
    .replace(/×/g, '*') // × → *
    .replace(/÷/g, '/') // ÷ → /
    .replace(/\s*\*\s*/g, '*') // Normaliser *
    .replace(/\s*\/\s*/g, '/') // Normaliser /
    .replace(/\s*\+\s*/g, '+') // Normaliser +
    .replace(/\s*-\s*/g, '-') // Normaliser -
    .toLowerCase();
}

/**
 * Comparaison textuelle améliorée
 */
function compareTextual(answer, expected) {
  // Extraire les parties clés (coeffs, variables, etc.)
  const answerParts = extractParts(answer);
  const expectedParts = extractParts(expected);
  
  // Vérifier si les parties clés correspondent
  let matches = 0;
  const totalParts = Math.max(answerParts.length, expectedParts.length);
  
  expectedParts.forEach(expectedPart => {
    if (answerParts.some(answerPart => answerPart === expectedPart)) {
      matches++;
    }
  });
  
  const confidence = totalParts > 0 ? matches / totalParts : 0;
  return {
    isEquivalent: confidence > 0.7,
    confidence
  };
}

/**
 * Extrait les parties importantes d'une expression
 */
function extractParts(expr) {
  const parts = [];
  
  // Coefficients numériques
  const numbers = expr.match(/\d+(\.\d+)?/g) || [];
  parts.push(...numbers);
  
  // Variables
  const variables = expr.match(/[a-z](\^\d+)?/gi) || [];
  parts.push(...variables.map(v => v.toLowerCase()));
  
  // Opérateurs principaux
  if (expr.includes('/')) parts.push('div');
  if (expr.includes('*')) parts.push('mult');
  if (expr.includes('+')) parts.push('add');
  if (expr.includes('-')) parts.push('sub');
  
  return parts;
}

/**
 * Valide une réponse numérique avec tolérance
 */
function validateNumeric(answer, expected, options = {}) {
  try {
    // Extraire le nombre de la réponse
    const answerNum = extractNumber(answer);
    const expectedNum = typeof expected === 'number' ? expected : extractNumber(expected);
    
    if (isNaN(answerNum) || isNaN(expectedNum)) {
      return {
        isValid: false,
        feedback: 'Valeur numérique invalide'
      };
    }
    
    // Tolérance par défaut
    const absolute = options.tolerance?.absolute || 0.1;
    const relative = options.tolerance?.relative || 0.01;
    
    const absoluteError = Math.abs(answerNum - expectedNum);
    const relativeError = Math.abs(absoluteError / expectedNum);
    
    const isValid = absoluteError <= absolute || relativeError <= relative;
    
    return {
      isValid,
      absoluteError,
      relativeError,
      feedback: isValid
        ? '✅ Valeur correcte'
        : `⚠️ Erreur: ${absoluteError.toFixed(4)} (attendu: ${expectedNum}, obtenu: ${answerNum})`
    };
  } catch (error) {
    return {
      isValid: false,
      feedback: 'Erreur lors de la validation'
    };
  }
}

/**
 * Extrait un nombre d'une chaîne
 */
function extractNumber(str) {
  if (typeof str === 'number') return str;
  
  // Chercher un nombre (supporte virgule ou point décimal)
  const match = str.replace(',', '.').match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
}

/**
 * Détecte des erreurs spécifiques dans une réponse
 */
function detectCommonErrors(answer, errorDetectors) {
  const detectedErrors = [];
  
  if (!Array.isArray(errorDetectors)) {
    return detectedErrors;
  }
  
  errorDetectors.forEach(detector => {
    try {
      if (detector.detect && typeof detector.detect === 'function') {
        const detected = detector.detect(answer);
        if (detected) {
          detectedErrors.push({
            name: detector.name,
            feedback: detector.feedback || 'Erreur détectée'
          });
        }
      } else if (detector.pattern) {
        // Pattern regex
        const regex = new RegExp(detector.pattern, detector.flags || 'i');
        if (regex.test(answer)) {
          detectedErrors.push({
            name: detector.name,
            feedback: detector.feedback || 'Erreur détectée'
          });
        }
      }
    } catch (error) {
      console.warn('Erreur détection:', error);
    }
  });
  
  return detectedErrors;
}

/**
 * Validation complète d'une étape
 */
function validateStep(answer, stepDefinition) {
  const validation = stepDefinition.validation || {};
  const result = {
    isValid: false,
    confidence: 0,
    feedback: '',
    errors: [],
    partialCredit: 0
  };
  
  // 1. Détection d'erreurs spécifiques
  if (validation.errorDetectors) {
    result.errors = detectCommonErrors(answer, validation.errorDetectors);
    if (result.errors.length > 0) {
      result.feedback = result.errors[0].feedback;
      result.isValid = false;
      return result;
    }
  }
  
  // 2. Validation principale
  if (validation.validate) {
    try {
      const validationResult = validation.validate(answer);
      
      if (typeof validationResult === 'boolean') {
        result.isValid = validationResult;
      } else if (validationResult && typeof validationResult === 'object') {
        // Si la validation retourne un objet avec isValid
        result.isValid = validationResult.isValid !== false;
        result.confidence = validationResult.confidence || (result.isValid ? 1 : 0);
        result.feedback = validationResult.feedback || '';
      }
      
      // Si pas de feedback, en générer un
      if (!result.feedback) {
        result.feedback = result.isValid
          ? '✅ Réponse correcte !'
          : '⚠️ Réponse incorrecte. Réessaie !';
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      result.isValid = false;
      result.feedback = 'Erreur lors de la validation';
    }
  } else {
    // Pas de validation définie, accepter tout
    result.isValid = true;
    result.feedback = 'Validation non définie';
  }
  
  // 3. Validation avec équivalences (si expression)
  if (validation.equivalentForms && !result.isValid) {
    for (const equivalentForm of validation.equivalentForms) {
      const equivResult = areEquationsEquivalent(answer, equivalentForm);
      if (equivResult.isEquivalent) {
        result.isValid = true;
        result.confidence = equivResult.confidence;
        result.feedback = '✅ Forme équivalente acceptée !';
        break;
      }
    }
  }
  
  // 4. Crédit partiel
  if (validation.partialCredit && !result.isValid) {
    let totalPartial = 0;
    validation.partialCredit.forEach(rule => {
      try {
        if (rule.condition && typeof rule.condition === 'function') {
          if (rule.condition(answer)) {
            totalPartial += rule.points || 0;
          }
        }
      } catch {
        // Ignorer erreurs
      }
    });
    
    if (totalPartial > 0) {
      result.partialCredit = totalPartial;
      result.feedback = `⚠️ Réponse partiellement correcte (${Math.round(totalPartial * 100)}%)`;
    }
  }
  
  return result;
}

export {
  areEquationsEquivalent,
  validateNumeric,
  detectCommonErrors,
  validateStep,
  normalizeExpression
};

export default {
  areEquationsEquivalent,
  validateNumeric,
  detectCommonErrors,
  validateStep,
  normalizeExpression
};










