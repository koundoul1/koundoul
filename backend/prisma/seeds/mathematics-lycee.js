import prismaService from '../../src/database/prisma.js';

const prisma = prismaService.client || prismaService;

export async function seedMathematicsLycee() {
  console.log('📐 Seeding Mathématiques Lycée...');

  // 1. Créer la matière Mathématiques
  const math = await prisma.subject.upsert({
    where: { slug: 'mathematiques' },
    update: {},
    create: {
      name: 'Mathématiques',
      slug: 'mathematiques',
      icon: '📐',
      description: 'Algèbre, Analyse, Géométrie et Probabilités',
      color: '#3B82F6',
      order: 1
    }
  });

  console.log('✅ Matière créée');

  // 2. Chapitres Seconde (5 chapitres)
  const chaptersSeconde = [
    {
      title: 'Nombres et Calculs',
      slug: 'nombres-calculs',
      description: 'Ensembles de nombres, opérations et priorités',
      level: 'SECONDE',
      order: 1,
      lessons: [
        {
          title: 'Les ensembles de nombres',
          slug: 'ensembles-nombres',
          order: 1,
          duration: 20,
          content: `# Les Ensembles de Nombres

## 🎯 Objectifs
- Connaître les différents ensembles (ℕ, ℤ, ℚ, ℝ)
- Savoir les relations d'inclusion
- Identifier à quel ensemble appartient un nombre

## 📚 Contenu

### 1. L'ensemble ℕ (Entiers naturels)
ℕ = {0, 1, 2, 3, 4, ...}

Exemples : 0, 5, 42, 1000

### 2. L'ensemble ℤ (Entiers relatifs)
ℤ = {..., -3, -2, -1, 0, 1, 2, 3, ...}

Exemples : -5, 0, 42, -1000

### 3. L'ensemble ℚ (Rationnels)
ℚ = {a/b | a ∈ ℤ, b ∈ ℤ, b ≠ 0}

Exemples : 1/2, -3/4, 0.75, 2

### 4. L'ensemble ℝ (Réels)
Tous les nombres de la droite numérique.

Exemples : √2, π, e, -3.14159...

## 🔑 Relations d'inclusion
ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ

## ✅ Points clés
- Tout entier naturel est un entier relatif
- Tout entier est un rationnel (ex: 5 = 5/1)
- √2 et π sont irrationnels (ℝ \\ ℚ)`,
          summary: 'Comprendre les ensembles ℕ, ℤ, ℚ, ℝ et leurs relations',
          objectives: [
            'Identifier les ensembles de nombres',
            'Comprendre les inclusions',
            'Classer des nombres dans les bons ensembles'
          ]
        },
        {
          title: 'Priorités opératoires',
          slug: 'priorites-operatoires',
          order: 2,
          duration: 15,
          content: `# Priorités Opératoires

## 🎯 Règle fondamentale : PEMDAS

**P**arenthèses
**E**xposants
**M**ultiplication
**D**ivision
**A**ddition
**S**oustraction

## 📝 Exemples

### Exemple 1
\`\`\`
3 + 4 × 5 = ?

Étape 1 : Multiplication d'abord
3 + 20 = 23

❌ FAUX : (3 + 4) × 5 = 35
\`\`\`

### Exemple 2
\`\`\`
(2 + 3) × 4 - 5 = ?

Étape 1 : Parenthèses
5 × 4 - 5

Étape 2 : Multiplication
20 - 5 = 15
\`\`\`

## ⚠️ Erreurs fréquentes
- Oublier les parenthèses
- Faire l'addition avant la multiplication
- Confondre - et ×`,
          summary: 'Maîtriser l\'ordre des opérations (PEMDAS)',
          objectives: [
            'Appliquer les priorités opératoires',
            'Utiliser correctement les parenthèses',
            'Éviter les erreurs de calcul'
          ]
        }
      ],
      exercises: [
        {
          title: 'Identifier les ensembles',
          difficulty: 'FACILE',
          level: 'SECONDE',
          type: 'QCM',
          statement: 'À quel ensemble appartient le nombre -5 ?',
          correctAnswer: 'ℤ (et ℚ, ℝ)',
          solution: '-5 est un entier relatif négatif, donc il appartient à ℤ, ℚ et ℝ.',
          steps: [
            { step: 1, title: 'Analyse', content: '-5 est négatif donc pas dans ℕ' },
            { step: 2, title: 'Classification', content: 'C\'est un entier → ℤ' },
            { step: 3, title: 'Inclusion', content: 'ℤ ⊂ ℚ ⊂ ℝ donc aussi dans ℚ et ℝ' }
          ],
          hints: [
            'Les nombres négatifs ne sont pas dans ℕ',
            'Un entier appartient automatiquement à ℤ'
          ],
          points: 5,
          timeEstimate: 2,
          tags: ['ensembles', 'classification']
        },
        {
          title: 'Calcul avec priorités',
          difficulty: 'MOYEN',
          level: 'SECONDE',
          type: 'CALCUL',
          statement: 'Calculer : 3 + 5 × 2 - 4',
          correctAnswer: '9',
          solution: `## Solution détaillée

**Étape 1** : Identifier les opérations
3 + 5 × 2 - 4

**Étape 2** : Multiplication d'abord (prioritaire)
5 × 2 = 10

**Étape 3** : Réécrire
3 + 10 - 4

**Étape 4** : Opérations de gauche à droite
3 + 10 = 13
13 - 4 = 9

**Réponse finale : 9**`,
          steps: [
            { step: 1, title: 'Multiplication', content: '5 × 2 = 10' },
            { step: 2, title: 'Addition', content: '3 + 10 = 13' },
            { step: 3, title: 'Soustraction', content: '13 - 4 = 9' }
          ],
          hints: [
            'Quelle opération est prioritaire ?',
            'Multiplication avant addition/soustraction'
          ],
          points: 10,
          timeEstimate: 5,
          tags: ['calcul', 'priorités', 'opérations']
        }
      ]
    },
    {
      title: 'Équations du 1er degré',
      slug: 'equations-premier-degre',
      description: 'Résolution d\'équations linéaires ax + b = c',
      level: 'SECONDE',
      order: 2,
      requiredChapters: [], // Peut être fait indépendamment
      lessons: [
        {
          title: 'Résoudre une équation simple',
          slug: 'resolution-equation-simple',
          order: 1,
          duration: 25,
          content: `# Résoudre une Équation du 1er Degré

## 🎯 Objectif
Trouver la valeur de x qui vérifie l'équation

## 📐 Forme générale
ax + b = c

où a ≠ 0

## 🔧 Méthode de résolution

### Étape 1 : Isoler le terme en x
Déplacer b de l'autre côté

ax = c - b

### Étape 2 : Isoler x
Diviser par a

x = (c - b) / a

## 💡 Exemple complet

**Résoudre : 2x + 5 = 13**

**Étape 1** : Soustraire 5 des deux côtés
2x + 5 - 5 = 13 - 5
2x = 8

**Étape 2** : Diviser par 2
x = 8/2
x = 4

**Vérification** : 2(4) + 5 = 8 + 5 = 13 ✓

## ⚠️ Règles importantes
1. Ce qu'on fait à gauche, on le fait à droite
2. Toujours vérifier sa réponse
3. Attention aux signes !`,
          summary: 'Méthode complète pour résoudre ax + b = c',
          objectives: [
            'Isoler l\'inconnue x',
            'Appliquer les opérations inverses',
            'Vérifier la solution'
          ]
        }
      ],
      exercises: [
        {
          title: 'Équation simple',
          difficulty: 'FACILE',
          level: 'SECONDE',
          type: 'CALCUL',
          statement: 'Résoudre : x + 7 = 12',
          correctAnswer: 'x = 5',
          solution: `x + 7 = 12
x = 12 - 7
x = 5

Vérification : 5 + 7 = 12 ✓`,
          steps: [
            { step: 1, title: 'Soustraire 7', content: 'x = 12 - 7' },
            { step: 2, title: 'Calculer', content: 'x = 5' }
          ],
          hints: ['Que faut-il faire pour isoler x ?'],
          points: 5,
          timeEstimate: 3,
          tags: ['équations', 'niveau-facile']
        },
        {
          title: 'Équation avec coefficient',
          difficulty: 'MOYEN',
          level: 'SECONDE',
          type: 'CALCUL',
          statement: 'Résoudre : 3x - 4 = 11',
          correctAnswer: 'x = 5',
          solution: `3x - 4 = 11
3x = 11 + 4
3x = 15
x = 15/3
x = 5

Vérification : 3(5) - 4 = 15 - 4 = 11 ✓`,
          steps: [
            { step: 1, title: 'Ajouter 4', content: '3x = 11 + 4 = 15' },
            { step: 2, title: 'Diviser par 3', content: 'x = 15/3 = 5' }
          ],
          hints: [
            'D\'abord isoler le terme en x',
            'Ensuite diviser par le coefficient'
          ],
          points: 10,
          timeEstimate: 5,
          tags: ['équations', 'coefficient']
        }
      ]
    },
    {
      title: 'Fonctions affines',
      slug: 'fonctions-affines',
      description: 'Définition, représentation graphique et propriétés',
      level: 'SECONDE',
      order: 3,
      requiredChapters: ['equations-premier-degre'],
      lessons: [
        {
          title: 'Définition d\'une fonction affine',
          slug: 'definition-fonction-affine',
          order: 1,
          duration: 20,
          content: `# Fonctions Affines

## 🎯 Définition
Une fonction affine est une fonction de la forme :
**f(x) = ax + b**

où :
- **a** est le coefficient directeur (pente)
- **b** est l'ordonnée à l'origine

## 📊 Exemples
- f(x) = 2x + 3 (a = 2, b = 3)
- f(x) = -x + 1 (a = -1, b = 1)
- f(x) = 5x (a = 5, b = 0) → fonction linéaire

## 🔍 Cas particuliers
- Si a = 0 : f(x) = b → fonction constante
- Si b = 0 : f(x) = ax → fonction linéaire

## 📈 Représentation graphique
Le graphique d'une fonction affine est une **droite** :
- **a** détermine la pente (inclinaison)
- **b** détermine l'intersection avec l'axe des ordonnées`,
          summary: 'Comprendre la forme f(x) = ax + b et ses paramètres',
          objectives: [
            'Identifier les paramètres a et b',
            'Distinguer fonction affine et linéaire',
            'Comprendre le rôle de chaque paramètre'
          ]
        }
      ],
      exercises: [
        {
          title: 'Identifier les paramètres',
          difficulty: 'FACILE',
          level: 'SECONDE',
          type: 'QCM',
          statement: 'Dans f(x) = 3x - 2, quels sont les paramètres ?',
          correctAnswer: 'a = 3, b = -2',
          solution: 'Dans f(x) = ax + b, on a a = 3 et b = -2',
          steps: [
            { step: 1, title: 'Forme générale', content: 'f(x) = ax + b' },
            { step: 2, title: 'Identifier a', content: 'a = 3 (coefficient de x)' },
            { step: 3, title: 'Identifier b', content: 'b = -2 (terme constant)' }
          ],
          hints: ['Comparer avec la forme générale f(x) = ax + b'],
          points: 5,
          timeEstimate: 2,
          tags: ['fonctions', 'paramètres']
        }
      ]
    }
  ];

  // 3. Créer les chapitres avec leçons et exercices
  for (const chapterData of chaptersSeconde) {
    const { lessons, exercises, ...chapterInfo } = chapterData;
    
    const chapter = await prisma.chapter.create({
      data: {
        ...chapterInfo,
        subjectId: math.id
      }
    });

    console.log(`  ✅ Chapitre créé : ${chapter.title}`);

    // Créer les leçons
    for (const lessonData of lessons) {
      await prisma.lesson.create({
        data: {
          ...lessonData,
          chapterId: chapter.id
        }
      });
    }

    console.log(`    📖 ${lessons.length} leçons créées`);

    // Créer les exercices
    for (const exerciseData of exercises) {
      await prisma.exercise.create({
        data: {
          ...exerciseData,
          subjectId: math.id,
          chapterId: chapter.id
        }
      });
    }

    console.log(`    🧮 ${exercises.length} exercices créés`);
  }

  console.log('✅ Mathématiques Seconde seeded !');
}


