import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Loader2, ArrowRight, Mail, TriangleAlert } from 'lucide-react'

interface SessionDetails {
  id: string
  payment_status: string
  amount_total: number | null
  currency: string | null
  customer_email: string | null
}

type LoadState = 'idle' | 'loading' | 'ok' | 'error'

export default function Success({ sessionId }: { sessionId?: string }) {
  const [state, setState] = useState<LoadState>(sessionId ? 'loading' : 'idle')
  const [details, setDetails] = useState<SessionDetails | null>(null)

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
          Ton paiement est confirmé. Un email de confirmation part chez toi avec le reçu et — pour
          les produits numériques — tes liens de téléchargement.
        </p>

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
            to="/boutique"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-container px-6 py-4 font-extrabold text-navy-950 transition-colors hover:bg-container-light"
          >
            Retour à la boutique <ArrowRight size={18} />
          </Link>
          <Link to="/" className="text-sm font-semibold text-steel-400 transition-colors hover:text-cream">
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
