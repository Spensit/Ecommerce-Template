/**
 * page.tsx (Shop)
 *
 * Shop all page server component. Reads filter values from the URL
 * searchParams, builds a ProductFilters object, and fetches matching
 * products from the Spensit API. Renders a two-column layout on desktop
 * (filter sidebar + product grid) and a single column with a filter
 * drawer on mobile.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { spensitApi } from '@/lib/api/client'
import type { ProductFilters, Product } from '@/lib/api/types'
import ProductGrid from '@/components/shop/ProductGrid'
import FilterSidebar from '@/components/shop/FilterSidebar'
import FilterDrawer from '@/components/shop/FilterDrawer'
import Pagination from '@/components/shop/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export const metadata: Metadata = {
    title: 'Shop',
    description: 'Browse our full collection of products.',
}

interface ShopPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const params = await searchParams

    // Build the filter object from URL search parameters.
    const filters: ProductFilters = {
        page: params.page ? Number(params.page) : 1,
        limit: 12,
        search: typeof params.search === 'string' ? params.search : undefined,
        category: typeof params.category === 'string' ? params.category : undefined,
        gender: typeof params.gender === 'string' ? params.gender : undefined,
        price_min: params.price_min ? Number(params.price_min) : undefined,
        price_max: params.price_max ? Number(params.price_max) : undefined,
        is_on_sale: params.is_on_sale === 'true' ? true : undefined,
        is_new: params.is_new === 'true' ? true : undefined,
        has_stock: params.has_stock === 'true' ? true : undefined,
        colors: typeof params.colors === 'string' ? params.colors : undefined,
        sizes: typeof params.sizes === 'string' ? params.sizes : undefined,
    }

    let products: Product[] = []
    let pagination = {
        page: 1,
        limit: 12,
        totalProducts: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    }

    try {
        const result = await spensitApi.getProducts(filters)
        products = result.data
        pagination = result.pagination
    } catch (error) {
        console.error('Failed to fetch shop products:', error)
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shop</h1>
                <p className="mt-2 text-sm text-gray-500">
                    {pagination.totalProducts} product{pagination.totalProducts !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Mobile filter button */}
            <div className="mb-6 md:hidden">
                <Suspense fallback={null}>
                    <FilterDrawer />
                </Suspense>
            </div>

            <div className="flex gap-8">
                {/* Desktop sidebar */}
                <div className="hidden w-64 flex-shrink-0 md:block">
                    <Suspense fallback={<LoadingSpinner label="Loading filters..." />}>
                        <FilterSidebar />
                    </Suspense>
                </div>

                {/* Product grid */}
                <div className="flex-1">
                    <ProductGrid products={products} />
                    <Suspense fallback={null}>
                        <Pagination pagination={pagination} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
