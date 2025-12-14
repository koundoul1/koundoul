import pg from 'pg'
import path from 'path'
import fs from 'fs'
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

async function importBanks() {
  const banksDir = path.resolve(__dirname, '..', 'data', 'question-banks')
  
  if (!fs.existsSync(banksDir)) {
    console.error('❌ Dossier data/question-banks introuvable')
    process.exit(1)
  }

  const files = fs.readdirSync(banksDir).filter(f => f.endsWith('.json'))
  
  if (files.length === 0) {
    console.error('❌ Aucun fichier JSON trouvé dans data/question-banks')
    console.log('💡 Créez d\'abord les fichiers JSON avec vos données')
    process.exit(1)
  }

  console.log(`📁 ${files.length} fichier(s) JSON trouvé(s)\n`)

  let client
  
  try {
    client = await pool.connect()
    
    for (const file of files) {
      await importBankFile(client, path.join(banksDir, file))
    }
    
    console.log('\n✅ Import terminé !')
    
  } catch (error) {
    console.error('❌ Erreur import:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    if (client) {
      client.release()
    }
    await pool.end()
  }
}

async function importBankFile(client, filePath) {
  const filename = path.basename(filePath)
  console.log(`📄 Traitement de ${filename}...`)
  
  const content = fs.readFileSync(filePath, 'utf8')
  const data = JSON.parse(content)
  
  if (!data.bank_info) {
    console.log(`   ⚠️  Format invalide : manque bank_info`)
    return
  }

  const bankInfo = data.bank_info
  
  // Déterminer l'ID de la banque
  const bankId = `${bankInfo.subject.substring(0, 1)}${bankInfo.level.substring(0, 1)}-${bankInfo.type === 'QCM' ? 'QCM' : 'EX'}`
  
  // UPSERT de la banque
  await client.query(`
    INSERT INTO public.question_banks (
      id, title, level, subject, type, total_questions,
      chapters_covered, difficulty_distribution
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      total_questions = EXCLUDED.total_questions,
      chapters_covered = EXCLUDED.chapters_covered,
      difficulty_distribution = EXCLUDED.difficulty_distribution,
      updated_at = CURRENT_TIMESTAMP
  `, [
    bankId,
    bankInfo.title,
    bankInfo.level,
    bankInfo.subject,
    bankInfo.type,
    bankInfo.total_questions,
    JSON.stringify(bankInfo.chapters_covered || []),
    JSON.stringify(bankInfo.difficulty_distribution || {})
  ])

  console.log(`   ✓ Banque ${bankId} créée`)

  // Importer les questions selon le type
  if (data.questions && Array.isArray(data.questions)) {
    // Import QCM
    await importQCM(client, bankId, data.questions)
    console.log(`   ✓ ${data.questions.length} QCM importées`)
  } else if (data.exercises && Array.isArray(data.exercises)) {
    // Import Exercices
    await importExercises(client, bankId, data.exercises)
    console.log(`   ✓ ${data.exercises.length} exercices importés`)
  }
}

async function importQCM(client, bankId, questions) {
  const BATCH_SIZE = 10
  let count = 0
  
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE)
    
    for (const [localIndex, q] of batch.entries()) {
      const globalIndex = i + localIndex
      
      try {
        await client.query(`
          INSERT INTO public.qcm_questions (
            id, bank_id, chapter, difficulty, points, time_limit_seconds,
            question, options, correct_answer, explanation, related_lesson, order_index
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            bank_id = EXCLUDED.bank_id,
            chapter = EXCLUDED.chapter,
            difficulty = EXCLUDED.difficulty,
            points = EXCLUDED.points,
            question = EXCLUDED.question,
            options = EXCLUDED.options,
            correct_answer = EXCLUDED.correct_answer,
            explanation = EXCLUDED.explanation
        `, [
          q.id,
          bankId,
          q.chapter || null,
          q.difficulty || 1,
          q.points || 10,
          q.time_limit_seconds || null,
          q.question,
          JSON.stringify(q.options || []),
          q.correct_answer !== undefined ? q.correct_answer : null,
          q.explanation || null,
          q.related_lesson || null,
          globalIndex
        ])
        count++
      } catch (error) {
        console.error(`   ❌ Erreur ${q.id}:`, error.message)
      }
    }
    
    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= questions.length) {
      console.log(`   📊 Progression: ${count}/${questions.length}`)
    }
  }
}

async function importExercises(client, bankId, exercises) {
  const BATCH_SIZE = 10
  let count = 0
  
  // Mapper les difficultés textuelles en nombres
  const mapDifficulty = (diff) => {
    if (typeof diff === 'number') return diff
    if (typeof diff === 'string') {
      const lower = diff.toLowerCase()
      if (lower === 'facile' || lower === 'easy') return 1
      if (lower === 'moyen' || lower === 'medium') return 2
      if (lower === 'difficile' || lower === 'hard') return 3
    }
    return 1
  }
  
  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE)
    
    for (const [localIndex, ex] of batch.entries()) {
      const globalIndex = i + localIndex
      
      try {
        // Support multiple formats: problem, statement, question
        const problemText = ex.problem || ex.statement || ex.question
        
        if (!problemText) {
          console.error(`   ⚠️  ${ex.id} : pas d'énoncé (problem/statement/question manquant)`)
          continue
        }
        
        await client.query(`
          INSERT INTO public.exercise_problems (
            id, bank_id, chapter, difficulty, points, time_limit_minutes,
            problem, solution, hints, related_lesson, order_index
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            bank_id = EXCLUDED.bank_id,
            chapter = EXCLUDED.chapter,
            difficulty = EXCLUDED.difficulty,
            points = EXCLUDED.points,
            problem = EXCLUDED.problem,
            solution = EXCLUDED.solution,
            hints = EXCLUDED.hints
        `, [
          ex.id,
          bankId,
          ex.chapter || null,
          mapDifficulty(ex.difficulty),
          ex.points || 10,
          ex.time_limit_minutes || null,
          problemText,
          JSON.stringify(ex.solution || {}),
          JSON.stringify(ex.hints || []),
          ex.related_lesson || null,
          globalIndex
        ])
        count++
      } catch (error) {
        console.error(`   ❌ Erreur ${ex.id}:`, error.message)
      }
    }
    
    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= exercises.length) {
      console.log(`   📊 Progression: ${count}/${exercises.length}`)
    }
  }
}

importBanks()

