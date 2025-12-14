/**
 * 🧮 Step Engine - KOUNDOUL
 * Moteur de résolution par étapes pour équations du second degré
 */

class StepEngine {
  constructor() {
    this.steps = new Map();
    this.currentStep = null;
    this.sessionData = {};
    this.guidanceLevel = 'moderate'; // autonomous, moderate, extensive, remediation
    this.problemType = null;
  }

  /**
   * Détecte le type de problème
   */
  detectProblemType(problemText) {
    // Détecte système d'équations (plusieurs équations avec "et" ou "=")
    if ((problemText.match(/=/g) || []).length >= 2 && (problemText.includes('et') || problemText.match(/x[\d]*[+-]/g)?.length >= 3)) {
      return 'system';
    }
    
    // Détecte équation du second degré
    if (problemText.includes('x²') || problemText.includes('x^2')) {
      return 'quadratic';
    }
    
    // Détecte équation du premier degré
    if (problemText.includes('x') && problemText.includes('=')) {
      return 'linear';
    }
    
    // Par défaut, essaye équation du second degré
    return 'quadratic';
  }

  /**
   * Génère les étapes pour une équation du second degré
   */
  generateStepsForQuadratic(equation) {
    const steps = [
      {
        id: 'step-1',
        title: 'Identifier les coefficients',
        description: 'Dans l\'équation ax² + bx + c = 0, trouve les valeurs de a, b et c',
        order: 1,
        type: 'identification',
        estimatedDuration: 60,
        inputs: [
          {
            id: 'coeff-a',
            label: 'Valeur de a',
            type: 'number',
            expected: this.extractCoefficient(equation, 'a'),
            validation: 'exact'
          },
          {
            id: 'coeff-b', 
            label: 'Valeur de b',
            type: 'number',
            expected: this.extractCoefficient(equation, 'b'),
            validation: 'exact'
          },
          {
            id: 'coeff-c',
            label: 'Valeur de c', 
            type: 'number',
            expected: this.extractCoefficient(equation, 'c'),
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Quelle est la forme générale d\'une équation du second degré ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Rappel: Une équation du 2nd degré a la forme ax² + bx + c = 0',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Méthode: Identifie le coefficient devant x² (a), devant x (b), et la constante (c)',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: `Ici, a=${this.extractCoefficient(equation, 'a')}, b=${this.extractCoefficient(equation, 'b')}, c=${this.extractCoefficient(equation, 'c')}`,
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: `Solution: a=${this.extractCoefficient(equation, 'a')}, b=${this.extractCoefficient(equation, 'b')}, c=${this.extractCoefficient(equation, 'c')}`,
            xpCost: 50
          }
        ],
        successMessage: '✅ Parfait ! Tu as bien identifié tous les coefficients',
        errorMessages: {
          'wrong-sign': '⚠️ Attention au signe des coefficients',
          'missing-coeff': '🤔 Il manque un coefficient'
        },
        xpReward: 20
      },
      {
        id: 'step-2',
        title: 'Calculer le discriminant',
        description: 'Calcule Δ = b² - 4ac',
        order: 2,
        type: 'calculation',
        estimatedDuration: 90,
        inputs: [
          {
            id: 'discriminant',
            label: 'Valeur de Δ',
            type: 'number',
            expected: this.calculateDiscriminant(equation),
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'À quoi sert le discriminant dans la résolution ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Le discriminant Δ = b² - 4ac détermine le nombre de solutions',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Méthode: Δ = b² - 4ac. Remplace b et c par leurs valeurs',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: `Calcul: Δ = (${this.extractCoefficient(equation, 'b')})² - 4×${this.extractCoefficient(equation, 'a')}×${this.extractCoefficient(equation, 'c')} = ?`,
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: `Solution: Δ = ${this.calculateDiscriminant(equation)}`,
            xpCost: 50
          }
        ],
        successMessage: '✅ Excellent ! Le discriminant est calculé',
        errorMessages: {
          'calculation-error': '⚠️ Vérifie ton calcul',
          'formula-error': '🤔 Utilise la formule Δ = b² - 4ac'
        },
        xpReward: 25
      },
      {
        id: 'step-3',
        title: 'Analyser le discriminant',
        description: 'Que nous dit la valeur de Δ sur les solutions ?',
        order: 3,
        type: 'analysis',
        estimatedDuration: 60,
        inputs: [
          {
            id: 'discriminant-analysis',
            label: 'Nombre de solutions',
            type: 'select',
            options: ['Aucune solution', 'Une solution', 'Deux solutions'],
            expected: this.getDiscriminantAnalysis(equation),
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Que signifie un discriminant positif ? Négatif ? Nul ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Rappel: Δ > 0 → 2 solutions, Δ = 0 → 1 solution, Δ < 0 → 0 solution',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Compare la valeur de Δ avec 0',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: `Δ = ${this.calculateDiscriminant(equation)}. Est-ce >, = ou < 0 ?`,
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: `Δ = ${this.calculateDiscriminant(equation)} ${this.calculateDiscriminant(equation) > 0 ? '> 0' : this.calculateDiscriminant(equation) === 0 ? '= 0' : '< 0'} → ${this.getDiscriminantAnalysis(equation)}`,
            xpCost: 50
          }
        ],
        successMessage: '✅ Parfait ! Tu as bien analysé le discriminant',
        errorMessages: {
          'wrong-analysis': '⚠️ Vérifie la règle: Δ > 0 → 2 solutions, Δ = 0 → 1 solution, Δ < 0 → 0 solution'
        },
        xpReward: 20
      },
      {
        id: 'step-4',
        title: 'Calculer les solutions',
        description: 'Utilise la formule x = (-b ± √Δ) / 2a',
        order: 4,
        type: 'calculation',
        estimatedDuration: 120,
        inputs: [
          {
            id: 'solution-1',
            label: 'Première solution (x₁)',
            type: 'number',
            expected: this.calculateSolutions(equation)[0],
            validation: 'exact'
          },
          {
            id: 'solution-2',
            label: 'Deuxième solution (x₂)',
            type: 'number',
            expected: this.calculateSolutions(equation)[1],
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Comment trouve-t-on les valeurs de x ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Formule: x = (-b ± √Δ) / 2a',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Calcule d\'abord √Δ, puis applique la formule avec + et -',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: `√Δ = √${this.calculateDiscriminant(equation)} = ${Math.sqrt(this.calculateDiscriminant(equation))}. Maintenant calcule x₁ et x₂`,
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: `Solutions: x₁ = ${this.calculateSolutions(equation)[0]}, x₂ = ${this.calculateSolutions(equation)[1]}`,
            xpCost: 50
          }
        ],
        successMessage: '✅ Bravo ! Tu as trouvé les solutions',
        errorMessages: {
          'calculation-error': '⚠️ Vérifie tes calculs',
          'formula-error': '🤔 Utilise la formule x = (-b ± √Δ) / 2a'
        },
        xpReward: 30
      },
      {
        id: 'step-5',
        title: 'Vérifier les solutions',
        description: 'Remplace x par chaque solution dans l\'équation originale',
        order: 5,
        type: 'verification',
        estimatedDuration: 90,
        inputs: [
          {
            id: 'verification-1',
            label: 'Vérification x₁',
            type: 'text',
            expected: 'Vérifiée',
            validation: 'contains'
          },
          {
            id: 'verification-2',
            label: 'Vérification x₂',
            type: 'text',
            expected: 'Vérifiée',
            validation: 'contains'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Comment vérifier qu\'une solution est correcte ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Remplace x par la solution dans l\'équation originale',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Calcule ax² + bx + c avec chaque solution. Le résultat doit être 0',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: `Pour x₁ = ${this.calculateSolutions(equation)[0]}: calcule ${this.extractCoefficient(equation, 'a')}×(${this.calculateSolutions(equation)[0]})² + ${this.extractCoefficient(equation, 'b')}×${this.calculateSolutions(equation)[0]} + ${this.extractCoefficient(equation, 'c')}`,
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: 'Les deux solutions sont correctes !',
            xpCost: 50
          }
        ],
        successMessage: '✅ Parfait ! Les solutions sont vérifiées',
        errorMessages: {
          'verification-error': '⚠️ Vérifie tes calculs de vérification'
        },
        xpReward: 25
      }
    ];

    return steps;
  }

