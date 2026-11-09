import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { CartProvider } from './lib/cart'
import { router } from './router'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('#root introuvable — vérifie index.html')
}

createRoot(rootEl).render(
  <StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </StrictMode>,
)
