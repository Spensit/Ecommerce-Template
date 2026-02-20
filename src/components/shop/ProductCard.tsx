'use client'

/**
 * ProductCard.tsx
 *
 * Single product card used in grids on the home page and shop page.
 * Displays the product image, name, price (with sale formatting), and status
 * badges. Price is formatted using the CurrencyContext so the correct symbol
 * is always shown (e.g. ₦ for NGN, ₵ for GHS, ৳ for BDT). If no currency
 * has been set in the context yet, falls back to the product's own currency.
 */

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/api/types'
import Badge from '@/components/ui/Badge'
import { useCurrency } from '@/context/CurrencyContext'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const { formatAmount, setCurrency, currency } = useCurrency()
    const mainImage = product.image_url || product.images?.[0] || ''

    // Seed the context with this product's currency the first time we see it,
    // so all subsequent formatAmount calls use the correct symbol.
    if (product.currency && product.currency.toUpperCase() !== currency.toUpperCase()) {
        setCurrency(product.currency as Parameters<typeof setCurrency>[0])
    }

    return (
        <Link
            href={`/products/${product.id}`}
            className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        >
            {/* Image container with consistent aspect ratio */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                {mainImage ? (
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}

                {/* Badges overlay */}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {product.is_on_sale && (
                        <Badge variant="sale">-{product.discount_percentage}%</Badge>
                    )}
                    {product.is_new && <Badge variant="new">New</Badge>}
                    {product.is_featured && <Badge variant="featured">Featured</Badge>}
                    {product.is_bestseller && <Badge variant="bestseller">Bestseller</Badge>}
                </div>
            </div>

            {/* Card body */}
            <div className="p-4">
                <h3 className="truncate text-sm font-medium text-gray-900 group-hover:text-[var(--color-primary)]">
                    {product.name}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">{product.category}</p>

                {/* Price display */}
                <div className="mt-2 flex items-center gap-2">
                    {product.is_on_sale ? (
                        <>
                            <span className="text-sm font-semibold text-[var(--color-sale)]">
                                {formatAmount(product.price)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                                {formatAmount(product.original_price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-gray-900">
                            {formatAmount(product.price)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}
