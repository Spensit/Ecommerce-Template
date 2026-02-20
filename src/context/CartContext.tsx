/**
 * CartContext.tsx
 *
 * Provides global cart state using React Context and useReducer. The cart is
 * persisted to localStorage under the key "spensit_cart" and rehydrated on
 * mount. Also manages the cart drawer open/close state so any component can
 * trigger the slide-in panel. All components that need to read or modify
 * cart state should consume the CartContext via the useCart() hook.
 */

'use client'

import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
    useState,
    type ReactNode,
} from 'react'

/* -------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------- */

/** Shape of a single item in the cart. */
export interface CartItem {
    productId: string
    name: string
    price: number
    /** ISO 4217 currency code from the product - required for price display. */
    currency: string
    image: string
    color: string | null
    size: string | null
    quantity: number
}

/** All possible actions the cart reducer can handle. */
type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: { productId: string; color: string | null; size: string | null } }
    | { type: 'UPDATE_QUANTITY'; payload: { productId: string; color: string | null; size: string | null; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'HYDRATE'; payload: CartItem[] }

/** Values exposed through the CartContext to consumer components. */
export interface CartContextValue {
    items: CartItem[]
    /** Total number of individual units across all line items. */
    itemCount: number
    /** Sum of price * quantity for every line item (display only). */
    subtotal: number
    addItem: (item: CartItem) => void
    removeItem: (productId: string, color: string | null, size: string | null) => void
    updateQuantity: (productId: string, color: string | null, size: string | null, quantity: number) => void
    clearCart: () => void
    /** Whether the cart drawer slide-in panel is currently open. */
    isDrawerOpen: boolean
    /** Open the cart drawer. */
    openDrawer: () => void
    /** Close the cart drawer. */
    closeDrawer: () => void
}

/* -------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------- */

const STORAGE_KEY = 'spensit_cart'

/**
 * Check whether two cart entries refer to the same product+variant combination.
 * A match requires identical productId, color, and size.
 */
function isSameVariant(
    a: { productId: string; color: string | null; size: string | null },
    b: { productId: string; color: string | null; size: string | null }
): boolean {
    return a.productId === b.productId && a.color === b.color && a.size === b.size
}

/** Persist the cart array to localStorage. */
function persistCart(items: CartItem[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
        // localStorage may be unavailable in SSR or private browsing contexts.
    }
}

/** Load the cart array from localStorage, returning an empty array on failure. */
function loadCart(): CartItem[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored) as CartItem[]
        }
    } catch {
        // Unable to parse - fall back to empty cart.
    }
    return []
}

/* -------------------------------------------------------------------------
 * Reducer
 * ---------------------------------------------------------------------- */

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.findIndex((item) => isSameVariant(item, action.payload))
            if (existing >= 0) {
                // Deduplicate: increment quantity of matching line item.
                const updated = [...state]
                updated[existing] = {
                    ...updated[existing],
                    quantity: updated[existing].quantity + action.payload.quantity,
                }
                return updated
            }
            return [...state, action.payload]
        }

        case 'REMOVE_ITEM':
            return state.filter((item) => !isSameVariant(item, action.payload))

        case 'UPDATE_QUANTITY':
            return state.map((item) =>
                isSameVariant(item, action.payload)
                    ? { ...item, quantity: Math.max(1, action.payload.quantity) }
                    : item
            )

        case 'CLEAR_CART':
            return []

        case 'HYDRATE':
            return action.payload

        default:
            return state
    }
}

/* -------------------------------------------------------------------------
 * Context & Provider
 * ---------------------------------------------------------------------- */

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, dispatch] = useReducer(cartReducer, [])
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Rehydrate from localStorage on initial mount.
    useEffect(() => {
        const stored = loadCart()
        if (stored.length > 0) {
            dispatch({ type: 'HYDRATE', payload: stored })
        }
    }, [])

    // Persist to localStorage whenever items change (skip first render).
    useEffect(() => {
        persistCart(items)
    }, [items])

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const addItem = useCallback(
        (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item }),
        []
    )

    const removeItem = useCallback(
        (productId: string, color: string | null, size: string | null) =>
            dispatch({ type: 'REMOVE_ITEM', payload: { productId, color, size } }),
        []
    )

    const updateQuantity = useCallback(
        (productId: string, color: string | null, size: string | null, quantity: number) =>
            dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, color, size, quantity } }),
        []
    )

    const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])
    const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
    const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                isDrawerOpen,
                openDrawer,
                closeDrawer,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

/**
 * Hook to consume the cart context. Must be used within a CartProvider.
 * Throws a descriptive error if used outside the provider tree.
 */
export function useCart(): CartContextValue {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a <CartProvider>. Wrap your app in CartProvider.')
    }
    return context
}
