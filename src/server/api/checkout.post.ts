import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { getProductById } from '../../lib/products'
import { getStripe } from '../lib/stripe.server'

const ItemSchema = z.object({
  id: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(20),
})

const BodySchema = z.object({
  items: z.array(ItemSchema).min(1, 'Panier vide').max(50),
  currency: z.enum(['eur', 'usd']).default('eur'),
})

const ALLOWED_COUNTRIES = [
  'FR', 'BE', 'CH', 'LU', 'DE', 'IT', 'ES', 'PT', 'NL', 'IE', 'AT', 'GR',
  'US', 'CA', 'GB', 'TG', 'SN', 'CI',
] as (
  | 'FR' | 'BE' | 'CH' | 'LU' | 'DE' | 'IT' | 'ES' | 'PT' | 'NL' | 'IE' | 'AT' | 'GR'
  | 'US' | 'CA' | 'GB' | 'TG' | 'SN' | 'CI'
)[]

export default defineEventHandler(async (event) => {
  // ── 1. Validation d'entrée (jamais confiance au client) ──
  const parsed = BodySchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Panier invalide ou vide',
      data: parsed.error.flatten(),
    })
  }
  const { items, currency } = parsed.data

  // ── 2. Résolution SERVEUR des prix : le client n'envoie jamais de priceId ──
  const line_items: { price: string; quantity: number }[] = []
  let hasPhysical = false

  for (const item of items) {
    const product = getProductById(item.id)
    if (!product) {
      throw createError({ statusCode: 400, statusMessage: `Produit inconnu : ${item.id}` })
    }
    const priceId = product.priceId[currency]
    if (!priceId || priceId.startsWith('price_REPLACE_ME')) {
      throw createError({
        statusCode: 409,
        statusMessage: `Price Stripe non configuré pour « ${product.name} » (${currency.toUpperCase()}). Voir README → « Brancher Stripe ».`,
      })
    }
    line_items.push({ price: priceId, quantity: item.quantity })
    if (product.type === 'physical') hasPhysical = true
  }

  // ── 3. Création de la Checkout Session ──
  let stripe
  try {
    stripe = getStripe()
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: err instanceof Error ? err.message : 'Stripe non configuré',
    })
  }

  const siteUrl = (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/boutique`,
    allow_promotion_codes: true,
    // Adresse de livraison uniquement si le panier contient du physique
    ...(hasPhysical
      ? { shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES } }
      : {}),
    metadata: { currency, source: 'haul' },
  })

  if (!session.url) {
    throw createError({ statusCode: 502, statusMessage: 'Stripe n’a pas retourné d’URL de paiement' })
  }
  return { url: session.url }
})
