# Haul

**Haul** — Boutique en ligne au style maritime / conteneurs.

Vente de produits numériques (guides, ebooks, packs) + produits physiques en dropshipping.

## Stack

- **Frontend** : Vite + React + Tailwind + Lucide
- **Backend** : Nitro (Vercel-ready)
- **Paiements** : Stripe Checkout (hosted) + Webhooks
- **Auth / DB** : prêt pour Supabase (à brancher)

## Design

Thème **maritime / shipping** :
- Palette sombre (navy, charcoal, acier)
- Accents container orange / ambre
- Typographie claire et industrielle
- Atmosphère logistique & livraisons internationales

## Structure

```
src/
  components/     # Header, Footer, ProductCard, CartDrawer...
  lib/            # stripe.ts, products
  pages/          # Accueil, Boutique, À propos, Success
  server/api/     # checkout + webhook Stripe
public/
```

## Démarrage

1. Copier `.env.example` → `.env`
2. Remplir les clés Stripe (mode test)
3. `npm install`
4. Lancer le backend Nitro + frontend Vite
5. Créer des produits dans le Dashboard Stripe avec metadata `type: digital` ou `type: physical`

## Roadmap

- [x] Architecture de base + Stripe Checkout
- [x] Design system maritime
- [ ] Catalogue dynamique (Stripe ou Supabase)
- [ ] Auth utilisateurs (Supabase)
- [ ] Commandes + historique
- [ ] Livraison numérique automatisée
- [ ] Intégration dropshipping
- [ ] Abonnements

---

Studio Arkanos · 2026
