/**
 * 💡 Système d'Indices Progressifs - KOUNDOUL
 * Génère et gère les indices progressifs selon le niveau de l'élève
 */

class HintSystem {
  
  /**
   * Types d'indices
   */
  static HintType = {
    QUESTION: 'question',      // Question socratique
    REMINDER: 'reminder',      // Rappel de notion
    METHOD: 'method',          // Suggestion de méthode
    PARTIAL: 'partial',        // Solution partielle
    FULL: 'full'              // Solution complète
  };

  /**
   * Génère les indices progressifs pour un problème
   * @param {Object} problem - Problème à résoudre
   * @param {string} strategy - Stratégie recommandée
   * @returns {Array} - Liste d'indices
   */
  generateHints(problem, strategy) {
    const hints = [
      this.generateHint1(problem),
      this.generateHint2(problem, strategy),
      this.generateHint3(problem, strategy),
      this.generateHint4(problem, strategy),
      this.generateHint5(problem, strategy)
    ];

    return hints;
  }

  /**
   * Indice niveau 1 : Question socratique
   */
  generateHint1(problem) {
    const questions = {
      equation: "🤔 Quelle est la forme générale d'une équation du second degré ?",
      derivative: "🤔 Qu'est-ce qu'une dérivée ? À quoi sert-elle ?",
      integral: "🤔 Quelle est la différence entre une dérivée et une intégrale ?",
      geometry: "🤔 Quelles sont les propriétés de cette figure géométrique ?",
      physics: "🤔 Quelle loi physique s'applique ici ?"
    };

    return {
      level: 1,
      type: HintSystem.HintType.QUESTION,
      content: questions[problem.category] || "🤔 Que connais-tu sur ce type de problème ?",
      visual: null,
      xpPenalty: 0, // Pas de pénalité pour une question socratique
      timing: 'immediate'
    };
  }

  /**
   * Indice niveau 2 : Rappel de notion
   */
  generateHint2(啰blem, strategy) {
    const reminders = {
      equation: "💡 Rappel : Une équation du second degré peut se résoudre par factorisation ou avec le discriminant Δ = b² - 4ac.",
      derivative: "💡 Rappel : La dérivée mesure le taux de variation instantané d'une fonction.",
      integral: "💡 Rappel : L'intégrale calcule l'aire sous une courbe.",
      geometry: "💡 Rappel : Pense aux formules de surface et de volume.",
      physics: "💡 Rappel : Identifie les forces en jeu dans ce problème."
    };

    return {
      level: 2,
      type: HintSystem.HintType.REMINDER,
      content: reminders[problem.category] || "💡 Rappel : Réfléchis aux concepts de base.",
      visual: 'concept-reminder',
      xpPenalty: 5,
      timing: 'after-60s'
    };
  }

  /**
   * Indice niveau 3 : Suggestion de méthode
   */
  generateHint3(problem, strategy) {
    return {
      level: 3,
      type: HintSystem.HintType.METHOD,
      content: `🎯 Méthode suggérée : ${strategy.description}. ${strategy.firstStep}`,
      visual: 'method-visualization',
      xpPenalty: 10,
      timing: 'after-90s'
    };
  }

  /**
   * Indice niveau 4 : Solution partielle
   */
  generateHint4(problem, strategy) {
    return {
      level: 4,
      type: HintSystem.HintType.PARTIAL,
      content: `📝 Premier résultat : ${strategy.partialResult}. Maintenant, continue le calcul.`,
      visual: 'partial-solution',
      xpPenalty: 20,
      timing: 'after-120s'
    };
  }

  /**
   * Indice niveau 5 : Solution complète
   */
  generateHint5(problem, strategy) {
    return {
      level: 5,
      type: HintSystem.HintType.FULL,
      content: `✍️ Solution complète : ${strategy.fullSolution}. Regarde attentivement chaque étape.`,
      visual: 'full-solution-animation',
      xpPenalty: 50, // Forte pénalité pour la solution complète
      timing: 'after-180s'
    };
  }

  /**
   * Détermine si un indice doit être débloqué automatiquement
   * @param {Object} sessionData - Données de la session
   * @returns {boolean} - Si l'indice doit être débloqué
   */
  shouldUnlockHint(sessionData) {
    const { currentHintLevel, timeStuck, attemptCount } = sessionData;

    // Si l'élève est bloqué > 90 secondes, débloquer automatiquement
    if (timeStuck > 90 && currentHintLevel < 5) {
      return true;
    }

    // Si 3+ tentatives incorrectes, proposer indice
    if (attemptCount >= 3 && currentHintLevel < 4) {
      return true;
    }

    return false;
  }

