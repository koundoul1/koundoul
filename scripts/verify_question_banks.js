import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { require: true, rejectUnauthorized: false } 
})

async function verify() {
  console.log('🔍 VÉRIFICATION DÉTAILLÉE DES BANQUES DE QUESTIONS\n')
  
  try {
    const client = await pool.connect()
    
    // Lister toutes les banques
    const banks = await client.query(`
      SELECT id, title, subject, level, type, total_questions 
      FROM public.question_banks 
      ORDER BY subject, level, type
    `)
    
    console.log('📚 BANQUES ENREGISTRÉES :\n')
    for (const bank of banks.rows) {
      console.log(`\n🏷️  ${bank.id}`)
      console.log(`   Titre : ${bank.title}`)
      console.log(`   Matière : ${bank.subject} • Niveau : ${bank.level}`)
      console.log(`   Type : ${bank.type}`)
      console.log(`   Questions attendues : ${bank.total_questions}`)
      
      // Compter les questions réelles
      if (bank.type === 'QCM') {
        const count = await client.query(
          'SELECT COUNT(*) FROM public.qcm_questions WHERE bank_id = $1',
          [bank.id]
        )
        console.log(`   Questions réelles : ${count.rows[0].count} QCM ✅`)
        
        // Exemple de question
        const sample = await client.query(
          'SELECT id, question FROM public.qcm_questions WHERE bank_id = $1 LIMIT 1',
          [bank.id]
        )
        if (sample.rows.length > 0) {
          console.log(`   Exemple : ${sample.rows[0].id} - ${sample.rows[0].question.substring(0, 60)}...`)
        }
      } else {
        const count = await client.query(
          'SELECT COUNT(*) FROM public.exercise_problems WHERE bank_id = $1',
          [bank.id]
        )
        console.log(`   Exercices réels : ${count.rows[0].count} exercices ✅`)
        
        // Exemple d'exercice
        const sample = await client.query(
          'SELECT id, problem FROM public.exercise_problems WHERE bank_id = $1 LIMIT 1',
          [bank.id]
        )
        if (sample.rows.length > 0) {
          console.log(`   Exemple : ${sample.rows[0].id} - ${sample.rows[0].problem.substring(0, 60)}...`)
        }
      }
    }
    
    // Statistiques globales
    const totalQcm = await client.query('SELECT COUNT(*) FROM public.qcm_questions')
    const totalEx = await client.query('SELECT COUNT(*) FROM public.exercise_problems')
    
    console.log('\n\n📊 STATISTIQUES GLOBALES')
    console.log('═══════════════════════════════')
    console.log(`Total QCM : ${totalQcm.rows[0].count}`)
    console.log(`Total Exercices : ${totalEx.rows[0].count}`)
    console.log(`Total Questions : ${parseInt(totalQcm.rows[0].count) + parseInt(totalEx.rows[0].count)}`)
    
    // Progression vers 1800
    const total = parseInt(totalQcm.rows[0].count) + parseInt(totalEx.rows[0].count)
    const percentage = ((total / 1800) * 100).toFixed(1)
    console.log(`\n🎯 Progression : ${total}/1800 (${percentage}%)`)
    console.log(`📦 Restant : ${1800 - total} questions`)
    
    // Distribution par difficulté
    const diffQcm = await client.query(`
      SELECT difficulty, COUNT(*) 
      FROM public.qcm_questions 
      GROUP BY difficulty 
      ORDER BY difficulty
    `)
    
    console.log('\n📈 DISTRIBUTION DIFFICULTÉ (QCM) :')
    diffQcm.rows.forEach(row => {
      const label = row.difficulty === 1 ? 'Facile' : row.difficulty === 2 ? 'Moyen' : 'Difficile'
      console.log(`   ${label} (${row.difficulty}) : ${row.count} QCM`)
    })
    
    client.release()
    console.log('\n✅ Vérification terminée !')
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
  } finally {
    await pool.end()
  }
}

verify()









