import { useEffect } from 'react'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useLocation,
  Link,
} from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Boutique from './pages/Boutique'
import APropos from './pages/APropos'
import Success from './pages/Success'
import Compte from './pages/Compte'
import type { ProductType } from './lib/products'

function RootLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-navy-950 text-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <Compass size={56} strokeWidth={1.5} className="text-container" />
      <h1 className="text-3xl font-extrabold text-cream">Mer calme, mais page perdue.</h1>
      <p className="max-w-sm text-sm text-steel-400">
        L’adresse que tu cherches n’existe pas sur ce navire. Reviens au cap.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-xl bg-container px-6 py-3 text-sm font-bold text-navy-950 hover:bg-container-light"
      >
        Retour à l’accueil
      </Link>
    </div>
  )
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const boutiqueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/boutique',
  validateSearch: (search: Record<string, unknown>): { type?: ProductType } => {
    const t = search.type
    return t === 'digital' || t === 'physical' ? { type: t } : {}
  },
  component: function BoutiqueRoute() {
    const { type } = boutiqueRoute.useSearch()
    return <Boutique type={type} />
  },
})

const aProposRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/a-propos',
  component: APropos,
})

const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/success',
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => {
    const s = search.session_id
    return typeof s === 'string' && s.length > 0 ? { session_id: s } : {}
  },
  component: function SuccessRoute() {
    const { session_id } = successRoute.useSearch()
    return <Success sessionId={session_id} />
  },
})

const compteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compte',
  component: Compte,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  boutiqueRoute,
  aProposRoute,
  successRoute,
  compteRoute,
])

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
