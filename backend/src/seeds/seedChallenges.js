/**
 * Seed: Challenges hebdomadaires
 * Crée 3 challenges (Maths, Physique, Chimie) avec questions QCM depuis la DB
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedChallenges() {
  console.log('🏆 Seeding challenges...');

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);

  // Récupérer des questions QCM existantes par matière
  const mathQuestions = await prisma.qcm_questions.findMany({
    where: { difficulty: { in: [2, 3] } },
    take: 10,
    orderBy: { created_at: 'desc' }
  });

  const physicsQuestions = await prisma.qcm_questions.findMany({
    where: {
      difficulty: { in: [2, 3] },
      NOT: { id: { in: mathQuestions.map(q => q.id) } }
    },
    take: 10,
    orderBy: { created_at: 'desc' }
  });

  const chemistryQuestions = await prisma.qcm_questions.findMany({
    where: {
      difficulty: { in: [2, 3] },
      NOT: { id: { in: [...mathQuestions, ...physicsQuestions].map(q => q.id) } }
    },
    take: 10,
    orderBy: { created_at: 'desc' }
  });

  // Si pas assez de questions par matière, prendre ce qu'on a
  const allQuestions = await prisma.qcm_questions.findMany({
    take: 30,
    orderBy: { created_at: 'desc' }
  });

  const formatQuestions = (questions, fallback) => {
    const source = questions.length >= 10 ? questions : fallback.slice(0, 10);
    return source.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      points: q.points || 10,
      time_limit_seconds: q.time_limit_seconds || 60
    }));
  };

  const challenges = [
    {
      title: 'Challenge Maths - Semaine',
      description: 'Testez vos compétences en mathématiques ! 10 questions de niveau intermédiaire en 20 minutes.',
      subject: 'Mathématiques',
      difficulty: 'Moyen',
      timeLimit: 20,
      questions: formatQuestions(mathQuestions, allQuestions),
      status: 'active',
      xpReward: 500,
      prize: '500 XP + Badge Champion Maths',
      startDate: now,
      endDate: endDate
    },
    {
      title: 'Challenge Physique - Semaine',
      description: 'Relevez le défi physique ! Mécanique, optique, électricité... Montrez votre niveau.',
      subject: 'Physique',
      difficulty: 'Moyen',
      timeLimit: 20,
      questions: formatQuestions(physicsQuestions, allQuestions),
      status: 'active',
      xpReward: 500,
      prize: '500 XP + Badge Champion Physique',
      startDate: now,
      endDate: endDate
    },
    {
      title: 'Challenge Chimie - Semaine',
      description: 'Atomes, molécules, réactions... Prouvez vos connaissances en chimie !',
      subject: 'Chimie',
      difficulty: 'Moyen',
      timeLimit: 20,
      questions: formatQuestions(chemistryQuestions, allQuestions),
      status: 'active',
      xpReward: 500,
      prize: '500 XP + Badge Champion Chimie',
      startDate: now,
      endDate: endDate
    }
  ];

  let created = 0;
  for (const challenge of challenges) {
    // Vérifier si un challenge avec le même titre existe déjà cette semaine
    const existing = await prisma.$queryRawUnsafe(
      `SELECT id FROM challenges WHERE title = $1 AND status = 'active' AND end_date > NOW()`,
      challenge.title
    ).catch(() => []);

    if (existing.length > 0) {
      console.log(`  ⏭️  "${challenge.title}" déjà actif, skip`);
      continue;
    }

    await prisma.challenge.create({ data: challenge });
    created++;
    console.log(`  ✅ "${challenge.title}" créé (${challenge.questions.length} questions)`);
  }

  console.log(`\n🏆 ${created} challenge(s) créé(s), ${challenges.length - created} déjà existant(s)`);
}

// Exécution directe
if (require.main === module) {
  seedChallenges()
    .then(() => {
      console.log('\n✅ Seed challenges terminé');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Erreur seed challenges:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { seedChallenges };
