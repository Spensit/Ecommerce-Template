/**
 * CartItem.tsx
 *
 * Renders a single line item in the cart page. Displays the product image,
 * name, selected variant (color/size), a quantity stepper, remove button,
 * and line total price. Uses formatPrice with the item's own currency.
 */

'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart, type CartItem as CartItemType } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'

interface CartItemProps {
    item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart()
    const { formatAmount } = useCurrency()

    const lineTotal = item.price * item.quantity

    return (
        <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            {/* Product image */}
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
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
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <div className="mt-1 flex gap-3 text-xs text-gray-500">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                    </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                    {/* Quantity stepper */}
                    <div className="inline-flex items-center rounded-lg border border-gray-200">
                        <button
                            onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                            aria-label="Decrease quantity"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[2rem] px-2 py-1 text-center text-sm font-medium">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                            className="px-2 py-1 text-gray-500 transition-colors hover:bg-gray-50"
                            aria-label="Increase quantity"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Line total */}
                    <span className="text-sm font-semibold text-gray-900">
                        {formatAmount(lineTotal)}
                    </span>
                </div>
            </div>

            {/* Remove button */}
            <button
                onClick={() => removeItem(item.productId, item.color, item.size)}
                className="self-start rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label={`Remove ${item.name} from cart`}
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    )
}
