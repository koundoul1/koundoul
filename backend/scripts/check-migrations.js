#!/usr/bin/env node
/**
 * Script pour vérifier l'état des migrations Prisma
 * Usage: node scripts/check-migrations.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMigrations() {
  try {
    console.log('🔍 Vérification de l\'état des migrations...\n');

    // Vérifier si la table _prisma_migrations existe
    const migrationsTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `;

    if (!migrationsTable[0].exists) {
      console.log('❌ La table _prisma_migrations n\'existe pas.');
      console.log('⚠️  Les migrations n\'ont PAS été exécutées.\n');
      console.log('📝 Pour exécuter les migrations :');
      console.log('   npx prisma migrate deploy\n');
      process.exit(1);
    }

    // Vérifier les migrations appliquées
    const appliedMigrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM _prisma_migrations
      ORDER BY finished_at DESC;
    `;

    if (appliedMigrations.length === 0) {
      console.log('⚠️  Aucune migration trouvée dans la base de données.');
      console.log('📝 Exécutez : npx prisma migrate deploy\n');
      process.exit(1);
    }

    console.log('✅ Migrations trouvées :\n');
    appliedMigrations.forEach((migration, index) => {
      console.log(`${index + 1}. ${migration.migration_name}`);
      console.log(`   Appliquée le : ${migration.finished_at}`);
      console.log(`   Étapes : ${migration.applied_steps_count}\n`);
    });

    // Vérifier si les tables principales existent
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name;
    `;

    console.log(`📊 Tables créées : ${tables.length}\n`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    console.log('\n✅ Les migrations ont été exécutées avec succès !\n');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification :');
    console.error(error.message);
    
    if (error.message.includes('does not exist') || error.message.includes('relation') || error.message.includes('table')) {
      console.log('\n⚠️  La base de données semble vide.');
      console.log('📝 Exécutez : npx prisma migrate deploy\n');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrations();

