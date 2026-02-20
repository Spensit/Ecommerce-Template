/**
 * Footer.tsx
 *
 * Site-wide footer displaying navigation links, brand information, and
 * legal text. All copy is sourced from config/site.ts so the developer
 * can rebrand by editing a single file.
 */

import Link from 'next/link'
import { siteConfig } from '@/config/site'

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="text-lg font-bold text-gray-900">
                            {siteConfig.name}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">{siteConfig.tagline}</p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex gap-6" aria-label="Footer navigation">
                        {siteConfig.footer.links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-gray-500 transition-colors hover:text-gray-700"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Legal */}
                <div className="mt-8 border-t border-gray-200 pt-6 text-center">
                    <p className="text-xs text-gray-400">{siteConfig.footer.legal}</p>
                </div>
            </div>
        </footer>
    )
}
