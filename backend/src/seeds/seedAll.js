const prisma = require('../config/database');
const seedBadges = require('./seedBadges');
const seedConceptNodes = require('./seedConceptNodes');

async function main() {
  console.log('🌱 Starting database seed...\n');

  await seedBadges();
  await seedConceptNodes();
  // Subscription plans are managed by scripts/initPlans.js (not seeds)

  console.log('\n🎉 All seeds completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
