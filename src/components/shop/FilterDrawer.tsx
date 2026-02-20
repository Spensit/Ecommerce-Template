/**
 * FilterDrawer.tsx
 *
 * Mobile slide-over drawer that wraps FilterSidebar. Opens from the left
 * when the "Filters" button is tapped on small screens. Includes an overlay
 * backdrop and a close button.
 */

'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import FilterSidebar from './FilterSidebar'

export default function FilterDrawer() {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Trigger button - only visible on mobile */}
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 md:hidden"
            >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
            </button>

            {/* Overlay + Drawer */}
            {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Drawer panel */}
                    <div className="absolute inset-y-0 left-0 w-80 max-w-full overflow-y-auto bg-white p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded p-1 text-gray-400 hover:text-gray-600"
                                aria-label="Close filters"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <FilterSidebar />
                    </div>
                </div>
            )}
        </>
    )
}
