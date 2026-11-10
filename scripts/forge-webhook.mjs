// Forge un webhook Stripe `checkout.session.completed` signé — test local SANS l’API Stripe.
// Usage : node scripts/forge-webhook.mjs  →  affiche { payload, signature }
// Puis    : curl -X POST localhost:3000/api/webhooks/stripe -H "Content-Type: application/json" -H "stripe-signature: <sig>" --data "<payload>"
// Forge un webhook Stripe `checkout.session.completed` signé, pour tester le
// flux complet en local SANS passer par l'API Stripe.
// Usage : node /tmp/forge-webhook.mjs  → affiche { payload, signature }
import crypto from 'node:crypto'

const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_haul_local_test_secret_2026'

const email = process.argv[2] || 'demo@example.com'
const sessionId = process.argv[3] || `cs_test_forge_${Date.now()}`

const event = {
  id: `evt_haul_forge_${Date.now()}`,
  type: 'checkout.session.completed',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: sessionId,
      payment_status: 'paid',
      amount_total: 7300,
      currency: 'eur',
      customer_details: { email },
      shipping_details: {
        name: 'Afi Demo',
        address: { line1: '12 rue du Quai', city: 'Lomé', country: 'TG', postal_code: 'B.P. 0000' },
      },
      metadata: {
        currency: 'eur',
        source: 'haul',
        cart: JSON.stringify([
          { id: 'guide-dropshipping-2026', qty: 1, type: 'digital' },
          { id: 'ebook-lance-ta-boutique', qty: 1, type: 'digital' },
          { id: 'tshirt-haul-container', qty: 1, type: 'physical' },
        ]),
      },
    },
  },
}

const payload = JSON.stringify(event)
const t = Math.floor(Date.now() / 1000)
const v1 = crypto.createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')
console.log(JSON.stringify({ payload, signature: `t=${t},v1=${v1}` }))
