/**
 * HeroBanner.tsx
 *
 * Full-width hero section for the home page. Displays a headline, subheadline,
 * and a CTA button linking to the shop. All copy is sourced from config/site.ts.
 * Uses a background image with an overlay for text readability.
 */

import Link from 'next/link'
import { siteConfig } from '@/config/site'

export default function HeroBanner() {
    const { hero } = siteConfig

    return (
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gray-900">
            {/* Background image with overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${hero.backgroundImage})` }}
            >
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {hero.headline}
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg text-gray-200 sm:text-xl">
                    {hero.subheadline}
                </p>
                <div className="mt-10">
                    <Link
                        href={hero.ctaHref}
                        className="inline-flex items-center rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    >
                        {hero.ctaLabel}
                    </Link>
                </div>
            </div>
        </section>
    )
}
