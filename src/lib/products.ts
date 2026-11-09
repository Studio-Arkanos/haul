// ─────────────────────────────────────────────────────────────
//  Catalogue Haul — source de vérité partagée (client + API Nitro)
//
//  Les `priceId` sont des PLACEHOLDERS. Pour brancher Stripe :
//    1. Crée les produits dans le Dashboard Stripe (mode test),
//       metadata : type = digital | physical | dropship
//    2. Recopie les `price_...` ci-dessous (un par devise)
//    3. Voir README → « Brancher Stripe »
// ─────────────────────────────────────────────────────────────

export type Currency = 'eur' | 'usd'
export type ProductType = 'digital' | 'physical'

export interface Product {
  id: string
  name: string
  tagline: string
  description: string
  image: string
  type: ProductType
  /** Prix affichés côté UI, en unités majeures (ex. 29 = 29 €) */
  price: Record<Currency, number>
  /** IDs de prix Stripe par devise — résolus CÔTÉ SERVEUR uniquement */
  priceId: Record<Currency, string>
  featured?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: 'guide-dropshipping-2026',
    name: 'Guide Dropshipping 2026',
    tagline: 'Le manuel terrain : niche, fournisseur, pub — du zéro à la première commande.',
    description:
      'PDF de 120 pages + checklists et templates de briefs fournisseurs. Couvre la recherche de produits, les marges, la pub Meta/TikTok et les erreurs qui coûtent cher.',
    image: '/images/products/guide-dropshipping-2026.jpg',
    type: 'digital',
    price: { eur: 29, usd: 29 },
    priceId: {
      eur: 'price_REPLACE_ME_guide_eur',
      usd: 'price_REPLACE_ME_guide_usd',
    },
    featured: true,
  },
  {
    id: 'pack-templates-ecommerce',
    name: 'Pack 25 Templates E-commerce',
    tagline: 'Landing pages, fiches produits et séquences email — prêts à vendre.',
    description:
      '25 templates Figma + Notion : pages de vente, fiches produit qui convertissent, séquence email post-achat et tableau de bord de suivi. Mises à jour offertes.',
    image: '/images/products/pack-templates.jpg',
    type: 'digital',
    price: { eur: 39, usd: 39 },
    priceId: {
      eur: 'price_REPLACE_ME_templates_eur',
      usd: 'price_REPLACE_ME_templates_usd',
    },
    featured: true,
  },
  {
    id: 'ebook-lance-ta-boutique',
    name: 'Ebook « Lance ta boutique »',
    tagline: 'Le plan sur 14 jours pour mettre en ligne ta première boutique rentable.',
    description:
      'Un plan d’attaque jour par jour : trouver l’angle, monter la vitrine, fixer les prix, lancer et lire tes premiers chiffres sans te noyer.',
    image: '/images/products/ebook-lance-boutique.jpg',
    type: 'digital',
    price: { eur: 19, usd: 19 },
    priceId: {
      eur: 'price_REPLACE_ME_ebook_eur',
      usd: 'price_REPLACE_ME_ebook_usd',
    },
  },
  {
    id: 'tshirt-haul-container',
    name: 'T-shirt « Container Co. »',
    tagline: 'Coton lourd 240 g/m², coupe unisexe, conteneur brodé.',
    description:
      'Le tee signature d’Haul : coton peigné 240 g/m², coupe unisexe légèrement boxy, broderie orange conteneur sur la poitrine. Expédié direct du fournisseur.',
    image: '/images/products/tshirt-haul.jpg',
    type: 'physical',
    price: { eur: 25, usd: 27 },
    priceId: {
      eur: 'price_REPLACE_ME_tshirt_eur',
      usd: 'price_REPLACE_ME_tshirt_usd',
    },
    featured: true,
  },
  {
    id: 'casquette-haul',
    name: 'Snapback « Capitaine Haul »',
    tagline: 'Broderie orange sur charbon chiné — édition dock.',
    description:
      'Snapback 6 panneaux, broderie 3D orange (conteneur + HAUL), fermoir snapback réglable. Pensée pour les longues attentes de conteneurs sur le quai.',
    image: '/images/products/casquette-haul.jpg',
    type: 'physical',
    price: { eur: 22, usd: 24 },
    priceId: {
      eur: 'price_REPLACE_ME_cap_eur',
      usd: 'price_REPLACE_ME_cap_usd',
    },
  },
  {
    id: 'affiche-port-of-haul',
    name: 'Affiche sérigraphie « Port of Haul » A2',
    tagline: 'Tirage limité à 500 exemplaires numérotés, 3 couleurs.',
    description:
      'Sérigraphie écran 3 passages (navy / crème / orange) sur papier 200 g, format A2, signée et numérotée à 500. Encadrement non inclus.',
    image: '/images/products/affiche-port-of-haul.jpg',
    type: 'physical',
    price: { eur: 18, usd: 20 },
    priceId: {
      eur: 'price_REPLACE_ME_poster_eur',
      usd: 'price_REPLACE_ME_poster_usd',
    },
  },
]

export const CURRENCIES: { id: Currency; label: string; symbol: string }[] = [
  { id: 'eur', label: 'EUR', symbol: '€' },
  { id: 'usd', label: 'USD', symbol: '$' },
]

export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id)
