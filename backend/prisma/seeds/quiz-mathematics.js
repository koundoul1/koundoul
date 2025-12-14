import prismaService from '../../src/database/prisma.js';

const prisma = prismaService.client || prismaService;

export async function seedQuizMathematics() {
  console.log('📝 Seeding Quiz Mathématiques...');

  const math = await prisma.subject.findUnique({
    where: { slug: 'mathematiques' }
  });

  if (!math) {
    console.log('⚠️ Matière Mathématiques non trouvée, skip quiz');
    return;
  }

  // Quiz 1 : Nombres et Calculs
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Quiz : Nombres et Calculs',
      description: 'Teste tes connaissances sur les ensembles de nombres et les opérations',
      subjectId: math.id,
      level: 'SECONDE',
      difficulty: 'FACILE',
      timeLimit: 10, // 10 minutes
      passingScore: 60,
      questions: {
        create: [
          {
            questionText: 'Quel ensemble contient tous les nombres entiers positifs ?',
            type: 'MULTIPLE_CHOICE',
            options: ['ℕ (Naturels)', 'ℤ (Relatifs)', 'ℚ (Rationnels)', 'ℝ (Réels)'],
            correctAnswer: 'ℕ (Naturels)',
            explanation: 'ℕ est l\'ensemble des entiers naturels (0, 1, 2, 3, ...)',
            points: 10,
            order: 1
          },
          {
            questionText: 'Combien font 3 + 5 × 2 ?',
            type: 'MULTIPLE_CHOICE',
            options: ['16', '13', '11', '10'],
            correctAnswer: '13',
            explanation: 'La multiplication est prioritaire : 5 × 2 = 10, puis 3 + 10 = 13',
            points: 10,
            order: 2
          },
          {
            questionText: 'Le nombre -7 appartient-il à ℕ ?',
            type: 'MULTIPLE_CHOICE',
            options: ['Oui', 'Non'],
            correctAnswer: 'Non',
            explanation: 'ℕ ne contient que les entiers positifs. -7 appartient à ℤ (relatifs)',
            points: 10,
            order: 3
          },
          {
            questionText: 'Quelle est la relation entre ℕ et ℤ ?',
            type: 'MULTIPLE_CHOICE',
            options: ['ℕ ⊂ ℤ', 'ℤ ⊂ ℕ', 'ℕ = ℤ', 'Aucune relation'],
            correctAnswer: 'ℕ ⊂ ℤ',
            explanation: 'Tous les nombres naturels sont des entiers relatifs, donc ℕ ⊂ ℤ',
            points: 15,
            order: 4
          },
          {
            questionText: 'Calcule : (8 + 2) × 3 - 5',
            type: 'MULTIPLE_CHOICE',
            options: ['25', '30', '23', '35'],
            correctAnswer: '25',
            explanation: 'Parenthèses d\'abord : 10 × 3 = 30, puis 30 - 5 = 25',
            points: 15,
            order: 5
          }
        ]
      }
    }
  });

  console.log(`  ✅ Quiz créé : ${quiz1.title} (5 questions)`);

  // Quiz 2 : Équations
  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Quiz : Équations du 1er degré',
      description: 'Vérifie ta maîtrise des équations linéaires',
      subjectId: math.id,
      level: 'SECONDE',
      difficulty: 'MOYEN',
      timeLimit: 15,
      passingScore: 70,
      questions: {
        create: [
          {
            questionText: 'Résoudre : x + 5 = 12',
            type: 'MULTIPLE_CHOICE',
            options: ['x = 7', 'x = 17', 'x = -7', 'x = 5'],
            correctAnswer: 'x = 7',
            explanation: 'x = 12 - 5 = 7',
            points: 10,
            order: 1
          },
          {
            questionText: 'Résoudre : 2x = 18',
            type: 'MULTIPLE_CHOICE',
            options: ['x = 9', 'x = 36', 'x = 16', 'x = 20'],
            correctAnswer: 'x = 9',
            explanation: 'x = 18 ÷ 2 = 9',
            points: 10,
            order: 2
          },
          {
            questionText: 'Résoudre : 3x - 6 = 9',
            type: 'MULTIPLE_CHOICE',
            options: ['x = 5', 'x = 3', 'x = 1', 'x = 15'],
            correctAnswer: 'x = 5',
            explanation: '3x = 9 + 6 = 15, donc x = 15 ÷ 3 = 5',
            points: 15,
            order: 3
          },
          {
            questionText: 'Résoudre : 5x + 7 = 3x + 17',
            type: 'MULTIPLE_CHOICE',
            options: ['x = 5', 'x = 10', 'x = 3', 'x = 12'],
            correctAnswer: 'x = 5',
            explanation: '5x - 3x = 17 - 7, donc 2x = 10, x = 5',
            points: 20,
            order: 4
          },
          {
            questionText: 'Quelle est la première étape pour résoudre ax + b = c ?',
            type: 'MULTIPLE_CHOICE',
            options: [
              'Isoler le terme en x', 
              'Diviser par a', 
              'Soustraire c', 
              'Multiplier par b'
            ],
            correctAnswer: 'Isoler le terme en x',
            explanation: 'On isole d\'abord ax en déplaçant b : ax = c - b',
            points: 15,
            order: 5
          }
        ]
      }
    }
  });

  console.log(`  ✅ Quiz créé : ${quiz2.title} (5 questions)`);

  console.log('✅ Quiz Mathématiques seeded !');
}


