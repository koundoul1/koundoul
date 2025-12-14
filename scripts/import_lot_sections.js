import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL manquant dans .env')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { require: true, rejectUnauthorized: false } })

function mapContent(d) {
  const summaryArray = d.summary
    ? [d.summary.key_concept, d.summary.key_method, `Prochaine étape: ${d.summary.next_step}`].filter(Boolean)
    : null
  return {
    introduction: d.introduction || null,
    objectives: undefined, // déjà dans la table
    prerequisites: undefined, // déjà dans la table
    method: d.method_step_by_step || null,
    example: d.guided_example ? { statement: d.guided_example.statement, solution_steps: d.guided_example.solution_steps || [] } : null,
    exercises: d.quick_exercises || null,
    common_mistakes: d.common_mistakes || null,
    summary: summaryArray
  }
}

const UPSERT_SQL = `
INSERT INTO public.microlessons (
  id, level, subject, chapter, title, duration_min, difficulty, xp_reward,
  objectives, prerequisites, content_types, tags, content_sections
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,
  $9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13::jsonb
) ON CONFLICT (id) DO UPDATE SET
  level = EXCLUDED.level,
  subject = EXCLUDED.subject,
  chapter = EXCLUDED.chapter,
  title = EXCLUDED.title,
  duration_min = EXCLUDED.duration_min,
  difficulty = EXCLUDED.difficulty,
  xp_reward = EXCLUDED.xp_reward,
  objectives = EXCLUDED.objectives,
  prerequisites = EXCLUDED.prerequisites,
  content_types = EXCLUDED.content_types,
  tags = EXCLUDED.tags,
  content_sections = EXCLUDED.content_sections,
  updated_at = CURRENT_TIMESTAMP
`;

async function run() {
  const argPath = process.argv[2]
  const jsonPath = argPath ? path.resolve(process.cwd(), argPath) : path.resolve(process.cwd(), '..', 'data', 'lot1_microlessons.json')
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Fichier JSON non trouvé:', jsonPath)
    process.exit(1)
  }
  const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  const lessons = payload.lessons || []

  const client = await pool.connect()
  try {
    let count = 0
    for (const l of lessons) {
      const sections = mapContent(l.detailed_content || {})
      await client.query(UPSERT_SQL, [
        l.id,
        l.level,
        l.subject,
        l.chapter,
        l.title,
        l.duration_min,
        l.difficulty,
        l.xp_reward,
        JSON.stringify(l.objectives || []),
        JSON.stringify(l.prerequisites || []),
        JSON.stringify(l.content_types || []),
        JSON.stringify(l.tags || []),
        JSON.stringify(sections)
      ])
      count++
      console.log(`✅ ${l.id} importée (${count}/${lessons.length})`)
    }
    console.log('🎉 Lot importé avec succès')
  } catch (e) {
    console.error('💥 Erreur import lot:', e.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()


