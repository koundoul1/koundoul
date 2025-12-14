/**
 * 🔍 Universal Problem Parser - KOUNDOUL
 * Système de parsing multi-modal pour tous types de problèmes
 */

class UniversalProblemParser {
  constructor() {
    this.mathPatterns = {
      derivative: /dérivée|dériver|f'|df\/dx|différentiel/i,
      integral: /intégrale|intégrer|∫|primitive/i,
      equation: /=|résoudre|solution|équation/i,
      system: /système|et|plusieurs.*équations/i,
      limit: /limite|lim|tend.*vers/i,
      function: /fonction|f\(x\)|g\(x\)|h\(x\)/i,
      complex: /complexe|z\s*=|module|argument/i,
      sequence: /suite|u_n|v_n|terme|récurrent/i
    };

    this.physicsPatterns = {
      kinematics: /vitesse|accélération|acceleration|mru|mra|mouvement|trajectoire|cinématique|cinematique/i,
      dynamics: /force|newton|masse|kg|équilibre|equilibre|frottement/i,
      energy: /énergie|energie|travail|puissance|cinétique|potentielle/i,
      electricity: /électricité|electricite|courant|tension|ampère|volt|ohm|résistance|resistance|circuit/i,
      waves: /onde|longueur.*d.*onde|fréquence|frequence|période|periode|amplitude/i,
      optics: /optique|lentille|foyer|miroir|réfraction|refraction/i,
      thermodynamics: /température|temperature|gaz|parfait|thermodynamique|enthalpie/i
    };

    this.chemistryPatterns = {
      stoichiometry: /réaction|reaction|équation.*chimique|equation.*chimique|mole|mol|concentration|dilution/i,
      acidBase: /acide|base|ph|pka|pkb|titrage|neutralisation/i,
      redox: /oxydation|réduction|reduction|redox|électrons|electrons|demi.*équation/i,
      equilibrium: /équilibre|equilibre|constante|ksp|ka|kb|quotient/i,
      kinetics: /vitesse.*réaction|cinétique|cinetique|ordre|constante.*vitesse/i,
      thermochemistry: /enthalpie|entropie|Δh|delta.*h|thermochimie/i
    };
  }

  /**
   * Parse un problème depuis un texte brut
   */
  parseText(text) {
    const cleanText = text.trim();
    
    // Extraction des variables
    const variables = this.extractVariables(cleanText);
    
    // Extraction des contraintes
    const constraints = this.extractConstraints(cleanText);
    
    // Extraction des questions
    const questions = this.extractQuestions(cleanText);
    
    // Classification du sujet et type
    const classification = this.classifyProblem(cleanText);
    
    // Extraction des données
    const givens = this.extractGivens(cleanText, classification.subject);
    
    // Identification des inconnues
    const unknowns = this.extractUnknowns(cleanText, questions);
    
    // Analyse de complexité
    const complexity = this.analyzeComplexity(cleanText, classification, questions);
    
    // Concepts impliqués
    const concepts = this.identifyConcepts(classification, cleanText);
    
    return {
      id: `problem-${Date.now()}`,
      rawText: cleanText,
      subject: classification.subject,
      mainType: classification.mainType,
      subTypes: classification.subTypes,
      context: {
        description: this.extractDescription(cleanText),
        givens,
        unknowns,
        constraints,
        assumptions: this.extractAssumptions(cleanText)
      },
      questions,
      complexity,
      concepts,
      suggestedStrategies: [],
      metadata: {
        parsedAt: new Date().toISOString(),
        confidence: classification.confidence
      }
    };
  }

  /**
   * Extract variables from text (ex: m=0.2, v₀=20 m/s)
   */
  extractVariables(text) {
    const variables = [];
    
    // Pattern: name = value unit
    const varPattern = /([a-z_₀₁₂₃₄₅₆₇₈₉]+)\s*=\s*([0-9.,]+)\s*([a-z²³/]*)?/gi;
    let match;
    
    while ((match = varPattern.exec(text)) !== null) {
      const [, name, value, unit] = match;
      variables.push({
        name: name.trim(),
        value: parseFloat(value.replace(',', '.')),
        unit: unit?.trim() || '',
        description: this.getVariableDescription(name.trim(), text)
      });
    }
    
    return variables;
  }

