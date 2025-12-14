/**
 * 🎓 Système de Guidage Adaptatif - KOUNDOUL
 * Détermine le niveau de guidage optimal selon le profil de l'élève
 */

class AdaptiveGuidance {
  
  /**
   * Niveaux de guidage possibles
   */
  static GuidanceLevel = {
    AUTONOMOUS: 'autonomous',    // Élève fort : indices minimalistes
    MODERATE: 'moderate',        // Élève moyen : guidage équilibré
    EXTENSIVE: 'extensive',      // Élève en difficulté : guidage pas à pas
    REMEDIATION: 'remediation'   // Grandes lacunes : reprise des bases
  };

  /**
   * Détermine le niveau de guidage pour un élève
   * @param {Object} studentProfile - Profil de l'élève
   * @param {Object} problem - Problème à résoudre
   * @param {Array} concepts - Concepts impliqués
   * @returns {string} - Niveau de guidage recommandé
   */
  async determineGuidanceLevel(studentProfile, problem, concepts) {
    try {
      // 1. Évaluer la maîtrise des concepts
      const masteryScores = concepts.map(c => 
        this.getConceptMastery(studentProfile, c.id)
      );
      const avgMastery = masteryScores.length > 0 
        ? masteryScores.reduce((a, b) => a + b) / masteryScores.length 
        : 0.5; // Valeur par défaut si pas de données

      // 2. Historique de résolution sur ce type de problème
      const pastPerformance = await this.getPastPerformance(
        studentProfile.userId, 
        problem.type
      );

      // 3. Niveau de confiance de l'élève
      const confidence = studentProfile.currentConfidence || 0.5;

      // 4. Calcul du score de guidage
      const guidanceScore = this.calculateGuidanceScore(
        avgMastery,
        pastPerformance.successRate,
        confidence
      );

      // 5. Déterminer le niveau
      if (guidanceScore >= 0.8) {
        return AdaptiveGuidance.GuidanceLevel.AUTONOMOUS;
      } else if (guidanceScore >= 0.6) {
        return AdaptiveGuidance.GuidanceLevel.MODERATE;
      } else if (guidanceScore >= 0.4) {
        return AdaptiveGuidance.GuidanceLevel.EXTENSIVE;
      } else {
        return AdaptiveGuidance.GuidanceLevel.REMEDIATION;
      }

    } catch (error) {
      console.error('Erreur détermination niveau guidage:', error);
      // En cas d'erreur, retourner niveau modéré par défaut
      return AdaptiveGuidance.GuidanceLevel.MODERATE;
    }
  }

  /**
   * Calcule le score de guidage
   */
  calculateGuidanceScore(avgMastery, successRate, confidence) {
    // Moyenne pondérée
    return (avgMastery * 0.4) + (successRate * 0.4) + (confidence * 0.2);
  }

  /**
   * Récupère la maîtrise d'un concept pour un élève
   */
  getConceptMastery(studentProfile, conceptId) {
    if (!studentProfile.conceptMastery) return 0.5;
    return studentProfile.conceptMastery[conceptId] || 0.5;
  }

  /**
   * Récupère les performances passées sur un type de problème
   */
  async getPastPerformance(userId, problemType) {
    // TODO: Implémenter avec Prisma pour récupérer les données réelles
    // Pour l'instant, retourner des valeurs par défaut
    return {
      successRate: 0.65,
      averageTime: 300, // secondes
      attemptsCount: 5
    };
  }

  /**
   * Ajuste le guidage en temps réel pendant la résolution
   * @param {Object} sessionData - Données de la session en cours
   * @returns {Object} - Ajustements recommandés
   */
  async adjustGuidanceInRealTime(sessionData) {
    const {
      currentLevel,
      attemptCount,
      timeSpent,
      frustrationLevel,
      hintCount
    } = sessionData;

    let newLevel = currentLevel;
    let shouldIncrease = false;
    let shouldDecrease = false;
    let encouragement = null;

    // Si l'élève est bloqué depuis > 2 minutes
    if (timeSpent > 120 && attemptCount > 3) {
      shouldIncrease = true;
      encouragement = "💪 C'est un problème difficile. Prends ton temps et n'hésite grandes lacunes : reprise des bases";
    }

    // Si frustration détectée
    if (frustrationLevel > 0.7) {
      shouldIncrease = true;
      encouragement = "🤝 Ne te décourage pas ! Nous pouvons passer par les bases ensemble si besoin.";
    }

    // Si l'élève réussit rapidement, réduire le guidage
    if (attemptCount <= 2 && timeSpent < 60 && hintCount === 0) {
      shouldDecrease = true;
      encouragement = "🎉 Tu maîtrises bien ! Je vais te donner moins d'indices pour te challenger.";
    }

    // Si beaucoup d'indices utilisés mais toujours bloqué
    if (hintCount >= 3 && attemptCount > 3) {
      shouldIncrease = true;
      encouragement = "📚 Il semble que nous devions revoir certaines notions de base.";
    }

    // Ajuster le niveau
    if (shouldIncrease) {
      newLevel = this.increaseGuidanceLevel(currentLevel);
    } else if (shouldDecrease && currentLevel !== AdaptiveGuidance.GuidanceLevel.AUTONOMOUS) {
      newLevel = this.decreaseGuidanceLevel(currentLevel);
    }

    return {
      newLevel,
      shouldIncrease,
      shouldDecrease,
      encouragement,
      reason: this.getAdjustmentReason(currentLevel, newLevel)
    };
  }

