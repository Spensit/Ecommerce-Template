/**
 * CartDrawer.tsx
 *
 * Slide-in cart panel that animates from the right side of the screen.
 * Contains all cart items with quantity controls, subtotal display, and
 * a "Checkout" button. When checkout is clicked, the component calls
 * POST /api/checkout with only product_ids, receives a link_id, and
 * redirects to https://spenspay.spensit.com/tempcheckout/{brand_id}/{link_id}.
 *
 * The drawer is opened globally via CartContext (openDrawer/closeDrawer).
 * It is mounted in the root layout so it is accessible from every page.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, Minus, Plus, Trash2, Loader2, Lock, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import Button from '@/components/ui/Button'

export default function CartDrawer() {
    const {
        items,
        itemCount,
        subtotal,
        isDrawerOpen,
        closeDrawer,
        updateQuantity,
        removeItem,
        clearCart,
    } = useCart()
    const { formatAmount } = useCurrency()

    const [checkoutLoading, setCheckoutLoading] = useState(false)
    const [checkoutError, setCheckoutError] = useState<string | null>(null)

    // Lock body scroll when drawer is open.
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isDrawerOpen])

    // Close on Escape key.
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && isDrawerOpen) {
                closeDrawer()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isDrawerOpen, closeDrawer])

    /**
     * Handle checkout: call the API proxy with cart items (including color/size for stock validation),
     * extract link_id, and redirect to SpensPay. Only cart_items are sent - never prices.
     */
    const handleCheckout = useCallback(async () => {
        setCheckoutLoading(true)
        setCheckoutError(null)

        try {
            // Send cart items with variant info so backend can validate stock
            const cartItems = items.map((item) => ({
                product_id: item.productId,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
            }))

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart_items: cartItems,
                    currency: displayCurrency
                }),
            })

            if (!response.ok) {
                const body = (await response.json().catch(() => ({}))) as { error?: string }
                throw new Error(body.error || `Checkout failed (${response.status})`)
            }

            const result = (await response.json()) as {
                data: { link_id: string; brand_id?: string }
            }

            const linkId = result.data.link_id
            const brandId = result.data.brand_id

            if (!linkId) {
                throw new Error('No link_id returned from the checkout API.')
            }

            if (!brandId) {
                throw new Error('No brand_id returned from the checkout API.')
            }

            // Clear the cart and redirect to SpensPay hosted checkout.
            clearCart()
            closeDrawer()
            window.location.href = `https://spenspay.spensit.com/tempcheckout/${brandId}/${linkId}`
        } catch (err) {
            setCheckoutError(
                err instanceof Error ? err.message : 'Something went wrong. Please try again.'
            )
            setCheckoutLoading(false)
        }
    }, [items, clearCart, closeDrawer])

    // Determine display currency from the first item (fallback USD).
    const displayCurrency = items.length > 0 ? items[0].currency : 'USD'

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                onClick={closeDrawer}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <div
                className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Your Cart ({itemCount})
                    </h2>
                    <button
                        onClick={closeDrawer}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Close cart"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Cart items - scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <ShoppingBag className="h-12 w-12 text-gray-300" />
                            <p className="mt-4 text-sm font-medium text-gray-900">
                                Your cart is empty
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Add items to get started.
                            </p>
                            <Button
                                href="/shop"
                                size="sm"
                                variant="outline"
                                className="mt-6"
                            >
                                Browse Shop
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div
                                    key={`${item.productId}-${item.color}-${item.size}-${index}`}
                                    className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                                No img
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                                {item.name}
                                            </h3>
                                            <div className="mt-0.5 flex gap-2 text-xs text-gray-500">
                                                {item.color && <span>{item.color}</span>}
                                                {item.color && item.size && <span>/</span>}
                                                {item.size && <span>{item.size}</span>}
                                            </div>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between">
                                            {/* Quantity stepper */}
                                            <div className="inline-flex items-center rounded border border-gray-200 bg-white">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.color,
                                                            item.size,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={item.quantity <= 1}
                                                    className="px-2 py-1 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="min-w-[1.5rem] px-1 text-center text-xs font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.color,
                                                            item.size,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Line total */}
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatAmount(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() =>
                                            removeItem(item.productId, item.color, item.size)
                                        }
                                        className="self-start rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                        aria-label={`Remove ${item.name}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - subtotal + checkout */}
                {items.length > 0 && (
                    <div className="border-t border-gray-200 px-6 py-4 space-y-4">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Subtotal</span>
                            <span className="text-lg font-semibold text-gray-900">
                                {formatAmount(subtotal)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">
                            Shipping and taxes calculated at checkout.
                        </p>

                        {/* Checkout error */}
                        {checkoutError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <p>{checkoutError}</p>
                                <button
                                    onClick={handleCheckout}
                                    className="mt-1 text-sm font-medium text-red-700 underline hover:text-red-800"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Checkout button */}
                        <Button
                            onClick={handleCheckout}
                            disabled={checkoutLoading}
                            size="lg"
                            className="w-full"
                        >
                            {checkoutLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4" />
                                    Checkout
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}
