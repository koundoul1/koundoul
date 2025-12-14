import prismaService from '../../src/database/prisma.js';
import { getCacheManager } from '../../src/utils/cache-manager.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = prismaService.client || prismaService;

// Gestion du cache
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '../../../cache');
const OUTPUT_DIR = path.join(__dirname, '../../../backend/prisma/seeds/derivee-expo');

export async function seedDerivativeExponentialLesson() {
  console.log('📚 Seeding Micro-Leçon : Dérivée de la Fonction Exponentielle...');

  // Vérifier le cache
  const cacheManager = await getCacheManager(CACHE_DIR, OUTPUT_DIR);
  
  const metadata = {
    id: 'derivee-fonction-exponentielle',
    title: 'Dérivée de la fonction exponentielle',
    subject: 'math',
    level: 'premiere',
    chapter: 'Fonctions exponentielles',
    duration: 8,
    prerequisites: [
      "Notion de dérivée (limite du taux d'accroissement)",
      'Fonction exp(x) et ses propriétés',
      'Règle de dérivation des fonctions composées'
    ],
    objectives: [
      'Dériver exp(x) et comprendre pourquoi sa dérivée est elle-même',
      'Maîtriser la formule de dérivation de exp(u(x))',
      'Appliquer ces formules dans des exercices concrets',
      'Lier cette notion aux applications pratiques (croissance, intérêts)'
    ],
    difficulty: 3,
    xpReward: 150,
    realWorldApp: "Modélisation de la croissance d'une population de bactéries",
    keywords: ['dérivée', 'exponentielle', 'exp(u)', 'croissance', 'formule']
  };

  // Vérifier si déjà en cache
  const isUpToDate = await cacheManager.isUpToDate(metadata);
  
  if (isUpToDate) {
    console.log('✅ Leçon déjà en cache et à jour - Skip génération');
    return;
  }

  console.log('🔄 Génération de la leçon...');

  // 1. Trouver la matière Mathématiques
  const math = await prisma.subject.findUnique({
    where: { slug: 'mathematiques' }
  });

  if (!math) {
    console.log('⚠️ Matière Mathématiques non trouvée');
    return;
  }

  // 2. Créer ou trouver le chapitre "Fonctions exponentielles"
  let chapter = await prisma.chapter.findFirst({
    where: {
      subjectId: math.id,
      slug: 'fonctions-exponentielles'
    }
  });

  if (!chapter) {
    chapter = await prisma.chapter.create({
      data: {
        title: 'Fonctions Exponentielles',
        slug: 'fonctions-exponentielles',
        description: 'Définition, propriétés et dérivées des fonctions exponentielles',
        subjectId: math.id,
        level: 'PREMIERE',
        order: 10,
        requiredChapters: []
      }
    });
    console.log('  ✅ Chapitre créé : Fonctions Exponentielles');
  }

  // 3. Créer la leçon
  const lesson = await prisma.lesson.upsert({
    where: {
      chapterId_slug: {
        chapterId: chapter.id,
        slug: 'derivee-fonction-exponentielle'
      }
    },
    update: {},
    create: {
      title: 'Dérivée de la fonction exponentielle',
      slug: 'derivee-fonction-exponentielle',
      chapterId: chapter.id,
      order: 1,
      duration: 8,
      content: `# Dérivée de la Fonction Exponentielle

## 🎯 Objectifs pédagogiques
À la fin de cette leçon, tu sauras :
- Dériver exp(x) et exp(u(x))
- Comprendre pourquoi la dérivée de exp est elle-même
- Appliquer les formules dans des exercices concrets
- Lier cette notion aux applications pratiques

## 📚 Prérequis
Avant de commencer, assure-toi de maîtriser :
- La notion de dérivée (limite du taux d'accroissement)
- La fonction exp(x) et ses propriétés
- La règle de dérivation des fonctions composées

---

## Phase 1️⃣ : Rappel sur la fonction exponentielle

### Définition
La fonction exponentielle de base e, notée \`exp(x)\` ou \`e^x\`, est définie pour tout réel x.

### Propriétés clés
- \`exp(0) = e^0 = 1\`
- \`exp(1) = e ≈ 2.718\`
- \`exp(x + y) = exp(x) × exp(y)\`
- \`exp(x - y) = exp(x) / exp(y)\`
- \`exp(nx) = [exp(x)]^n\`

### Graphique
![Graphe de exp(x)](https://via.placeholder.com/400x200)
La courbe est **toujours positive**, **croissante**, et passe par le point (0, 1).

---

## Phase 2️⃣ : Découverte intuitive

### Question clé
**Quelle est la pente de la tangente à la courbe de exp(x) en chaque point ?**

Imagine que tu marches le long de la courbe de exp(x). À chaque instant, ta vitesse (la dérivée) est égale à ta position actuelle !

- En x = 0, on est en y = 1, donc la pente est 1
- En x = 1, on est en y = e, donc la pente est e
- En x = 2, on est en y = e², donc la pente est e²

### Formule fondamentale
\`\`\`
d/dx [exp(x)] = exp(x)
ou
d/dx [e^x] = e^x
\`\`\`

C'est la seule fonction (вм не-constante) dont la dérivée est égale à elle-même !

---

## Phase 3️⃣ : Démonstration (Approche rigoureuse)

### Méthode avec la définition de la dérivée

Soit \`f(x) = exp(x)\`. Par définition :

\`\`\`
f'(x) = lim(h→0) [exp(x+h) - exp(x)] / h
\`\`\`

Factorisons en utilisant les propriétés de l'exponentielle :

\`\`\`
f'(x) = lim(h→0) [exp(x) × exp(h) - exp(x)] / h
f'(x) = lim(h→0) exp(x) × [exp(h) - 1] / h
f'(x) = exp(x) × lim(h→0) [exp(h) - 1] / h
\`\`\`

**Avec h très petit :** exp(h) ≈ 1 + h, donc [exp(h) - 1] / h ≈ h / h = 1

Ainsi : \`f'(x) = exp(x) × 1 = exp(x)\` ✓

---

## Phase 4️⃣ : Dérivation de fonctions composées

### Formule générale
Si u est une fonction dérivable, alors :

\`\`\`
d/dx [exp(u(x))] = u'(x) × exp(u(x))
\`\`\`

### Mécanisme
On applique la règle de la chaîne (chain rule) :
1. Dériver l'exponentielle → reste exp(u(x))
2. Multiplier par la dérivée de u → u'(x)

**Mémoire visuelle :**
\`\`\`
[exp(☁)]' = ☁' × exp(☁)
\`\`\`

### Exemples concrets

**Exemple 1 :** \`f(x) = exp(3x)\`
- u(x) = 3x
- u'(x) = 3
- f'(x) = 3 × exp(3x) ✓

**Exemple 2 :** \`g(x) = exp(x²)\`
- u(x) = x²
- u'(x) = 2x
- g'(x) = 2x × exp(x²) ✓

**Exemple 3 :** \`h(x) = exp(2x + 1)\`
- u(x) = 2x + 1
- u'(x) = 2
- h'(x) = 2 × exp(2x + 1) ✓

---

## Phase 5️⃣ : Applications concrètes

### 🧮 Modélisation de croissance

**Scénario :** Une population de bactéries double toutes les 2 heures.
Le nombre de bactéries après t heures est : \`N(t) = 100 × exp(0.35t)\`

**Question :** À quelle vitesse la population croît-elle à t = 5 heures ?

**Solution :**
- N'(t) = 100 × 0.35 × exp(0.35t)
- N'(5) = 35 × exp(1.75) ≈ 35 × 5.75 ≈ **201 bactéries/heure**

### 💰 Finance : Intérêts composés

**Scénario :** Un investissement de 1000€ avec intérêts continus à 5% par an.
La valeur après t ans est : \`V(t) = 1000 × exp(0.05t)\`

**Question :** À quel taux croît l'investissement après 10 ans ?

**Solution :**
- V'(t) = 1000 × 0.05 × exp(0.05t)
- V'(10) = 50 × exp(0.5) ≈ 50 × 1.65 ≈ **82.4 €/an**

---

## Phase 6️⃣ : Erreurs courantes à éviter

### ❌ Erreur 1 : Oublier la dérivée interne
\`\`\`
Faux : [exp(2x)]' = exp(2x)
Correct : [exp(2x)]' = 2 × exp(2x)
\`\`\`

### ❌ Erreur 2 : Confondre exp(x²) et [exp(x)]²
\`\`\`
[exp(x)]² = exp(x) × exp(x) = exp(2x)
Mais exp(x²) est différent ! [exp(x²)]' = 2x × exp(x²)
\`\`\`

### ❌ Erreur 3 : Dériver avec la règle des puissances
\`\`\`
Faux : [exp(x)]' = x × exp(x)^(x-1)  ← Marche PAS !
Correct : [exp(x)]' = exp(x)
\`\`\`

---

## Phase 7️⃣ : Récapitulatif et fiche mémo

### ✅ Formules à retenir

| Fonction | Dérivée |
|----------|---------|
| \`exp(x)\` | \`exp(x)\` |
| \`exp(kx)\` | \`k × exp(kx)\` |
| \`exp(u(x))\` | \`u'(x) × exp(u(x))\` |
| \`e^x\` | \`e^x\` |
| \`e^{2x}\` | \`2e^{2x}\` |
| \`e^{x²}\` | \`2xe^{x²}\` |

### 🎯 Points clés
1. La dérivée de exp est exp elle-même
2. Pour exp(u(x)), multiplier par u'(x)
3. Ne jamais oublier la dérivée interne
4. L'exponentielle est cruciale en sciences

### 🧠 Application à faire maintenant
Exercice 1 : Dérive \`f(x) = exp(5x - 3)\`
Exercice 2 : Dérive \`g(x) = 3exp(2x²)\`

---

## 🎓 Conclusion

Tu maîtrises maintenant la dérivation de la fonction exponentielle ! Cette compétence est essentielle pour :
- Les sciences (croissance, radioactivité)
- La finance (intérêts composés)
- L'ingénierie (signaux, systèmes)
- Les mathématiques avancées (équations différentielles)

**Prochaines étapes :**
- Pratiquer avec les exercices fournis
- Réviser les fonctions trigonométriques
- Explorer les intégrales de l'exponentielle

---

## 📖 Ressources supplémentaires
- Vidéo explicative : [Lien vidéo]
- Simulations interactives : [Lien simulation]
- Quiz de validation : 5 questions (voir ci-dessous)
`,
      summary: 'Comprendre et maîtriser la dérivation de exp(x) et exp(u(x)) avec applications concrètes',
      objectives: [
        'Dériver exp(x)',
        'Dériver exp(u(x)) avec la règle de la chaîne',
        'Appliquer dans des problèmes concrets',
        'Éviter les erreurs courantes'
      ]
    }
  });

  console.log('  ✅ Leçon créée : Dérivée de la fonction exponentielle');

  // 4. Créer des exercices
  const exercises = [
    {
      title: 'Dériver exp(3x)',
      difficulty: 'FACILE',
      level: 'PREMIERE',
      type: 'CALCUL',
      statement: 'Calcule la dérivée de f(x) = exp(3x)',
      correctAnswer: '3exp(3x)',
      solution: `## Solution détaillée

**Identifions la fonction interne :**
- u(x) = 3x
- u'(x) = 3

**Appliquons la formule :**
[exp(u(x))]' = u'(x) × exp(u(x))

**Résultat :**
f'(x) = 3 × exp(3x) = **3exp(3x)**`,
      steps: [
        { step: 1, title: 'Identifier u(x)', content: 'u(x) = 3x' },
        { step: 2, title: 'Calculer u'(x)', content: 'u'(x) = 3' },
        { step: 3, title: 'Appliquer la formule', content: 'f'(x) = 3 × exp(3x)' }
      ],
      hints: [
        'Utilise la formule [exp(u(x))]' = u'(x) × exp(u(x))',
        'Quelle est la dérivée de 3x ?'
      ],
      points: 10,
      timeEstimate: 3,
      tags: ['dérivée', 'exponentielle', 'fonction-composée']
    },
    {
      title: 'Dériver exp(x²)',
      difficulty: 'MOYEN',
      level: 'PREMIERE',
      type: 'CALCUL',
      statement: 'Calcule la dérivée de g(x) = exp(x²)',
      correctAnswer: '2x × exp(x²)',
      solution: `## Solution détaillée

**Identifions la fonction interne :**
- u(x) = x²
- u'(x) = 2x

**Appliquons la formule :**
[exp(u(x))]' = u'(x) × exp(u(x))

**Résultat :**
g'(x) = 2x × exp(x²) = **2xexp(x²)**`,
      steps: [
        { step: 1, title: 'Identifier u(x)', content: 'u(x) = x²' },
        { step: 2, title: 'Calculer u'(x)', content: 'u'(x) = 2x' },
        { step: 3, title: 'Appliquer la formule', content: 'g'(x) = 2x × exp(x²)' }
      ],
      hints: [
        'Attention : u(x) = x², pas x !',
        'N\'oublie pas de multiplier par u'(x) = 2x'
      ],
      points: 15,
      timeEstimate: 5,
      tags: ['dérivée', 'exponentielle', 'composée']
    },
    {
      title: 'Dériver exp(2x + 1)',
      difficulty: 'FACILE',
      level: 'PREMIERE',
      type: 'CALCUL',
      statement: 'Calcule la dérivée de h(x) = exp(2x + 1)',
      correctAnswer: '2exp(2x + 1)',
      solution: `## Solution détaillée

**Identifions la fonction interne :**
- u(x) = 2x + 1
- u'(x) = 2

**Appliquons la formule :**
[exp(u(x))]' = u'(x) × exp(u(x))

**Résultat :**
h'(x) = 2 × exp(2x + 1) = **2exp(2x + 1)**`,
      steps: [
        { step: 1, title: 'Identifier u(x)', content: 'u(x) = 2x + 1' },
        { step: 2, title: 'Calculer u'(x)', content: 'loga labelsu'(x) = 2' },
        { step: 3, title: 'Appliquer la formule', content: 'h'(x) = 2 × exp(2x + 1)' }
      ],
      hints: [
        'Quelle est la dérivée de 2x + 1 ?',
        'Utilise la règle de la chaîne'
      ],
      points: 10,
      timeEstimate: 3,
      tags: ['dérivée', 'exponentielle', 'base']
    },
    {
      title: 'Dériver 5exp(3x)',
      difficulty: 'MOYEN',
      level: 'PREMIERE',
      type: 'CALCUL',
      statement: 'Calcule la dérivée de f(x) = 5exp(3x)',
      correctAnswer: '15exp(3x)',
      solution: `## Solution détaillée

**On a une constante × exponentielle :**
- Le coefficient 5 reste
- On dérive exp(3x)

**Dérivation de exp(3x) :**
- u(x) = 3x
- u'(x) = 3
- [exp(3x)]' = 3exp(3x)

**Résultat final :**
f'(x) = 5 × 3exp(3x) = **15exp(3x)**`,
      steps: [
        { step: 1, title: 'Extraire la constante', content: 'Le coefficient 5 reste' },
        { step: 2, title: 'Dériver exp(3x)', content: '[expederivée(x))]' = 3exp(3x)' },
        { step: 3, title: 'Multiplier', content: 'f'(x) = 5 × 3exp(3x) = 15exp(3x)' }
      ],
      hints: [
        'Le coefficient 5 est une constante',
        'Dérive exp(3x) puis multiplie par 5'
      ],
      points: 15,
      timeEstimate: 4,
      tags: ['dérivée', 'exponentielle', 'constante']
    },
    {
      title: 'Application : croissance de population',
      difficulty: 'DIFFICILE',
      level: 'PREMIERE',
      type: 'CALCUL',
      statement: `Une population de bactéries évolue selon N(t) = 1000 × exp(0.2t), où t est en heures.
      
Calcule le taux de croissance à t = 5 heures.`,
      correctAnswer: '272 bactéries/heure environ',
      solution: `## Solution détaillée

**Étape 1 : Trouver la dérivée N'(t)**
- N(t) = 1000 × exp(0.2t)
- N'(t) = 1000 × 0.2 × exp(0.2t)
- N'(t) = 200 × exp(0.2t)

**Étape 2 : Calculer à t = 5**
- N'(5) = 200 × exp(0.2 × 5)
- N'(5) = 200 × exp(1)
- N'(5) = 200 × e
- N'(5) ≈ 200 × 2.718
- N'(5) ≈ **544 bactéries/heure**

**Interprétation :** À t = 5h, la population croît d'environ 544 bactéries par heure.`,
      steps: [
        { step: 1, title: 'Dériver N(t)', content: 'N'(t) = 1000 × 0.2 × exp(0.2t) = 200exp(0.2t)' },
        { step: 2, title: 'Évaluer en t = 5', content: 'N'(5) = 200 × exp(1)' },
        { step: 3, title: 'Calcul numérique', content: 'N'(5) ≈ 200 × 2.718 ≈ 544' }
      ],
      hints: [
        'Calcule d\'abord la dérivée N'(t)',
        'Remplace t par 5 dans l\'expression de la dérivée',
        'e ≈ 2.718'
      ],
      points: 20,
      timeEstimate: 8,
      tags: ['dérivée', 'exponentielle', 'application', 'croissance']
    }
  ];

  for (const exerciseData of exercises) {
    await prisma.exercise.create({
      data: {
        ...exerciseData,
        subjectId: math.id,
        chapterId: chapter.id
      }
    });
  }

  console.log(`  ✅ ${exercises.length} exercices créés`);

  // 5. Créer un quiz de validation
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Quiz : Dérivée de la fonction exponentielle',
      description: 'Valide ta compréhension de la dérivation des exponentielles',
      subjectId: math.id,
      level: 'PREMIERE',
      difficulty: 'MOYEN',
      timeLimit: 10,
      passingScore: 70,
      questions: {
        create: [
          {
            questionText: 'Quelle est la dérivée de exp(x) ?',
            type: 'MULTIPLE_CHOICE',
            options: ['exp(x)', 'xexp(x)', 'exp(x)/x', '0'],
            correctAnswer: 'exp(x)',
            explanation: 'La dérivée de exp(x) est exp(x) elle-même, c\'est une propriété unique de l\'exponentielle',
            points: 10,
            order: 1
          },
          {
            questionText: 'Calcule la dérivée de exp(4x)',
            type: 'MULTIPLE_CHOICE',
            options: ['exp(4x)', '4exp(x)', '4exp(4x)', 'xexp(4x)'],
            correctAnswer: '4exp(4x)',
            explanation: 'Pour exp(4x), on a u(x) = 4x et u\' = 4, donc f\' = 4 × exp(4x)',
            points: 15,
            order: 2
          },
          {
            questionText: 'Quelle est la dérivée de exp(x²) ?',
            type: 'MULTIPLE_CHOICE',
            options: ['exp(x²)', '2xexp(x²)', '2exp(x²)', 'x²exp(x²)'],
            correctAnswer: '2xexp(x²)',
            explanation: 'Pour exp(x²), u(x) = x² donc u\' = 2x, d\'où f\' = 2x × exp(x²)',
            points: 15,
            order: 3
          },
          {
            questionText: 'Calcule la dérivée de 3exp(2x)',
            type: 'MULTIPLE_CHOICE',
            options: ['3exp(2x)', '6exp(2x)', '6exp(x)', '2exp(2x)'],
            correctAnswer: '6exp(2x)',
            explanation: 'On garde le coefficient 3 et on dérive exp(2x) qui donne 2exp(2x), donc 3 × 2exp(2x) = 6exp(2x)',
            points: 15,
            order: 4
          },
          {
            questionText: 'Quelle erreur est commise dans ce calcul : [exp(5x)]\' = exp(5x) ?',
            type: 'MULTIPLE_CHOICE',
            options: [
              'Aucune erreur',
              'Oubli de la dérivée interne 5',
              'Oubli du signe négatif',
              'Confusion avec la règle des puissances'
            ],
            correctAnswer: 'Oubli de la dérivée interne 5',
            explanation: 'Il faut multiplier par la dérivée de 5x qui est 5, donc [exp(5x)]\' = 5exp(5x)',
            points: 20,
            order: 5
          },
          {
            questionText: 'La dérivée de exp(u(x)) est toujours égale à u\' × exp(u).',
            type: 'TRUE_FALSE',
            options: ['Vrai', 'Faux'],
            correctAnswer: 'Vrai',
            explanation: 'C\'est la formule générale de dérivation d\'une fonction composée avec l\'exponentielle',
            points: 15,
            order: 6
          },
          {
            questionText: 'Calcule la dérivée de exp(x + 1)',
            type: 'MULTIPLE_CHOICE',
            options: ['exp(x + 1)', '2exp(x + 1)', 'xexp(x + 1)', 'exp(x)'],
            correctAnswer: 'exp(x + 1)',
            explanation: 'Pour exp(x + 1), u(x) = x + 1 donc u\' = 1, d\'où f\' = 1 × exp(x + 1) = exp(x + 1)',
            points: 10,
            order: 7
          }
        ]
      }
    }
  });

  console.log('  ✅ Quiz de validation créé (7 questions)');
  console.log('✅ Micro-leçon complète créée !');
}

