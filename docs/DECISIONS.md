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

## D11 — Projet Supabase dédié « Haul » (pas le projet Arkanos)

- **Contexte** : le brief laissait le choix entre site autonome ou intégration Arkanos.
- **Décision** : projet Supabase **séparé** `Haul` (ref `choaryjjjbsekjwporjo`, eu-west-1, free), créé le 2026-11-10. Aucune donnée du site studio n'est touchée ; le rattachement ultérieur à Arkanos reste possible (même organisation).

## D12 — Catalogue en code ; transactions en base

- **Décision** : une seule source de vérité produit (`src/lib/products.ts`, typée, versionnée). Supabase ne stocke que les **transactions et livraisons** (`orders`, `order_items`, `digital_deliveries`, `stripe_events`, `profiles`). Pas de sync de catalogue à maintenir.
- **Écarté** : table `products` + back-office — inutile pour 6 produits ; à ajouter quand le catalogue dépassera ~30 références.

## D13 — Panier embarqué dans `session.metadata.cart`

- **Contexte** : le webhook ne doit pas rappeler l'API Stripe (latence, egress, échec).
- **Décision** : `checkout.post.ts` compacte le panier (`[{id,qty,type}]`, ~150 car.) dans `metadata.cart` (limite Stripe 500 car./valeur). Le webhook reconstruit tout localement.

## D14 — Webhook idempotent (Stripe rejoue les événements)

- **Décision** : `stripe_events(id PK)` inséré **en dernier** ; upsert `orders` sur `stripe_session_id` ; `order_items` en delete+insert ; `digital_deliveries` en upsert `ignoreDuplicates` sur `(order_id, product_id)`. Tout avant `stripe_events` est rejouable sans doublon.

## D15 — Livraison numérique : token unique → URL signée Storage

- **Décision** : bucket privé `digital-products` ; `/api/download?token=` valide le token (existence + expiration 30 j), incrémente `download_count`, puis 302 vers une URL signée (120 s). Repli local `storage/digital/*.pdf` en dev — les placeholders sont générés par `scripts/generate_placeholders.py` et gitignorés.
- **Écarté** : envoi d'email avec pièce jointe (limite de taille Mailgun/Resend, friction) ; lien public permanent (fuite).

## D16 — Auth email/mot de passe, autoconfirm activé

- **Décision** : `mailer_autoconfirm=true` pour que les comptes fonctionnent sans SMTP. En production : SMTP propre + `false` (sinon n'importe quel email s'inscrit en le possédant). `site_url`/allow list pointent sur localhost tant que le domaine final n'est pas choisi.

## D17 — RLS vérifiée par simulation JWT (2026-11-10)

- **Test** : `set role authenticated` + `request.jwt.claims` avec email du propriétaire → voit 1 commande / 3 lignes / 2 livraisons / 0 événement ; avec un autre email → 0 ligne partout. `stripe_events` sans policy = deny-all client. Nettoyé ensuite (base vierge).

## D18 — Limite d'egress du sandbox Arena

- **Constat** : ce sandbox ne peut joindre ni `*.supabase.co` ni `api.stripe.com` (HTTP 000) — seuls GitHub/npm/pypi passent. Le checkout réel et le webhook vers Supabase sont donc non exécutables ICI ; ils fonctionneront en local chez l'utilisateur et en production (Cloudflare).
- **Mitigations appliquées** : logique webhook rejouable sans API Stripe (D13) ; vérification du schéma et du RLS via SQL direct (D17) ; livraison testée sur le chemin de repli local ; `scripts/forge-webhook.mjs` pour reproduire le test complet en local chez l'utilisateur.

## D19 — Le preview Arena : limites côté API

- Le navigateur de l'utilisateur joint directement `*.supabase.co` (auth + commandes) → OK même ici.
- Les routes `/api/*` tournent dans le sandbox → egress restreinte → indisponibles jusqu'au déploiement ou à l'exécution locale.

## D20 — Liaison ARKANOS ⇄ HAUL : liens croisés, comptes séparés (2026-11-11)

- **Contexte** : Haul est en ligne (haul.arkanos-innovation.workers.dev, Cloudflare Workers) ; le site ARKANOS.SYS (statique, Drive `site-arkanos-2.0.zip`) existe en parallèle, même hébergeur.
- **Décision retenue — niveau 1 (fait)** :
  - ARKANOS → HAUL : carte « Haul » dans la section Nos systèmes (grille g4), lien « Haul » dans la nav, lien « HAUL — la boutique » dans le footer. Diff exact: 3 fichiers (index.html, assets/js/site.js). Livré via `site-arkanos-2.0-haul-link.zip` + `MISE-A-JOUR-haul-link.md` dans le Drive (dossier Arkanos), sans toucher aux archives sources.
  - HAUL → ARKANOS : le footer Haul lie désormais « Studio Arkanos » vers github.com/Studio-Arkanos.
- **Volontairement non fait — niveau 2 (à trancher plus tard)** : unification des comptes (SSO / même projet Supabase / même origine). Projets Auth distincts (Haul = projet dédié, D11), RLS et rôles incompatibles sans refonte ; pas de gain immédiat. Réévaluer si la boutique devient majeure.
- **Optionnel — niveau 3** : servir HAUL sous le même domaine (reverse proxy path-based `/haul` ou sous-domaine) ; uniquement config Cloudflare, sans code. À faire si le domaine arkanos-innovation (ou un domaine custom) est tranché.

## D21 — HAUL hébergé sur workers.dev : `.workers.dev` par défaut

- Le site est déployé sur `haul.arkanos-innovation.workers.dev` (branche/domaine par défaut du compte Cloudflare). Pour relier au niveau DNS : soit ajouter une route sur le sous-domaine `haul.` d'un domaine final, soit un chemin `/boutique` en rewrite Workers — les deux sans changement applicatif.
