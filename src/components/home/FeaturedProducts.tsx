/**
 * FeaturedProducts.tsx
 *
 * Grid of featured product cards displayed on the home page. Receives an
 * array of Product objects as props from the server component and renders
 * them using ProductCard. Also used for the "On Sale" section with a
 * different title prop.
 */

import type { Product } from '@/lib/api/types'
import ProductCard from '@/components/shop/ProductCard'

interface FeaturedProductsProps {
    /** Section heading displayed above the grid. */
    title: string
    /** Array of products to display. */
    products: Product[]
}

export default function FeaturedProducts({ title, products }: FeaturedProductsProps) {
    if (products.length === 0) {
        return null
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {title}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    )
}
