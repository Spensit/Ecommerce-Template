/**
 * FilterSidebar.tsx
 *
 * Sidebar with all product filter controls for the shop page. Each control
 * updates the URL query string so that filters are bookmarkable and shareable.
 * This component is used directly on desktop and wrapped in FilterDrawer on mobile.
 *
 * Supported filters: search, category, gender, price range, on sale, new arrivals,
 * colors, sizes, and in-stock-only.
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Button from '@/components/ui/Button'

/** Predefined category options. Extend this list as your catalogue grows. */
const CATEGORIES = ['T-Shirts', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories']

/** Gender filter options. */
const GENDERS = ['All', 'Men', 'Women', 'Unisex']

/** Common colour options. Extend as needed. */
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Navy', 'Grey', 'Pink', 'Brown', 'Beige']

/** Common size options. */
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

interface FilterSidebarProps {
    className?: string
}

export default function FilterSidebar({ className = '' }: FilterSidebarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    /**
     * Update one or more query parameters while preserving the rest.
     * Passing an empty string removes the parameter.
     */
    const updateParams = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString())

            Object.entries(updates).forEach(([key, value]) => {
                if (value === '') {
                    params.delete(key)
                } else {
                    params.set(key, value)
                }
            })

            // Reset to page 1 when filters change.
            params.delete('page')
            router.push(`/shop?${params.toString()}`)
        },
        [router, searchParams]
    )

    const clearAll = useCallback(() => {
        router.push('/shop')
    }, [router])

    // Read current values from the URL.
    const currentSearch = searchParams.get('search') || ''
    const currentCategory = searchParams.get('category') || ''
    const currentGender = searchParams.get('gender') || 'All'
    const currentPriceMin = searchParams.get('price_min') || ''
    const currentPriceMax = searchParams.get('price_max') || ''
    const currentOnSale = searchParams.get('is_on_sale') === 'true'
    const currentIsNew = searchParams.get('is_new') === 'true'
    const currentHasStock = searchParams.get('has_stock') === 'true'
    const currentColors = searchParams.get('colors')?.split(',').filter(Boolean) || []
    const currentSizes = searchParams.get('sizes')?.split(',').filter(Boolean) || []

    /** Toggle a value in a comma-separated list parameter. */
    function toggleListParam(paramName: string, value: string, currentList: string[]) {
        const next = currentList.includes(value)
            ? currentList.filter((v) => v !== value)
            : [...currentList, value]
        updateParams({ [paramName]: next.join(',') })
    }

    return (
        <aside className={`space-y-6 ${className}`}>
            {/* Search */}
            <div>
                <label htmlFor="filter-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Search
                </label>
                <input
                    id="filter-search"
                    type="text"
                    placeholder="Search products..."
                    defaultValue={currentSearch}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            updateParams({ search: (e.target as HTMLInputElement).value })
                        }
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                />
            </div>

            {/* Category */}
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Category</p>
                <div className="space-y-1.5">
                    {CATEGORIES.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={currentCategory === cat}
                                onChange={() => updateParams({ category: currentCategory === cat ? '' : cat })}
                                className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            />
                            {cat}
                        </label>
                    ))}
                </div>
            </div>

            {/* Gender */}
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Gender</p>
                <div className="space-y-1.5">
                    {GENDERS.map((g) => (
                        <label key={g} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                checked={currentGender === g}
                                onChange={() => updateParams({ gender: g === 'All' ? '' : g })}
                                className="h-4 w-4 border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            />
                            {g}
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Price Range</p>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        defaultValue={currentPriceMin}
                        onBlur={(e) => updateParams({ price_min: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        defaultValue={currentPriceMax}
                        onBlur={(e) => updateParams({ price_max: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    />
                </div>
            </div>

            {/* Toggles */}
            <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={currentOnSale}
                        onChange={() => updateParams({ is_on_sale: currentOnSale ? '' : 'true' })}
                        className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    On Sale
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={currentIsNew}
                        onChange={() => updateParams({ is_new: currentIsNew ? '' : 'true' })}
                        className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    New Arrivals
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={currentHasStock}
                        onChange={() => updateParams({ has_stock: currentHasStock ? '' : 'true' })}
                        className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    In Stock Only
                </label>
            </div>

            {/* Colors */}
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Colors</p>
                <div className="flex flex-wrap gap-1.5">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => toggleListParam('colors', color, currentColors)}
                            className={`rounded-full border px-3 py-1 text-xs transition-colors ${currentColors.includes(color)
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                }`}
                        >
                            {color}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Sizes</p>
                <div className="flex flex-wrap gap-1.5">
                    {SIZES.map((size) => (
                        <button
                            key={size}
                            onClick={() => toggleListParam('sizes', size, currentSizes)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${currentSizes.includes(size)
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clear All */}
            <Button variant="outline" size="sm" onClick={clearAll} className="w-full">
                Clear All Filters
            </Button>
        </aside>
    )
}
