import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  compatibilityDate: '2026-11-09',
  srcDir: 'src/server',
  routeRules: {
    '/api/**': { cors: true },
  },
  // Déploiement autonome Cloudflare Pages / Workers :
  // nitro preset via NITRO_PRESET=cloudflare-pages (voir docs/DECISIONS.md)
  // preset: 'cloudflare-pages',
})
