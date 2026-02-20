/**
 * SaleBanner.tsx
 *
 * Full-width promotional banner strip displayed between product sections
 * on the home page. All copy is sourced from config/site.ts.
 */

import Link from 'next/link'
import { siteConfig } from '@/config/site'

export default function SaleBanner() {
    const { saleBanner } = siteConfig

    return (
        <section className="bg-[var(--color-primary)] py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6 lg:px-8">
                <p className="text-lg font-semibold text-white sm:text-xl">
                    {saleBanner.copy}
                </p>
                <Link
                    href={saleBanner.ctaHref}
                    className="inline-flex items-center whitespace-nowrap rounded-lg border-2 border-white px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
                >
                    {saleBanner.ctaLabel}
                </Link>
            </div>
        </section>
    )
}
