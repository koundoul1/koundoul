import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

// Désactiver la vérification de certificat pour l'import (supabase self-signed)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL manquant dans .env')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { require: true, rejectUnauthorized: false } })

const INSERT_SQL = `
INSERT INTO public.microlessons (
  id, level, subject, chapter, title, duration_min, objectives, prerequisites,
  content_types, difficulty, xp_reward, tags
) VALUES (
  $1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11,$12::jsonb
) ON CONFLICT (id) DO UPDATE SET
  level = EXCLUDED.level,
  subject = EXCLUDED.subject,
  chapter = EXCLUDED.chapter,
  title = EXCLUDED.title,
  duration_min = EXCLUDED.duration_min,
  objectives = EXCLUDED.objectives,
  prerequisites = EXCLUDED.prerequisites,
  content_types = EXCLUDED.content_types,
  difficulty = EXCLUDED.difficulty,
  xp_reward = EXCLUDED.xp_reward,
  tags = EXCLUDED.tags,
  updated_at = CURRENT_TIMESTAMP
`;

async function importJSON() {
  // Chercher d'abord dans ./data, puis ../data
  let jsonPath = path.resolve(process.cwd(), 'data', 'all_450_microlessons.json')
  if (!fs.existsSync(jsonPath)) {
    const alt = path.resolve(process.cwd(), '..', 'data', 'all_450_microlessons.json')
    if (fs.existsSync(alt)) jsonPath = alt
  }
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Fichier introuvable:', jsonPath)
    process.exit(1)
  }

  const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  const lessons = payload.lessons || []
  console.log(`📖 ${lessons.length} leçons à insérer`)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // purge optionnelle
    await client.query('DELETE FROM public.microlessons')

    let count = 0
    for (const l of lessons) {
      await client.query(INSERT_SQL, [
        l.id,
        l.level,
        l.subject,
        l.chapter,
        l.title,
        l.duration_min,
        JSON.stringify(l.objectives || []),
        JSON.stringify(l.prerequisites || []),
        JSON.stringify(l.content_types || []),
        l.difficulty,
        l.xp_reward,
        JSON.stringify(l.tags || [])
      ])
      count++
      if (count % 50 === 0) console.log(`✅ ${count} insérées...`)
    }
    await client.query('COMMIT')
    console.log(`🎉 Import terminé: ${count} leçons`) 
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('💥 Erreur import:', e.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

importJSON()


