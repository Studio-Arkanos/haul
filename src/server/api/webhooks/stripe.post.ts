import { buffer } from 'node:stream/consumers'
import { createError, defineEventHandler, getHeader } from 'h3'
import type Stripe from 'stripe'
import { getStripe } from '../../lib/stripe.server'
import { getSupabaseAdmin } from '../../lib/supabase.server'
import { getProductById, type Currency, type ProductType } from '../../../lib/products'

// ─────────────────────────────────────────────────────────────
//  Webhook Stripe — checkout.session.completed
//
//  • Vérifie la signature sur le corps BRUT
//  • IDEMPOTENT : stripe_events(id) enregistre chaque événement traité ;
//    toute étape (order upsert, items, livraisons) est rejouable sans doublon
//  • Le panier voyage dans session.metadata.cart (embarqué au checkout) →
//    aucune requête sortante vers l'API Stripe ici (robuste, testable)
//  • Digital  → lignes digital_deliveries (token unique, expirant, 30 j)
//  • Physique → fulfillment_status = awaiting_shipment (trace en DB)
// ─────────────────────────────────────────────────────────────

interface CartEntry {
  id: string
  qty: number
  type?: ProductType
}

export default defineEventHandler(async (event) => {
  const signature = getHeader(event, 'stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature) {
    throw createError({ statusCode: 400, statusMessage: 'Header stripe-signature manquant' })
  }
  if (!webhookSecret) {
    throw createError({ statusCode: 500, statusMessage: 'STRIPE_WEBHOOK_SECRET manquant' })
  }

  const rawBody = await buffer(event.node.req)

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'signature invalide'
    console.error('[haul][webhook] vérification de signature échouée :', message)
    throw createError({ statusCode: 400, statusMessage: `Webhook: ${message}` })
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    console.log(`[haul][webhook] événement ignoré : ${stripeEvent.type}`)
    return { received: true }
  }

  const supabase = getSupabaseAdmin()

  // ── Idempotence : événement déjà traité ? ──
  const { data: existing, error: lookupError } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('id', stripeEvent.id)
    .maybeSingle()
  if (lookupError) {
    console.error('[haul][webhook] stripe_events lookup:', lookupError.message)
    throw createError({ statusCode: 500, statusMessage: 'Webhook: base indisponible' })
  }
  if (existing) {
    console.log(`[haul][webhook] événement déjà traité : ${stripeEvent.id} — ignoré`)
    return { received: true, duplicate: true }
  }

  const session = stripeEvent.data.object as Stripe.Checkout.Session
  const meta = (session.metadata ?? {}) as Record<string, string>
  const currency: Currency = meta.currency === 'usd' ? 'usd' : 'eur'
  const email = session.customer_details?.email ?? session.customer_email ?? 'inconnu@haul.local'

  let cart: CartEntry[] = []
  try {
    const parsed = JSON.parse(meta.cart ?? '[]') as unknown
    if (Array.isArray(parsed)) {
      cart = parsed
        .map((i) => i as Partial<CartEntry>)
        .filter((i) => typeof i.id === 'string' && Number.isFinite(Number(i.qty)) && Number(i.qty) > 0)
        .map((i) => ({ id: i.id as string, qty: Math.floor(Number(i.qty)), type: i.type }))
    }
  } catch {
    console.warn('[haul][webhook] metadata.cart illisible — commande sans lignes')
  }

  const items = cart.map((c) => {
    const product = getProductById(c.id)
    return {
      product_id: c.id,
      product_name: product?.name ?? c.id,
      product_type: (product?.type ?? c.type ?? 'digital') as ProductType,
      quantity: c.qty,
      unit_price: product ? Math.round(product.price[currency] * 100) : null,
    }
  })

  const hasPhysical = items.some((i) => i.product_type === 'physical')
  const fulfillment = hasPhysical ? 'awaiting_shipment' : 'delivered'

  // ── Order : upsert sur stripe_session_id (rejouable) ──
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .upsert(
      {
        stripe_session_id: session.id,
        email,
        amount_total: session.amount_total ?? null,
        currency: session.currency ?? currency,
        payment_status: session.payment_status ?? 'paid',
        fulfillment_status: fulfillment,
        shipping_details: session.shipping_details ?? null,
        metadata: meta,
      },
      { onConflict: 'stripe_session_id' },
    )
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('[haul][webhook] upsert order:', orderError?.message)
    throw createError({ statusCode: 500, statusMessage: 'Webhook: commande non enregistrable' })
  }

  // ── Items : delete + insert (strictement idempotent) ──
  const { error: delItemsError } = await supabase.from('order_items').delete().eq('order_id', order.id)
  if (delItemsError) console.error('[haul][webhook] delete order_items:', delItemsError.message)
  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items.map((i) => ({ ...i, order_id: order.id })))
    if (itemsError) console.error('[haul][webhook] insert order_items:', itemsError.message)
  }

  // ── Livraisons numériques : token par produit ──
  const digitalItems = items.filter((i) => i.product_type === 'digital')
  for (const item of digitalItems) {
    const { error: deliveryError } = await supabase
      .from('digital_deliveries')
      .upsert(
        {
          order_id: order.id,
          email,
          product_id: item.product_id,
          product_name: item.product_name,
          file_path: `${item.product_id}.pdf`,
        },
        { onConflict: 'order_id,product_id', ignoreDuplicates: true },
      )
    if (deliveryError) console.error('[haul][webhook] digital_deliveries:', deliveryError.message)
  }

  // ── Marque l'événement comme traité (en dernier : tout avant est rejouable) ──
  const { error: markError } = await supabase.from('stripe_events').insert({
    id: stripeEvent.id,
    type: stripeEvent.type,
    payload: stripeEvent as unknown as Record<string, unknown>,
  })
  if (markError && markError.code !== '23505') {
    console.error('[haul][webhook] stripe_events insert:', markError.message)
    throw createError({ statusCode: 500, statusMessage: 'Webhook: journalisation échouée' })
  }

  console.log(
    `[haul][fulfilment] order=${order.id} email=${email} ` +
      `digital=${digitalItems.length} physical=${items.length - digitalItems.length} ` +
      `total=${session.amount_total ?? '?'} ${session.currency ?? currency}`,
  )
  return { received: true }
})
