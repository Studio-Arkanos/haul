import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError, defineEventHandler, getQuery, sendRedirect, setResponseHeader } from 'h3'
import { getSupabaseAdmin } from '../lib/supabase.server'

// Téléchargement d'un bien numérique via token unique (digital_deliveries).
// Stratégie : URL signée Supabase Storage (bucket privé « digital-products ») → 302.
// Repli développement : streaming du fichier local storage/digital/<file_path>.
export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  if (typeof token !== 'string' || !/^[a-f0-9]{32,128}$/i.test(token)) {
    throw createError({ statusCode: 400, statusMessage: 'Token invalide' })
  }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (err) {
    throw createError({
      statusCode: 503,
      statusMessage: err instanceof Error ? err.message : 'Supabase non configuré',
    })
  }

  const { data: delivery, error } = await supabase
    .from('digital_deliveries')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (error) {
    console.error('[haul][download] lookup:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Base indisponible' })
  }
  if (!delivery) {
    throw createError({ statusCode: 404, statusMessage: 'Lien de téléchargement inconnu' })
  }
  if (new Date(delivery.expires_at).getTime() < Date.now()) {
    throw createError({ statusCode: 410, statusMessage: 'Lien expiré — contacte le support' })
  }

  const bumpCount = () =>
    supabase
      .from('digital_deliveries')
      .update({ download_count: (delivery.download_count ?? 0) + 1 })
      .eq('id', delivery.id)
      .then(({ error: e }) => {
        if (e) console.error('[haul][download] increment:', e.message)
      })

  // ── 1. Supabase Storage (production) : URL signée 120 s ──
  try {
    const { data, error: signError } = await supabase.storage
      .from('digital-products')
      .createSignedUrl(delivery.file_path, 120)
    if (!signError && data?.signedUrl) {
      await bumpCount()
      return sendRedirect(event, data.signedUrl, 302)
    }
    if (signError) console.warn('[haul][download] signed URL:', signError.message)
  } catch (err) {
    console.warn('[haul][download] storage indisponible:', err instanceof Error ? err.message : err)
  }

  // ── 2. Repli local (développement) ──
  try {
    const localPath = join(process.cwd(), 'storage', 'digital', delivery.file_path)
    const bytes = await readFile(localPath)
    await bumpCount()
    setResponseHeader(event, 'content-type', 'application/pdf')
    setResponseHeader(event, 'content-disposition', `attachment; filename="${delivery.file_path}"`)
    setResponseHeader(event, 'cache-control', 'private, no-store')
    return bytes
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage:
        'Fichier pas encore disponible. Le studio doit déposer les livrables dans le bucket « digital-products ».',
    })
  }
})
