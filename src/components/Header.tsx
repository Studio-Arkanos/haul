import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, ShoppingBag, X } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '../lib/cart'
import { CURRENCIES } from '../lib/products'

const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/boutique', label: 'Boutique' },
  { to: '/a-propos', label: 'À propos' },
] as const

export default function Header() {
  const { count, openCart, currency, setCurrency } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-navy-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Haul — Accueil" className="shrink-0">
          <Logo />
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel-300 transition-colors hover:text-cream"
              activeProps={{ className: '!text-cream border-b-2 border-container pb-0.5' }}
              activeOptions={{ exact: item.to === '/' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sélecteur de devise */}
          <div
            className="flex items-center rounded-full border border-white/10 bg-navy-800 p-0.5 text-[11px] font-bold"
            role="group"
            aria-label="Devise d'affichage"
          >
            {CURRENCIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCurrency(c.id)}
                aria-pressed={currency === c.id}
                className={`rounded-full px-2.5 py-1 tracking-wide transition-colors ${
                  currency === c.id
                    ? 'bg-container text-navy-950'
                    : 'text-steel-300 hover:text-cream'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Panier */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Ouvrir le panier — ${count} article${count > 1 ? 's' : ''}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-navy-800 text-cream transition-colors hover:border-container/50 hover:text-container-light"
          >
            <ShoppingBag size={19} strokeWidth={2} />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-container px-1 text-[10px] font-extrabold text-navy-950">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          {/* Burger mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-navy-800 text-cream md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Panneau mobile */}
      {menuOpen && (
        <nav
          className="border-t border-white/5 bg-navy-950/95 backdrop-blur-md md:hidden"
          aria-label="Navigation mobile"
        >
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-steel-200 transition-colors hover:bg-navy-800 hover:text-cream"
                activeProps={{ className: '!text-container-light bg-navy-800' }}
                activeOptions={{ exact: item.to === '/' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
