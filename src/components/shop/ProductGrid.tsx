/**
 * ProductGrid.tsx
 *
 * Responsive grid layout for displaying an array of ProductCard components.
 * Used on the shop page alongside the filter sidebar. Shows a message when
 * no products match the current filters.
 */

import type { Product } from '@/lib/api/types'
import ProductCard from './ProductCard'

interface ProductGridProps {
    products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-medium text-gray-900">No products found</p>
                <p className="mt-2 text-sm text-gray-500">
                    Try adjusting your filters or search terms.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}
