/**
 * Navbar.tsx
 *
 * Site-wide navigation bar. Displays the store name/logo, navigation links,
 * a user account link (opens myorders.spensit.com in a new tab), and a cart
 * icon with a live item count badge that opens the CartDrawer.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X, UserCircle2 } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { useCart } from '@/context/CartContext'

const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID ?? ''
const ACCOUNT_URL = `https://myorders.spensit.com/login/${BRAND_ID}`

export default function Navbar() {
    const { itemCount, openDrawer } = useCart()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo / Store Name */}
                <Link
                    href="/"
                    className="text-xl font-bold tracking-tight text-gray-900 hover:text-[var(--color-primary)] transition-colors"
                >
                    {siteConfig.name}
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-6 md:flex">
                    {siteConfig.nav.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Account link → myorders.spensit.com */}
                    <a
                        href={ACCOUNT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg p-1.5 text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                        aria-label="My account & orders"
                    >
                        <UserCircle2 className="h-5 w-5" />
                        <span className="text-xs font-medium">Account</span>
                    </a>

                    {/* Cart icon — opens CartDrawer */}
                    <button
                        onClick={openDrawer}
                        className="relative p-2 text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded"
                        aria-label={`Shopping cart with ${itemCount} items`}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {itemCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                                {itemCount > 99 ? '99+' : itemCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Mobile: Account + Cart + Hamburger */}
                <div className="flex items-center gap-3 md:hidden">
                    <a
                        href={ACCOUNT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-600"
                        aria-label="My account & orders"
                    >
                        <UserCircle2 className="h-5 w-5" />
                    </a>
                    <button
                        onClick={openDrawer}
                        className="relative p-2 text-gray-600"
                        aria-label={`Shopping cart with ${itemCount} items`}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {itemCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                                {itemCount > 99 ? '99+' : itemCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-gray-600"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="border-t border-gray-100 bg-white md:hidden">
                    <div className="space-y-1 px-4 py-3">
                        {siteConfig.nav.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href={ACCOUNT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                            My Account
                        </a>
                    </div>
                </div>
            )}
        </header>
    )
}