  /**
   * Augmente le niveau de guidage
   */
  increaseGuidanceLevel(currentLevel) {
    const levels = [
      AdaptiveGuidance.GuidanceLevel.AUTONOMOUS,
      AdaptiveGuidance.GuidanceLevel.MODERATE,
      AdaptiveGuidance.GuidanceLevel.EXTENSIVE,
      AdaptiveGuidance.GuidanceLevel.REMEDIATION
    ];
    
    const currentIndex = levels.indexOf(currentLevel);
    const newIndex = Math.min(currentIndex + 1, levels.length - 1);
    return levels[newIndex];
  }

  /**
   * Diminue le niveau de guidage
   */
  decreaseGuidanceLevel(currentLevel) {
    const levels = [
      AdaptiveGuidance.GuidanceLevel.AUTONOMOUS,
      AdaptiveGuidance.GuidanceLevel.MODERATE,
      AdaptiveGuidance.GuidanceLevel.EXTENSIVE,
      AdaptiveGuidance.GuidanceLevel.REMEDIATION
    ];
    
    const currentIndex = levels.indexOf(currentLevel);
    const newIndex = Math.max(currentIndex - 1, 0);
    return levels[newIndex];
  }

  /**
   * Obtient la raison de l'ajustement
   */
  getAdjustmentReason(oldLevel, newLevel) {
    if (oldLevel === newLevel) return 'Aucun ajustement nécessaire';

    const levelNames = {
      [AdaptiveGuidance.GuidanceLevel.AUTONOMOUS]: 'Autonome',
      [AdaptiveGuidance.GuidanceLevel.MODERATE]: 'Modéré',
      [AdaptiveGuidance.GuidanceLevel.EXTENSIVE]: 'Guidage étendu',
      [AdaptiveGuidance.GuidanceLevel.REMEDIATION]: 'Remédiation'
    };

    return `Ajustement de ${levelNames[oldLevel]} à ${levelNames[newLevel]}`;
  }

  /**
   * Retourne les paramètres de guidage selon le niveau
   */
  getGuidanceParameters(level) {
    const parameters = {
      [AdaptiveGuidance.GuidanceLevel.AUTONOMOUS]: {
        hintDelay: 120,           // Temps avant indice automatique (2 min)
        questionFrequency: 3,     // Question toutes les 3 étapes
        scaffoldingType: 'questions', // Type d'échafaudage
        showProgress: true,
        encouragementFrequency: 5  // Encourager toutes les 5 minutes
      },
      [AdaptiveGuidance.GuidanceLevel.MODERATE]: {
        hintDelay: 90,            // 1.5 minutes
        questionFrequency: 2,     // Plus fréquent
        scaffoldingType: 'examples', 
        showProgress: true,
        encouragementFrequency: 3
      },
      [AdaptiveGuidance.GuidanceLevel.EXTENSIVE]: {
        hintDelay: 60,            // 1 minute
        questionFrequency: 1,     // À chaque étape
        scaffoldingType: 'visual',
        showProgress: true,
        encouragementFrequency: 2
      },
      [AdaptiveGuidance.GuidanceLevel.REMEDIATION]: {
        hintDelay: 30,            // 30 secondes
        questionFrequency: 1,     // Maximum
        scaffoldingType: 'analogies',
        showProgress: true,
        encouragementFrequency: 1
      }
    };

    return parameters[level] || parameters[AdaptiveGuidance.GuidanceLevel.MODERATE];
  }
}

export default new AdaptiveGuidance();

