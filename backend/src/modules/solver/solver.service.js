import prismaService from '../../database/prisma.js';
import fetch from 'node-fetch';
import { ALL_PHYSICS_CONSTANTS, findConstantBySymbol, formatConstant } from '../../constants/physics-constants.js';
import { convertUnit, detectUnitType, formatValue } from '../../constants/unit-conversions.js';
import { ALL_FORMULAS, findFormulas, formatFormula } from '../../constants/formulas.js';

class SolverService {
  
  // Résoudre un problème avec Gemini
  async solveProblem(userId, input, domain, level, customPrompt = null) {
    try {
      console.log('🔍 Solving problem:', { userId, domain, level, hasCustomPrompt: !!customPrompt });

      // Appel à l'API Gemini
      const solution = await this.callGeminiAPI(input, domain, level, customPrompt);

      // Sauvegarder dans la base de données
      const problem = await prismaService.client.problem.create({
        data: {
          title: `Problème ${domain} - ${level}`,
          description: input,
          category: domain,
          difficulty: level.toLowerCase(),
          subject: domain.toLowerCase(),
          points: 10,
          userId: userId
        }
      });

      // Mettre à jour l'utilisateur (XP +10)
      await prismaService.client.user.update({
        where: { id: userId },
        data: {
          xp: { increment: 10 }
        }
      });

      console.log('✅ Problem solved and saved');

      return {
        success: true,
        problem,
        solution,
        xpGained: 10
      };

    } catch (error) {
      console.error('❌ Solver error:', error);
      throw error;
    }
  }

