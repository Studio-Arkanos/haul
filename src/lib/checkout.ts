import type { Currency } from './products'

export interface CheckoutItem {
  id: string
  quantity: number
}

/**
 * Crée une Checkout Session Stripe côté serveur et retourne l'URL de redirection.
 * Le serveur re-résout les priceIds à partir du catalogue : le client n'envoie jamais de prix.
 */
export async function startCheckout(
  items: CheckoutItem[],
  currency: Currency,
  email?: string,
): Promise<string> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, currency, ...(email ? { email } : {}) }),
  })

  const data: unknown = await res.json().catch(() => null)
  const payload = (data ?? {}) as { url?: string; message?: string; statusMessage?: string }

  if (!res.ok) {
    throw new Error(
      payload.statusMessage ||
        payload.message ||
        `Erreur serveur (${res.status}) — réessaie dans un instant.`,
    )
  }
  if (!payload.url) {
    throw new Error('Réponse Stripe inattendue — réessaie dans un instant.')
  }
  return payload.url
}
