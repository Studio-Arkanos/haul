import type { Currency } from './products'

export function formatPrice(amount: number, currency: Currency): string {
  const hasCents = !Number.isInteger(amount)
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount)
}