  /**
   * Exponential backoff pour retry automatique des appels API
   */
  async exponentialBackoff(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        const backoffDelay = delay * Math.pow(2, i);
        console.warn(`⚠️ Tentative ${i + 1}/${maxRetries} échouée. Nouvelle tentative dans ${backoffDelay}ms.`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  // Appel à l'API Gemini - UNIQUEMENT IA, pas de fallback
  async callGeminiAPI(input, domain, level, customPrompt = null) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      throw new Error('❌ GOOGLE_AI_API_KEY est requise. Le solver nécessite Gemini IA pour fonctionner.');
    }

    // Adapter le prompt selon le niveau de difficulté
    const levelGuidance = {
      easy: "Utilise un vocabulaire simple et accessible pour un élève de Seconde. Décompose chaque étape en sous-étapes très détaillées. Ajoute des rappels de formules et des analogies du quotidien.",
      medium: "Utilise un vocabulaire technique progressif pour un élève de Première. Justifie chaque étape et fais des liens entre les concepts. Propose une méthode de vérification.",
      hard: "Utilise un vocabulaire technique avancé pour un élève de Terminale. Applique un raisonnement mathématique rigoureux. Propose des applications concrètes et des variantes du problème.",
      expert: "Niveau supérieur: démonstrations complètes, rigueur maximale, liens avec d'autres domaines scientifiques."
    };

    // Adapter selon le domaine
    const domainGuidance = {
      math: "mathématiques. Propose une visualisation graphique si pertinent. Vérifie la solution par une méthode alternative.",
      physics: "physique. Commence par un schéma du système. Effectue une analyse dimensionnelle. Donne une application concrète du phénomène.",
      chemistry: "chimie. Écris l'équation bilan. Propose un tableau d'avancement si pertinent. Mentionne les applications pratiques.",
      biology: "biologie/SVT. Utilise des schémas si nécessaire. Explique les processus biologiques étape par étape. Fais le lien avec la santé ou l'environnement.",
      general: "sciences. Adopte une approche interdisciplinaire et pédagogique."
    };

    const levelText = levelGuidance[level] || levelGuidance.easy;
    const domainText = domainGuidance[domain] || domainGuidance.general;

    // Préparer les constantes et formules pertinentes (aide contextuelle seulement)
    const relevantConstants = this.getRelevantConstants(domain, input);
    const relevantFormulas = this.getRelevantFormulas(domain, input);

    // PROMPT AMÉLIORÉ pour résolution intégrale complète sans interaction
    const systemPrompt = `Tu es un Professeur et Coach Pédagogique de niveau Supérieur. 
Ton objectif est de fournir une RÉSOLUTION COMPLÈTE et INTÉGRALE du problème, sans demander d'interaction à l'élève.

**RÔLE :** Résoudre le problème de A à Z avec une stratégie pédagogique complète.
**EXIGENCE :** Donner la SOLUTION COMPLÈTE immédiatement, toutes les étapes détaillées, tous les calculs, toutes les justifications.

**STRUCTURE OBLIGATOIRE DE LA RÉPONSE (Markdown avec LaTeX) :**
1. **Analyse Complète :** Identifier TOUTES les données (variables, unités, grandeurs connues/inconnues) et TOUTES les lois physiques/mathématiques à appliquer.
2. **Stratégie de Résolution :** Expliquer la méthode choisie (PFD, Équation différentielle, Titrage, etc.) avec justification pédagogique complète.
3. **Résolution Détaillée Étape par Étape :** 
   - Chaque étape doit être COMPLÈTE avec formules en LaTeX ($$...$$ pour bloc, $...$ pour inline)
   - Tous les calculs intermédiaires doivent être montrés
   - Justifications pédagogiques à chaque étape
4. **Application Numérique :** Tous les calculs numériques avec les valeurs substituées, étape par étape.
5. **Résultats Finaux :** Solutions complètes avec unités et vérifications dimensionnelles.
6. **Vérification et Validation :** Tests de cohérence, vérification des unités, validation du résultat.

Le domaine est: ${domainText} et le niveau de complexité est: ${levelText}. Utilise le français.

**FORMATAGE LaTeX OBLIGATOIRE :**
- Utilise $$...$$ pour les formules en mode bloc (ex: $$E = mc^2$$)
- Utilise $...$ pour les formules inline (ex: La vitesse est $v = \\frac{d}{t}$)
- TOUTES les formules mathématiques doivent être en LaTeX`;

    const userPrompt = `Problème: ${input}

AIDE CONTEXTUELLE (optionnelle - utilise uniquement si pertinent):
${relevantConstants.length > 0 ? `CONSTANTES PHYSIQUES:\n${relevantConstants.map(c => formatConstant(c)).join('\n')}\n` : ''}
${relevantFormulas.length > 0 ? `FORMULES PERTINENTES:\n${relevantFormulas.map(f => formatFormula(f)).join('\n')}` : ''}

**INSTRUCTIONS IMPORTANTES :**
- Donne une RÉSOLUTION COMPLÈTE et INTÉGRALE
- Ne demande PAS de participation à l'élève
- Fournis TOUS les calculs, TOUTES les étapes, TOUTES les formules
- Chaque étape doit être auto-suffisante et complète
- Utilise LaTeX pour TOUTES les expressions mathématiques

Réponds UNIQUEMENT en JSON avec cette structure exacte:
{
  "solution": "Réponse finale COMPLÈTE avec TOUS les résultats numériques et unités (utilise $$...$$ pour formules bloc, $...$ pour inline)",
  "steps": [
    {
      "title": "📚 Analyse Complète du Problème",
      "content": "Identification COMPLÈTE de toutes les données (grandeurs connues/inconnues, unités, lois à appliquer). Formules clés en LaTeX ($$...$$). Analyse dimensionnelle si pertinent."
    },
    {
      "title": "🎯 Stratégie de Résolution", 
      "content": "Explication COMPLÈTE de la méthode choisie (pourquoi cette méthode, quelles lois appliquer, démarche générale). Justification pédagogique avec formules en LaTeX ($$...$$)."
    },
    {
      "title": "📝 Résolution Détaillée Étape par Étape",
      "content": "RÉSOLUTION COMPLÈTE avec: 1) Formulation des équations (LaTeX $$...$$), 2) Tous les calculs intermédiaires montrés, 3) Substitutions numériques étape par étape, 4) Justifications à chaque étape. Format: Etape 1: ... Etape 2: ... etc."
    },
    {
      "title": "🔢 Application Numérique",
      "content": "TOUS les calculs numériques complets avec valeurs substituées. Montrer: formules → substitution → calcul → résultat avec unités. Utiliser LaTeX pour toutes les expressions."
    },
    {
      "title": "✅ Vérification et Validation",
      "content": "Vérification dimensionnelle des résultats, cohérence des unités, validation par méthode alternative si possible, conclusion pédagogique."
    }
  ],
  "explanation": "Résumé pédagogique complet avec points clés, applications pratiques, et conseils d'apprentissage. Formules importantes en LaTeX."
}

⚠️ IMPORTANT - STRUCTURE OBLIGATOIRE:
- Le champ "steps" DOIT être un tableau avec EXACTEMENT 5 éléments (ni plus, ni moins)
- Chaque élément du tableau "steps" DOIT avoir "title" et "content"
- Le JSON DOIT être valide et bien formé
- NE PAS ajouter de texte avant ou après le JSON
- NE PAS utiliser de markdown, UNIQUEMENT du JSON pur

RÈGLES STRICTES:
- RÉSOLUTION COMPLÈTE (pas de "on trouve", montre TOUS les calculs)
- EXACTEMENT 5 étapes détaillées (obligatoire)
- TOUTES les formules en LaTeX
- Contenu exhaustif et pédagogique
- Pas de raccourcis, tout doit être expliqué
- JSON valide uniquement (commence par { et se termine par })`;

    // Utiliser le customPrompt si fourni, sinon le prompt par défaut
    const prompt = customPrompt || `${systemPrompt}\n\n${userPrompt}`;

    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=';
    
    // Fonction d'appel avec gestion d'erreurs robuste
    const fetcher = async () => {
      const response = await fetch(`${API_URL}${apiKey}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          // Configuration pour meilleure précision et support LaTeX
          generationConfig: {
            temperature: 0.1, // Basse température pour plus de précision
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192, // Maximum pour Gemini 2.5 Flash - permet réponses complètes pour problèmes longs
          },
          // Optionnel: Active l'outil de recherche Google pour grounding factuel
          tools: [{ google_search: {} }]
        })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error('❌ Erreur API Gemini:', response.status, errorBody);
        
        // Gestion spécifique des erreurs
        if (response.status === 403 || response.status === 401) {
          throw new Error('❌ Clé API Gemini refusée. Vérifiez votre clé ou votre quota.');
        }
        if (response.status === 429) {
          throw new Error('❌ Limite de taux dépassée. Veuillez réessayer plus tard.');
        }
        throw new Error(`❌ Erreur de service Gemini IA (Status: ${response.status}). ${errorBody.error?.message || ''}`);
      }

      const data = await response.json();
      
      // Vérifier si la réponse est vide ou bloquée par filtres
      const solutionText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!solutionText) {
        const finishReason = data.candidates?.[0]?.finishReason;
        console.error('❌ Réponse IA vide ou bloquée:', finishReason);
        
        if (finishReason === 'SAFETY') {
          throw new Error('❌ La réponse IA a été bloquée par les filtres de sécurité. Veuillez reformuler votre problème.');
        }
        throw new Error('❌ La réponse IA est vide. Veuillez reformuler votre problème.');
      }
      
      return solutionText;
    };
    
    // Utiliser exponential backoff pour retry automatique
    const text = await this.exponentialBackoff(fetcher, 3, 1000);
    
    try {
      // Nettoyer les balises markdown et extraire le JSON
      let cleanText = text
        .replace(/```json\n?/g, '')  // Supprimer ```json
        .replace(/```\n?/g, '')       // Supprimer ```
        .trim();
      
      // Si le texte commence par {, extraire jusqu'à la dernière }
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanText);
      
      // Log pour debug - vérifier la structure
      console.log('📋 Structure de la réponse parsée:', {
        hasSolution: !!parsed.solution,
        hasSteps: !!parsed.steps,
        stepsCount: parsed.steps?.length || 0,
        hasExplanation: !!parsed.explanation
      });
      
      // S'assurer que les steps existent toujours
      if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        console.warn('⚠️ Aucune étape structurée trouvée dans la réponse. Génération de steps par défaut.');
        // Générer des steps par défaut à partir de la solution
        parsed.steps = [
          {
            title: "📚 Analyse Complète du Problème",
            content: parsed.solution || "Analyse du problème en cours..."
          },
          {
            title: "🎯 Stratégie de Résolution",
            content: parsed.explanation || "Stratégie de résolution détaillée..."
          }
        ];
      }
      
      // Nettoyer aussi le contenu des champs si nécessaire
      if (parsed.solution) {
        if (typeof parsed.solution === 'string') {
          parsed.solution = parsed.solution.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (typeof parsed.solution === 'object') {
          // Si solution est un objet, le convertir en string lisible
          parsed.solution = parsed.solution.solution || JSON.stringify(parsed.solution);
        }
      }
      if (parsed.explanation) {
        if (typeof parsed.explanation === 'string') {
          parsed.explanation = parsed.explanation.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (typeof parsed.explanation === 'object') {
          // Si explanation est un objet, le convertir en string lisible
          parsed.explanation = parsed.explanation.explanation || JSON.stringify(parsed.explanation);
        }
      }
      if (parsed.steps && Array.isArray(parsed.steps)) {
        parsed.steps = parsed.steps.map(step => {
          if (typeof step === 'string') {
            return step.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          } else if (step.content) {
            return {
              ...step,
              content: step.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            };
          }
          return step;
        });
      }
      
      return parsed;
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        solution: text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim(),
        steps: [],
        explanation: text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      };
    }
  }

