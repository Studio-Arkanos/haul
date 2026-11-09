import { createError, defineEventHandler, getQuery } from 'h3'
import { getStripe } from '../lib/stripe.server'

export default defineEventHandler(async (event) => {
  const { session_id } = getQuery(event)
  if (typeof session_id !== 'string' || !session_id.startsWith('cs_')) {
    throw createError({ statusCode: 400, statusMessage: 'session_id manquant ou invalide' })
  }

  let stripe
  try {
    stripe = getStripe()
  } catch (err) {
    throw createError({
      statusCode: 503,
      statusMessage: err instanceof Error ? err.message : 'Stripe non configuré',
    })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    return {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email ?? session.customer_email ?? null,
    }
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Session introuvable' })
  }
})
