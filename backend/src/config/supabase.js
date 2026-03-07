/**
 * Client Supabase pour Koundoul
 * Utilisé pour les micro-leçons (table micro_lessons).
 * Variables d'environnement : SUPABASE_URL, SUPABASE_ANON_KEY
 */

let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false }
    });
    return supabaseClient;
  } catch (err) {
    console.warn('[Supabase] Client non initialisé:', err.message);
    return null;
  }
}

function isSupabaseConfigured() {
  return !!(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

module.exports = {
  getSupabase,
  isSupabaseConfigured
};
