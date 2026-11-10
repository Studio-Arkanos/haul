import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Client Supabase « service role » — contourne le RLS. SERVEUR UNIQUEMENT.
// Instancié paresseusement pour ne pas faire échouer le build quand les clés manquent.
let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants — copie .env.example vers .env.',
    )
  }
  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return cached
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}