  /**
   * Extrait un coefficient d'une équation
   */
  extractCoefficient(equation, coeff) {
    // Parsing simple pour équations du type "x² - 5x + 6 = 0"
    const cleanEq = equation.replace(/\s/g, '');
    
    if (coeff === 'a') {
      const match = cleanEq.match(/^([+-]?\d*)x²/);
      return match ? (match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseInt(match[1])) : 1;
    }
    
    if (coeff === 'b') {
      const match = cleanEq.match(/x²([+-]?\d*)x/);
      return match ? (match[1] === '' ? 1 : match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseInt(match[1])) : 0;
    }
    
    if (coeff === 'c') {
      const match = cleanEq.match(/x([+-]?\d+)=/);
      return match ? parseInt(match[1]) : 0;
    }
    
    return 0;
  }

  /**
   * Calcule le discriminant
   */
  calculateDiscriminant(equation) {
    const a = this.extractCoefficient(equation, 'a');
    const b = this.extractCoefficient(equation, 'b');
    const c = this.extractCoefficient(equation, 'c');
    return b * b - 4 * a * c;
  }

  /**
   * Calcule les solutions
   */
  calculateSolutions(equation) {
    const a = this.extractCoefficient(equation, 'a');
    const b = this.extractCoefficient(equation, 'b');
    const c = this.extractCoefficient(equation, 'c');
    const delta = this.calculateDiscriminant(equation);
    
    if (delta < 0) return [null, null];
    if (delta === 0) {
      const x = -b / (2 * a);
      return [x, x];
    }
    
    const sqrtDelta = Math.sqrt(delta);
    const x1 = (-b + sqrtDelta) / (2 * a);
    const x2 = (-b - sqrtDelta) / (2 * a);
    
    return [x1, x2];
  }

