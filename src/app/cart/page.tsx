/**
 * page.tsx (Cart)
 *
 * Cart review page. Client component that reads items from CartContext and
 * displays each line item with quantity controls alongside an order summary.
 * Shows the empty cart state when no items are present. The "Checkout"
 * button opens the CartDrawer which handles the actual checkout flow.
 */

'use client'

import { useCart } from '@/context/CartContext'
import CartItemComponent from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'
import EmptyCart from '@/components/cart/EmptyCart'

export default function CartPage() {
    const { items } = useCart()

    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <EmptyCart />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Cart items */}
                <div className="space-y-4 lg:col-span-2">
                    {items.map((item, index) => (
                        <CartItemComponent
                            key={`${item.productId}-${item.color}-${item.size}-${index}`}
                            item={item}
                        />
                    ))}
                </div>

                {/* Summary sidebar */}
                <div>
                    <CartSummary />
                </div>
            </div>
        </div>
    )
}
