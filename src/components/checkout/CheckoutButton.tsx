/**
 * CheckoutButton.tsx
 *
 * Client component that handles the checkout flow. When clicked, it collects
 * product IDs from the cart, calls POST /api/checkout via the API client,
 * clears the cart on success, and redirects the browser to the checkout_url
 * returned by the API.
 *
 * SECURITY: Only product_ids (and optionally currency) are sent to the API.
 * Never include price, subtotal, or total_price. The API calculates all
 * pricing server-side.
 */

'use client'

import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'

export default function CheckoutButton() {
    const { items, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleCheckout() {
        setLoading(true)
        setError(null)

        try {
            // Send cart items with variant info so backend can validate stock
            const cartItems = items.map((item) => ({
                product_id: item.productId,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
            }))

            // Determine currency from cart items
            const currency = items.length > 0 ? items[0].currency : undefined

            // Call the checkout endpoint through a Next.js API route proxy to keep
            // the API key server-side. The payload contains cart_items with variant info.
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    cart_items: cartItems,
                    currency 
                }),
            })

            if (!response.ok) {
                const body = (await response.json().catch(() => ({}))) as { error?: string }
                throw new Error(body.error || `Checkout failed (${response.status})`)
            }

            const result = (await response.json()) as { 
                data: { 
                    checkout_url?: string
                    link_id?: string
                    brand_id?: string
                } 
            }

            // Use checkout_url if provided, otherwise construct from link_id and brand_id
            let redirectUrl: string
            if (result.data.checkout_url) {
                redirectUrl = result.data.checkout_url
            } else if (result.data.link_id && result.data.brand_id) {
                redirectUrl = `https://spenspay.spensit.com/tempcheckout/${result.data.brand_id}/${result.data.link_id}`
            } else {
                throw new Error('No checkout URL or link_id/brand_id returned from the checkout API.')
            }

            // Clear the cart and redirect to the hosted checkout page.
            clearCart()
            window.location.href = redirectUrl
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="space-y-3">
            <Button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                size="lg"
                className="w-full"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock className="h-4 w-4" />
                        Confirm and Pay
                    </>
                )}
            </Button>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p>{error}</p>
                    <button
                        onClick={handleCheckout}
                        className="mt-1 text-sm font-medium text-red-700 underline hover:text-red-800"
                    >
                        Try again
                    </button>
                </div>
            )}
        </div>
    )
}
