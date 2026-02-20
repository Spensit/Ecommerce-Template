/**
 * EmptyCart.tsx
 *
 * Empty state component displayed on the cart page when no items are in
 * the cart. Includes a friendly message and a link back to the shop.
 */

import { ShoppingBag } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-500">
                Browse our collection and add some items to your cart.
            </p>
            <div className="mt-8">
                <Button href="/shop">Continue Shopping</Button>
            </div>
        </div>
    )
}
