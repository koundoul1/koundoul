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

async function sample() {
  console.log('📝 ÉCHANTILLON DE QUESTIONS\n')
  
  try {
    const client = await pool.connect()
    
    // 3 QCM aléatoires Math
    console.log('🔢 MATHÉMATIQUES - QCM :')
    const mathQcm = await client.query(`
      SELECT id, question, options, explanation 
      FROM public.qcm_questions 
      WHERE bank_id = 'MS-QCM' 
      ORDER BY RANDOM() 
      LIMIT 3
    `)
    
    mathQcm.rows.forEach((q, i) => {
      console.log(`\n${i+1}. ${q.id} : ${q.question}`)
      const opts = q.options
      opts.forEach(opt => {
        const mark = opt.is_correct ? '✅' : '  '
        console.log(`   ${mark} ${opt.id}. ${opt.text}`)
      })
      console.log(`   💡 ${q.explanation}`)
    })
    
    // 2 Exercices Math
    console.log('\n\n📐 MATHÉMATIQUES - EXERCICES :')
    const mathEx = await client.query(`
      SELECT id, problem, solution, hints 
      FROM public.exercise_problems 
      WHERE bank_id = 'MS-EX' 
      ORDER BY RANDOM() 
      LIMIT 2
    `)
    
    mathEx.rows.forEach((ex, i) => {
      console.log(`\n${i+1}. ${ex.id} : ${ex.problem}`)
      console.log(`   📝 Solution :`)
      if (ex.solution.steps) {
        ex.solution.steps.forEach((step, idx) => {
          console.log(`      ${idx+1}. ${step}`)
        })
      }
      console.log(`   ✅ Réponse : ${ex.solution.final_answer}`)
      if (ex.hints && ex.hints.length > 0) {
        console.log(`   💡 Indice : ${ex.hints[0]}`)
      }
    })
    
    // 2 QCM Physique
    console.log('\n\n⚡ PHYSIQUE - QCM :')
    const physQcm = await client.query(`
      SELECT id, question, options 
      FROM public.qcm_questions 
      WHERE bank_id = 'PS-QCM' 
      ORDER BY RANDOM() 
      LIMIT 2
    `)
    
    physQcm.rows.forEach((q, i) => {
      console.log(`\n${i+1}. ${q.id} : ${q.question}`)
      const correctOpt = q.options.find(opt => opt.is_correct)
      console.log(`   ✅ Réponse correcte : ${correctOpt.id}. ${correctOpt.text}`)
    })
    
    // 2 QCM Chimie
    console.log('\n\n🧪 CHIMIE - QCM :')
    const chimieQcm = await client.query(`
      SELECT id, question, options 
      FROM public.qcm_questions 
      WHERE bank_id = 'CS-QCM' 
      ORDER BY RANDOM() 
      LIMIT 2
    `)
    
    chimieQcm.rows.forEach((q, i) => {
      console.log(`\n${i+1}. ${q.id} : ${q.question}`)
      const correctOpt = q.options.find(opt => opt.is_correct)
      console.log(`   ✅ Réponse correcte : ${correctOpt.id}. ${correctOpt.text}`)
    })
    
    client.release()
    console.log('\n\n✅ Échantillonnage terminé !')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await pool.end()
  }
}

sample()









