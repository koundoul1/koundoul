// Script pour seeder uniquement les nouvelles fonctionnalités
import { PrismaClient } from '@prisma/client';
import { seedFlashcards } from './prisma/seeds/flashcards-seed.js';
import { seedForum } from './prisma/seeds/forum-seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding nouvelles fonctionnalités...\n');
  
  try {
    // Vérifier si flashcards existent déjà
    const flashcardsCount = await prisma.flashcard.count();
    if (flashcardsCount === 0) {
      await seedFlashcards();
    } else {
      console.log(`ℹ️ ${flashcardsCount} flashcards déjà existantes, skip`);
    }
    
    // Vérifier si discussions existent déjà
    const discussionsCount = await prisma.discussion.count();
    if (discussionsCount === 0) {
      await seedForum();
    } else {
      console.log(`ℹ️ ${discussionsCount} discussions déjà existantes, skip`);
    }
    
    console.log('\n✅ Seed nouvelles fonctionnalités complété !');
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });


