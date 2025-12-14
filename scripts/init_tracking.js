import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL manquant dans .env');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false }
});

async function initTracking() {
  try {
    console.log('📊 Initialisation du système de tracking des micro-leçons...\n');

    // Lire le fichier de migration
    const migrationPath = path.resolve(__dirname, '../supabase/migration_microlesson_tracking.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Exécuter la migration
    console.log('⏳ Application de la migration...');
    await pool.query(migrationSQL);
    console.log('✅ Migration appliquée avec succès !\n');

    // Vérifier la création de la table
    const checkQuery = `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'microlesson_completions'
      ORDER BY ordinal_position;
    `;

    const result = await pool.query(checkQuery);
    
    if (result.rows.length > 0) {
      console.log('📋 Table créée avec succès :');
      console.log(`   Colonnes (${result.rows.length}) :`);
      result.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('⚠️  Table non trouvée.');
    }

    // Vérifier les fonctions
    const functionsQuery = `
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name IN ('get_user_microlessons_stats', 'get_lessons_to_review')
      ORDER BY routine_name;
    `;

    const functionsResult = await pool.query(functionsQuery);
    console.log(`\n🔧 Fonctions créées (${functionsResult.rows.length}) :`);
    functionsResult.rows.forEach(func => {
      console.log(`   - ${func.routine_name}()`);
    });

    console.log('\n🎉 Système de tracking initialisé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initTracking();

