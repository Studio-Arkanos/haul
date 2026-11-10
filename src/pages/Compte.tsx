import { FormEvent, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Anchor,
  ArrowRight,
  Download,
  Loader2,
  LogOut,
  Mail,
  Package,
  User,
  Lock,
  TriangleAlert,
  CheckCircle2,
  LogIn,
  Truck,
  Zap,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/format'
import type { Currency } from '../lib/products'

type Mode = 'signin' | 'signup'
type OrderRow = {
  id: string
  created_at: string
  amount_total: number | null
  currency: string
  payment_status: string
  fulfillment_status: string
  order_items: {
    id: string
    product_name: string
    product_type: string
    quantity: number
    unit_price: number | null
  }[]
  digital_deliveries: {
    id: string
    product_id: string
    product_name: string
    token: string
    expires_at: string
  }[]
}

const FULFILLMENT_LABEL: Record<string, { label: string; tone: string }> = {
  delivered: { label: 'Livrée', tone: 'bg-emerald-500/15 text-emerald-400' },
  awaiting_shipment: { label: 'En attente d’expédition', tone: 'bg-amber-500/15 text-amber-400' },
  shipped: { label: 'Expédiée', tone: 'bg-sky-500/15 text-sky-400' },
  pending: { label: 'En cours', tone: 'bg-steel-400/15 text-steel-300' },
  refunded: { label: 'Remboursée', tone: 'bg-red-500/15 text-red-400' },
}

export default function Compte() {
  const { user, loading, configured, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [orders, setOrders] = useState<OrderRow[] | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (!user || !supabase) return
    let cancelled = false
    setOrdersLoading(true)
    supabase
      .from('orders')
      .select('*, order_items(*), digital_deliveries(*)')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) console.error('[compte] orders:', err.message)
        setOrders((data as OrderRow[]) ?? [])
        setOrdersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    if (mode === 'signup' && fullName.trim().length < 2) {
      setError('Dis-nous ton prénom (2 caractères minimum).')
      setBusy(false)
      return
    }
    if (password.length < 6) {
      setError('6 caractères de mot de passe minimum.')
      setBusy(false)
      return
    }
    const { error: err } =
      mode === 'signup' ? await signUp(email.trim(), password, fullName.trim()) : await signIn(email.trim(), password)
    if (err) {
      setError(
        err.includes('Invalid login') ? 'Email ou mot de passe incorrect.' : err,
      )
    } else if (mode === 'signup') {
      setNotice('Compte créé — bienvenue à bord !')
    }
    setBusy(false)
  }

  /* ─── Supabase non configuré ─────────────────────────── */
  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <TriangleAlert size={44} className="mx-auto text-amber-400" />
        <h1 className="mt-4 text-2xl font-extrabold text-cream">Comptes non configurés</h1>
        <p className="mt-2 text-sm leading-relaxed text-steel-400">
          Les clés Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) manquent dans
          l’environnement. Voir README → « Brancher Supabase ».
        </p>
      </div>
    )
  }

  /* ─── Chargement session ─────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center px-6 py-32">
        <Loader2 size={36} className="animate-spin text-container" />
      </div>
    )
  }

  /* ─── Déconnecté : connexion / création ──────────────── */
  if (!user) {
    return (
      <div className="container-texture px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <p className="flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.28em] text-container">
              <Anchor size={13} /> Passerelle Haul
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-cream">Mon compte</h1>
            <p className="mt-2 text-sm text-steel-400">
              Retrouve tes commandes, tes liens de téléchargement et ton adresse de livraison.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-navy-900">
            {/* Onglets */}
            <div className="grid grid-cols-2 border-b border-white/5">
              {([
                { id: 'signin', label: 'Connexion' },
                { id: 'signup', label: 'Créer un compte' },
              ] as { id: Mode; label: string }[]).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMode(tab.id)
                    setError(null)
                    setNotice(null)
                  }}
                  aria-pressed={mode === tab.id}
                  className={`px-4 py-4 text-sm font-bold uppercase tracking-[0.14em] transition-colors ${
                    mode === tab.id
                      ? 'bg-navy-800 text-container-light'
                      : 'text-steel-400 hover:text-cream'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4 p-6">
              {mode === 'signup' && (
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-steel-400">
                    <User size={12} /> Prénom
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    placeholder="Afi"
                    className="w-full rounded-xl border border-white/10 bg-navy-800 px-4 py-3 text-sm text-cream placeholder-steel-400/50 outline-none transition-colors focus:border-container/60"
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-steel-400">
                  <Mail size={12} /> Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="toi@exemple.com"
                  className="w-full rounded-xl border border-white/10 bg-navy-800 px-4 py-3 text-sm text-cream placeholder-steel-400/50 outline-none transition-colors focus:border-container/60"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-steel-400">
                  <Lock size={12} /> Mot de passe
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="6 caractères minimum"
                  className="w-full rounded-xl border border-white/10 bg-navy-800 px-4 py-3 text-sm text-cream placeholder-steel-400/50 outline-none transition-colors focus:border-container/60"
                />
              </label>

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs leading-relaxed text-red-300">
                  <TriangleAlert size={14} className="mt-0.5 shrink-0" /> {error}
                </p>
              )}
              {notice && (
                <p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs leading-relaxed text-emerald-300">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-container py-3.5 font-extrabold text-navy-950 transition-colors hover:bg-container-light disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                {mode === 'signup' ? 'Créer mon compte' : 'Embarquer'}
              </button>
              <p className="text-center text-[10px] uppercase tracking-[0.18em] text-steel-400/70">
                Propulsé par Supabase Auth · mot de passe hashé bcrypt
              </p>
            </form>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Connecté : tableau de bord compte ──────────────── */
  return (
    <div className="container-texture px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-container">
              Passerelle Haul
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-cream">
              Salut{' '}
              {typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name
                ? user.user_metadata.full_name
                : ''}{' '}
              👋
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-steel-400">
              <Mail size={13} /> {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-steel-300 transition-colors hover:border-red-400/40 hover:text-red-300"
          >
            <LogOut size={14} /> Se déconnecter
          </button>
        </div>

        {/* Commandes */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wide text-cream">
            <Package size={18} className="text-container" /> Tes commandes
          </h2>

          {ordersLoading ? (
            <div className="mt-6 flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-container" />
            </div>
          ) : orders && orders.length > 0 ? (
            <ul className="mt-5 space-y-4">
              {orders.map((order) => {
                const status = FULFILLMENT_LABEL[order.fulfillment_status] ?? FULFILLMENT_LABEL.pending
                const total =
                  order.amount_total != null
                    ? formatPrice(order.amount_total / 100, (order.currency === 'usd' ? 'usd' : 'eur') as Currency)
                    : '—'
                return (
                  <li
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-white/8 bg-navy-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-navy-800/60 px-5 py-3.5 text-xs">
                      <div className="text-steel-300">
                        <span className="font-mono text-[11px] text-steel-400">#{order.id.slice(0, 8)}</span>
                        <span className="mx-2 text-steel-400/50">·</span>
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${status.tone}`}>
                          {status.label}
                        </span>
                        <span className="text-sm font-extrabold text-cream">{total}</span>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <ul className="space-y-1.5 text-sm text-steel-200">
                        {order.order_items?.map((item) => (
                          <li key={item.id} className="flex items-center gap-2">
                            {item.product_type === 'digital' ? (
                              <Zap size={13} className="text-container" />
                            ) : (
                              <Truck size={13} className="text-container" />
                            )}
                            {item.product_name}
                            <span className="text-steel-400">× {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      {order.digital_deliveries && order.digital_deliveries.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                          {order.digital_deliveries.map((d) => (
                            <a
                              key={d.id}
                              href={`/api/download?token=${encodeURIComponent(d.token)}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-container/40 bg-container/10 px-3 py-2 text-xs font-bold text-container-light transition-colors hover:bg-container/20"
                            >
                              <Download size={13} /> Télécharger {d.product_name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-navy-900/50 px-6 py-12 text-center">
              <Package size={36} strokeWidth={1.5} className="mx-auto text-steel-400" />
              <p className="mt-3 font-bold text-cream">Aucune commande pour l’instant</p>
              <p className="mt-1 text-sm text-steel-400">
                Les commandes passées avec cet email apparaissent ici automatiquement.
              </p>
              <Link
                to="/boutique"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-container px-5 py-3 text-sm font-bold text-navy-950 hover:bg-container-light"
              >
                Voir la boutique <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
