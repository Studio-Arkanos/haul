# Haul

**Haul** — Boutique en ligne au style maritime / conteneurs. « Tout ce qui doit arriver » : guides et templates numériques livrés instantanément, plus une sélection de pièces en dropshipping — payables en **EUR** ou **USD**.

**Stack** : Vite + React 18 · TanStack Router · Tailwind · Nitro (API serverless) · Stripe Checkout · Supabase (Auth + Postgres + Storage).

## Ce que le site fait (v1)

- Vitrine maritime complète : Accueil / Boutique / À propos / Success / **Mon compte**
- Catalogue 6 produits (3 numériques, 3 dropshipping) — `src/lib/products.ts`
- Panier persistant (localStorage) + devise EUR/USD
- **Comptes clients** Supabase (email + mot de passe, RLS stricte) : inscription, connexion, historique de commandes, liens de téléchargement permanents
- **Paiement Stripe Checkout** : prix résolus côté serveur (jamais par le client), adresse de livraison collectée seulement si le panier contient du physique
- **Webhook idempotent** `checkout.session.completed` : commande + lignes + livraisons numériques enregistrées en base ; rejeu sans doublon
- **Livraison numérique réelle** : tokens uniques (30 j) → redirection 302 vers une URL signée Supabase Storage (bucket privé `digital-products`) ; repli local `storage/digital/` en dev

## Démarrage local

```bash
npm install
cp .env.example .env       # puis renseigne les clés (voir tableau ci-dessous)
```

Deux terminaux :

```bash
npm run nitro:dev          # API sur :3000
npm run dev                # Vitrine sur :5173 (proxy /api → :3000)
```

Ouvre http://localhost:5173

## Variables d'environnement

| Variable | Où l'obtenir | Côté |
|---|---|---|
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys (mode **Test** d'abord) | serveur / — |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks (`/api/webhooks/stripe`, event `checkout.session.completed`) | serveur |
| `SITE_URL` / `VITE_SITE_URL` | URL publique du site (`http://localhost:5173` en dev) | — |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase → projet **Haul** → Project Settings → API (`service_role`, **jamais côté client**) | serveur |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | idem, clé `anon` (publique, protégée par RLS) | client |

## Supabase — projet « Haul »

Projet dédié et **indépendant** du site Arkanos (ref `choaryjjjbsekjwporjo`, eu-west-1, plan free). Le schéma (migrations `haul_init`, `haul_deliveries_unique`) :

| Table | Rôle | Accès client (RLS) |
|---|---|---|
| `profiles` | miroir `auth.users` (créé par trigger) | soi uniquement |
| `orders` | commandes (invité ou compte), `stripe_session_id` unique | lecture par email du JWT |
| `order_items` | lignes de commande | via commande parente |
| `digital_deliveries` | tokens de téléchargement (30 j) | lecture par email du JWT |
| `stripe_events` | idempotence webhook | **aucun** (service role) |

Auth : email/mot de passe activé, `mailer_autoconfirm = true` (comptes utilisables sans SMTP).
Bucket Storage `digital-products` **privé** pour les livrables réels.
En production : configurer SMTP + remettre `mailer_autoconfirm = false`, et remplacer `site_url` / allow list par le domaine final.

## Brancher Stripe (5 minutes)

1. Dashboard (mode Test) → Product catalog → crée les produits du catalogue (`src/lib/products.ts`) avec metadata `type = digital` ou `type = physical`.
2. Recopie chaque `price_...` dans `priceId.eur` / `priceId.usd` (2 prix par produit, un par devise).
3. `.env` : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
4. Webhook : Developers → Webhooks → endpoint `https://<domaine>/api/webhooks/stripe`, event unique `checkout.session.completed`.
   En dev local : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

Tant que les placeholders `price_REPLACE_ME_*` subsistent, `/api/checkout` répond **409** avec le nom exact du produit à configurer — rien ne plante.

### Tester le webhook en local sans Stripe

```bash
node scripts/forge-webhook.mjs mon@email.com   # affiche { payload, signature }
curl -X POST localhost:3000/api/webhooks/stripe \
  -H 'Content-Type: application/json' -H 'stripe-signature: <sig>' --data '<payload>'
```

La commande, les lignes et les liens numériques sont alors visibles dans le compte Supabase correspondant (ou via `scripts` + query SQL).

## Livrables numériques

Les fichiers réels (PDF du Guide, Pack, etc.) se déposent dans le bucket privé **`digital-products`** (mêmes noms que `file_path` : `guide-dropshipping-2026.pdf`, `pack-templates-ecommerce.pdf`, `ebook-lance-ta-boutique.pdf`). En développement, `npm run gen:placeholders` génère des PDF de substitution dans `storage/digital/` (gitignored) servis en repli local par `/api/download`.

## Déploiement (Cloudflare Pages, Option A)

1. Build Vite → `dist/` ; API Nitro avec preset `cloudflare-pages` (`NITRO_PRESET=cloudflare-pages nitro build` → `.output/public`).
2. Env vars Pages : toutes les clés de `.env.example` avec les valeurs de prod.
3. Supabase : `site_url` + allow list → domaine final ; SMTP propre ; `mailer_autoconfirm = false`.
4. Stripe : webhook de prod sur le domaine final ; `STRIPE_WEBHOOK_SECRET` de prod.
5. DNS : `haul.<domaine>` → Pages.

L'intégration au site Arkanos (Option B) reste possible sans refonte — voir `docs/DECISIONS.md`.

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Frontend Vite |
| `npm run nitro:dev` / `npm run nitro:build` | API Nitro |
| `npm run typecheck` | `tsc` strict |
| `npm run gen:placeholders` | Génère les PDF de livraison locaux (nécessite `pip install fpdf2`) |

## Structure

```
src/
  main.tsx, router.tsx        # entrée + routes (/, /boutique, /a-propos, /success, /compte)
  lib/                        # products (catalogue), cart, auth, supabase, checkout, format
  components/                 # Header, Footer, Logo, ProductCard, CartDrawer
  pages/                      # Home, Boutique, APropos, Success, Compte
  server/
    lib/stripe.server.ts      # client Stripe lazy
    lib/supabase.server.ts    # client service role (serveur uniquement)
    api/checkout.post.ts      # Zod + résolution serveur des prix + metadata.cart
    api/webhooks/stripe.post.ts  # signature brute + idempotence + fulfilment
    api/download-links.get.ts # liens d'une session (page Success)
    api/download.get.ts       # token → 302 URL signée Storage (ou fichier local en dev)
    api/session.get.ts, api/health.get.ts
storage/digital/              # PDF placeholders (gitignored)
scripts/                      # forge-webhook.mjs, generate_placeholders.py
docs/DECISIONS.md             # journal des décisions techniques
```

## Roadmap

- [x] Design system maritime + pages vitrine
- [x] Panier persistant + EUR/USD (prix résolus serveur)
- [x] Comptes Supabase + historique de commandes + liens permanents
- [x] Checkout Stripe + webhook idempotent + livraison numérique
- [ ] Prix Stripe réels (mode test → live)
- [ ] Vrais livrables dans le bucket `digital-products`
- [ ] Emails transactionnels (Resend/Postmark) : confirmation + suivi dropshipping
- [ ] Flux dropshipping fournisseur (API ou email structuré)
- [ ] Abonnements / XOF

---

Studio Arkanos · 2026
