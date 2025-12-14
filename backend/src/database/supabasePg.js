import { Pool } from 'pg'

let supabasePool = null

export function getSupabasePool() {
  // Essayer DATABASE_URL aussi car c'est la variable utilisée dans .env
  const url = process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_PG_URL || process.env.DATABASE_URL
  if (!url || !url.includes('supabase')) return null
  if (supabasePool) return supabasePool
  supabasePool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  })
  return supabasePool
}


