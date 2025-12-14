/**
 * Script pour appliquer la migration parent-child
 */

import { Client } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env depuis le dossier backend
dotenv.config({ path: resolve(__dirname, '../backend/.env') });

// Bypass SSL pour Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function applyMigration() {
  // Utiliser le pooler si disponible
  const dbUrl = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: false
  });

  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connecté');

    // Lire le fichier SQL
    const sqlPath = resolve(__dirname, '../backend/prisma/migrations/add_parent_child_links.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('\n📝 Application de la migration parent-child...');
    await client.query(sql);
    console.log('✅ Migration appliquée avec succès');

    console.log('\n✅ Terminé !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();

