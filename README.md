# Haul

**Haul** — Boutique en ligne au style maritime / conteneurs.

« Tout ce qui doit arriver » : produits numériques (téléchargement immédiat) et produits physiques en dropshipping, payables en **EUR** ou **USD**.

- **Frontend** : Vite + React 18 + TanStack Router + Tailwind CSS
- **Backend** : Nitro (serverless-ready) — `/api/checkout`, `/api/webhooks/stripe`, `/api/session`, `/api/health`
- **Paiement** : Stripe Checkout (hosted) + webhook `checkout.session.completed`
- **Auth / DB** : prêt pour Supabase, pas encore branché (voir `docs/DECISIONS.md`)

Design **maritime / shipping** : navy profond, acier, orange conteneur `#e85d04`, cream. Typo Inter. Voir `tailwind.config.js`.

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner les clés Stripe de test
```

Deux terminaux :

```bash
npm run nitro:dev      # API Nitro sur :3000 (watch)
npm run dev            # Vitrine Vite sur :5173 (proxy /api → :3000)
```

Ouvre http://localhost:5173

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` | Frontend Vite (:5173), proxy `/api` → :3000 |
| `npm run build` | `tsc` (type-check) + build de production Vite → `dist/` |
| `npm run preview` | Sert le build Vite |
| `npm run nitro:dev` | API Nitro en dev avec watch (:3000) |
| `npm run nitro:build` | Build Nitro → `.output/` |

## Structure

```
src/
  main.tsx              # entrée React
  router.tsx            # routes TanStack (code-based)
  index.css             # Tailwind + utilitaires maritimes
  lib/
    products.ts         # catalogue (source de vérité client + serveur)
    cart.tsx            # panier (context + localStorage) + devise
    checkout.ts         # appel /api/checkout
    format.ts           # formatage prix
  components/           # Header, Footer, Logo, ProductCard, CartDrawer
  pages/                # Home, Boutique, APropos, Success
  server/
    lib/stripe.server.ts  # client Stripe paresseux
    api/
      health.get.ts
      checkout.post.ts    # Zod + résolution serveur des priceIds
      session.get.ts      # détail session (page succès)
      webhooks/stripe.post.ts  # signature brute + fulfilment digital/physique
public/images/          # visuels (héros + produits)
docs/DECISIONS.md       # choix techniques documentés
```

## Brancher Stripe

1. Dashboard Stripe (mode **Test**) → Product catalog → créer :
   - **« Guide Dropshipping 2026 »** : One-time, 29 EUR **+** un prix 29 USD ; metadata `type = digital`
   - **« Produit Dropshipping Exemple »** : metadata `type = physical` (ou `dropship`)
   - (Idem pour les 6 produits du catalogue, ou consulter `src/lib/products.ts`)
2. Recopie chaque `price_...` dans `src/lib/products.ts` (clés `priceId.eur` / `priceId.usd`).
   Tant que les placeholders `price_REPLACE_ME_*` sont en place, `/api/checkout` répond proprement **409** avec le nom du produit à configurer — le site ne plante pas.
3. `.env` : renseigne `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
4. Webhook (une fois déployé) : Developers → Webhooks → `https://<domaine>/api/webhooks/stripe`
   - Event : `checkout.session.completed`
   - En dev local : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

Le panier envoie **seulement** `{ items: [{ id, quantity }], currency }` : le serveur re-résout les prix depuis le catalogue — jamais de `priceId` fourni par le client.

## Livraison & fulfilment (état réel)

- **Numérique** : le webhook détecte `metadata.type = digital` et logge la commande. L’envoi du lien signé par email est **à brancher** (Resend / Postmark + Supabase Storage) — voir `docs/DECISIONS.md`.
- **Physique** : le webhook détecte `physical|dropship` et logge adresse + lignes. L’appel d’API fournisseur est **à brancher**.
- Idempotence webhook (table `stripe_events`) : prévue avec Supabase.

## Déploiement

Préférence actuelle : **Cloudflare Pages autonome** (voir `docs/DECISIONS.md`, Option A). Chemin type : build Vite → `dist/`, API Nitro avec preset `cloudflare-pages` (via `NITRO_PRESET=cloudflare-pages nitro build`), secrets dans les env vars Cloudflare. L’intégration au site Arkanos reste possible plus tard (Option B) — la boutique reste portable et sans dépendance Arkanos.

## Roadmap

- [x] Design system maritime (Tailwind, palette navy/acier/conteneur)
- [x] Accueil / Boutique / À propos / Succès
- [x] Panier client-side persistant (localStorage) + devise EUR/USD
- [x] Checkout Stripe (validation Zod, résolution serveur des prix)
- [x] Webhook structuré (digital vs physique) — signature vérifiée
- [ ] Prix Stripe réels (remplacer `price_REPLACE_ME_*`)
- [ ] Livraison numérique automatisée (lien signé + email)
- [ ] Flux dropshipping (API fournisseur ou email structuré)
- [ ] Supabase (auth + table commandes + idempotence webhook)
- [ ] Abonnements
- [ ] Déploiement Cloudflare Pages + domaine

---

Studio Arkanos · 2026
