import { useEffect, useState } from 'react'
import { Check, Download, Plus, Star, Truck } from 'lucide-react'
import type { Product } from '../lib/products'
import { formatPrice } from '../lib/format'
import { useCart } from '../lib/cart'

export default function ProductCard({ product }: { product: Product }) {
  const { add, currency } = useCart()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const t = window.setTimeout(() => setAdded(false), 1400)
    return () => window.clearTimeout(t)
  }, [added])

  const isDigital = product.type === 'digital'

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-navy-800/70 to-navy-900 transition-all duration-300 hover:-translate-y-1 hover:border-container/40 hover:shadow-[0_18px_50px_-20px_rgba(232,93,4,0.35)]">
      {/* Visuel */}
      <div className="relative h-52 overflow-hidden bg-navy-800">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/10 to-transparent" />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${
            isDigital ? 'bg-navy-950/85 text-steel-200' : 'bg-container text-navy-950'
          } backdrop-blur-sm`}
        >
          {isDigital ? <Download size={11} /> : <Truck size={11} />}
          {isDigital ? 'Numérique' : 'Dropshipping'}
        </span>
        {product.featured && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-container/40 bg-navy-950/85 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-container-light backdrop-blur-sm">
            <Star size={11} fill="currentColor" /> Sélection
          </span>
        )}
      </div>

      {/* Corps */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-cream">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-steel-400">
          {product.tagline}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-steel-400">
              {isDigital ? 'Téléchargement' : 'Expédition'}
            </p>
            <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-cream">
              {formatPrice(product.price[currency], currency)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              add(product.id)
              setAdded(true)
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-95 ${
              added
                ? 'bg-emerald-500 text-navy-950'
                : 'bg-container text-navy-950 hover:bg-container-light'
            }`}
            aria-label={`Ajouter « ${product.name} » au panier`}
          >
            {added ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
            {added ? 'Ajouté' : 'Ajouter'}
          </button>
        </div>
      </div>
    </article>
  )
}
