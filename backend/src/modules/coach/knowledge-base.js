/**
 * 📚 Knowledge Base - KOUNDOUL
 * Base de connaissances exhaustive pour tous types de problèmes
 */

class KnowledgeBase {
  constructor() {
    this.strategies = new Map();
    this.methods = new Map();
    this.commonErrors = new Map();
    this.formulas = new Map();
    this.techniques = new Map();
    
    this.initializeStrategies();
    this.initializeMethods();
    this.initializeCommonErrors();
    this.initializeFormulas();
  }

  initializeStrategies() {
    // === STRATÉGIE: Dérivée de composition (ln(u)) ===
    this.strategies.set('derivative-composition', {
      id: 'derivative-composition',
      problemType: 'derivative',
      variants: ['ln-composition', 'log-composition', 'trig-composition'],
      
      phases: [
        {
          id: 'phase-1-identification',
          name: 'Identification de la structure',
          description: 'Identifier que c\'est une composition de fonctions',
          order: 1,
          steps: [
            {
              id: 'step-1-1',
              title: 'Identifier la fonction externe et interne',
              instruction: 'Dans f(x) = ln(x² + 1), quelle est la fonction externe et quelle est la fonction interne ?',
              taskType: 'identify-data',
              expectedInput: {
                type: 'text',
                format: 'Description des fonctions'
              },
              validation: {
                validate: (answer) => {
                  const lower = answer.toLowerCase();
                  return lower.includes('externe') && lower.includes('ln') &&
                         lower.includes('interne') && (lower.includes('x²') || lower.includes('x^2'));
                },
                equivalentForms: [],
                errorDetectors: [
                  {
                    name: 'confusion-order',
                    detect: (ans) => ans.toLowerCase().includes('ln') && ans.toLowerCase().includes('interne'),
                    feedback: '💡 Attention ! ln est la fonction EXTERNE (appliquée en dernier), et x²+1 est INTERNE'
                  }
                ]
              },
              help: {
                socraticQuestions: [
                  'Si tu évaluais f(2), dans quel ordre ferais-tu les calculs ?',
                  'D\'abord tu calculerais... puis tu appliquerais...'
                ],
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Pour calculer f(2), commences-tu par ln ou par x²+1 ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 Dans une composition f(g(x)), on calcule d\'abord g(x) puis on applique f',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 30, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 Ici: f(x) = ln(x²+1). La fonction INTERNE est u(x) = x²+1, la fonction EXTERNE est ln',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 60, onDemand: true }
                  }
                ],
                theoryReminders: [
                  {
                    concept: 'function-composition',
                    title: 'Composition de fonctions',
                    summary: 'f(g(x)) signifie appliquer d\'abord g, puis f sur le résultat',
                    microLessonId: 'function-composition'
                  }
                ],
                autoUnlock: {
                  afterTime: 60,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 20
            },
            {
              id: 'step-1-2',
              title: 'Identifier la règle à utiliser',
              instruction: 'Quelle règle de dérivation utilises-tu pour dériver ln(u(x)) ?',
              taskType: 'choose-method',
              expectedInput: {
                type: 'choice',
                format: 'Règle de dérivation'
              },
              validation: {
                validate: (answer) => {
                  const lower = answer.toLowerCase();
                  return lower.includes('règle') && (lower.includes('chaîne') || lower.includes('composition')) ||
                         lower.includes('ln') && lower.includes("u'/u");
                },
                errorDetectors: [
                  {
                    name: 'wrong-rule',
                    detect: (ans) => ans.toLowerCase().includes('produit') || ans.toLowerCase().includes('quotient'),
                    feedback: '⚠️ Ce n\'est pas une règle du produit ou du quotient, mais de la chaîne (composition) !'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Quand on dérive ln(something), quelle formule utilises-tu ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 La dérivée de ln(u) est u\'/u',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 45, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 Règle de dérivation : (ln(u))\' = u\'/u, où u est la fonction interne',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 75, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 60,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 25
            }
          ],
          phaseValidation: (answers) => {
            const hasId = answers.find(a => a.stepId === 'step-1-1')?.isCorrect;
            const hasRule = answers.find(a => a.stepId === 'step-1-2')?.isCorrect;
            
            return {
              success: hasId && hasRule,
              message: hasId && hasRule 
                ? '✅ Phase 1 terminée ! Tu as bien identifié la structure' 
                : '⚠️ Vérifie tes réponses',
              xpBonus: hasId && hasRule ? 15 : 0,
              unlocksNextPhase: hasId && hasRule
            };
          }
        },
        {
          id: 'phase-2-calculation',
          name: 'Calcul de la dérivée',
          description: 'Appliquer la formule étape par étape',
          order: 2,
          steps: [
            {
              id: 'step-2-1',
              title: 'Dériver la fonction interne',
              instruction: 'Quelle est la dérivée de u(x) = x² + 1 ?',
              taskType: 'calculate',
              expectedInput: {
                type: 'expression',
                format: '2x ou équivalent'
              },
              validation: {
                validate: (answer) => {
                  // Normaliser la réponse
                  const normalized = answer.replace(/\s+/g, '').replace(/\^/g, '²').toLowerCase();
                  return normalized === '2x' || normalized === '2*x' || normalized.includes('2x');
                },
                equivalentForms: ['2x', '2*x', '2 × x'],
                errorDetectors: [
                  {
                    name: 'forgot-derivative-x2',
                    detect: (ans) => ans.includes('x') && !ans.includes('2'),
                    feedback: '⚠️ La dérivée de x² est 2x, pas x'
                  },
                  {
                    name: 'forgot-constant-zero',
                    detect: (ans) => ans.includes('+') && ans.includes('1'),
                    feedback: '💡 Rappel : La dérivée d\'une constante (comme 1) est 0'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Quelle est la dérivée de x² ? Et la dérivée de 1 ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 Rappel : (x²)\' = 2x et (1)\' = 0',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 40, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 La dérivée d\'une somme est la somme des dérivées : (x²+1)\' = (x²)\' + (1)\' = 2x + 0 = 2x',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 70, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 60,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 25
            },
            {
              id: 'step-2-2',
              title: 'Appliquer la formule ln(u)',
              instruction: 'Maintenant applique la formule (ln(u))\' = u\'/u. Quel est le résultat final ?',
              taskType: 'apply-formula',
              expectedInput: {
                type: 'expression',
                format: '2x/(x²+1) ou équivalent'
              },
              validation: {
                validate: (answer) => {
                  const normalized = answer.replace(/\s+/g, '').toLowerCase();
                  // Accepter différentes formes équivalentes
                  return normalized.includes('2x') && normalized.includes('x²+1') ||
                         normalized.includes('2x') && normalized.includes('x^2+1') ||
                         normalized.includes('2*x') && normalized.includes('x*x+1');
                },
                equivalentForms: [
                  '2x/(x²+1)',
                  '2x/(x^2+1)',
                  '2*x/(x*x+1)',
                  '(2x)/(x²+1)'
                ],
                errorDetectors: [
                  {
                    name: 'inverted-fraction',
                    detect: (ans) => ans.includes('x²+1') && ans.includes('2x') && ans.indexOf('x²+1') < ans.indexOf('2x'),
                    feedback: '⚠️ Attention au numérateur et dénominateur ! C\'est u\' au numérateur et u au dénominateur'
                  },
                  {
                    name: 'forgot-denominator',
                    detect: (ans) => ans === '2x' || ans === '2*x',
                    feedback: '💡 N\'oublie pas le dénominateur ! La formule est u\'/u, donc tu dois diviser par u'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Dans la formule (ln(u))\' = u\'/u, quel est u\' et quel est u ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 Ici : u = x²+1, u\' = 2x, donc (ln(x²+1))\' = 2x / (x²+1)',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 50, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 Résultat final : f\'(x) = 2x / (x²+1)',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 90, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 80,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 35,
              bonusConditions: [
                { condition: 'first_try', bonus: 10, message: '🏆 Excellent !' },
                { condition: 'no_hints', bonus: 15, message: '🌟 Sans aide !' }
              ]
            }
          ],
          phaseValidation: (answers) => {
            const hasDerivative = answers.find(a => a.stepId === 'step-2-1')?.isCorrect;
            const hasFinal = answers.find(a => a.stepId === 'step-2-2')?.isCorrect;
            
            return {
              success: hasDerivative && hasFinal,
              message: hasDerivative && hasFinal
                ? '🎉 Parfait ! Tu as trouvé la dérivée !'
                : '⚠️ Vérifie tes calculs',
              xpBonus: hasDerivative && hasFinal ? 25 : 0,
              unlocksNextPhase: false // Dernière phase
            };
          }
        }
      ],
      
      applicableWhen: [
        { condition: 'has-ln-function', check: (problem) => /ln\s*\(/.test(problem.rawText) },
        { condition: 'has-composition', check: (problem) => problem.mainType === 'derivative' }
      ],
      
      commonPitfalls: [
        'Confondre l\'ordre des fonctions (externe vs interne)',
        'Oublier le dénominateur dans u\'/u',
        'Faire des erreurs dans la dérivée de la fonction interne',
        'Inverser numérateur et dénominateur'
      ],
      
      resources: {
        microLesson: 'derivative-composition',
        videos: ['https://youtube.com/watch?v=derivative-composition'],
        interactiveDemo: '/demos/derivative-composition'
      }
    });

    // === STRATÉGIE: Projectile vertical ===
    this.strategies.set('projectile-vertical', {
      id: 'projectile-vertical',
      problemType: 'kinematics',
      variants: ['vertical-up', 'vertical-down', 'free-fall'],
      
      phases: [
        {
          id: 'phase-1-data',
          name: 'Identification des données',
          description: 'Identifier toutes les données et l\'inconnue',
          order: 1,
          steps: [
            {
              id: 'step-1-1',
              title: 'Lister les données',
              instruction: 'Quelles sont les valeurs données dans le problème ? Liste-les avec leurs unités.',
              taskType: 'identify-data',
              expectedInput: {
                type: 'text',
                format: 'Liste des données'
              },
              validation: {
                validate: (answer) => {
                  const lower = answer.toLowerCase();
                  return (lower.includes('20') || lower.includes('vitesse')) &&
                         (lower.includes('9.8') || lower.includes('g') || lower.includes('accélération'));
                },
                errorDetectors: [
                  {
                    name: 'missing-velocity',
                    detect: (ans) => !ans.includes('20') && !ans.includes('vitesse'),
                    feedback: '💡 As-tu noté la vitesse initiale de 20 m/s ?'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Relis l\'énoncé. Quelles valeurs numériques sont mentionnées ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 Cherche: vitesse initiale, accélération (g), direction du mouvement',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 45, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 Données: v₀ = 20 m/s (vers le haut), g = 9.8 m/s² (vers le bas), on cherche h_max',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 75, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 60,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 20
            },
            {
              id: 'step-1-2',
              title: 'Condition au sommet',
              instruction: 'À la hauteur maximale, que peut-on dire de la vitesse du projectile ?',
              taskType: 'identify-data',
              expectedInput: {
                type: 'text',
                format: 'v = 0 ou vitesse nulle'
              },
              validation: {
                validate: (answer) => {
                  const lower = answer.toLowerCase();
                  return lower.includes('0') && (lower.includes('vitesse') || lower.includes('v'));
                },
                errorDetectors: [
                  {
                    name: 'wrong-velocity',
                    detect: (ans) => ans.includes('vitesse') && !ans.includes('0'),
                    feedback: '💡 Réfléchis : au sommet, avant de redescendre, la vitesse change de sens...'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Au sommet de la trajectoire, avant de redescendre, que fait la vitesse ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 Au point le plus haut, la vitesse verticale est nulle (elle passe de positive à négative)',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 50, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 À la hauteur maximale : v = 0 m/s',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 80, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 70,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 25
            }
          ],
          phaseValidation: (answers) => {
            const hasData = answers.find(a => a.stepId === 'step-1-1')?.isCorrect;
            const hasCondition = answers.find(a => a.stepId === 'step-1-2')?.isCorrect;
            
            return {
              success: hasData && hasCondition,
              message: hasData && hasCondition
                ? '✅ Données identifiées ! Passons à l\'équation'
                : '⚠️ Vérifie tes réponses',
              xpBonus: hasData && hasCondition ? 15 : 0,
              unlocksNextPhase: hasData && hasCondition
            };
          }
        },
        {
          id: 'phase-2-equation',
          name: 'Choix de l\'équation',
          description: 'Choisir et appliquer l\'équation appropriée',
          order: 2,
          steps: [
            {
              id: 'step-2-1',
              title: 'Choisir l\'équation cinématique',
              instruction: 'Quelle équation relie v, v₀, a et Δh sans faire intervenir le temps ?',
              taskType: 'choose-method',
              expectedInput: {
                type: 'equation',
                format: 'v² = v₀² + 2ah ou équivalent'
              },
              validation: {
                validate: (answer) => {
                  const normalized = answer.replace(/\s+/g, '').toLowerCase();
                  return (normalized.includes('v²') || normalized.includes('v^2')) &&
                         (normalized.includes('v₀') || normalized.includes('v0')) &&
                         normalized.includes('2a') && (normalized.includes('h') || normalized.includes('delta'));
                },
                equivalentForms: [
                  'v² = v₀² + 2ah',
                  'v^2 = v0^2 + 2*a*h',
                  'v² = v₀² + 2aΔh'
                ],
                errorDetectors: [
                  {
                    name: 'wrong-equation',
                    detect: (ans) => ans.includes('t') || ans.includes('temps'),
                    feedback: '⚠️ Ici on cherche une équation SANS le temps, car on ne connaît pas t !'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Parmi les équations cinématiques, laquelle n\'implique pas le temps t ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 Rappel : v² = v₀² + 2aΔx (relation vitesse-position)',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 50, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 Équation : v² = v₀² + 2ah (où h est la hauteur)',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 90, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 75,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 30
            },
            {
              id: 'step-2-2',
              title: 'Appliquer au sommet',
              instruction: 'Applique cette équation au sommet (v = 0). Quelle expression obtiens-tu pour h ?',
              taskType: 'calculate',
              expectedInput: {
                type: 'expression',
                format: 'h = v₀²/(2g) ou équivalent'
              },
              validation: {
                validate: (answer) => {
                  const normalized = answer.replace(/\s+/g, '').toLowerCase();
                  return (normalized.includes('h') || normalized.includes('h_max')) &&
                         (normalized.includes('v₀') || normalized.includes('v0')) &&
                         (normalized.includes('g') || normalized.includes('9.8')) &&
                         (normalized.includes('/') || normalized.includes('÷'));
                },
                errorDetectors: [
                  {
                    name: 'wrong-sign',
                    detect: (ans) => ans.includes('+') && ans.includes('2g') && !ans.includes('-'),
                    feedback: '⚠️ Attention au signe ! Si v = 0 et a = -g (vers le bas), vérifie ton calcul'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Si v = 0 dans v² = v₀² + 2ah, que devient l\'équation ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 0² = v₀² + 2ah. Attention : a = -g (vers le bas, donc négatif)',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 60, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 0 = v₀² + 2(-g)h, donc 0 = v₀² - 2gh, donc h = v₀²/(2g)',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 100, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 90,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 30
            },
            {
              id: 'step-2-3',
              title: 'Calculer la valeur numérique',
              instruction: 'Calcule maintenant h_max avec v₀ = 20 m/s et g = 9.8 m/s²',
              taskType: 'calculate',
              expectedInput: {
                type: 'number',
                format: '≈ 20.4 m'
              },
              validation: {
                validate: (answer) => {
                  const num = parseFloat(answer.replace(/[^0-9.,]/g, '').replace(',', '.'));
                  return num >= 20 && num <= 21; // Tolérance
                },
                tolerance: {
                  absolute: 0.5
                },
                errorDetectors: [
                  {
                    name: 'calculation-error',
                    detect: (ans) => {
                      const num = parseFloat(ans.replace(/[^0-9.,]/g, '').replace(',', '.'));
                      return num < 10 || num > 30;
                    },
                    feedback: '⚠️ Vérifie ton calcul : h = 20²/(2×9.8) = 400/19.6 ≈ 20.4 m'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Calcule d\'abord 20², puis 2×9.8, puis la division',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 h = v₀²/(2g) = 20²/(2×9.8)',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 50, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 h = 400/19.6 ≈ 20.41 m',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 90, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 75,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 35,
              bonusConditions: [
                { condition: 'exact_value', bonus: 10, message: '🎯 Valeur exacte !' }
              ]
            }
          ],
          phaseValidation: (answers) => {
            const hasEquation = answers.find(a => a.stepId === 'step-2-1')?.isCorrect;
            const hasExpression = answers.find(a => a.stepId === 'step-2-2')?.isCorrect;
            const hasValue = answers.find(a => a.stepId === 'step-2-3')?.isCorrect;
            
            return {
              success: hasEquation && hasExpression && hasValue,
              message: hasEquation && hasExpression && hasValue
                ? '🎉 Bravo ! Tu as trouvé la hauteur maximale !'
                : '⚠️ Vérifie tes calculs',
              xpBonus: hasEquation && hasExpression && hasValue ? 30 : 0,
              unlocksNextPhase: false
            };
          }
        }
      ],
      
      applicableWhen: [
        { condition: 'vertical-motion', check: (problem) => /vertical|vers.*haut|vers.*bas/i.test(problem.rawText) },
        { condition: 'has-initial-velocity', check: (problem) => /vitesse.*initial|v₀|v0/i.test(problem.rawText) }
      ],
      
      commonPitfalls: [
        'Oublier que v = 0 au sommet',
        'Erreur de signe sur l\'accélération (g négatif vers le haut)',
        'Utiliser la mauvaise équation cinématique',
        'Erreur de calcul numérique'
      ],
      
      resources: {
        microLesson: 'projectile-vertical',
        videos: ['https://youtube.com/watch?v=projectile-vertical'],
        interactiveDemo: '/simulations/projectile-vertical'
      }
    });

    // === STRATÉGIE: Réaction acide-métal ===
    this.strategies.set('acid-metal-reaction', {
      id: 'acid-metal-reaction',
      problemType: 'stoichiometry',
      variants: ['hcl-zinc', 'acid-alkaline-metal', 'single-displacement'],
      
      phases: [
        {
          id: 'phase-1-equation',
          name: 'Équation de réaction',
          description: 'Écrire et équilibrer l\'équation',
          order: 1,
          steps: [
            {
              id: 'step-1-1',
              title: 'Identifier les réactifs et produits',
              instruction: 'Quelle réaction se produit entre l\'acide chlorhydrique HCl et le zinc Zn ?',
              taskType: 'identify-data',
              expectedInput: {
                type: 'text',
                format: 'Description de la réaction'
              },
              validation: {
                validate: (answer) => {
                  const lower = answer.toLowerCase();
                  return lower.includes('acide') && lower.includes('métal') &&
                         (lower.includes('sel') || lower.includes('chlorure') || lower.includes('zncl'));
                },
                errorDetectors: [
                  {
                    name: 'missing-hydrogen',
                    detect: (ans) => !ans.includes('hydrogène') && !ans.includes('h2'),
                    feedback: '💡 Les acides avec métaux actifs libèrent de l\'hydrogène H₂'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Que se passe-t-il quand un acide réagit avec un métal actif ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 Acide + Métal → Sel + Hydrogène (H₂)',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 45, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 HCl + Zn → ZnCl₂ + H₂ (chlorure de zinc + dihydrogène)',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 75, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 60,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 25
            },
            {
              id: 'step-1-2',
              title: 'Équilibrer l\'équation',
              instruction: 'Équilibre l\'équation chimique. Combien de molécules de chaque espèce ?',
              taskType: 'apply-formula',
              expectedInput: {
                type: 'equation',
                format: '2HCl + Zn → ZnCl₂ + H₂'
              },
              validation: {
                validate: (answer) => {
                  const normalized = answer.replace(/\s+/g, '').toLowerCase();
                  return normalized.includes('2hcl') && normalized.includes('zn') &&
                         normalized.includes('zncl2') && normalized.includes('h2');
                },
                equivalentForms: [
                  '2HCl + Zn → ZnCl₂ + H₂',
                  '2 HCl + Zn → ZnCl₂ + H₂',
                  'Zn + 2HCl → ZnCl₂ + H₂'
                ],
                errorDetectors: [
                  {
                    name: 'unbalanced',
                    detect: (ans) => {
                      // Vérifier l\'équilibre des atomes
                      const has2Cl = (ans.match(/cl/gi) || []).length >= 2;
                      const has2H = (ans.match(/h(?!\d)/gi) || []).length >= 2;
                      return !has2Cl || !has2H;
                    },
                    feedback: '⚠️ Vérifie l\'équilibre des atomes : il faut 2 Cl et 2 H à gauche'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Compte les atomes de chaque côté. Sont-ils égaux ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 À gauche : H, Cl, Zn. À droite : Zn, Cl, H. Il faut équilibrer',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 60, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 2HCl + Zn → ZnCl₂ + H₂ (2 atomes H, 2 atomes Cl, 1 atome Zn de chaque côté)',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 90, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 75,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 30
            }
          ],
          phaseValidation: (answers) => {
            const hasId = answers.find(a => a.stepId === 'step-1-1')?.isCorrect;
            const hasBalanced = answers.find(a => a.stepId === 'step-1-2')?.isCorrect;
            
            return {
              success: hasId && hasBalanced,
              message: hasId && hasBalanced
                ? '✅ Équation équilibrée ! Quel est le produit principal ?'
                : '⚠️ Vérifie l\'équilibrage',
              xpBonus: hasId && hasBalanced ? 15 : 0,
              unlocksNextPhase: hasId && hasBalanced
            };
          }
        },
        {
          id: 'phase-2-product',
          name: 'Identification du produit',
          description: 'Identifier le produit principal de la réaction',
          order: 2,
          steps: [
            {
              id: 'step-2-1',
              title: 'Produit principal',
              instruction: 'Parmi les produits de la réaction équilibrée, quel est le produit principal (le sel formé) ?',
              taskType: 'identify-data',
              expectedInput: {
                type: 'text',
                format: 'ZnCl₂ ou chlorure de zinc'
              },
              validation: {
                validate: (answer) => {
                  const lower = answer.toLowerCase();
                  return lower.includes('zncl') || lower.includes('chlorure') && lower.includes('zinc');
                },
                errorDetectors: [
                  {
                    name: 'wrong-product',
                    detect: (ans) => ans.includes('h2') || ans.includes('hydrogène'),
                    feedback: '💡 Le produit PRINCIPAL (le sel) est le composé ionique, pas le gaz'
                  }
                ]
              },
              help: {
                hints: [
                  {
                    level: 1,
                    type: 'question',
                    content: '🤔 Parmi ZnCl₂ et H₂, lequel est le sel (composé ionique) ?',
                    xpPenalty: 0,
                    unlockConditions: { onDemand: true }
                  },
                  {
                    level: 2,
                    type: 'reminder',
                    content: '💡 Le produit principal est généralement le sel formé (composé solide/ionique)',
                    xpPenalty: 5,
                    unlockConditions: { minTime: 40, onDemand: true }
                  },
                  {
                    level: 3,
                    type: 'method',
                    content: '🎯 Produit principal : ZnCl₂ (chlorure de zinc) - c\'est le sel formé',
                    xpPenalty: 10,
                    unlockConditions: { minTime: 70, onDemand: true }
                  }
                ],
                autoUnlock: {
                  afterTime: 60,
                  afterAttempts: 2,
                  onFrustration: true
                }
              },
              xpReward: 30
            }
          ],
          phaseValidation: (answers) => {
            const hasProduct = answers.find(a => a.stepId === 'step-2-1')?.isCorrect;
            
            return {
              success: hasProduct,
              message: hasProduct
                ? '🎉 Correct ! Le produit principal est ZnCl₂'
                : '⚠️ Réessaie',
              xpBonus: hasProduct ? 20 : 0,
              unlocksNextPhase: false
            };
          }
        }
      ],
      
      applicableWhen: [
        { condition: 'acid-metal', check: (problem) => /acide.*(hcl|hno3|h2so4)/i.test(problem.rawText) && /(zinc|fer|magnésium|métal)/i.test(problem.rawText) }
      ],
      
      commonPitfalls: [
        'Oublier d\'équilibrer l\'équation',
        'Confondre produit principal (sel) et sous-produit (gaz)',
        'Mauvaise formule du sel (ZnCl vs ZnCl₂)'
      ],
      
      resources: {
        microLesson: 'acid-metal-reactions',
        videos: ['https://youtube.com/watch?v=acid-metal'],
        interactiveDemo: '/simulations/acid-metal'
      }
    });
  }

  initializeMethods() {
    // Méthodes de résolution
    this.methods.set('chain-rule', {
      id: 'chain-rule',
      name: 'Règle de la chaîne',
      applicableTo: ['derivative-composition'],
      steps: ['Identifier u', 'Calculer u\'', 'Appliquer (f(u))\' = f\'(u) × u\''],
      example: 'd/dx [ln(x²+1)] = (1/(x²+1)) × 2x'
    });

    this.methods.set('kinematic-equation', {
      id: 'kinematic-equation',
      name: 'Équation cinématique sans temps',
      applicableTo: ['kinematics'],
      formula: 'v² = v₀² + 2aΔx',
      usage: 'Quand on connaît v, v₀, a et cherche Δx sans connaître t'
    });
  }

  initializeCommonErrors() {
    this.commonErrors.set('derivative', [
      {
        pattern: /oubli.*dénominateur|pas.*diviser/i,
        error: 'Oublier le dénominateur dans u\'/u',
        correction: 'Rappel : (ln(u))\' = u\'/u, donc il faut diviser par u'
      },
      {
        pattern: /inverser|renverser|numérateur.*dénominateur/i,
        error: 'Inverser numérateur et dénominateur',
        correction: 'Attention : c\'est u\' au numérateur et u au dénominateur'
      }
    ]);

    this.commonErrors.set('kinematics', [
      {
        pattern: /signe.*erreur|positif.*négatif/i,
        error: 'Erreur de signe sur l\'accélération',
        correction: 'Si l\'axe est vers le haut et g vers le bas, alors a = -g'
      },
      {
        pattern: /vitesse.*sommet|v.*0/i,
        error: 'Oublier que v = 0 au sommet',
        correction: 'À la hauteur maximale, la vitesse verticale est nulle'
      }
    ]);
  }

  initializeFormulas() {
    this.formulas.set('derivative-ln', {
      id: 'derivative-ln',
      name: 'Dérivée de ln(u)',
      formula: '(ln(u))\' = u\'/u',
      domain: 'mathematics',
      level: 'premiere'
    });

    this.formulas.set('kinematic-v2', {
      id: 'kinematic-v2',
      name: 'Équation cinématique v²',
      formula: 'v² = v₀² + 2aΔx',
      domain: 'physics',
      level: 'premiere'
    });
  }

  /**
   * Get strategy for a problem
   */
  getStrategy(problem) {
    // Parcourir les stratégies et trouver celle applicable
    for (const [key, strategy] of this.strategies.entries()) {
      if (strategy.applicableWhen.some(condition => {
        try {
          return condition.check(problem);
        } catch {
          return false;
        }
      })) {
        return strategy;
      }
    }
    
    // Fallback : stratégie générique
    return {
      id: 'generic-strategy',
      problemType: problem.mainType,
      phases: [
        {
          id: 'phase-1',
          name: 'Analyse',
          steps: [
            {
              id: 'step-1',
              title: 'Identifier les données',
              instruction: 'Liste les données du problème',
              taskType: 'identify-data',
              expectedInput: { type: 'text' },
              validation: { validate: () => true },
              help: { hints: [] },
              xpReward: 20
            }
          ],
          phaseValidation: () => ({ success: true, unlocksNextPhase: true })
        }
      ]
    };
  }
}

export default new KnowledgeBase();










