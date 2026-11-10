import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  Container,
  Download,
  LayoutGrid,
  ShieldCheck,
  Ship,
  Truck,
  Zap,
} from 'lucide-react'
import { PRODUCTS } from '../lib/products'
import ProductCard from '../components/ProductCard'

const MARQUEE = [
  'LIVRAISON MONDIALE',
  'PAIEMENT STRIPE',
  'EUR / USD',
  'PRODUITS NUMÉRIQUES',
  'DROPSHIPPING TRACKÉ',
  'TÉLÉCHARGEMENT IMMÉDIAT',
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Livraison express digitale',
    text: 'Guides, ebooks et packs disponibles immédiatement après paiement — le lien arrive dans ta boîte mail.',
  },
  {
    icon: Truck,
    title: 'Dropshipping sans stock',
    text: 'Aucun stock, aucune rupture : nos partenaires fournisseurs expédient directement chez toi, avec suivi.',
  },
  {
    icon: ShieldCheck,
    title: 'Paiement blindé',
    text: 'Stripe Checkout, 3-D Secure, données chiffrées. Ton argent ne transite jamais par nos serveurs.',
  },
]

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.featured)

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="container-texture relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-container/10 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:pt-16">
          {/* Texte */}
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-container/30 bg-container/10 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.24em] text-container-light">
              <Ship size={13} /> Livraisons mondiales · EUR / USD
            </p>
            <h1 className="mt-6 text-5xl font-extrabold leading-[0.98] tracking-tight text-cream sm:text-6xl xl:text-7xl">
              Tout ce qui doit arriver,{' '}
              <span className="bg-gradient-to-r from-container to-container-light bg-clip-text text-transparent">
                arrivera.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-steel-300">
              Guides, ebooks et packs en téléchargement immédiat — plus une sélection de pièces
              en dropshipping depuis nos docks. Payé en quelques secondes, reçu par mer ou par
              câble.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/boutique"
                className="group inline-flex items-center gap-2 rounded-xl bg-container px-6 py-4 text-base font-extrabold text-navy-950 transition-colors hover:bg-container-light"
              >
                Explorer la boutique
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/boutique"
                search={{ type: 'digital' }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-4 text-base font-semibold text-cream transition-colors hover:border-container/50 hover:text-container-light"
              >
                <Download size={18} /> Produits numériques
              </Link>
            </div>
          </div>

          {/* Visuel */}
          <div className="relative lg:col-span-6">
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <img
                src="/images/hero.jpg"
                alt="Port à conteneurs au crépuscule — grues et stacks prêts au chargement"
                className="h-[380px] w-full object-cover object-center sm:h-[480px]"
              />
            </div>
            {/* Badge flottant */}
            <div className="animate-bob absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-navy-950/85 px-4 py-3 backdrop-blur-md sm:bottom-6 sm:left-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-container text-navy-950">
                <Ship size={22} />
              </span>
              <span>
                <span className="block text-[9px] font-extrabold uppercase tracking-[0.24em] text-container-light">
                  Départ imminent
                </span>
                <span className="mt-0.5 block text-sm font-bold text-cream">
                  +2 400 colis vers 38 pays
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ─── BANDEAU DÉFILANT ────────────────────────────── */}
        <div className="overflow-hidden border-t border-white/5 bg-navy-900/70 py-3">
          <div className="animate-marquee flex items-center gap-10 whitespace-nowrap">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span
                key={i}
                aria-hidden={i >= MARQUEE.length}
                className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-[0.28em] text-steel-300"
              >
                {item}
                <Container size={13} className="text-container" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ENGAGEMENTS ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-navy-900/60 p-6 transition-colors hover:border-container/30"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-container/10 text-container">
                <Icon size={22} />
              </span>
              <h2 className="mt-4 text-base font-extrabold uppercase tracking-wide text-cream">
                {title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-steel-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SÉLECTION DU CAPITAINE ─────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.28em] text-container">
              <LayoutGrid size={13} /> La sélection
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
              Sélection du capitaine
            </h2>
            <p className="mt-1.5 text-sm text-steel-400">
              Les pièces les plus commandées, prêtes à partir à l’instant.
            </p>
          </div>
          <Link
            to="/boutique"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-container-light transition-colors hover:text-container"
          >
            Toute la boutique
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ─── DEUX QUAIS : NUMÉRIQUE / PHYSIQUE ────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quai numérique */}
          <div className="container-notch relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-8">
            <Download
              aria-hidden
              size={150}
              strokeWidth={1}
              className="absolute -right-6 -top-6 text-steel-400/10"
            />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-container">
              Quai 01 — Numérique
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-cream">
              Du panier au téléchargement en secondes
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-steel-300">
              {[
                'Lien de téléchargement envoyé immédiatement',
                'Mises à jour offertes à vie sur les guides',
                'Facture conforme fournie par Stripe',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-container" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/boutique"
              search={{ type: 'digital' }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-container px-5 py-3 text-sm font-bold text-navy-950 transition-colors hover:bg-container-light"
            >
              Voir le catalogue numérique <ArrowRight size={16} />
            </Link>
          </div>

          {/* Quai physique */}
          <div className="container-notch relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-8">
            <Truck
              aria-hidden
              size={150}
              strokeWidth={1}
              className="absolute -right-6 -top-6 text-steel-400/10"
            />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-container">
              Quai 02 — Physique · Dropshipping
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-cream">
              Expédié depuis nos docks, sans stock
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-steel-300">
              {[
                'Zéro stock, zéro rupture — flux fournisseur direct',
                'Suivi colis de l’atelier jusqu’à ta porte',
                'Retours sous 14 jours selon conditions fournisseur',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-container" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/boutique"
              search={{ type: 'physical' }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-cream transition-colors hover:border-container/60 hover:text-container-light"
            >
              Voir le merch <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-container-dark via-container to-container-light px-8 py-12 text-center text-navy-950">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Prêt à lever l’ancre&nbsp;?
          </h2>
          <p className="mx-auto mt-2 max-w-md font-medium text-navy-950/80">
            Choisis ton prochain guide ou ta pièce du quai — on s’occupe du reste.
          </p>
          <Link
            to="/boutique"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-950 px-7 py-4 text-base font-extrabold text-cream transition-transform hover:scale-[1.03]"
          >
            Voir la boutique <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
