require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDuel() {
  console.log('⚔️ Seeding duel...');

  const admin = await prisma.user.findUnique({
    where: { email: 'contact@peak-performance-partner.com' }
  });
  if (!admin) {
    console.log('Admin not found');
    return;
  }

  const count = await prisma.duel.count();
  if (count > 0) {
    console.log(`Duels already exist: ${count}, skipping`);
    return;
  }

  const questions = await prisma.qcm_questions.findMany({
    take: 5,
    orderBy: { created_at: 'desc' }
  });

  const formatted = questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    points: q.points || 10,
    time_limit_seconds: q.time_limit_seconds || 60
  }));

  const duel = await prisma.duel.create({
    data: {
      challengerId: admin.id,
      subject: 'Mathématiques',
      difficulty: 'Moyen',
      timeLimit: 10,
      questions: formatted,
      xpReward: 50,
      isPublic: true,
      status: 'PENDING'
    }
  });

  console.log(`  ✅ Duel créé: ${duel.id} (${formatted.length} questions)`);
}

seedDuel()
  .then(() => { console.log('✅ Seed duel terminé'); process.exit(0); })
  .catch(err => { console.error('❌ Erreur:', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