  /**
   * Analyse le discriminant
   */
  getDiscriminantAnalysis(equation) {
    const delta = this.calculateDiscriminant(equation);
    if (delta > 0) return 'Deux solutions';
    if (delta === 0) return 'Une solution';
    return 'Aucune solution';
  }

  /**
   * Démarre une session de résolution
   */
  startSession(equation, guidanceLevel = 'moderate') {
    this.problemType = this.detectProblemType(equation);
    this.guidanceLevel = guidanceLevel;
    this.sessionData = {
      equation,
      startTime: Date.now(),
      currentStepIndex: 0,
      completedSteps: [],
      xpEarned: 0,
      hintsUsed: [],
      errors: []
    };
    
    // Choix du moteur d'étapes selon le type détecté
    let steps;
    if (this.problemType === 'system') {
      steps = this.generateStepsForSystem(equation);
    } else if (this.problemType === 'quadratic') {
      steps = this.generateStepsForQuadratic(equation);
    } else if (this.problemType === 'linear') {
      steps = this.generateStepsForLinear(equation);
    } else {
      steps = this.generateStepsForQuadratic(equation); // fallback
    }
    
    this.steps = new Map(steps.map(step => [step.id, step]));
    this.currentStep = steps[0];
    
    return {
      sessionId: `session-${Date.now()}`,
      equation,
      problemType: this.problemType,
      steps: steps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.description,
        order: step.order,
        estimatedDuration: step.estimatedDuration
      })),
      currentStep: this.currentStep,
      guidanceLevel: this.guidanceLevel,
      progress: {
        current: 1,
        total: steps.length,
        percentage: Math.round((1 / steps.length) * 100)
      }
    };
  }

  /**
   * Valide une réponse pour l'étape courante
   */
  validateAnswer(stepId, inputs) {
    const step = this.steps.get(stepId);
    if (!step) return { success: false, error: 'Étape non trouvée' };

    const results = [];
    let allCorrect = true;

    for (const input of step.inputs) {
      const userValue = inputs[input.id];
      const isCorrect = this.validateInput(input, userValue);
      
      results.push({
        inputId: input.id,
        label: input.label,
        userValue,
        expected: input.expected,
        isCorrect,
        feedback: isCorrect ? step.successMessage : this.getErrorMessage(step, input, userValue)
      });

      if (!isCorrect) allCorrect = false;
    }

    if (allCorrect) {
      this.sessionData.completedSteps.push(stepId);
      this.sessionData.xpEarned += step.xpReward;
      this.sessionData.currentStepIndex++;
      
      // Passer à l'étape suivante
      const nextStep = this.getNextStep();
      this.currentStep = nextStep;
    }

    return {
      success: allCorrect,
      results,
      xpEarned: allCorrect ? step.xpReward : 0,
      nextStep: allCorrect ? this.currentStep : null,
      progress: {
        current: this.sessionData.currentStepIndex + 1,
        total: this.steps.size,
        percentage: Math.round(((this.sessionData.currentStepIndex + 1) / this.steps.size) * 100)
      }
    };
  }

  /**
   * Valide un input spécifique
   */
  validateInput(input, userValue) {
    if (input.validation === 'exact') {
      return userValue == input.expected;
    }
    if (input.validation === 'contains') {
      return userValue && userValue.toLowerCase().includes(input.expected.toLowerCase());
    }
    return false;
  }

  /**
   * Génère un message d'erreur
   */
  getErrorMessage(step, input, userValue) {
    if (input.type === 'number' && userValue !== input.expected) {
      return '⚠️ Vérifie ton calcul';
    }
    return step.errorMessages['calculation-error'] || '❌ Incorrect';
  }

  /**
   * Récupère l'étape suivante
   */
  getNextStep() {
    const stepArray = Array.from(this.steps.values()).sort((a, b) => a.order - b.order);
    return stepArray[this.sessionData.currentStepIndex] || null;
  }

  /**
   * Récupère un indice pour l'étape courante
   */
  getHint(stepId, level) {
    const step = this.steps.get(stepId);
    if (!step) return null;

    const hint = step.hints.find(h => h.level === level);
    if (!hint) return null;

    // Enregistrer l'utilisation de l'indice
    this.sessionData.hintsUsed.push({
      stepId,
      level,
      timestamp: Date.now(),
      xpCost: hint.xpCost
    });

    return hint;
  }

  /**
   * Adapte le niveau de guidage
   */
  adaptGuidanceLevel(trigger) {
    const currentLevel = this.guidanceLevel;
    const levels = ['autonomous', 'moderate', 'extensive', 'remediation'];
    const currentIndex = levels.indexOf(currentLevel);

    switch (trigger) {
      case 'blocked':
        if (currentIndex < levels.length - 1) {
          this.guidanceLevel = levels[currentIndex + 1];
          return { newLevel: this.guidanceLevel, reason: 'Augmentation du guidage car blocage détecté' };
        }
        break;
      case 'success':
        if (currentIndex > 0) {
          this.guidanceLevel = levels[currentIndex - 1];
          return { newLevel: this.guidanceLevel, reason: 'Réduction du guidage car bonnes performances' };
        }
        break;
    }

    return { newLevel: this.guidanceLevel, reason: 'Niveau maintenu' };
  }

  /**
   * Génère les étapes pour un système d'équations
   */
  generateStepsForSystem(system) {
    const steps = [
      {
        id: 'step-1',
        title: 'Identifier les équations',
        description: 'Identifie les deux équations du système',
        order: 1,
        type: 'identification',
        estimatedDuration: 60,
        inputs: [
          {
            id: 'eq-1',
            label: 'Première équation',
            type: 'text',
            expected: this.extractFirstEquation(system),
            validation: 'contains'
          },
          {
            id: 'eq-2',
            label: 'Deuxième équation',
            type: 'text',
            expected: this.extractSecondEquation(system),
            validation: 'contains'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Combien d\'équations as-tu dans ce système ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Un système de 2 équations à 2 inconnues a la forme générale : ax + by = c et dx + ey = f',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Sépare les deux équations en cherchant le mot "et" ou en identifiant les deux signes "="',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: `Équation 1: ${this.extractFirstEquation(system)}`,
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: `Équation 1: ${this.extractFirstEquation(system)}, Équation 2: ${this.extractSecondEquation(system)}`,
            xpCost: 50
          }
        ],
        successMessage: '✅ Parfait ! Tu as bien identifié les deux équations',
        errorMessages: {
          'wrong-identification': '⚠️ Vérifie que tu as bien identifié les deux équations'
        },
        xpReward: 20
      },
      {
        id: 'step-2',
        title: 'Choisir la méthode de résolution',
        description: 'Quelle méthode veux-tu utiliser ?',
        order: 2,
        type: 'method-selection',
        estimatedDuration: 60,
        inputs: [
          {
            id: 'method',
            label: 'Méthode',
            type: 'select',
            options: ['Substitution', 'Combinaison (addition)', 'Graphique'],
            expected: 'Substitution',
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Quelles méthodes connais-tu pour résoudre un système ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Les principales méthodes sont : Substitution, Combinaison, et Graphique',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'La substitution consiste à isoler une inconnue dans une équation et remplacer dans l\'autre',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: 'Pour ce système, la méthode de substitution est recommandée',
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: 'Méthode recommandée : Substitution',
            xpCost: 50
          }
        ],
        successMessage: '✅ Bon choix de méthode !',
        errorMessages: {
          'wrong-method': '⚠️ Cette méthode fonctionne aussi, mais substitution est plus rapide ici'
        },
        xpReward: 15
      },
      {
        id: 'step-3',
        title: 'Isoler une inconnue dans la première équation',
        description: 'Exprime x en fonction de y (ou vice versa)',
        order: 3,
        type: 'isolation',
        estimatedDuration: 90,
        inputs: [
          {
            id: 'isolated',
            label: 'Inconnue isolée',
            type: 'text',
            expected: 'x = ',
            validation: 'contains'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Comment exprimes-tu x en fonction de y ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Isoler x signifie avoir x d\'un côté et le reste de l\'autre',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Utilise les opérations inverses pour isoler x',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: 'Pour 2x - 3y = 9, on obtient x = (9 + 3y) / 2',
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: 'Exemple: x = (9 + 3y) / 2',
            xpCost: 50
          }
        ],
        successMessage: '✅ Bien isolé !',
        errorMessages: {
          'wrong-isolation': '⚠️ Vérifie ton isolation d\'inconnue'
        },
        xpReward: 25
      },
      {
        id: 'step-4',
        title: 'Substituer dans la deuxième équation',
        description: 'Remplace l\'inconnue isolée dans la deuxième équation',
        order: 4,
        type: 'substitution',
        estimatedDuration: 90,
        inputs: [
          {
            id: 'substituted',
            label: 'Équation après substitution',
            type: 'text',
            expected: 'y',
            validation: 'contains'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Où remplaces-tu l\'expression que tu as trouvée ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Substituer signifie remplacer par la valeur équivalente',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Remplace x dans la 2ème équation par l\'expression trouvée à l\'étape 3',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: 'Exemple: 54 × ((9 + 3y) / 2) - 9y = 10',
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: '243 + 81y - 9y = 10, donc 72y = -233',
            xpCost: 50
          }
        ],
        successMessage: '✅ Substitution réussie !',
        errorMessages: {
          'wrong-substitution': '⚠️ Vérifie ta substitution'
        },
        xpReward: 25
      },
      {
        id: 'step-5',
        title: 'Résoudre pour trouver la première valeur',
        description: 'Calcule la valeur de y (ou x)',
        order: 5,
        type: 'calculation',
        estimatedDuration: 60,
        inputs: [
          {
            id: 'first-value',
            label: 'Valeur de y',
            type: 'number',
            expected: -233/72,
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Comment résous-tu cette équation à une inconnue ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Utilise les opérations inverses pour isoler y',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Simplifie puis divise pour obtenir y',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: 'y = -233 / 72',
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: 'y = -233/72 ≈ -3.236',
            xpCost: 50
          }
        ],
        successMessage: '✅ Première valeur trouvée !',
        errorMessages: {
          'calculation-error': '⚠️ Vérifie tes calculs'
        },
        xpReward: 20
      },
      {
        id: 'step-6',
        title: 'Trouver la deuxième valeur',
        description: 'Substitue la valeur trouvée pour obtenir l\'autre inconnue',
        order: 6,
        type: 'calculation',
        estimatedDuration: 60,
        inputs: [
          {
            id: 'second-value',
            label: 'Valeur de x',
            type: 'number',
            expected: -1/24,
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Comment trouves-tu x maintenant que tu connais y ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Remplace y par sa valeur dans une des équations originales',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Utilise la formule d\'isolation de l\'étape 3',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: 'x = (9 + 3 × (-233/72)) / 2',
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: 'x = -1/24 ≈ -0.042',
            xpCost: 50
          }
        ],
        successMessage: '✅ Deuxième valeur trouvée !',
        errorMessages: {
          'calculation-error': '⚠️ Vérifie tes calculs'
        },
        xpReward: 20
      }
    ];

    return steps;
  }

  /**
   * Génère les étapes pour une équation du premier degré
   */
  generateStepsForLinear(equation) {
    const steps = [
      {
        id: 'step-1',
        title: 'Identifier l\'équation',
        description: 'Reconnais le type d\'équation',
        order: 1,
        type: 'identification',
        estimatedDuration: 30,
        inputs: [
          {
            id: 'equation-type',
            label: 'Type d\'équation',
            type: 'select',
            options: ['Premier degré', 'Second degré', 'Système'],
            expected: 'Premier degré',
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Quel est le degré le plus élevé de x dans cette équation ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Une équation du premier degré a la forme ax + b = c',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Cherche la puissance la plus élevée de x',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: 'Si x n\'a pas d\'exposant, c\'est du premier degré',
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: 'Type: Premier degré',
            xpCost: 50
          }
        ],
        successMessage: '✅ Correct ! C\'est une équation du premier degré',
        errorMessages: {
          'wrong-type': '⚠️ Vérifie le degré de l\'équation'
        },
        xpReward: 15
      },
      {
        id: 'step-2',
        title: 'Isoler x',
        description: 'Exprime x en fonction des autres termes',
        order: 2,
        type: 'isolation',
        estimatedDuration: 60,
        inputs: [
          {
            id: 'isolated-x',
            label: 'x =',
            type: 'text',
            expected: 'x = ',
            validation: 'contains'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Comment fais-tu passer les autres termes de l\'autre côté ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Utilise les opérations inverses',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Addition ↔ Soustraction, Multiplication ↔ Division',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: 'Exemple: 2x + 3 = 7 → 2x = 7 - 3',
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: 'x = (terme constant) / (coefficient de x)',
            xpCost: 50
          }
        ],
        successMessage: '✅ Bien isolé !',
        errorMessages: {
          'wrong-isolation': '⚠️ Vérifie ton isolation'
        },
        xpReward: 20
      },
      {
        id: 'step-3',
        title: 'Calculer la valeur',
        description: 'Effectue le calcul final',
        order: 3,
        type: 'calculation',
        estimatedDuration: 45,
        inputs: [
          {
            id: 'final-value',
            label: 'Valeur de x',
            type: 'number',
            expected: this.extractLinearSolution(equation),
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Quelle est la valeur numérique de x ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Divise le terme constant par le coefficient',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Effectue le calcul étape par étape',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: 'Exemple: x = 4 / 2 = 2',
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: `Solution: ${this.extractLinearSolution(equation)}`,
            xpCost: 50
          }
        ],
        successMessage: '✅ Solution trouvée !',
        errorMessages: {
          'calculation-error': '⚠️ Vérifie tes calculs'
        },
        xpReward: 25
      },
      {
        id: 'step-4',
        title: 'Vérifier la solution',
        description: 'Remplace x par sa valeur dans l\'équation originale',
        order: 4,
        type: 'verification',
        estimatedDuration: 45,
        inputs: [
          {
            id: 'verification',
            label: 'Vérification',
            type: 'select',
            options: ['Correct', 'Incorrect'],
            expected: 'Correct',
            validation: 'exact'
          }
        ],
        hints: [
          {
            level: 1,
            type: 'socratic',
            content: 'Que se passe-t-il si tu remplaces x par ta solution ?',
            xpCost: 0
          },
          {
            level: 2,
            type: 'conceptual',
            content: 'Une solution correcte vérifie l\'égalité',
            xpCost: 5
          },
          {
            level: 3,
            type: 'method',
            content: 'Remplace x et calcule les deux côtés',
            xpCost: 10
          },
          {
            level: 4,
            type: 'partial',
            content: 'Si les deux côtés sont égaux, c\'est correct',
            xpCost: 20
          },
          {
            level: 5,
            type: 'full',
            content: 'Vérification: Correct',
            xpCost: 50
          }
        ],
        successMessage: '✅ Parfait ! La solution est vérifiée',
        errorMessages: {
          'wrong-verification': '⚠️ Vérifie ta solution'
        },
        xpReward: 20
      }
    ];

    return steps;
  }

  extractLinearSolution(equation) {
    // Extraction simple pour équation linéaire
    // Format: ax + b = c
    const match = equation.match(/(\d*)x\s*([+-])\s*(\d+)\s*=\s*(\d+)/);
    if (match) {
      const [, aStr, op, bStr, cStr] = match;
      const a = parseInt(aStr) || 1;
      const b = parseInt(bStr);
      const c = parseInt(cStr);
      
      if (op === '+') {
        return (c - b) / a;
      } else {
        return (c + b) / a;
      }
    }
    return 0; // fallback
  }

  /**
   * Génère un résumé de session
   */
  getSessionSummary() {
    const duration = Date.now() - this.sessionData.startTime;
    const totalXp = this.sessionData.xpEarned;
    const hintsCost = this.sessionData.hintsUsed.reduce((sum, hint) => sum + hint.xpCost, 0);
    const finalXp = Math.max(0, totalXp - hintsCost);

    return {
      equation: this.sessionData.equation,
      duration: Math.round(duration / 1000), // en secondes
      stepsCompleted: this.sessionData.completedSteps.length,
      totalSteps: this.steps.size,
      xpEarned: finalXp,
      hintsUsed: this.sessionData.hintsUsed.length,
      errors: this.sessionData.errors.length,
      guidanceLevel: this.guidanceLevel,
      success: this.sessionData.completedSteps.length === this.steps.size
    };
  }
}

export default StepEngine;
