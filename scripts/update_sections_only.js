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

async function run() {
  const argPath = process.argv[2]
  const jsonPath = argPath ? path.resolve(process.cwd(), argPath) : path.resolve(process.cwd(), '..', 'data', 'lot1_microlessons.json')
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Fichier JSON non trouvé:', jsonPath)
    process.exit(1)
  }
  const lessons = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  if (!Array.isArray(lessons)) {
    console.error('❌ Format JSON incorrect : attend un tableau')
    process.exit(1)
  }

  const client = await pool.connect()
  try {
    let count = 0
    let skipped = 0
    for (const l of lessons) {
      if (!l.id || !l.content_sections) {
        console.log(`⚠️  ${l.id || '?'} ignorée : id ou content_sections manquant`)
        skipped++
        continue
      }
      await client.query(
        `UPDATE public.microlessons SET content_sections = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [JSON.stringify(l.content_sections), l.id]
      )
      count++
      console.log(`✅ ${l.id} mise à jour (${count}/${lessons.length})`)
    }
    console.log(`🎉 ${count} leçons mises à jour, ${skipped} ignorées`)
  } catch (e) {
    console.error('💥 Erreur import lot:', e.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()