  /**
   * Obtient un message d'encouragement
   */
  getEncouragement(timeStuck) {
    const encouragements = [
      { time: 60, message: "💪 Continue, tu es sur la bonne voie ! Prends ton temps pour réfléchir." },
      { time: 90, message: "🤝 C'est un problème difficile. N'hésite pas à demander un indice !" },
      { time: 120, message: "📚 Si tu es bloqué(e), nous pouvons revoir les notions de base ensemble." },
      { time: 180, message: "🌟 Pas de problème ! Chaque erreur est une opportunité d'apprendre." }
    ];

    for (const enc of encouragements) {
      if (timeStuck >= enc.time) {
        return enc.message;
      }
    }

    return null;
  }

  /**
   * Génère un indice personnalisé pour un type de problème spécifique
   */
  generateCustomHint(problem, studentContext) {
    // Générer des indices spécifiques selon le type de problème
    
    if (problem.type === 'equation_second_degree') {
      return this.generateEquationHints(problem, studentContext);
    }
    
    if (problem.type === 'derivative') {
      return this.generateDerivativeHints(problem, studentContext);
    }

    // Fallback vers les indices génériques
    return this.generateHints(problem, { description: "Applique les méthodes de base" });
  }

  /**
   * Indices spécifiques pour équations du second degré
   */
  generateEquationHints(problem, context) {
    const equation = problem.expression || "x² - 5x + 6 = 0";
    
    return [
      {
        level: 1,
        type: HintSystem.HintType.QUESTION,
        content: "🤔 Quelle est la forme générale de cette équation ?",
        xpPenalty: 0
      },
      {
        level: 2,
        type: HintSystem.HintType.REMINDER,
        content: "💡 Rappel : Pour résoudre ax² + bx + c = 0, tu peux utiliser :",
        subContent: "- La factorisation (si facile)",
        moreContent: "- La formule du discriminant Δ = b² - 4ac",
        xpPenalty: 5
      },
      {
        level: 3,
        type: HintSystem.HintType.METHOD,
        content: "🎯 Ici, tu peux factoriser. Trouve deux nombres dont :",
        subContent: "- Le produit = 6 (c)",
        moreContent: "- La somme = 5 (b)",
        xpPenalty: 10
      },
      {
        level: 4,
        type: HintSystem.HintType.PARTIAL,
        content: "📝 Les deux nombres sont 2 et 3 (car 2×3=6 et 2+3=5).",
        subContent: "Écris maintenant : (x-2)(x-3) = 0",
        xpPenalty: 20
      },
      {
        level: 5,
        type: HintSystem.HintType.FULL,
        content: "✍️ Solution complète :",
        subContent: "(x-2)(x-3) = 0",
        moreContent: "Donc x-2=0 ou x-3=0",
        finalContent: "Solutions : x=2 et x=3",
        xpPenalty: 50
      }
    ];
  }

  /**
   * Indices spécifiques pour dérivées
   */
  generateDerivativeHints(problem, context) {
    return [
      {
        level: 1,
        type: HintSystem.HintType.QUESTION,
        content: "🤔 Quelle est la dérivée d'une fonction ?",
        xpPenalty: 0
      },
      {
        level: 2,
        type: HintSystem.HintType.REMINDER,
        content: "💡 Rappel :",
        subContent: "- (xⁿ)' = n·xⁿ⁻¹",
        moreContent: "- (exp(u))' = u'·exp(u)",
        xpPenalty: 5
      },
      {
        level: 3,
        type: HintSystem.HintType.METHOD,
        content: "🎯 Identifie la forme de ta fonction :",
        subContent: "- Polynôme ? → Dérive terme par terme",
        moreContent: "- Exponentielle ? → Utilise la formule de dérivation en chaîne",
        xpPenalty: 10
      },
      {
        level: 4,
        type: HintSystem.HintType.PARTIAL,
        content: "📝 Applique la règle de dérivation étape par étape...",
        xpPenalty: 20
      },
      {
        level: 5,
        type: HintSystem.HintType.FULL,
        content: "✍️ La dérivée complète est...",
        xpPenalty: 50
      }
    ];
  }

  /**
   * Calcule la pénalité XP totale
   */
  calculateTotalXPPenalty(usedHints) {
    return usedHints.reduce((total, hint) => total + (hint.xpPenalty || 0), 0);
  }
}

export default new HintSystem();

