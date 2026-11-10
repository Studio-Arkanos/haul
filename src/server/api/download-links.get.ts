import { createError, defineEventHandler, getQuery } from 'h3'
import { getSupabaseAdmin } from '../lib/supabase.server'

// Retourne les liens de téléchargement d'une session Checkout payée.
// Le session_id (reçu dans l'URL de succès) agit comme un jeton porteur — même modèle
// qu'un lien de reçu Stripe. Génère une requête par lien, pas d'accès aux fichiers ici.
export default defineEventHandler(async (event) => {
  const { session_id } = getQuery(event)
  if (typeof session_id !== 'string' || !session_id.startsWith('cs_')) {
    throw createError({ statusCode: 400, statusMessage: 'session_id manquant ou invalide' })
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

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, email, payment_status, fulfillment_status, created_at')
    .eq('stripe_session_id', session_id)
    .maybeSingle()

  if (orderError) {
    console.error('[haul][download-links] orders:', orderError.message)
    throw createError({ statusCode: 500, statusMessage: 'Base indisponible' })
  }

  // Webhook pas encore arrivé → le client réessaie quelques secondes
  if (!order) {
    return { status: 'pending', links: [] }
  }

  const { data: deliveries, error: deliveriesError } = await supabase
    .from('digital_deliveries')
    .select('product_name, token, expires_at')
    .eq('order_id', order.id)

  if (deliveriesError) {
    console.error('[haul][download-links] deliveries:', deliveriesError.message)
    throw createError({ statusCode: 500, statusMessage: 'Base indisponible' })
  }

  return {
    status: 'ready',
    order_id: order.id,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    links: (deliveries ?? []).map((d) => ({
      product_name: d.product_name,
      url: `/api/download?token=${encodeURIComponent(d.token)}`,
      expires_at: d.expires_at,
    })),
  }
})
