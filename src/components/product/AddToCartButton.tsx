/**
 * AddToCartButton.tsx
 *
 * Quantity selector and "Add to Cart" CTA for the product detail page.
 * Validates that a variant is selected (when variants exist) before allowing
 * the add action. After adding, opens the CartDrawer so the user can
 * see their updated cart and proceed to checkout directly.
 */

'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react'
import { useCart, type CartItem } from '@/context/CartContext'
import type { Product } from '@/lib/api/types'
import Button from '@/components/ui/Button'

interface AddToCartButtonProps {
    product: Product
    selectedColor: string | null
    selectedSize: string | null
    /** Maximum stock available for the currently selected variant. */
    availableStock: number
}

export default function AddToCartButton({
    product,
    selectedColor,
    selectedSize,
    availableStock,
}: AddToCartButtonProps) {
    const { addItem, openDrawer } = useCart()
    const [quantity, setQuantity] = useState(1)
    const [showSuccess, setShowSuccess] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    // For standalone items, no variant selection needed
    const isStandalone = product.standalone_item === true
    const hasColors = !isStandalone && product.colors && product.colors.length > 0
    const hasSizes = !isStandalone && product.sizes_available && product.sizes_available.length > 0

    /** Ensure quantity stays within bounds. */
    const maxQty = availableStock > 0 ? availableStock : 1
    const adjustedQty = Math.min(quantity, maxQty)

    function handleAdd() {
        // Validate variant selection when variants exist (skip for standalone items).
        if (!isStandalone) {
            if (hasColors && !selectedColor) {
                setValidationError('Please select a color.')
                return
            }
            if (hasSizes && !selectedSize) {
                setValidationError('Please select a size.')
                return
            }
        }

        setValidationError(null)

        const cartItem: CartItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            image: product.image_url || product.images?.[0] || '',
            color: selectedColor,
            size: selectedSize,
            quantity: adjustedQty,
        }

        addItem(cartItem)

        // Show brief success feedback, then open the cart drawer.
        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
            openDrawer()
        }, 400)
    }

    return (
        <div className="space-y-4">
            {/* Quantity selector */}
            <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Quantity</p>
                <div className="inline-flex items-center rounded-lg border border-gray-300">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[3rem] px-3 py-2 text-center text-sm font-medium">
                        {adjustedQty}
                    </span>
                    <button
                        onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                        className="px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        disabled={quantity >= maxQty}
                        aria-label="Increase quantity"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
                {availableStock > 0 && availableStock <= 5 && (
                    <p className="mt-1 text-xs text-amber-600">Only {availableStock} left in stock</p>
                )}
            </div>

            {/* Validation error */}
            {validationError && (
                <p className="text-sm text-red-600">{validationError}</p>
            )}

            {/* Add to Cart button */}
            <Button
                onClick={handleAdd}
                size="lg"
                className="w-full"
                disabled={availableStock === 0}
            >
                {showSuccess ? (
                    <>
                        <Check className="h-5 w-5" />
                        Added to Cart
                    </>
                ) : availableStock === 0 ? (
                    'Out of Stock'
                ) : (
                    <>
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart
                    </>
                )}
            </Button>
        </div>
    )
}
