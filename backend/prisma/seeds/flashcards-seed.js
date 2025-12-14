import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedFlashcards() {
  console.log('📇 Seeding flashcards...');

  // Récupérer les matières et leçons existantes
  const mathSubject = await prisma.subject.findFirst({
    where: { slug: 'mathematiques' }
  });

  if (!mathSubject) {
    console.log('⚠️ Matière Mathématiques non trouvée, skip flashcards');
    return;
  }

  const lessons = await prisma.lesson.findMany({
    where: {
      chapter: {
        subjectId: mathSubject.id
      }
    },
    include: {
      chapter: true
    }
  });

  // Flashcards pour Mathématiques - Ensembles de nombres
  const flashcardsData = [
    {
      question: "Qu'est-ce que l'ensemble ℕ ?",
      answer: "L'ensemble des nombres naturels (entiers positifs) : 0, 1, 2, 3, ...",
      explanation: "ℕ représente les nombres que nous utilisons naturellement pour compter.",
      difficulty: 'FACILE',
      tags: ['nombres', 'ensembles']
    },
    {
      question: "Quelle est la différence entre ℕ et ℤ ?",
      answer: "ℤ contient aussi les nombres négatifs, contrairement à ℕ qui ne contient que les positifs.",
      explanation: "ℤ = {..., -2, -1, 0, 1, 2, ...} alors que ℕ = {0, 1, 2, 3, ...}",
      difficulty: 'FACILE',
      tags: ['nombres', 'ensembles']
    },
    {
      question: "Qu'est-ce qu'un nombre rationnel (ℚ) ?",
      answer: "Un nombre qui peut s'écrire sous forme de fraction a/b où a et b sont des entiers et b ≠ 0.",
      explanation: "Exemples : 1/2, -3/4, 5 (= 5/1). Les décimaux finis sont dans ℚ.",
      difficulty: 'MOYEN',
      tags: ['nombres', 'rationnels']
    },
    {
      question: "Donnez un exemple de nombre irrationnel",
      answer: "√2, π, e sont des nombres irrationnels (ne peuvent pas s'écrire en fraction).",
      explanation: "Les irrationnels ont des décimales infinies non périodiques.",
      difficulty: 'MOYEN',
      tags: ['nombres', 'irrationnels']
    },
    {
      question: "Quelle est la relation entre ℕ, ℤ, ℚ et ℝ ?",
      answer: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ (chaque ensemble contient le précédent)",
      explanation: "Tout nombre naturel est entier, tout entier est rationnel, tout rationnel est réel.",
      difficulty: 'MOYEN',
      tags: ['nombres', 'ensembles', 'inclusion']
    },
    {
      question: "Comment calculer : 3 × (2 + 5) ?",
      answer: "= 3 × 7 = 21",
      explanation: "On commence par les parenthèses (PEMDAS), puis la multiplication.",
      difficulty: 'FACILE',
      tags: ['calcul', 'priorités']
    },
    {
      question: "Quelle est la formule d'une fonction affine ?",
      answer: "f(x) = ax + b",
      explanation: "a est le coefficient directeur (pente), b est l'ordonnée à l'origine.",
      difficulty: 'FACILE',
      tags: ['fonctions', 'affines']
    },
    {
      question: "Comment résoudre 2x + 5 = 13 ?",
      answer: "x = 4",
      explanation: "2x = 13 - 5 = 8, donc x = 8/2 = 4",
      difficulty: 'MOYEN',
      tags: ['équations', 'résolution']
    },
    {
      question: "Qu'est-ce que le coefficient directeur d'une fonction affine ?",
      answer: "C'est le nombre 'a' dans f(x) = ax + b, qui représente la pente de la droite.",
      explanation: "Si a > 0, la fonction est croissante. Si a < 0, elle est décroissante.",
      difficulty: 'MOYEN',
      tags: ['fonctions', 'affines', 'pente']
    },
    {
      question: "Calculer : (-3)² + 2 × 5",
      answer: "= 9 + 10 = 19",
      explanation: "D'abord les puissances : (-3)² = 9, puis multiplication : 2×5 = 10, enfin addition : 9+10 = 19",
      difficulty: 'MOYEN',
      tags: ['calcul', 'priorités', 'puissances']
    }
  ];

  // Créer les flashcards
  for (const data of flashcardsData) {
    const lesson = lessons[Math.floor(Math.random() * lessons.length)];
    
    await prisma.flashcard.create({
      data: {
        question: data.question,
        answer: data.answer,
        explanation: data.explanation,
        difficulty: data.difficulty,
        tags: data.tags,
        subjectId: mathSubject.id,
        lessonId: lesson?.id,
        chapterId: lesson?.chapterId
      }
    });
  }

  console.log(`✅ ${flashcardsData.length} flashcards créées`);
}

export default seedFlashcards;


