import pg from 'pg'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { require: true, rejectUnauthorized: false } 
})

async function test() {
  console.log('🧪 Test du système de banques de questions\n')
  
  try {
    const client = await pool.connect()
    
    // Vérifier les tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('question_banks', 'qcm_questions', 'exercise_problems')
    `)
    
    console.log(`✅ Tables trouvées : ${tables.rows.length}/3`)
    tables.rows.forEach(t => console.log(`   - ${t.table_name}`))
    
    // Vérifier les fonctions
    const functions = await client.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname IN ('get_random_qcm', 'get_random_exercises', 'get_bank_stats')
    `)
    
    console.log(`\n✅ Fonctions trouvées : ${functions.rows.length}/3`)
    functions.rows.forEach(f => console.log(`   - ${f.proname}()`))
    
    // Compter les banques
    const banks = await client.query('SELECT COUNT(*) FROM public.question_banks')
    console.log(`\n📊 Banques enregistrées : ${banks.rows[0].count}`)
    
    // Compter les QCM
    const qcm = await client.query('SELECT COUNT(*) FROM public.qcm_questions')
    console.log(`📝 QCM enregistrés : ${qcm.rows[0].count}`)
    
    // Compter les exercices
    const exercises = await client.query('SELECT COUNT(*) FROM public.exercise_problems')
    console.log(`💪 Exercices enregistrés : ${exercises.rows[0].count}`)
    
    client.release()
    console.log('\n🎉 Système opérationnel !')
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

test()