  /**
   * Extract constraints (ex: "On néglige...", "Frottement = -kv²")
   */
  extractConstraints(text) {
    const constraints = [];
    const constraintPatterns = [
      /on néglige[^\\.]*/gi,
      /on suppose[^\\.]*/gi,
      /(?:force|frottement|résistance)\s*(?:de|du)?\s*[=:]\s*[^\\.]+/gi,
      /négligeable/gi,
      /constant/gi
    ];

    constraintPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(m => constraints.push(m.trim()));
      }
    });

    return [...new Set(constraints)];
  }

  /**
   * Extract questions from text
   */
  extractQuestions(text) {
    const questions = [];
    
    // Pattern pour identifier les questions (commencent souvent par "Quel", "Calculer", etc.)
    const questionPatterns = [
      /(?:Quel|quelle|quels|que|calculer|déterminer|démontrer|trouver|exprimer|montrer)[^\?]*\?/gi,
      /(?:Quel|quelle|quels|que|calculer|déterminer|démontrer|trouver|exprimer|montrer)[^\.]*\./gi
    ];

    questionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((q, idx) => {
          questions.push({
            id: `q${idx + 1}`,
            order: idx + 1,
            text: q.trim(),
            type: this.classifyQuestionType(q),
            expectedAnswerType: this.detectAnswerType(q),
            dependencies: [],
            estimatedTime: this.estimateQuestionTime(q),
            difficulty: this.estimateQuestionDifficulty(q)
          });
        });
      }
    });

    // Si aucune question explicite, la question est implicite dans le problème
    if (questions.length === 0) {
      questions.push({
        id: 'q1',
        order: 1,
        text: 'Résoudre le problème',
        type: 'calculation',
        expectedAnswerType: 'mixed',
        dependencies: [],
        estimatedTime: 10,
        difficulty: 3
      });
    }

    return questions;
  }

  /**
   * Classify the problem (subject, main type, sub types)
   */
  classifyProblem(text) {
    const lowerText = text.toLowerCase();
    
    // Détection du sujet
    let subject = 'math';
    let mainType = 'unknown';
    let subTypes = [];
    let confidence = 0.5;

    // Vérifier la physique
    let physicsScore = 0;
    Object.keys(this.physicsPatterns).forEach(type => {
      if (this.physicsPatterns[type].test(text)) {
        physicsScore++;
        if (physicsScore === 1) {
          subject = 'physics';
          mainType = type;
          confidence = 0.8;
        }
        subTypes.push(type);
      }
    });

    // Vérifier la chimie
    let chemistryScore = 0;
    Object.keys(this.chemistryPatterns).forEach(type => {
      if (this.chemistryPatterns[type].test(text)) {
        chemistryScore++;
        if (chemistryScore === 1 && physicsScore === 0) {
          subject = 'chemistry';
          mainType = type;
          confidence = 0.8;
        }
        subTypes.push(type);
      }
    });

    // Si pas de match physique/chimie, chercher en math
    if (subject === 'math' && physicsScore === 0 && chemistryScore === 0) {
      Object.keys(this.mathPatterns).forEach(type => {
        if (this.mathPatterns[type].test(text)) {
          if (mainType === 'unknown') {
            mainType = type;
            confidence = 0.7;
          }
          subTypes.push(type);
        }
      });
    }

    // Détection fine selon le sujet
    if (subject === 'physics' && mainType === 'kinematics') {
      if (/vertical|verticalement|vers.*haut|vers.*bas/i.test(text)) {
        subTypes.push('vertical-motion');
      }
      if (/parabolique|projectile|tir/i.test(text)) {
        subTypes.push('projectile-motion');
      }
      if (/frottement|résistance.*air/i.test(text)) {
        subTypes.push('with-friction');
        if (/v²|v\^2/i.test(text)) {
          subTypes.push('quadratic-friction');
        }
      }
    }

    if (subject === 'chemistry' && mainType === 'stoichiometry') {
      if (/acide|hcl|hno3|h2so4/i.test(text) && /métal|zinc|fer|magnésium/i.test(text)) {
        subTypes.push('acid-metal-reaction');
      }
    }

    return {
      subject,
      mainType,
      subTypes,
      confidence
    };
  }

  /**
   * Extract given data
   */
  extractGivens(text, subject) {
    const givens = this.extractVariables(text);
    
    // Enrichir avec des patterns spécifiques selon le sujet
    if (subject === 'physics') {
      // Rechercher des données physiques courantes
      const patterns = {
        mass: /masse[^\d]*([0-9.,]+)\s*kg/gi,
        velocity: /vitesse[^\d]*([0-9.,]+)\s*m\/s/gi,
        acceleration: /(?:accélération|acceleration|g)[^\d]*([0-9.,]+)\s*m\/s²/gi,
        height: /(?:hauteur|altitude)[^\d]*([0-9.,]+)\s*m/gi,
        time: /(?:temps|durée)[^\d]*([0-9.,]+)\s*s/gi
      };

      Object.keys(patterns).forEach(key => {
        const match = text.match(patterns[key]);
        if (match) {
          givens.push({
            name: key,
            value: parseFloat(match[0].match(/[0-9.,]+/)[0].replace(',', '.')),
            unit: key === 'mass' ? 'kg' : key === 'velocity' ? 'm/s' : key === 'acceleration' ? 'm/s²' : key === 'height' ? 'm' : 's',
            description: `Donnée ${key} extraite du texte`
          });
        }
      });
    }

    return givens;
  }

  /**
   * Extract unknowns (what we're looking for)
   */
  extractUnknowns(text, questions) {
    const unknowns = [];
    
    questions.forEach(q => {
      // Extraire ce qui est demandé dans la question
      const questionLower = q.text.toLowerCase();
      
      if (/vitesse|v/i.test(questionLower)) unknowns.push({ name: 'v', description: 'Vitesse' });
      if (/hauteur|h/i.test(questionLower)) unknowns.push({ name: 'h', description: 'Hauteur' });
      if (/temps|t/i.test(questionLower)) unknowns.push({ name: 't', description: 'Temps' });
      if (/dérivée|f'|derivee/i.test(questionLower)) unknowns.push({ name: "f'(x)", description: 'Dérivée' });
      if (/produit|composé|résultat/i.test(questionLower)) unknowns.push({ name: 'produit', description: 'Produit de la réaction' });
    });

    return [...new Set(unknowns.map(u => u.name))].map(name => {
      return unknowns.find(u => u.name === name);
    });
  }

  /**
   * Analyze complexity (1-5 stars)
   */
  analyzeComplexity(text, classification, questions) {
    let complexityScore = 1;
    
    // Nombre de concepts impliqués
    complexityScore += classification.subTypes.length * 0.5;
    
    // Nombre de questions
    complexityScore += questions.length * 0.3;
    
    // Longueur et complexité du texte
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 100) complexityScore += 0.5;
    if (wordCount > 200) complexityScore += 0.5;
    
    // Mots-clés de difficulté
    if (/complexe|difficile|avancé|olympiade/i.test(text)) complexityScore += 1;
    if (/simple|facile|basique/i.test(text)) complexityScore -= 0.5;
    
    // Types spécifiques difficiles
    if (classification.subTypes.includes('differential-equation')) complexityScore += 1;
    if (classification.subTypes.includes('quadratic-friction')) complexityScore += 0.5;
    
    const overall = Math.min(5, Math.max(1, Math.round(complexityScore)));
    
    return {
      overall,
      perQuestion: questions.map(q => q.difficulty),
      reasoning: `Complexité basée sur ${classification.subTypes.length} concepts, ${questions.length} questions, longueur ${wordCount} mots`
    };
  }

  /**
   * Identify concepts involved
   */
  identifyConcepts(classification, text) {
    const concepts = [];
    
    const conceptMap = {
      'derivative': {
        id: 'derivatives',
        name: 'Dérivées',
        domain: 'mathematics',
        level: 'premiere',
        prerequisites: ['limits', 'continuity']
      },
      'kinematics': {
        id: 'kinematics',
        name: 'Cinématique',
        domain: 'mechanics',
        level: 'premiere',
        prerequisites: ['motion-basics']
      },
      'stoichiometry': {
        id: 'stoichiometry',
        name: 'Stœchiométrie',
        domain: 'chemistry',
        level: 'premiere',
        prerequisites: ['chemical-equations']
      }
    };

    if (conceptMap[classification.mainType]) {
      concepts.push(conceptMap[classification.mainType]);
    }

    return concepts;
  }

  // Helper methods
  extractDescription(text) {
    const sentences = text.split(/[.!?]\s+/);
    return sentences[0] || text.substring(0, 100);
  }

  extractAssumptions(text) {
    const assumptions = [];
    const assumptionPatterns = [
      /on néglige[^\\.]*/gi,
      /on suppose[^\\.]*/gi,
      /hypothèse[^\\.]*/gi
    ];

    assumptionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        assumptions.push(...matches.map(m => m.trim()));
      }
    });

    return assumptions;
  }

  getVariableDescription(name, text) {
    // Chercher une description contextuelle autour de la variable
    const namePattern = new RegExp(`${name.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, '.*')}[^\\w]*(?:est|vaut|\\=)[^\\.,]+`, 'i');
    const match = text.match(namePattern);
    return match ? match[0].substring(0, 50) : '';
  }

  classifyQuestionType(questionText) {
    const q = questionText.toLowerCase();
    if (/démontrer|montrer|prouver/i.test(q)) return 'proof';
    if (/exprimer|donner.*expression/i.test(q)) return 'calculation';
    if (/calculer|trouver.*valeur/i.test(q)) return 'calculation';
    if (/expliquer|comment|pourquoi/i.test(q)) return 'explanation';
    if (/tracer|représenter|graphe/i.test(q)) return 'graph';
    if (/comparer|comparaison/i.test(q)) return 'comparison';
    return 'calculation';
  }

  detectAnswerType(questionText) {
    const q = questionText.toLowerCase();
    if (/valeur|numérique|chiffre/i.test(q)) return 'numeric';
    if (/expression|forme/i.test(q)) return 'symbolic';
    if (/tracer|graphe/i.test(q)) return 'graph';
    return 'mixed';
  }

  estimateQuestionTime(questionText) {
    const q = questionText.toLowerCase();
    let time = 3;
    if (/complexe|difficile|plusieurs.*étapes/i.test(q)) time += 5;
    if (/calculer|trouver/i.test(q)) time += 2;
    if (/démontrer|prouver/i.test(q)) time += 8;
    return time;
  }

  estimateQuestionDifficulty(questionText) {
    const q = questionText.toLowerCase();
    let diff = 2;
    if (/simple|facile/i.test(q)) diff = 1;
    if (/complexe|difficile|avancé/i.test(q)) diff = 4;
    if (/olympiade|expert/i.test(q)) diff = 5;
    return Math.min(5, Math.max(1, diff));
  }

  /**
   * Parse from image (using OCR fallback or AI)
   */
  async parseImage(imageBase64) {
    // TODO: Intégrer OCR réel (Tesseract.js) ou API vision
    // Pour l'instant, on retourne un placeholder
    return {
      success: false,
      message: 'OCR not yet implemented, please use text input',
      fallback: this.parseText('Image fournie - conversion nécessaire')
    };
  }

  /**
   * Parse LaTeX
   */
  parseLatex(latex) {
    // TODO: Parser LaTeX vers AST mathématique
    return this.parseText(latex);
  }

  /**
   * Parse MathML
   */
  parseMathML(mathml) {
    // TODO: Parser MathML
    return this.parseText(mathml);
  }
}

export default UniversalProblemParser;










