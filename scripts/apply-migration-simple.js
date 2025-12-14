/**
 * Script simplifié pour appliquer la migration parent-child
 */

import { Client } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env depuis le dossier backend
dotenv.config({ path: resolve(__dirname, '../backend/.env') });

// Bypass SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SQL = `
-- Migration: Ajout du système parent-enfant et code d'invitation
-- Date: 2025-11-09

-- Ajouter colonne invitationCode à la table User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "invitationCode" TEXT UNIQUE;

-- Créer la table parent_child_links
CREATE TABLE IF NOT EXISTS "parent_child_links" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "parent_child_links_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "parent_child_links_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parent_child_links_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parent_child_links_parentId_childId_key" UNIQUE ("parentId", "childId")
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS "parent_child_links_parentId_idx" ON "parent_child_links"("parentId");
CREATE INDEX IF NOT EXISTS "parent_child_links_childId_idx" ON "parent_child_links"("childId");

-- Commentaires
COMMENT ON TABLE "parent_child_links" IS 'Liens entre comptes parents et enfants';
COMMENT ON COLUMN "User"."invitationCode" IS 'Code pour lier un compte parent';
`;

async function applyMigration() {
  // Essayer d'abord avec DATABASE_URL
  let connectionString = process.env.DATABASE_URL;
  
  console.log('🔌 Tentative de connexion à la base de données...');
  console.log('📍 URL:', connectionString ? connectionString.substring(0, 30) + '...' : 'NON TROUVÉE');

  if (!connectionString) {
    console.error('❌ DATABASE_URL non trouvée dans .env');
    console.log('\n📝 Veuillez copier-coller ce SQL dans Supabase SQL Editor:');
    console.log('\n' + '='.repeat(80));
    console.log(SQL);
    console.log('='.repeat(80));
    console.log('\n🌐 Allez sur: https://supabase.com/dashboard');
    console.log('   1. Sélectionnez votre projet');
    console.log('   2. Allez dans "SQL Editor"');
    console.log('   3. Créez une nouvelle query');
    console.log('   4. Copiez-collez le SQL ci-dessus');
    console.log('   5. Cliquez sur "Run"');
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: false
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    console.log('\n📝 Application de la migration...');
    await client.query(SQL);
    console.log('✅ Migration appliquée avec succès !');

    console.log('\n🎉 TERMINÉ !');
    console.log('✅ Colonne invitationCode ajoutée à User');
    console.log('✅ Table parent_child_links créée');
    console.log('✅ Index créés');

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    
    if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      console.log('\n⚠️  Impossible de se connecter à la base de données.');
      console.log('📝 Veuillez appliquer la migration manuellement via Supabase:');
      console.log('\n' + '='.repeat(80));
      console.log(SQL);
      console.log('='.repeat(80));
      console.log('\n🌐 Allez sur: https://supabase.com/dashboard');
      console.log('   1. Sélectionnez votre projet');
      console.log('   2. Allez dans "SQL Editor"');
      console.log('   3. Créez une nouvelle query');
      console.log('   4. Copiez-collez le SQL ci-dessus');
      console.log('   5. Cliquez sur "Run"');
    } else if (error.message.includes('already exists')) {
      console.log('\n✅ La migration semble déjà appliquée !');
    } else {
      console.log('\nDétails:', error);
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();









