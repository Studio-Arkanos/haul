import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Lock,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Trash2,
  X,
  Loader2,
  TriangleAlert,
} from 'lucide-react'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { formatPrice } from '../lib/format'
import { startCheckout } from '../lib/checkout'

export default function CartDrawer() {
  const { lines, count, subtotal, currency, isOpen, closeCart, setQuantity, remove, clear } =
    useCart()
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Échap pour fermer + bloque le scroll de fond
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  const pay = async () => {
    setBusy(true)
    setError(null)
    try {
      const url = await startCheckout(
        lines.map(({ product, quantity }) => ({ id: product.id, quantity })),
        currency,
        user?.email,
      )
      window.location.assign(url) // redirection Stripe Checkout (hosted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue — réessaie.')
      setBusy(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-navy-950/75 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panneau */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-navy-900 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Tête */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-container">
              Quai n° 7
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-cream">
              Ton panier{' '}
              <span className="text-steel-400">({count})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-steel-300 transition-colors hover:text-cream"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenu */}
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-white/15 text-steel-400">
              <Package size={34} strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-lg font-bold text-cream">Ton panier est vide</p>
              <p className="mt-1 text-sm text-steel-400">
                Aucun colis n’attend sur le quai… pour l’instant.
              </p>
            </div>
            <Link
              to="/boutique"
              onClick={closeCart}
              className="mt-2 rounded-xl bg-container px-5 py-3 text-sm font-bold text-navy-950 transition-colors hover:bg-container-light"
            >
              Explorer la boutique
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {lines.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-4 rounded-2xl border border-white/5 bg-navy-800/60 p-3"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-24 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold leading-snug text-cream">{product.name}</p>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        aria-label={`Retirer « ${product.name} »`}
                        className="text-steel-400 transition-colors hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-steel-400">
                      {product.type === 'digital' ? 'Numérique' : 'Dropshipping'}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg border border-white/10">
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          aria-label="Réduire la quantité"
                          className="flex h-8 w-8 items-center justify-center text-steel-300 hover:text-cream"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-cream">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          aria-label="Augmenter la quantité"
                          className="flex h-8 w-8 items-center justify-center text-steel-300 hover:text-cream"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <p className="text-sm font-extrabold text-cream">
                        {formatPrice(product.price[currency] * quantity, currency)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              <li className="pt-1">
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-medium text-steel-400 underline-offset-2 transition-colors hover:text-cream hover:underline"
                >
                  Vider le panier
                </button>
              </li>
            </ul>

            {/* Pied */}
            <div className="border-t border-white/5 bg-navy-900 px-6 py-5">
              <div className="flex items-center justify-between text-sm text-steel-300">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-base font-extrabold text-cream">Total</span>
                <span className="text-2xl font-extrabold tracking-tight text-cream">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-steel-400">
                Taxes & livraison calculées par Stripe à l’étape suivante.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs leading-relaxed text-red-300"
                >
                  <TriangleAlert size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={pay}
                disabled={busy}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-container py-4 text-base font-extrabold text-navy-950 transition-all hover:bg-container-light disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? (
                  <>
                    <Loader2 size={19} className="animate-spin" /> Redirection vers Stripe…
                  </>
                ) : (
                  <>
                    <Lock size={18} strokeWidth={2.5} /> Payer avec Stripe
                  </>
                )}
              </button>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-steel-400">
                <ShieldCheck size={12} className="text-container" /> Paiement sécurisé · 3-D Secure
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
