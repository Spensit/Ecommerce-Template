/**
 * filters.ts
 *
 * Utility for converting the ProductFilters object into a URLSearchParams
 * instance suitable for both API requests and browser URL updates. Omits
 * keys with empty, null, or undefined values so the resulting query string
 * contains only active filters.
 */

import type { ProductFilters } from '@/lib/api/types'

/**
 * Build a URLSearchParams instance from a ProductFilters object,
 * stripping out any keys whose values are empty or falsy.
 *
 * @param filters - The filter state to serialise.
 * @returns A URLSearchParams ready to be appended to a URL.
 */
export function buildFilterParams(filters: ProductFilters): URLSearchParams {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value))
        }
    })

    return params
}
