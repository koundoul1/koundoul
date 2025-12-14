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

async function fix() {
  console.log('🔧 Correction de la fonction get_bank_stats...')
  
  try {
    const client = await pool.connect()
    
    await client.query(`
      CREATE OR REPLACE FUNCTION get_bank_stats(p_bank_id VARCHAR)
      RETURNS TABLE (
          total_qcm BIGINT,
          total_exercises BIGINT,
          difficulty_distribution JSONB
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              (SELECT COUNT(*) FROM public.qcm_questions WHERE bank_id = p_bank_id)::BIGINT,
              (SELECT COUNT(*) FROM public.exercise_problems WHERE bank_id = p_bank_id)::BIGINT,
              (SELECT qb.difficulty_distribution FROM public.question_banks qb WHERE qb.id = p_bank_id);
      END;
      $$;
    `)
    
    console.log('✅ Fonction corrigée avec succès')
    
    client.release()
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await pool.end()
  }
}

fix()









