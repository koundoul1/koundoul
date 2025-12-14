/**
 * Script pour vérifier si la migration a été appliquée
 */

import { Client } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env
dotenv.config({ path: resolve(__dirname, '../backend/.env') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function verifierMigration() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log('❌ DATABASE_URL non trouvée dans .env');
    console.log('\n📝 La migration n\'a pas pu être vérifiée automatiquement.');
    console.log('👉 Vérifie manuellement dans Supabase Dashboard > Table Editor');
    return;
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: false
  });

  try {
    console.log('🔌 Connexion à la base de données...\n');
    await client.connect();
    console.log('✅ Connecté\n');

    // Vérifier la colonne invitationCode
    console.log('🔍 Vérification 1/3 : Colonne invitationCode...');
    const colonneResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'invitationCode'
    `);
    
    if (colonneResult.rows.length > 0) {
      console.log('   ✅ Colonne "invitationCode" existe dans la table User');
    } else {
      console.log('   ❌ Colonne "invitationCode" N\'EXISTE PAS');
      console.log('   👉 La migration n\'a pas été appliquée');
    }

    // Vérifier la table parent_child_links
    console.log('\n🔍 Vérification 2/3 : Table parent_child_links...');
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'parent_child_links'
    `);
    
    if (tableResult.rows.length > 0) {
      console.log('   ✅ Table "parent_child_links" existe');
      
      // Compter les lignes
      const countResult = await client.query('SELECT COUNT(*) as count FROM parent_child_links');
      console.log(`   📊 Nombre de liens parent-enfant : ${countResult.rows[0].count}`);
    } else {
      console.log('   ❌ Table "parent_child_links" N\'EXISTE PAS');
      console.log('   👉 La migration n\'a pas été appliquée');
    }

    // Vérifier les index
    console.log('\n🔍 Vérification 3/3 : Index...');
    const indexResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'parent_child_links'
    `);
    
    if (indexResult.rows.length > 0) {
      console.log('   ✅ Index créés :');
      indexResult.rows.forEach(row => {
        console.log(`      - ${row.indexname}`);
      });
    } else {
      console.log('   ⚠️  Aucun index trouvé (peut être normal si la table n\'existe pas)');
    }

    // Résumé final
    console.log('\n' + '='.repeat(60));
    if (colonneResult.rows.length > 0 && tableResult.rows.length > 0) {
      console.log('🎉 MIGRATION APPLIQUÉE AVEC SUCCÈS !');
      console.log('✅ Tous les éléments sont en place');
      console.log('✅ Le système parent-enfant est opérationnel');
    } else {
      console.log('❌ MIGRATION NON APPLIQUÉE');
      console.log('\n📝 Pour appliquer la migration :');
      console.log('   1. Va sur https://supabase.com/dashboard');
      console.log('   2. SQL Editor > New query');
      console.log('   3. Copie le contenu de MIGRATION_SQL_A_EXECUTER.sql');
      console.log('   4. Exécute (Run)');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    
    if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      console.log('\n⚠️  Impossible de se connecter à la base de données.');
      console.log('👉 Vérifie manuellement dans Supabase Dashboard > Table Editor');
      console.log('   - Cherche la table "parent_child_links"');
      console.log('   - Vérifie si la colonne "invitationCode" existe dans User');
    }
  } finally {
    await client.end();
  }
}

verifierMigration();









