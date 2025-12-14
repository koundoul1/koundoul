import pg from 'pg'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL manquant')
  process.exit(1)
}

const pool = new pg.Pool({ 
  connectionString: DATABASE_URL, 
  ssl: { require: true, rejectUnauthorized: false } 
})

async function initSchema() {
  console.log('📊 Initialisation du schéma des banques de questions...')
  
  try {
    const client = await pool.connect()
    
    // Lire et exécuter la migration SQL
    const schemaPath = path.resolve(__dirname, '..', 'supabase', 'migration_question_banks.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    
    await client.query(schemaSql)
    console.log('✅ Schéma créé avec succès')
    
    // Vérifier les tables
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('question_banks', 'qcm_questions', 'exercise_problems')
    `)
    
    console.log('\n📋 Tables créées :')
    tablesCheck.rows.forEach(row => console.log(`   ✓ ${row.table_name}`))
    
    // Vérifier les fonctions
    const functionsCheck = await client.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname IN ('get_random_qcm', 'get_random_exercises', 'get_bank_stats')
    `)
    
    console.log('\n🔧 Fonctions créées :')
    functionsCheck.rows.forEach(row => console.log(`   ✓ ${row.proname}()`))
    
    client.release()
    console.log('\n🎉 Schéma des banques de questions initialisé !')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

initSchema()









