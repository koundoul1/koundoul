import { seedAllLessons } from './seeds/seed-all-lessons.js';
import { seedQuizMathematics } from './seeds/quiz-mathematics.js';
import { seedFlashcards } from './seeds/flashcards-seed.js';
import { seedForum } from './seeds/forum-seed.js';

async function main() {
  console.log('🌱 Starting seed...');
  
  // Charger toutes les 420 leçons depuis les fichiers de métadonnées
  await seedAllLessons();
  
  // Optionnel: charger les quiz et flashcards (désactivé pour l'instant car peut prendre du temps)
  // await seedQuizMathematics();
  // await seedFlashcards();
  // await seedForum();
  
  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });