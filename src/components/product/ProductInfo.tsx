'use client'

/**
 * ProductInfo.tsx
 *
 * Displays the name, price, description, and status badges for a single
 * product on the detail page. Price is formatted using the CurrencyContext
 * so the correct symbol is always shown. If no currency has been set in
 * the context yet, falls back to the product's own currency.
 */

import type { Product } from '@/lib/api/types'
import Badge from '@/components/ui/Badge'
import { useCurrency } from '@/context/CurrencyContext'

interface ProductInfoProps {
    product: Product
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const { formatAmount, setCurrency, currency } = useCurrency()

    // Seed the context currency from the product when first seen.
    if (product.currency && product.currency.toUpperCase() !== currency.toUpperCase()) {
        setCurrency(product.currency as Parameters<typeof setCurrency>[0])
    }

    return (
        <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
                {product.is_on_sale && <Badge variant="sale">Sale</Badge>}
                {product.is_new && <Badge variant="new">New</Badge>}
                {product.is_featured && <Badge variant="featured">Featured</Badge>}
                {product.is_bestseller && <Badge variant="bestseller">Bestseller</Badge>}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {product.name}
            </h1>

            {/* SKU */}
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3">
                {product.is_on_sale ? (
                    <>
                        <span className="text-2xl font-bold text-[var(--color-sale)]">
                            {formatAmount(product.price)}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                            {formatAmount(product.original_price)}
                        </span>
                        <Badge variant="sale">-{product.discount_percentage}%</Badge>
                    </>
                ) : (
                    <span className="text-2xl font-bold text-gray-900">
                        {formatAmount(product.price)}
                    </span>
                )}
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-gray-600">
                {product.html_description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.html_description }} />
                ) : (
                    <p>{product.description}</p>
                )}
            </div>

            {/* Metadata */}
            <div className="space-y-1 border-t border-gray-200 pt-4 text-sm text-gray-500">
                <p><span className="font-medium text-gray-700">Category:</span> {product.category}</p>
                <p><span className="font-medium text-gray-700">Gender:</span> {product.gender}</p>
                {product.materials && product.materials.length > 0 && (
                    <p><span className="font-medium text-gray-700">Materials:</span> {product.materials.join(', ')}</p>
                )}
                {product.item_weight_kg && (
                    <p><span className="font-medium text-gray-700">Weight:</span> {product.item_weight_kg} kg</p>
                )}
            </div>
        </div>
    )
}
