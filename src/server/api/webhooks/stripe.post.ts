import { buffer } from 'node:stream/consumers'
import { createError, defineEventHandler, getHeader } from 'h3'
import type Stripe from 'stripe'
import { getStripe } from '../../lib/stripe.server'

// ─────────────────────────────────────────────────────────────
//  Webhook Stripe — checkout.session.completed
//
//  • Vérifie la signature sur le corps BRUT (aucun parsing JSON avant)
//  • Discrimine numérique / physique via metadata.type du produit Stripe
//  • TODO(Supabase) : idempotence — stocker stripeEvent.id dans une table
//    `stripe_events` (unique) pour ignorer les rejeux. Voir docs/DECISIONS.md
// ─────────────────────────────────────────────────────────────

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

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session
      console.log('[haul][webhook] paiement confirmé :', session.id)

      const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product'],
        limit: 100,
      })

      for (const item of lineItems.data) {
        const product = item.price?.product
        if (!product || typeof product === 'string' || 'deleted' in product) {
          console.warn('[haul][webhook] produit illisible pour la ligne', item.id)
          continue
        }
        const meta = (product as Stripe.Product).metadata ?? {}
        const qty = item.quantity ?? 1
        const email = session.customer_details?.email ?? session.customer_email ?? 'inconnu'

        if (meta.type === 'digital') {
          // TODO(livraison numérique) : générer un lien signé (Supabase Storage ou
          // token à usage unique) + email transactionnel (Resend / Postmark).
          console.log(
            `[haul][fulfilment][digital] email=${email} produit="${(product as Stripe.Product).name}" qty=${qty}`,
          )
        } else if (meta.type === 'physical' || meta.type === 'dropship') {
          // TODO(dropshipping) : POST vers l'API fournisseur OU email structuré
          // (DROPSHIP_NOTIFY_EMAIL) avec adresse + lignes de commande.
          console.log(
            `[haul][fulfilment][dropship] session=${session.id} produit="${(product as Stripe.Product).name}" qty=${qty} shipping=${JSON.stringify(session.shipping_details)}`,
          )
        } else {
          console.warn(
            `[haul][webhook] metadata.type absent/inconnu sur « ${(product as Stripe.Product).name} » (reçu: ${meta.type ?? '∅'}) — à renseigner dans le Dashboard Stripe`,
          )
        }
      }
      break
    }

    default:
      console.log(`[haul][webhook] événement ignoré : ${stripeEvent.type}`)
  }

  return { received: true }
})
