import { getSupabasePool } from '../../database/supabasePg.js'

class QuestionBanksService {
  
  // Récupérer toutes les banques avec filtres
  async listBanks({ level, subject, type, limit = 100, offset = 0 }) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    const clauses = []
    const params = []
    let idx = 1

    if (level) {
      clauses.push(`level = $${idx++}`)
      params.push(level)
    }
    if (subject) {
      clauses.push(`subject = $${idx++}`)
      params.push(subject)
    }
    if (type) {
      clauses.push(`type = $${idx++}`)
      params.push(type)
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const sql = `
      SELECT * FROM public.question_banks
      ${where}
      ORDER BY subject, level, type
      LIMIT $${idx} OFFSET $${idx + 1}
    `
    params.push(limit, offset)

    const { rows } = await supa.query(sql, params)
    return rows
  }

  // Récupérer une banque spécifique avec statistiques
  async getBankById(id) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    const result = await supa.query('SELECT * FROM get_bank_stats($1)', [id])
    const stats = result.rows[0] || { total_qcm: 0, total_exercises: 0, difficulty_distribution: {} }

    const bank = await supa.query('SELECT * FROM public.question_banks WHERE id = $1', [id])
    
    return {
      ...bank.rows[0],
      stats
    }
  }

  // Récupérer des QCM aléatoires
  async getRandomQCM({ bankId, difficulty, limit = 10 }) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    const result = await supa.query('SELECT * FROM get_random_qcm($1, $2, $3)', [
      bankId,
      difficulty || null,
      limit
    ])

    return result.rows
  }

  // Récupérer des exercices aléatoires
  async getRandomExercises({ bankId, difficulty, limit = 5 }) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    const result = await supa.query('SELECT * FROM get_random_exercises($1, $2, $3)', [
      bankId,
      difficulty || null,
      limit
    ])

    return result.rows
  }

  // Récupérer toutes les QCM d'une banque
  async getQCMByBank(bankId, { chapter, difficulty, limit = 100, offset = 0 }) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    const clauses = ['bank_id = $1']
    const params = [bankId]
    let idx = 2

    if (chapter) {
      clauses.push(`chapter = $${idx++}`)
      params.push(chapter)
    }
    if (difficulty) {
      clauses.push(`difficulty = $${idx++}`)
      params.push(difficulty)
    }

    const where = clauses.join(' AND ')
    const sql = `
      SELECT * FROM public.qcm_questions
      WHERE ${where}
      ORDER BY order_index, id
      LIMIT $${idx} OFFSET $${idx + 1}
    `
    params.push(limit, offset)

    const { rows } = await supa.query(sql, params)
    return rows
  }

  // Récupérer tous les exercices d'une banque
  async getExercisesByBank(bankId, { chapter, difficulty, limit = 100, offset = 0 }) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    const clauses = ['bank_id = $1']
    const params = [bankId]
    let idx = 2

    if (chapter) {
      clauses.push(`chapter = $${idx++}`)
      params.push(chapter)
    }
    if (difficulty) {
      clauses.push(`difficulty = $${idx++}`)
      params.push(difficulty)
    }

    const where = clauses.join(' AND ')
    const sql = `
      SELECT * FROM public.exercise_problems
      WHERE ${where}
      ORDER BY order_index, id
      LIMIT $${idx} OFFSET $${idx + 1}
    `
    params.push(limit, offset)

    const { rows } = await supa.query(sql, params)
    return rows
  }
}

export default new QuestionBanksService()









