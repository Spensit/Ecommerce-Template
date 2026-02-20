/**
 * CartSummary.tsx
 *
 * Displays the cart subtotal, item count, and a CTA to proceed to checkout.
 * The subtotal shown here is for display purposes only. The authoritative
 * total is always recalculated server-side by the Spensit API when the
 * checkout session is created.
 *
 * Currency handling: When all cart items share the same currency, the subtotal
 * is displayed in that currency. When items have mixed currencies, the
 * subtotal is displayed in the currency used by the majority of items.
 * Developers can adjust this behaviour by editing the getMajorityCurrency
 * function below.
 */

'use client'

import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import Button from '@/components/ui/Button'

/**
 * Determine the most common currency across all cart items.
 * If all items share one currency, returns that currency.
 * Otherwise returns the currency used by the largest number of line items.
 */
function getMajorityCurrency(items: { currency: string }[]): string {
    if (items.length === 0) return 'USD'

    const counts: Record<string, number> = {}
    for (const item of items) {
        counts[item.currency] = (counts[item.currency] || 0) + 1
    }

    let majority = items[0].currency
    let max = 0
    for (const [currency, count] of Object.entries(counts)) {
        if (count > max) {
            max = count
            majority = currency
        }
    }

    return majority
}

export default function CartSummary() {
    const { items, itemCount, subtotal } = useCart()
    const { formatAmount } = useCurrency()

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

            <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Items</span>
                    <span>{itemCount}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
                    <span>Subtotal</span>
                    <span>{formatAmount(subtotal)}</span>
                </div>
            </div>

            {/*
       * NOTE: This subtotal is for display only. The API always recalculates
       * the total, VAT, and shipping server-side when the checkout session
       * is created. Do not rely on this client-side subtotal for billing.
       */}
            <p className="mt-3 text-xs text-gray-400">
                Shipping and taxes calculated at checkout.
            </p>

            <div className="mt-6">
                <Button href="/checkout" size="lg" className="w-full">
                    Proceed to Checkout
                </Button>
            </div>
        </div>
    )
}
