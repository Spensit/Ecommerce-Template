/**
 * VariantSelector.tsx
 *
 * Renders selector groups for color and size variants on the product detail page.
 * Uses stock_by_size and stock_by_color_size from the product data to determine
 * per-variant availability. Options with zero stock are visually disabled.
 */

'use client'

import type { Product } from '@/lib/api/types'

interface VariantSelectorProps {
    product: Product
    selectedColor: string | null
    selectedSize: string | null
    onColorChange: (color: string | null) => void
    onSizeChange: (size: string | null) => void
}

export default function VariantSelector({
    product,
    selectedColor,
    selectedSize,
    onColorChange,
    onSizeChange,
}: VariantSelectorProps) {
    /** Determine available stock for a size, optionally filtered by colour. */
    function getStockForSize(size: string): number {
        if (selectedColor && product.stock_by_color_size?.[selectedColor]) {
            return product.stock_by_color_size[selectedColor][size] ?? 0
        }
        return product.stock_by_size?.[size] ?? 0
    }

    /** Check if a colour has any stock across all sizes. */
    function colorHasStock(color: string): boolean {
        if (!product.stock_by_color_size?.[color]) return true
        return Object.values(product.stock_by_color_size[color]).some((qty) => qty > 0)
    }

    // Hide selector for standalone items (no variations)
    if (product.standalone_item) {
        return null
    }

    const hasColors = product.colors && product.colors.length > 0
    const hasSizes = product.sizes_available && product.sizes_available.length > 0

    if (!hasColors && !hasSizes) return null

    return (
        <div className="space-y-6">
            {/* Color selector */}
            {hasColors && (
                <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                        Color{selectedColor ? `: ${selectedColor}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => {
                            const available = colorHasStock(color)
                            const isSelected = selectedColor === color
                            return (
                                <button
                                    key={color}
                                    onClick={() => onColorChange(isSelected ? null : color)}
                                    disabled={!available}
                                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${isSelected
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                                            : available
                                                ? 'border-gray-300 text-gray-700 hover:border-gray-400'
                                                : 'cursor-not-allowed border-gray-200 text-gray-300 line-through'
                                        }`}
                                    aria-label={`Color: ${color}${!available ? ' (out of stock)' : ''}`}
                                >
                                    {color}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Size selector */}
            {hasSizes && (
                <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                        Size{selectedSize ? `: ${selectedSize}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {product.sizes_available.map((size) => {
                            const stock = getStockForSize(size)
                            const available = stock > 0
                            const isSelected = selectedSize === size
                            return (
                                <button
                                    key={size}
                                    onClick={() => onSizeChange(isSelected ? null : size)}
                                    disabled={!available}
                                    className={`min-w-[3rem] rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${isSelected
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                                            : available
                                                ? 'border-gray-300 text-gray-700 hover:border-gray-400'
                                                : 'cursor-not-allowed border-gray-200 text-gray-300 line-through'
                                        }`}
                                    aria-label={`Size: ${size}${!available ? ' (out of stock)' : ''}`}
                                >
                                    {size}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
