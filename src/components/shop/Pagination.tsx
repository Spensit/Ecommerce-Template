/**
 * Pagination.tsx
 *
 * URL-based pagination controls for the shop product listing. Uses query
 * parameter "page" so the browser back button works correctly and pages
 * are bookmarkable. Preserves all existing filter parameters when navigating.
 */

'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@/lib/api/types'

interface PaginationProps {
    pagination: PaginationMeta
}

export default function Pagination({ pagination }: PaginationProps) {
    const searchParams = useSearchParams()

    /** Build a URL that changes the page number while preserving other params. */
    function pageUrl(page: number): string {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))
        return `/shop?${params.toString()}`
    }

    // Do not render pagination if there is only one page.
    if (pagination.totalPages <= 1) {
        return null
    }

    return (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
            {/* Previous */}
            {pagination.hasPreviousPage ? (
                <Link
                    href={pageUrl(pagination.page - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Link>
            ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </span>
            )}

            {/* Page indicator */}
            <span className="px-4 text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
            </span>

            {/* Next */}
            {pagination.hasNextPage ? (
                <Link
                    href={pageUrl(pagination.page + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Link>
            ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">
                    Next
                    <ChevronRight className="h-4 w-4" />
                </span>
            )}
        </nav>
    )
}
