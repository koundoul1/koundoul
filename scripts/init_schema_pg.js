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
  const client = await pool.connect()
  try {
    const schemaPath = path.resolve(process.cwd(), '..', 'supabase', 'supabase_schema.sql')
    const functionsPath = path.resolve(process.cwd(), '..', 'supabase', 'supabase_functions.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8')
    const functionsSql = fs.readFileSync(functionsPath, 'utf-8')
    const migrationPath = path.resolve(process.cwd(), '..', 'supabase', 'migration_add_content_sections.sql')
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('🏗️  Application du schéma...')
    await client.query(schemaSql)
    console.log('✅ Schéma appliqué')

    console.log('🧠 Fonctions utilitaires...')
    await client.query(functionsSql)
    console.log('✅ Fonctions appliquées')

    console.log('🧩 Migration content_sections...')
    await client.query(migrationSql)
    console.log('✅ Migration appliquée')
  } catch (e) {
    console.error('💥 Erreur init:', e.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()


