/**
 * 🔍 Analyseur d'Erreurs Communes - Koundoul
 * Détecte les erreurs typiques dans les réponses des élèves
 * Fournit un feedback pédagogique ciblé
 */

/**
 * Calcule le PGCD (Plus Grand Commun Diviseur) avec l'algorithme d'Euclide
 */
const gcd = (a, b) => {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

/**
 * Base de données des patterns d'erreurs par matière
 */
export const errorPatterns = {
  // ==================== MATHÉMATIQUES ====================
  math: {
    signErrors: {
      check: (attempt, correct) => {
        const attemptNums = attempt.match(/-?\d+/g)?.map(Number) || []
        const correctNums = correct.match(/-?\d+/g)?.map(Number) || []
        
        if (attemptNums.length !== correctNums.length) return false
        
        // Vérifier si des nombres ont la même valeur absolue mais signe différent
        for (let i = 0; i < attemptNums.length; i++) {
          if (Math.abs(attemptNums[i]) === Math.abs(correctNums[i]) &&
              attemptNums[i] !== correctNums[i]) {
            return true
          }
        }
        return false
      },
      error: {
        type: 'Erreur de signe',
        icon: '➕➖',
        explanation: 'Tu as confondu les signes + et - dans ton calcul.',
        correction: 'Rappel: Quand on change un nombre de côté dans une équation, on inverse son signe.',
        example: 'x + 5 = 12  →  x = 12 - 5  (pas x = 12 + 5)',
        videoUrl: '/videos/signes-equations.mp4',
        exerciceUrl: '/exercises/signes-practice'
      }
    },
    
    orderOfOperations: {
      check: (attempt) => {
        // Détecte si addition/soustraction avant multiplication/division
        return /\d+\s*[+\-]\s*\d+\s*[×÷*\/]/.test(attempt)
      },
      error: {
        type: 'Ordre des opérations',
        icon: '🔢',
        explanation: 'Tu n\'as pas respecté la priorité des opérations (× et ÷ avant + et -).',
        correction: 'Rappel: On calcule d\'abord les multiplications et divisions, puis les additions et soustractions.',
        example: '2 + 3 × 4 = 2 + 12 = 14  (pas 5 × 4 = 20)',
        videoUrl: '/videos/ordre-operations.mp4',
        exerciceUrl: '/exercises/ordre-practice'
      }
    },
    
    fractionErrors: {
      check: (attempt, correct) => {
        const attemptFractions = attempt.match(/(\d+)\/(\d+)/g)
        if (!attemptFractions) return false
        
        // Vérifier si la fraction n'est pas simplifiée
        for (const fraction of attemptFractions) {
          const [num, den] = fraction.split('/').map(Number)
          if (gcd(num, den) > 1) {
            return true
          }
        }
        return false
      },
      error: {
        type: 'Fraction non simplifiée',
        icon: '🔢',
        explanation: 'Ta réponse est juste mais la fraction n\'est pas simplifiée.',
        correction: 'Pense toujours à simplifier les fractions au maximum en divisant par le PGCD.',
        example: '4/6 = 2/3  (on divise par 2)',
        videoUrl: '/videos/simplification-fractions.mp4',
        exerciceUrl: '/exercises/fractions-practice'
      }
    },
    
    missingParentheses: {
      check: (attempt) => {
        // Détecte expressions ambiguës sans parenthèses
        return /\d+[a-z]*\s*[+\-]\s*\d+\s*\/\s*\d+/.test(attempt)
      },
      error: {
        type: 'Parenthèses oubliées',
        icon: '( )',
        explanation: 'Ton expression est ambiguë. Il manque des parenthèses pour clarifier l\'ordre des opérations.',
        correction: 'Utilise des parenthèses pour grouper les termes qui doivent être calculés ensemble.',
        example: '(2x + 3)/4  au lieu de  2x + 3/4',
        videoUrl: '/videos/parentheses.mp4',
        exerciceUrl: '/exercises/parentheses-practice'
      }
    },
    
    divisionByZero: {
      check: (attempt) => {
        // Détecte division par zéro
        return /\/\s*0(?!\d)/.test(attempt) || /\/\s*\(\s*0\s*\)/.test(attempt)
      },
      error: {
        type: 'Division par zéro',
        icon: '⚠️',
        explanation: 'Attention ! Tu as une division par zéro, ce qui est mathématiquement impossible.',
        correction: 'Vérifie ton calcul. Une division par zéro indique souvent une erreur dans les étapes précédentes.',
        example: 'Si tu obtiens x/0, reviens en arrière et vérifie tes calculs',
        videoUrl: '/videos/division-zero.mp4',
        exerciceUrl: '/exercises/division-practice'
      }
    }
  },

  // ==================== PHYSIQUE ====================
  physics: {
    unitErrors: {
      check: (attempt) => {
        const units = ['m', 'km', 'cm', 'mm', 's', 'h', 'min', 'N', 'kg', 'g', 'J', 'W', 'V', 'A', 'Ω', 'Pa', 'Hz', 'C', 'K']
        const hasNumber = /\d+/.test(attempt)
        const hasUnit = units.some(unit => new RegExp(`\\d+\\s*${unit}(?![a-z])`).test(attempt))
        return hasNumber && !hasUnit
      },
      error: {
        type: 'Unité manquante',
        icon: '📏',
        explanation: 'Tu as oublié d\'indiquer l\'unité dans ta réponse.',
        correction: 'En physique, toute mesure doit TOUJOURS avoir une unité !',
        example: 'Vitesse = 15 m/s  (pas juste "15")',
        videoUrl: '/videos/unites-physique.mp4',
        exerciceUrl: '/exercises/unites-practice'
      }
    },
    
    conversionErrors: {
      check: (attempt, correct) => {
        const conversions = { km: 1000, m: 1, cm: 0.01, mm: 0.001 }
        
        const attemptMatch = attempt.match(/(\d+(?:\.\d+)?)\s*(km|m|cm|mm)/)
        const correctMatch = correct.match(/(\d+(?:\.\d+)?)\s*(km|m|cm|mm)/)
        
        if (!attemptMatch || !correctMatch) return false
        
        const attemptValue = parseFloat(attemptMatch[1]) * conversions[attemptMatch[2]]
        const correctValue = parseFloat(correctMatch[1]) * conversions[correctMatch[2]]
        
        return Math.abs(attemptValue - correctValue) > 0.01
      },
      error: {
        type: 'Erreur de conversion',
        icon: '↔️',
        explanation: 'Tu t\'es trompé dans la conversion d\'unités.',
        correction: 'Vérifie ton tableau de conversion (× 1000 pour km→m, ÷ 100 pour m→cm, etc.)',
        example: '1 km = 1000 m  (pas 100 m)',
        videoUrl: '/videos/conversions-unites.mp4',
        exerciceUrl: '/exercises/conversions-practice'
      }
    },
    
    vectorErrors: {
      check: (attempt) => {
        const vectorWords = ['force', 'vitesse', 'accélération', 'champ']
        const hasVectorWord = vectorWords.some(word => attempt.toLowerCase().includes(word))
        const hasVectorNotation = /\\vec|→|\\overrightarrow/.test(attempt)
        return hasVectorWord && !hasVectorNotation
      },
      error: {
        type: 'Notation vectorielle manquante',
        icon: '➡️',
        explanation: 'Tu parles d\'une grandeur vectorielle mais tu n\'utilises pas la notation vectorielle.',
        correction: 'Les forces, vitesses et accélérations sont des vecteurs. Utilise la notation avec flèche.',
        example: 'Force: F⃗ ou \\vec{F}  (pas juste F)',
        videoUrl: '/videos/vecteurs-physique.mp4',
        exerciceUrl: '/exercises/vecteurs-practice'
      }
    }
  },

  // ==================== CHIMIE ====================
  chemistry: {
    unbalancedEquation: {
      check: (attempt) => {
        // Détection basique: cherche une équation chimique avec =
        const equationMatch = attempt.match(/([A-Z][a-z]?\d*\s*\+?\s*)+\s*=\s*([A-Z][a-z]?\d*\s*\+?\s*)+/)
        if (!equationMatch) return false
        
        // Vérification simplifiée: compter les symboles de chaque côté
        const [left, right] = attempt.split('=')
        const leftSymbols = left.match(/[A-Z][a-z]?/g) || []
        const rightSymbols = right.match(/[A-Z][a-z]?/g) || []
        
        // Si nombre de symboles très différent, probablement non équilibrée
        return Math.abs(leftSymbols.length - rightSymbols.length) > 2
      },
      error: {
        type: 'Équation non équilibrée',
        icon: '⚖️',
        explanation: 'Ton équation chimique n\'est pas équilibrée. Le nombre d\'atomes doit être identique de chaque côté.',
        correction: 'Compte les atomes de chaque élément à gauche et à droite du =. Ajuste les coefficients pour équilibrer.',
        example: 'H₂ + O₂ → H₂O  ❌  |  2H₂ + O₂ → 2H₂O  ✅',
        videoUrl: '/videos/equilibrage-equations.mp4',
        exerciceUrl: '/exercises/equilibrage-practice'
      }
    },
    
    wrongFormula: {
      check: (attempt) => {
        // Détecte symboles chimiques invalides (2 majuscules consécutives)
        return /[A-Z]{2}/.test(attempt) && !/He|Li|Be|Ne|Na|Mg|Al|Si|Cl|Ar|Ca|Fe|Cu|Zn|Br|Kr|Ag|Sn|Xe|Au|Hg|Pb/.test(attempt)
      },
      error: {
        type: 'Formule chimique incorrecte',
        icon: '🧪',
        explanation: 'Tu as utilisé un symbole chimique qui n\'existe pas ou mal écrit.',
        correction: 'Les symboles chimiques ont toujours une majuscule suivie d\'une minuscule (sauf H, C, N, O, etc.)',
        example: 'Calcium: Ca  (pas CA)  |  Chlore: Cl  (pas CL)',
        videoUrl: '/videos/symboles-chimiques.mp4',
        exerciceUrl: '/exercises/symboles-practice'
      }
    }
  }
}

/**
 * Analyse la tentative de l'élève et détecte les erreurs
 * @param {string} attempt - Réponse de l'élève
 * @param {string} correctAnswer - Réponse correcte
 * @param {string} subject - Matière (math/physics/chemistry)
 * @returns {Array} Liste des erreurs détectées
 */
export const analyzeStudentAttempt = (attempt, correctAnswer, subject) => {
  const detectedErrors = []
  const subjectPatterns = errorPatterns[subject] || errorPatterns.math
  
  for (const [errorKey, errorData] of Object.entries(subjectPatterns)) {
    try {
      if (errorData.check(attempt, correctAnswer)) {
        detectedErrors.push({
          ...errorData.error,
          timestamp: new Date().toISOString(),
          errorKey
        })
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification de ${errorKey}:`, error)
    }
  }
  
  return detectedErrors
}

/**
 * Génère des recommandations personnalisées basées sur l'historique d'erreurs
 * @param {Array} errorHistory - Historique des erreurs de l'élève
 * @returns {Array} Recommandations prioritaires
 */
export const generateRecommendations = (errorHistory) => {
  const errorCounts = {}
  
  // Compter les occurrences de chaque type d'erreur
  errorHistory.forEach(error => {
    errorCounts[error.type] = (errorCounts[error.type] || 0) + 1
  })
  
  const recommendations = []
  
  // Générer recommandations pour erreurs fréquentes (≥3 fois)
  for (const [errorType, count] of Object.entries(errorCounts)) {
    if (count >= 3) {
      recommendations.push({
        priority: 'high',
        type: errorType,
        count: count,
        message: `Tu as fait ${count} fois cette erreur. Il serait bon de réviser ce concept.`,
        resources: [
          { type: 'video', label: 'Voir la vidéo explicative', icon: '📺' },
          { type: 'exercise', label: 'Faire des exercices ciblés', icon: '🎯' },
          { type: 'lesson', label: 'Relire la leçon', icon: '📚' }
        ]
      })
    }
  }
  
  // Trier par priorité (erreurs les plus fréquentes en premier)
  recommendations.sort((a, b) => b.count - a.count)
  
  return recommendations
}

/**
 * Analyse la progression de l'élève sur un type d'erreur spécifique
 * @param {Array} errorHistory - Historique complet
 * @param {string} errorType - Type d'erreur à analyser
 * @returns {Object} Statistiques de progression
 */
export const analyzeErrorProgression = (errorHistory, errorType) => {
  const relevantErrors = errorHistory.filter(e => e.type === errorType)
  
  if (relevantErrors.length === 0) {
    return {
      status: 'no_data',
      message: 'Aucune donnée pour ce type d\'erreur'
    }
  }
  
  // Analyser les 10 dernières tentatives
  const recent = relevantErrors.slice(-10)
  const older = relevantErrors.slice(-20, -10)
  
  const recentRate = recent.length / 10
  const olderRate = older.length / 10
  
  if (recentRate < olderRate * 0.5) {
    return {
      status: 'improving',
      message: '📈 Progrès ! Tu fais moins cette erreur qu\'avant.',
      improvement: Math.round((1 - recentRate / olderRate) * 100)
    }
  } else if (recentRate > olderRate * 1.5) {
    return {
      status: 'worsening',
      message: '⚠️ Attention, cette erreur revient plus souvent. Révise ce concept.',
      decline: Math.round((recentRate / olderRate - 1) * 100)
    }
  } else {
    return {
      status: 'stable',
      message: '➡️ Stable. Continue à t\'entraîner pour progresser.'
    }
  }
}

/**
 * Détecte le niveau de confiance de l'élève dans sa réponse
 * Basé sur la longueur, le détail, et la présence de vérifications
 */
export const assessConfidenceLevel = (attempt) => {
  let confidence = 0
  
  // Longueur de la réponse (détail)
  if (attempt.length > 200) confidence += 2
  else if (attempt.length > 100) confidence += 1
  
  // Présence d'étapes numérotées
  if (/\d+\.\s/.test(attempt) || /Étape\s*\d+/.test(attempt)) confidence += 2
  
  // Présence de vérification
  if (/vérif|check|test|contrôle/i.test(attempt)) confidence += 2
  
  // Présence de formules
  if (/=/.test(attempt)) confidence += 1
  
  // Présence de conclusion
  if (/donc|ainsi|conclusion|finalement/i.test(attempt)) confidence += 1
  
  if (confidence >= 6) return { level: 'high', label: 'Confiant', color: 'green' }
  if (confidence >= 3) return { level: 'medium', label: 'Modéré', color: 'yellow' }
  return { level: 'low', label: 'Hésitant', color: 'red' }
}

export default {
  errorPatterns,
  analyzeStudentAttempt,
  generateRecommendations,
  analyzeErrorProgression,
  assessConfidenceLevel
}









