import Stripe from 'stripe'

// Client Stripe serveur — instancié PARESSEUSEMENT pour que le build/Nitro
// ne plante pas quand la clé n'est pas encore configurée.
let cached: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY manquante — copie .env.example vers .env et renseigne tes clés de test.',
    )
  }
  if (!cached) {
    cached = new Stripe(key, { apiVersion: '2024-06-20' })
  }
  return cached
}
