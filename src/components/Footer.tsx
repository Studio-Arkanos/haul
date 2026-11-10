import { Link } from '@tanstack/react-router'
import { Github, Lock, Anchor } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-900/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Marque */}
          <div>
            <Logo compact />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-steel-400">
              La boutique « tout ce qui doit arriver » : guides et templates en téléchargement
              immédiat, plus une sélection de pièces en dropshipping — payables en EUR ou USD.
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-steel-400">
              <Anchor size={13} className="text-container" /> Studio Arkanos · Lomé, Togo
            </p>
          </div>

          {/* Explorer */}
          <nav aria-label="Explorer">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-steel-400">
              Explorer
            </p>
            <ul className="mt-3 space-y-2 text-sm text-steel-200">
              <li><Link to="/" className="transition-colors hover:text-cream">Accueil</Link></li>
              <li><Link to="/boutique" className="transition-colors hover:text-cream">Boutique</Link></li>
              <li><Link to="/boutique" search={{ type: 'digital' }} className="transition-colors hover:text-cream">Produits numériques</Link></li>
              <li><Link to="/boutique" search={{ type: 'physical' }} className="transition-colors hover:text-cream">Dropshipping</Link></li>
              <li><Link to="/a-propos" className="transition-colors hover:text-cream">À propos</Link></li>
              <li><Link to="/compte" className="transition-colors hover:text-cream">Mon compte</Link></li>
            </ul>
          </nav>

          {/* Légal & contact */}
          <nav aria-label="Légal et support">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-steel-400">
              Légal & support
            </p>
            <ul className="mt-3 space-y-2 text-sm text-steel-200">
              <li><Link to="/a-propos" hash="legal" className="transition-colors hover:text-cream">Mentions légales</Link></li>
              <li><Link to="/a-propos" hash="faq" className="transition-colors hover:text-cream">FAQ — livraison & retours</Link></li>
              <li>
                <a
                  href="https://github.com/Studio-Arkanos/haul/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-cream"
                >
                  <Github size={14} /> Support via GitHub Issues
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-steel-400 sm:flex-row">
          <p>© 2026 Haul — Studio Arkanos. Tous droits réservés.</p>
          <p className="flex items-center gap-2">
            <Lock size={13} className="text-container" />
            Paiements chiffrés par Stripe Checkout · 3-D Secure
          </p>
        </div>
      </div>
    </footer>
  )
}
