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

function splitStatements(sql) {
  // découpe simple sur ; en fin de ligne
  return sql
    .split(/;\s*\n/g)
    .map(s => s.trim())
    .filter(Boolean)
}

async function run() {
  const client = await pool.connect()
  try {
    const filePath = path.resolve(process.cwd(), '..', 'supabase', 'test_queries.sql')
    const sql = fs.readFileSync(filePath, 'utf-8')
    const statements = splitStatements(sql)
    console.log(`▶️  Exécution de ${statements.length} requêtes...\n`)
    let i = 0
    for (const stmt of statements) {
      i++
      try {
        const res = await client.query(stmt)
        console.log(`-- [${i}] OK (${res.rowCount ?? 0} lignes)`) 
        if (res.rows && res.rows.length) {
          console.log(res.rows.slice(0, 5))
        }
      } catch (e) {
        console.log(`-- [${i}] ERREUR: ${e.message}`)
      }
      console.log('')
    }
  } finally {
    client.release()
    await pool.end()
  }
}

run()










