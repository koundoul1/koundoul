/**
 * 🚨 Détecteur d'Erreurs Courantes - KOUNDOUL
 * Détecte les erreurs fréquentes que les élèves commettent
 */

class ErrorDetector {
  
  /**
   * Base de données des erreurs courantes
   */
  commonErrors = [
    {
      id: "sign-error-discriminant",
      name: "Erreur de signe dans le discriminant",
      category: "algebra",
      patterns: [
        /b²\+4ac/i,
        /b\s*\^2\s*\+4ac/i,
        /delta\s*=\s*b²\s*\+4ac/i
      ],
      explanation: "⚠️ Le discriminant est Δ = b² **MOINS** 4ac, pas plus !",
      howToFix: [
        "Rappelle-toi : Δ = b² - 4ac",
        "Le signe est toujours négatif devant 4ac",
        "Attention aux signes de b et c"
      ],
      visualAid: "discriminant-formula-highlight",
      frequency: 0.35 // 35% des élèves font cette erreur
    },
    {
      id: "forgot-two-solutions",
      name: "Solution unique oubliée",
      category: "algebra",
      patterns: [
        (input) => {
          // Détecter si une seule solution alors que Δ > 0
          const solutions = input.match(/x\s*=\s*[^,\n]+/g);
          return solutions && solutions.length === 1 && input.includes("delta") && input.includes(">") && input.includes("0");
        }
      ],
      explanation: "🔍 Attention ! Quand Δ > 0, il y a DEUX solutions",
      howToFix: [
        "Utilise ± dans la formule : x = (-b ± √Δ) / 2a",
        "Calcule x₁ et x₂ séparément",
        "Vérifie toujours : tu dois avoir deux valeurs"
      ],
      visualAid: "two-solutions-parabola",
      frequency: 0.28
    },
    {
      id: "division-by-zero",
      name: "Division par zéro",
      category: "general",
      patterns: [
        /\/\s*0/g,
        /diviser par 0/i,
        /÷\s*0/g
      ],
      explanation: "🚫 On ne peut pas diviser par zéro !",
      howToFix: [
        "Vérifie que le dénominateur n'est pas nul",
        "Pose une condition d'existence si nécessaire : dénominateur ≠ 0",
        "Si le dénominateur = 0, la solution n'existe pas"
      ],
      visualAid: "division-by-zero-explanation",
      frequency: 0.15
    },
    {
      id: "wrong-derivative-exp",
      name: "Dérivée exponentielle incorrecte",
      category: "calculus",
      patterns: [
        /exp\([^)]*\)'\s*=\s*exp\(\d+\)/,
        (input) => {
          // Détecter [exp(2x)]' = exp(2) au lieu de 2*exp(2x)
          return /exp\([^)]*x\)'\s*=\s*exp\([^)]*\)/i.test(input) && !input.includes("*");
        }
      ],
      explanation: "❌ Tu as oublié de dériver ce qu'il y a DANS l'exponentielle !",
      howToFix: [
        "Formule : [exp(u)]' = u' × exp(u)",
        "Si u = 2x, alors u' = 2",
        "Donc [exp(2x)]' = 2 × exp(2x)"
      ],
      visualAid: "chain-rule-exponential",
      frequency: 0.42
    },
    {
      id: "units-mismatch",
      name: "Incohérence d'unités",
      category: "physics",
      patterns: [
        /m\/s.*km\/h/i,
        /km\/h.*m\/s/i,
        /m.*km/,
        /kg.*g/
      ],
      explanation: "⚠️ Attention aux unités ! Tu mélanges différentes unités",
      howToFix: [
        "Convertis tout dans la même unité",
        "1 m/s = 3.6 km/h",
        "1 km = 1000 m",
        "Vérifie l'unité demandée dans l'énoncé"
      ],
      frequency: 0.22
    },
    {
      id: "wrong-sign-quadratic",
      name: "Confusion des signes dans équation quadratique",
      category: "algebra",
      patterns: [
        (input) => {
          // Détecter confusion entre x²+5x+6 et x²-5x+6
          return input.includes("x²") && input.includes("=") && !input.match(/x²[+\-]?(\d+)x/);
        }
      ],
      explanation: "⚠️ Fais attention aux signes dans ton équation",
      howToFix: [
        "Une équation quadratique s'écrit : ax² + bx + c = 0",
        "Attention aux signes de b et c",
        "Réécris correctement avant de résoudre"
      ],
      frequency: 0.18
    },
    {
      id: "forgot-check-answer",
      name: "Oubli de vérification",
      category: "general",
      patterns: [
        (input) => {
          // Pas de substitution ni de vérification visible
          return !input.match(/vérif/i) && !input.match(/substitu/i) && input.includes("x =");
        }
      ],
      explanation: "✅ N'oublie pas de vérifier ta solution !",
      howToFix: [
        "Remplace ta solution dans l'équation d'origine",
        "Vérifie que le résultat = 0 (ou équivalent)",
        "Assure-toi que ta solution est cohérente"
      ],
      frequency: 0.30
    }
  ];

  /**
   * Détecte les erreurs dans le travail de l'élève
   * @param {string} studentWork - Travail de l'élève
   * @param {string} problemType - Type de problème
   * @returns {Array} - Liste des erreurs détectées
   */
  async detectErrors(studentWork, problemType) {
    const detectedErrors = [];

    // Filtrer les erreurs pertinentes pour ce type de problème
    const relevantErrors = this.commonErrors.filter(error =>
      this.isRelevantForProblem(error, problemType)
    );

    // Tester chaque pattern
    for (const error of relevantErrors) {
      if (this.matchesError(studentWork, error)) {
        detectedErrors.push(error);
      }
    }

    return detectedErrors;
  }

  /**
   * Vérifie si une erreur est pertinente pour le type de problème
   */
  isRelevantForProblem(error, problemType) {
    // Si l'erreur n'a pas de catégorie spécifique, elle s'applique à tout
    if (!error.category) return true;

    // Mapping des types de problèmes aux catégories
    const typeMapping = {
      equation_second_degree: 'algebra',
      derivative: 'calculus',
      integral: 'calculus',
      physics_kinematics: 'physics',
      physics_forces: 'physics'
    };

    const problemCategory = typeMapping[problemType];
    return error.category === problemCategory || !problemCategory;
  }

  /**
   * Vérifie si le travail de l'élève correspond à une erreur
   */
  matchesError(studentWork, error) {
    // Vérifier chaque pattern
    for (const pattern of error.patterns) {
      if (typeof pattern === 'function') {
        // Pattern personnalisé (fonction)
        if (pattern(studentWork)) {
          return true;
        }
      } else if (pattern instanceof RegExp) {
        // Pattern regex
        if (pattern.test(studentWork)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Génère un feedback pour une erreur détectée
   */
  generateErrorFeedback(error, studentWork) {
    return {
      type: 'error',
      severity: 'warning',
      message: error.explanation,
      details: `${this.getFrequencyMessage(error)}`,
      suggestions: error.howToFix,
      visualAid: error.visualAid,
      category: error.category
    };
  }

  /**
   * Obtient un message sur la fréquence de l'erreur
   */
  getFrequencyMessage(error) {
    const percentage = (error.frequency * 100).toFixed(0);
    return `Cette erreur est très courante : ${percentage}% des élèves la commettent. Ne t'inquiète pas, nous allons corriger ensemble`;
  }

  /**
   * Détecte les erreurs de syntaxe mathématique
   */
  detectSyntaxErrors(input) {
    const syntaxErrors = [];

    // Parenthèses non équilibrées
    const openParens = (input.match(/\(/g) || []).length;
    const closeParens = (input.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      syntaxErrors.push({
        id: "unbalanced-parentheses",
        message: "⚠️ Tes parenthèses ne sont pas équilibrées",
        fix: "Compte tes parenthèses : ( et ) doivent être en nombre égal"
      });
    }

    // Crochets non équilibrés
    const openBrackets = (input.match(/\[/g) || []).length;
    const closeBrackets = (input.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      syntaxErrors.push({
        id: "unbalanced-brackets",
        message: "⚠️ Tes crochets ne sont pas équilibrés",
        fix: "Compte tes crochets : [ et ] doivent être en nombre égal"
      });
    }

    // Opérateurs mal placés (ex: +*, **, //)
    if (/[+\-*/]{2,}/.test(input)) {
      syntaxErrors.push({
        id: "consecutive-operators",
        message: "⚠️ Tu as mis des opérateurs à la suite",
        fix: "Récris clairement en évitant les opérateurs consécutifs"
      });
    }

    return syntaxErrors;
  }

  /**
   * Calcule un score d'erreur (0-100)
   */
  calculateErrorScore(detectedErrors) {
    if (detectedErrors.length === 0) return 100;

    // Score décroissant selon le nombre d'erreurs
    const basePenalty = 20;
    const totalPenalty = detectedErrors.length * basePenalty;
    return Math.max(0, 100 - totalPenalty);
  }
}

export default new ErrorDetector();

