import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  Mail,
  TriangleAlert,
  Download,
} from 'lucide-react'

interface SessionDetails {
  id: string
  payment_status: string
  amount_total: number | null
  currency: string | null
  customer_email: string | null
}

interface DownloadLink {
  product_name: string
  url: string
  expires_at: string
}

type LoadState = 'idle' | 'loading' | 'ok' | 'error'
type LinksState = 'idle' | 'polling' | 'ready' | 'none'

const MAX_POLLS = 8
const POLL_MS = 1500

export default function Success({ sessionId }: { sessionId?: string }) {
  const [state, setState] = useState<LoadState>(sessionId ? 'loading' : 'idle')
  const [details, setDetails] = useState<SessionDetails | null>(null)
  const [linksState, setLinksState] = useState<LinksState>(sessionId ? 'polling' : 'idle')
  const [links, setLinks] = useState<DownloadLink[]>([])

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    setState('loading')
    fetch(`/api/session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        return (await res.json()) as SessionDetails
      })
      .then((data) => {
        if (cancelled) return
        setDetails(data)
        setState('ok')
      })
      .catch(() => {
        if (cancelled) return
        setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [sessionId])

  // Les liens arrivent dès que le webhook a enregistré la commande (quelques secondes).
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    let attempts = 0
    const timer = window.setInterval(async () => {
      attempts += 1
      try {
        const res = await fetch(`/api/download-links?session_id=${encodeURIComponent(sessionId)}`)
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as { status: string; links: DownloadLink[] }
        if (cancelled) return
        if (data.status === 'ready') {
          setLinks(data.links)
          setLinksState(data.links.length > 0 ? 'ready' : 'none')
          window.clearInterval(timer)
        } else if (attempts >= MAX_POLLS) {
          setLinksState('none')
          window.clearInterval(timer)
        }
      } catch {
        if (attempts >= MAX_POLLS) {
          setLinksState('none')
          window.clearInterval(timer)
        }
      }
    }, POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [sessionId])

  const amount =
    details?.amount_total != null && details.currency
      ? new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: details.currency.toUpperCase(),
        }).format(details.amount_total / 100)
      : null

  return (
    <div className="container-texture px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-navy-900 p-8 text-center sm:p-12">
        {state === 'loading' ? (
          <Loader2 size={52} className="mx-auto animate-spin text-container" />
        ) : (
          <CheckCircle2 size={72} strokeWidth={1.5} className="mx-auto text-container" />
        )}

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
          Bienvenue à bord.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-steel-300">
          Ton paiement est confirmé. Retrouve ton reçu dans ta boîte mail — et tes produits
          numériques ici même, juste en dessous.
        </p>

        {/* ─── LIVRAISON NUMÉRIQUE IMMÉDIATE ─────────────────── */}
        {linksState === 'polling' && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-navy-800/60 px-4 py-4 text-sm text-steel-300">
            <Loader2 size={16} className="animate-spin text-container" />
            Préparation de tes liens de téléchargement…
          </div>
        )}
        {linksState === 'ready' && (
          <div className="mt-6 rounded-2xl border border-container/30 bg-container/5 p-5 text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-container-light">
              Tes téléchargements
            </p>
            <ul className="mt-3 space-y-2">
              {links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    className="flex items-center gap-2 rounded-xl bg-container px-4 py-3 text-sm font-extrabold text-navy-950 transition-colors hover:bg-container-light"
                  >
                    <Download size={18} />
                    <span className="truncate">{link.product_name}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-[10px] uppercase tracking-[0.18em] text-steel-400">
              Liens valables 30 jours · aussi dispo dans ton compte
            </p>
          </div>
        )}

        {/* Détail de la commande (si récupérable) */}
        {state === 'ok' && details && (
          <dl className="mt-6 space-y-2 rounded-2xl border border-white/5 bg-navy-800/70 p-5 text-left text-sm">
            {details.customer_email && (
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-steel-400"><Mail size={13} /> Email</dt>
                <dd className="truncate font-semibold text-cream">{details.customer_email}</dd>
              </div>
            )}
            {amount && (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-steel-400">Montant</dt>
                <dd className="font-extrabold text-cream">{amount}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <dt className="text-steel-400">Statut</dt>
              <dd className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-400">
                {details.payment_status === 'paid' ? 'Payé' : details.payment_status}
              </dd>
            </div>
          </dl>
        )}
        {state === 'error' && (
          <p className="mt-6 flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-left text-xs leading-relaxed text-amber-300">
            <TriangleAlert size={15} className="mt-0.5 shrink-0" />
            Impossible de charger le détail de la commande. Pas d’inquiétude : si le paiement est
            passé, ton email contient déjà ton reçu et tes liens.
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/compte"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-container px-6 py-4 font-extrabold text-navy-950 transition-colors hover:bg-container-light"
          >
            Voir mes commandes <ArrowRight size={18} />
          </Link>
          <Link
            to="/boutique"
            className="text-sm font-semibold text-steel-400 transition-colors hover:text-cream"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  )
}
