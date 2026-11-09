import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { PRODUCTS, getProductById, type Currency, type Product } from './products'

export interface CartLine {
  product: Product
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  currency: Currency
  setCurrency: (c: Currency) => void
  add: (productId: string) => void
  remove: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'haul-cart-v1'

interface PersistedState {
  items: { id: string; quantity: number }[]
  currency: Currency
}

function readPersisted(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], currency: 'eur' }
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    const items = Array.isArray(parsed.items)
      ? parsed.items.filter(
          (i): i is { id: string; quantity: number } =>
            !!i && typeof i.id === 'string' && Number.isFinite(i.quantity) && i.quantity > 0,
        )
      : []
    const currency: Currency = parsed.currency === 'usd' ? 'usd' : 'eur'
    return { items, currency }
  } catch {
    return { items: [], currency: 'eur' }
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: string; quantity: number }[]>(
    () => readPersisted().items,
  )
  const [currency, setCurrency] = useState<Currency>(() => readPersisted().currency)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, currency }))
    } catch {
      // localStorage indisponible (navigation privée…) : on ignore, le panier reste en mémoire
    }
  }, [items, currency])

  const add = useCallback((productId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === productId)
      if (existing) {
        return prev.map((i) =>
          i.id === productId ? { ...i, quantity: Math.min(i.quantity + 1, 20) } : i,
        )
      }
      return [...prev, { id: productId, quantity: 1 }]
    })
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId))
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.id !== productId)
      return prev.map((i) =>
        i.id === productId ? { ...i, quantity: Math.min(quantity, 20) } : i,
      )
    })
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = items
      .map((i) => {
        const product = getProductById(i.id)
        return product ? { product, quantity: i.quantity } : null
      })
      .filter((l): l is CartLine => l !== null)
    const count = lines.reduce((acc, l) => acc + l.quantity, 0)
    const subtotal = lines.reduce((acc, l) => acc + l.product.price[currency] * l.quantity, 0)
    return {
      lines,
      count,
      subtotal,
      currency,
      setCurrency,
      add,
      remove,
      setQuantity,
      clear,
      isOpen,
      openCart,
      closeCart,
    }
  }, [items, currency, isOpen, add, remove, setQuantity, clear, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}

export { PRODUCTS }
