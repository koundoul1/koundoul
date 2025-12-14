import prismaService from '../../database/prisma.js'
import { getSupabasePool } from '../../database/supabasePg.js'

class MicrolessonsService {
  async search({ level, subject, difficulty, q, limit, offset }) {
    const supa = getSupabasePool()
    const client = prismaService.client
    const safeLimit = Math.min(Math.max(parseInt(limit || '0', 10) || 0, 1), 5000) || 1000
    const safeOffset = Math.max(parseInt(offset || '0', 10) || 0, 0)
    if (q) {
      // Utilise la fonction SQL de recherche si présente
      if (supa) {
        const { rows } = await supa.query(
          `SELECT * FROM search_microlessons($1, $2, $3, $4) LIMIT ${safeLimit} OFFSET ${safeOffset}`,
          [q, level || null, subject || null, difficulty || null]
        )
        return rows
      } else {
        const rows = await client.$queryRawUnsafe(
          `SELECT * FROM search_microlessons($1, $2, $3, $4) LIMIT ${safeLimit} OFFSET ${safeOffset}`,
          q, level || null, subject || null, difficulty || null
        )
        return rows
      }
    }
    const clauses = []
    const params = []
    let idx = 1
    if (level) { clauses.push(`level = $${idx++}`); params.push(level) }
    if (subject) { clauses.push(`subject = $${idx++}`); params.push(subject) }
    if (difficulty) { clauses.push(`difficulty = $${idx++}`); params.push(parseInt(difficulty)) }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const sql = `SELECT id, level, subject, chapter, title, duration_min, difficulty, xp_reward, tags
                 FROM public.microlessons ${where} ORDER BY id LIMIT ${safeLimit} OFFSET ${safeOffset}`
    if (supa) {
      const { rows } = await supa.query(sql, params)
      return rows
    } else {
      const rows = await client.$queryRawUnsafe(sql, ...params)
      return rows
    }
  }

  async getById(id) {
    const client = prismaService.client
    const rows = await client.$queryRawUnsafe(
      `SELECT * FROM public.microlessons WHERE id = $1 LIMIT 1`, id
    )
    return rows[0] || null
  }

  async getChapterPath(chapter, level) {
    const client = prismaService.client
    const rows = await client.$queryRawUnsafe(
      `SELECT * FROM get_chapter_path($1, $2)`, chapter, level
    )
    return rows
  }

  // ===== TRACKING METHODS =====

  async completeLesson(userId, microlessonId, { score, timeSpent } = {}) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    const now = new Date().toISOString()
    
    // UPSERT : créer ou mettre à jour la complétion
    const query = `
      INSERT INTO public.microlesson_completions 
        (user_id, microlesson_id, completed, score, time_spent, attempts, first_completed_at, last_reviewed_at)
      VALUES 
        ($1, $2, true, $3, $4, 1, $5, $6)
      ON CONFLICT (user_id, microlesson_id) 
      DO UPDATE SET
        completed = true,
        score = EXCLUDED.score,
        time_spent = EXCLUDED.time_spent,
        attempts = microlesson_completions.attempts + 1,
        last_reviewed_at = EXCLUDED.last_reviewed_at,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `

    const result = await supa.query(query, [
      userId, microlessonId, 
      score || null, 
      timeSpent || 0, 
      now, now
    ])

    return result.rows[0]
  }

  async getUserStats(userId) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    const result = await supa.query('SELECT * FROM get_user_microlessons_stats($1)', [userId])
    return result.rows[0]
  }

  async getToReview(userId, limit = 10) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    const result = await supa.query('SELECT * FROM get_lessons_to_review($1, $2)', [userId, limit])
    return result.rows
  }

  async getCompletionStatus(userId, microlessonId) {
    const supa = getSupabasePool()
    if (!supa) {
      return null
    }

    const result = await supa.query(
      'SELECT * FROM public.microlesson_completions WHERE user_id = $1 AND microlesson_id = $2',
      [userId, microlessonId]
    )
    return result.rows[0] || null
  }

  async getUserCompletions(userId, filters = {}) {
    const supa = getSupabasePool()
    if (!supa) {
      return []
    }

    const { subject, level, completed } = filters
    let query = 'SELECT * FROM public.microlesson_completions WHERE user_id = $1'
    const params = [userId]

    if (completed !== undefined) {
      query += ' AND completed = $' + (params.length + 1)
      params.push(completed)
    }

    query += ' ORDER BY created_at DESC'

    const result = await supa.query(query, params)
    return result.rows
  }
}

const microlessonsService = new MicrolessonsService()
export default microlessonsService


