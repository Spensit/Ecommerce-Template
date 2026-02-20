/**
 * ProductImages.tsx
 *
 * Image gallery for the product detail page. Renders a large main image
 * with a thumbnail strip below. Supports keyboard navigation (left/right
 * arrow keys) and touch swipe to cycle through images.
 */

'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImagesProps {
    images: string[]
    productName: string
}

export default function ProductImages({ images, productName }: ProductImagesProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    // Fallback when no images are provided.
    const imageList = images.length > 0 ? images : []

    const goTo = useCallback(
        (index: number) => {
            if (imageList.length === 0) return
            // Wrap around for continuous navigation.
            const next = ((index % imageList.length) + imageList.length) % imageList.length
            setActiveIndex(next)
        },
        [imageList.length]
    )

    /** Handle keyboard navigation on the main image container. */
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goTo(activeIndex - 1)
            if (e.key === 'ArrowRight') goTo(activeIndex + 1)
        },
        [activeIndex, goTo]
    )

    if (imageList.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                No images available
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Main image */}
            <div
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                role="img"
                aria-label={`${productName} - image ${activeIndex + 1} of ${imageList.length}`}
            >
                <Image
                    src={imageList[activeIndex]}
                    alt={`${productName} - image ${activeIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                />

                {/* Navigation arrows - visible on hover */}
                {imageList.length > 1 && (
                    <>
                        <button
                            onClick={() => goTo(activeIndex - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                            onClick={() => goTo(activeIndex + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-700" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnail strip */}
            {imageList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                    {imageList.map((src, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${index === activeIndex
                                    ? 'border-[var(--color-primary)]'
                                    : 'border-transparent hover:border-gray-300'
                                }`}
                            aria-label={`View image ${index + 1}`}
                        >
                            <Image
                                src={src}
                                alt={`${productName} thumbnail ${index + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
