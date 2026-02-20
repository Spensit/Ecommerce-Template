/**
 * ProductDetailClient.tsx
 *
 * Client wrapper for the product detail page. Manages variant selection state
 * (colour and size) and calculates available stock for the selected combination.
 * Passes these down to AddToCartButton.
 */

'use client'

import { useState, useMemo } from 'react'
import type { Product } from '@/lib/api/types'
import ProductImages from '@/components/product/ProductImages'
import ProductInfo from '@/components/product/ProductInfo'
import VariantSelector from '@/components/product/VariantSelector'
import AddToCartButton from '@/components/product/AddToCartButton'

interface ProductDetailClientProps {
    product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)

    /**
     * Calculate the available stock for the currently selected variant.
     * Priority: stock_by_color_size > stock_by_size > total stock.
     * For standalone items, always use the total stock.
     */
    const availableStock = useMemo(() => {
        // Standalone items: no variations, use total stock
        if (product.standalone_item) {
            return product.stock ?? 0
        }

        // Regular items with variations
        if (selectedColor && selectedSize && product.stock_by_color_size?.[selectedColor]) {
            return product.stock_by_color_size[selectedColor][selectedSize] ?? 0
        }
        if (selectedSize && product.stock_by_size) {
            return product.stock_by_size[selectedSize] ?? 0
        }
        // No variant selected or no variant-level stock data: use total stock.
        return product.stock ?? 0
    }, [selectedColor, selectedSize, product])

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Left column: Image gallery */}
                <ProductImages images={product.images} productName={product.name} />

                {/* Right column: Product info, variant selector, add-to-cart */}
                <div className="space-y-8">
                    <ProductInfo product={product} />
                    <VariantSelector
                        product={product}
                        selectedColor={selectedColor}
                        selectedSize={selectedSize}
                        onColorChange={setSelectedColor}
                        onSizeChange={setSelectedSize}
                    />
                    <AddToCartButton
                        product={product}
                        selectedColor={selectedColor}
                        selectedSize={selectedSize}
                        availableStock={availableStock}
                    />
                </div>
            </div>
        </div>
    )
}
