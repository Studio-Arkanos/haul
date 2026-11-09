# Haul — Décisions techniques

> Journal des choix d’architecture. Date : 2026-11-09. Auteur : Studio Arkanos + agent Arena.
> Chaque décision liste le contexte, l’option retenue et les alternatives écartées.

## D1 — Repo fusionné avec l’archive Drive (`boutique-stripe.zip`)

- **Contexte** : le repo ne contenait que le scaffold (config Tailwind/Vite) ; le code applicatif existait uniquement dans l’archive du Drive.
- **Décision** : intégrer le code de l’archive dans le repo sur la branche `arena/10b0f13b-haul`, en le réalignant sur le design maritime. L’archive Drive fait désormais office de référence historique ; le repo est la seule source de vérité.
- **Écartés** : maintenir les deux en parallèle (divergence garantie).

## D2 — Split Vitrine (Vite) + API (Nitro), proxy en dev

- **Contexte** : le brief pile deux mondes — SPA React et fonctions serverless Stripe.
- **Décision** : Vite sert le frontend sur :5173 et proxifie `/api/*` vers Nitro sur :3000 (le navigateur ne parle jamais directement à un autre port). En production, le frontend est statique (`dist/`) et l’API Nitro est déployée en fonctions serverless.
- **Écartés** : monolithe SSR — inutile ici (pas de SEO par page critique, catalogue statique côté client) et plus lourd à porter sur Cloudflare.

## D3 — Déploiement : Cloudflare Pages autonome d’abord (Option A)

- **Contexte** : le brief propose A (Cloudflare Pages autonome) ou B (intégration au site Arkanos), préférence actuelle pour A.
- **Décision** : tout construire pour A — repo autonome, zéro dépendance à l’infra Arkanos, secrets en variables d’environnement, images locales, Stripe en source de vérité des prix. La migration B reste possible sans refonte (le design system est déjà Tokens CSS + Tailwind, l’API est stateless).
- **Prérequis Cloudflare** : preset Nitro `cloudflare-pages` (via `NITRO_PRESET` ou config), sortie `dist/`, secrets `STRIPE_*` dans les variables d’environnement Pages.
- **Écartés** : intégration immédiate à Arkanos — le couplage empêcherait une mise en vente rapide (objectif n°1 du brief).

## D4 — Multi-devises par Prix Stripe explicites (EUR + USD)

- **Contexte** : le brief veut EUR/USD dès le départ. Stripe Checkout ne convertit pas automatiquement une ligne de commande en multi-devise de façon transparente.
- **Décision** : un Price par devise et par produit, stockés dans `src/lib/products.ts` (`priceId.eur` / `priceId.usd`). Le toggle de devise est global (contexte panier). Le **serveur re-résout** le priceId à partir de l’`id` produit + la devise validée par Zod — le client n’envoie jamais de priceId ni de montant.
- **Écartés** : adaptive pricing (moins de contrôle, prix non différenciés FR/US) ; un seul Price + conversion maison (faux partage de TVA/logistique).
- **XOF/FCFA** : prévu, pas implémenté — Stripe ne supporte pas XOF nativement sur Checkout pour tout le compte ; à réévaluer avec Wise/Stripe localités.

## D5 — Prix résolus côté serveur, entrée validée par Zod

- **Contexte** : un panier qui envoie des priceIds depuis le client permet de payer n’importe quel prix.
- **Décision** : `/api/checkout` accepte uniquement `{ items: [{ id, quantity }], currency }`, valide avec Zod, résout les prix depuis le catalogue (`getProductById`), et renvoie **409 explicite** si un `price_REPLACE_ME_*` subsiste (guidage utilisateur, pas un crash).
- **Écartés** : confiance au client ; prix embarqués côté serveur sans validation (quantité ≤ 0, lignes nulles…).

## D6 — Webhook : signature brute, fulfilment discriminé, idempotence différée

- **Décision** : corps BRUT lu via `buffer(event.node.req)` avant toute vérification (`stripe-signature` obligatoire, sinon 400). Discrimination `digital` vs `physical|dropship` via `metadata.type` du produit Stripe expansé. Logs structurés `[haul][fulfilment][...]` prêts pour un agrégateur.
- **Volontairement non fait** (attente Supabase, évite le sur-engineering) : idempotence par `stripe_events(id unique)`, génération de lien de téléchargement signé, email transactionnel, POST fournisseur dropshipping. Le webhook répond 200 après log pour ne pas bloquer Stripe.
- **Écartés** : traiter la livraison dans la requête Checkout (pas fiable — le paiement peut réussir sans redirection réussie) ; auto-ack silencieux sans log.

## D7 — Cart : React Context + localStorage, pas de librairie externe

- **Contexte** : panier simple, un seul type d’ajout, audience boutique.
- **Décision** : contexte React + `localStorage('haul-cart-v1')` (items + devise). Zéro dépendance, zéro sur-ingénierie ; migration vers Zustand/Supabase triviale si le besoin grandit.
- **Écartés** : Redux/Zustand (prématuré), panier côté serveur (nécessite auth — pas encore).

## D8 — Images générées localement, dans `public/images/`

- **Décision** : héros portuaire + 6 visuels produits générés en local, versionnés avec le repo. Aucun S3/CDN nécessaire pour v1.
- **Suite** : déplacer vers Stripe Product Images ou Supabase Storage quand les vrais produits existeront ; les `product.image` deviennent des URLs absolues.

## D9 — Chiffres de la page À propos : illustration

- **Contexte** : le brief ne fournit pas de métriques réelles.
- **Décision** : les compteurs (« 2 400+ colis », « 38 pays ») sont marqués « chiffres de démonstration » en clair sous le bloc. À remplacer par les vraies données dès le premier trimestre d’exploitation.

## D10 — Correction scaffold : `nitro` → `nitropack`

- **Contexte** : le scaffold déclarait `nitro: ^2.9.7`, version inexistante (le paquet npm `nitro` n’existe qu’en 3.x RC).
- **Décision** : dépendance remplacée par `nitropack: ^2.9.7` (Nitro v2 réel). Scripts `nitro:dev` / `nitro:build` inchangés.

## Reste à faire (priorités)

1. Prix Stripe réels (mode test) → remplacer les `price_REPLACE_ME_*`
2. Livraison numérique (lien signé + email) — dépend de la décision Supabase (D3/D6)
3. Flux dropshipping minimal (email structuré `DROPSHIP_NOTIFY_EMAIL` puis API fournisseur)
4. Supabase : `orders`, `order_items`, `stripe_events` (+ auth si comptes clients)
5. Cloudflare Pages : preset Nitro, domaines, variables d’environnement, webhook de prod
