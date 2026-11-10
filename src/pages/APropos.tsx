import { Link } from '@tanstack/react-router'
import {
  Anchor,
  ArrowRight,
  ChevronDown,
  Container,
  ShieldCheck,
  Zap,
} from 'lucide-react'

const VALUES = [
  {
    icon: Container,
    title: 'Sobre & industriel',
    text: 'Pas de surcouche marketing : des produits utiles, bien documentés, vendus au juste prix.',
  },
  {
    icon: Zap,
    title: 'Rapide par défaut',
    text: 'Le numérique arrive à la seconde. Le physique part sous 48 h. L’attente n’est jamais une fonctionnalité.',
  },
  {
    icon: ShieldCheck,
    title: 'Honnête sur les délais',
    text: 'On affiche les vraies fourchettes de livraison et les vraies conditions de retour — avant paiement, pas après.',
  },
]

const STATS = [
  { value: '2 400+', label: 'colis expédiés' },
  { value: '38', label: 'pays desservis' },
  { value: '4,9/5', label: 'satisfaction clients' },
  { value: '100 %', label: 'paiements sécurisés' },
]

const FAQ = [
  {
    q: 'Quand recevrai-je mon produit numérique ?',
    a: 'Immédiatement après paiement : le lien de téléchargement part par email (vérifie aussi tes spams) et la page de succès reprend le détail de ta commande. Tu peux télécharger autant de fois que nécessaire.',
  },
  {
    q: 'Quels sont les délais pour un produit physique ?',
    a: 'Les produits en dropshipping partent sous 48 h de nos fournisseurs partenaires. Compte 7 à 15 jours ouvrés selon ta zone (Europe de l’Ouest : 5–8 jours). Un numéro de suivi t’est envoyé dès l’expédition.',
  },
  {
    q: 'Quelles devises acceptez-vous ?',
    a: 'EUR et USD dès maintenant — le toggle de devise est dans le header. Le XOF (FCFA) est prévu pour une prochaine version, reste branché sur nos réseaux.',
  },
  {
    q: 'Puis-je me faire rembourser ?',
    a: 'Numérique : non, dès le téléchargement déclenché — comme tout achat de contenu. Physique : 14 jours après réception si le produit est non ouvert, selon les conditions du fournisseur. Un doute ? Ouvre un ticket via GitHub Issues.',
  },
  {
    q: 'Mes données de paiement sont-elles en sécurité ?',
    a: 'Oui. Aucun numéro de carte ne touche nos serveurs : tout passe par Stripe Checkout (chiffré, 3-D Secure). Nous ne conservons que ton email et le détail de ta commande.',
  },
]

export default function APropos() {
  return (
    <>
      {/* ─── HISTOIRE ─────────────────────────────────────── */}
      <section className="container-texture border-b border-white/5">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.28em] text-container">
              <Anchor size={13} /> Journal de bord
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.02] tracking-tight text-cream sm:text-5xl">
              Haul, né entre deux conteneurs.
            </h1>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-steel-300">
              <p>
                Tout est parti du port de <strong className="text-cream">Lomé</strong>, un matin
                d’harmattan : un docker qui coupait son poste pour attendre un PDF de fournisseur,
                un transitaire qui notait ses prix sur une nappe en papier. La même question,
                partout — <em>« tout ce qui doit arriver, quand est-ce que ça arrive ? »</em>
              </p>
              <p>
                Haul est la réponse : une boutique où le numérique part à la seconde (guides,
                templates, ebooks) et où le physique part sans intermédiaire — expédié
                directement par nos partenaires fournisseurs, sans stock ni marge cachée.
              </p>
              <p>
                Un seul principe, deux quais : <strong className="text-cream">rien d’inutile,
                rien d’approximatif</strong>. C’est le standard du Studio Arkanos, appliqué au
                commerce en ligne.
              </p>
            </div>
            <Link
              to="/boutique"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-container px-6 py-3.5 text-sm font-extrabold text-navy-950 transition-colors hover:bg-container-light"
            >
              Découvrir la boutique
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <figure className="relative">
            <img
              src="/images/hero.jpg"
              alt="Grues et conteneurs du port au crépuscule"
              className="h-[420px] w-full rounded-3xl border border-white/10 object-cover object-bottom"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-navy-950/85 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-200 backdrop-blur-sm">
              Le quai — Lomé, Togo
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ─── CHIFFRES ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-navy-900 px-6 py-6 text-center">
              <dt className="order-2 mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-steel-400">
                {s.label}
              </dt>
              <dd className="order-1 text-2xl font-extrabold text-container-light sm:text-3xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-right text-[10px] uppercase tracking-[0.18em] text-steel-400/60">
          * chiffres de démonstration
        </p>
      </section>

      {/* ─── VALEURS ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-container">
          Ce qui navire avec nous
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-navy-900/60 p-6">
              <Icon size={24} className="text-container" />
              <h2 className="mt-3 font-extrabold uppercase tracking-wide text-cream">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-steel-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-4 pb-12 sm:px-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-container">
          FAQ — Avant de payer
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-cream sm:text-3xl">Les questions du quai</h2>
        <div className="mt-6 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-navy-900/60">
          {FAQ.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-bold text-cream transition-colors hover:bg-navy-800/60">
                {item.q}
                <ChevronDown size={18} className="faq-chevron shrink-0 text-container" />
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-steel-300">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── MENTIONS LÉGALES ─────────────────────────────── */}
      <section id="legal" className="mx-auto max-w-4xl scroll-mt-24 px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-white/8 bg-navy-900/40 p-6 text-xs leading-relaxed text-steel-400">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-steel-300">
            Mentions légales
          </p>
          <p className="mt-3">
            <strong className="text-cream">Haul</strong> est une marque du{' '}
            <strong className="text-cream">Studio Arkanos</strong> (Lomé, Togo). La boutique est
            éditée par le Studio Arkanos ; hébergement et code source&nbsp;:{' '}
            <a
              href="https://github.com/Studio-Arkanos/haul"
              target="_blank"
              rel="noreferrer"
              className="text-container-light underline-offset-2 hover:underline"
            >
              github.com/Studio-Arkanos/haul
            </a>
            .
          </p>
          <p className="mt-2">
            Les paiements sont traités exclusivement par{' '}
            <strong className="text-cream">Stripe</strong> (Stripe Checkout, TLS, 3-D Secure). Haul
            ne stocke aucune donnée bancaire. Les données conservées se limitent à ton email et au
            détail de ta commande, utilisées pour la livraison et le support.
          </p>
          <p className="mt-2">
            Contenu numérique&nbsp;: droit de rétractation exclu après téléchargement (art. L221-28
            — bien immatériel fourni immédiatement). Produits physiques&nbsp;: retour sous 14 jours
            après réception si non ouverts, frais et conditions selon le fournisseur. Le
            localStorage de ton navigateur ne sert qu’à ton panier — aucun cookie publicitaire.
          </p>
        </div>
      </section>
    </>
  )
}
