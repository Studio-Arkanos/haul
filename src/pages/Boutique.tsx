import { Link } from '@tanstack/react-router'
import { LayoutGrid, Truck, Zap, Info } from 'lucide-react'
import { PRODUCTS, type ProductType } from '../lib/products'
import ProductCard from '../components/ProductCard'

const FILTERS: { id: ProductType | 'all'; label: string; icon: typeof Zap }[] = [
  { id: 'all', label: 'Tous', icon: LayoutGrid },
  { id: 'digital', label: 'Numérique', icon: Zap },
  { id: 'physical', label: 'Dropshipping', icon: Truck },
]

export default function Boutique({ type }: { type?: ProductType }) {
  const active = type ?? 'all'
  const filtered = PRODUCTS.filter((p) => (active === 'all' ? true : p.type === active))

  return (
    <>
      {/* En-tête */}
      <div className="container-texture border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-container">
            Catalogue — Numérique & Dropshipping
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-cream sm:text-5xl">
            La Boutique
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-steel-400">
            {PRODUCTS.length} pièces en catalogue — mises à jour au fil des arrivages.
          </p>

          {/* Filtres */}
          <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par type">
            {FILTERS.map(({ id, label, icon: Icon }) => {
              const isActive = active === id
              return (
                <Link
                  key={id}
                  to="/boutique"
                  search={id === 'all' ? {} : { type: id }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                    isActive
                      ? 'border-container bg-container text-navy-950'
                      : 'border-white/10 bg-navy-800 text-steel-300 hover:border-container/50 hover:text-cream'
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              )
            })}
            <span className="ml-1 text-xs text-steel-400">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Grille produits */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Note logistique */}
        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-dashed border-white/15 bg-navy-900/40 px-5 py-4 text-sm text-steel-300">
          <Info size={17} className="mt-0.5 shrink-0 text-container" />
          <p>
            <strong className="text-cream">Comment ça part&nbsp;?</strong> Les produits numériques
            arrivent par email quelques secondes après paiement. Les produits physiques partent
            sous 48 h de nos fournisseurs partenaires — livraison estimée 7 à 15 jours selon ta
            zone, avec numéro de suivi.
          </p>
        </div>
      </div>
    </>
  )
}