  // Résoudre un problème sans authentification (anonyme)
  async solveProblemAnonymous(input, domain, level, customPrompt = null) {
    try {
      console.log('🔍 Solving problem anonymously:', { domain, level, hasCustomPrompt: !!customPrompt });

      // Appel à l'API Gemini
      const solution = await this.callGeminiAPI(input, domain, level, customPrompt);

      console.log('✅ Problem solved anonymously');

      return {
        success: true,
        solution, // Retourne la solution de Gemini
        xpGained: 0 // Pas de gain d'XP pour les utilisateurs anonymes
      };

    } catch (error) {
      console.error('❌ Anonymous solver error:', error);
      throw error;
    }
  }

  // Récupérer l'historique
  async getUserHistory(userId, limit = 20) {
    return await prismaService.client.problem.findMany({
      where: { 
        user: { id: userId }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // Récupérer un problème spécifique
  async getProblemById(problemId, userId) {
    const problem = await prismaService.client.problem.findFirst({
      where: {
        id: problemId,
        user: { id: userId }
      }
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    return problem;
  }

  // Obtenir les constantes pertinentes pour un domaine et un problème
  getRelevantConstants(domain, input) {
    const lowerInput = input.toLowerCase();
    const relevantConstants = [];

    // Constantes essentielles par domaine
    const domainConstants = {
      math: ['c', 'h', 'G', 'e'],
      physics: ['c', 'h', 'G', 'e', 'k', 'mₑ', 'mₚ', 'α', 'σ', 'b'],
      chemistry: ['R', 'Nₐ', 'F', 'k', 'u', 'Vm'],
      biology: ['k', 'R', 'Nₐ'],
      general: ['c', 'h', 'G', 'e', 'k', 'R', 'Nₐ']
    };

    // Ajouter les constantes du domaine
    const essentialSymbols = domainConstants[domain] || domainConstants.general;
    essentialSymbols.forEach(symbol => {
      const constant = findConstantBySymbol(symbol);
      if (constant) relevantConstants.push(constant);
    });

    // Ajouter des constantes basées sur le contenu du problème
    Object.values(ALL_PHYSICS_CONSTANTS).forEach(constant => {
      const symbol = constant.symbol.toLowerCase();
      const description = constant.description.toLowerCase();
      
      if (lowerInput.includes(symbol) || 
          lowerInput.includes(description.split(' ')[0]) ||
          (domain === 'physics' && ['thermodynamic', 'particle', 'electromagnetic'].includes(constant.category))) {
        if (!relevantConstants.find(c => c.symbol === constant.symbol)) {
          relevantConstants.push(constant);
        }
      }
    });

    return relevantConstants.slice(0, 10); // Limiter à 10 constantes
  }

  // Obtenir les formules pertinentes pour un domaine et un problème
  getRelevantFormulas(domain, input) {
    const lowerInput = input.toLowerCase();
    const relevantFormulas = [];

    // Formules essentielles par domaine
    const domainFormulas = {
      math: ['vitesse_moyenne', 'acceleration_moyenne', 'mouvement_uniforme'],
      physics: ['deuxieme_loi_newton', 'force_gravitationnelle', 'energie_cinetique', 'loi_ohm', 'loi_gaz_parfait'],
      chemistry: ['loi_gaz_parfait', 'quantite_chaleur', 'loi_coulomb'],
      biology: ['loi_gaz_parfait', 'quantite_chaleur'],
      general: ['deuxieme_loi_newton', 'loi_ohm', 'loi_gaz_parfait']
    };

    // Ajouter les formules du domaine
    const essentialFormulas = domainFormulas[domain] || domainFormulas.general;
    essentialFormulas.forEach(formulaKey => {
      if (ALL_FORMULAS[formulaKey]) {
        relevantFormulas.push(ALL_FORMULAS[formulaKey]);
      }
    });

    // Ajouter des formules basées sur le contenu du problème
    Object.entries(ALL_FORMULAS).forEach(([key, formula]) => {
      const formulaText = formula.formula.toLowerCase();
      const description = formula.description.toLowerCase();
      
      if (lowerInput.includes('force') && (formulaText.includes('f =') || description.includes('force'))) {
        if (!relevantFormulas.find(f => f.formula === formula.formula)) {
          relevantFormulas.push(formula);
        }
      }
      
      if (lowerInput.includes('énergie') && (formulaText.includes('e =') || description.includes('énergie'))) {
        if (!relevantFormulas.find(f => f.formula === formula.formula)) {
          relevantFormulas.push(formula);
        }
      }
    });

    return relevantFormulas.slice(0, 8); // Limiter à 8 formules
  }
}

export default new SolverService();
