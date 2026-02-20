/**
 * Badge.tsx
 *
 * Reusable badge component for labelling products with tags such as
 * "Sale", "New", "Featured", or "Bestseller". Accepts a variant prop
 * to control the visual style.
 */

import type { ReactNode } from 'react'

type BadgeVariant = 'sale' | 'new' | 'featured' | 'bestseller' | 'default'

interface BadgeProps {
    variant?: BadgeVariant
    children: ReactNode
    className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
    sale: 'bg-red-500 text-white',
    new: 'bg-emerald-500 text-white',
    featured: 'bg-blue-500 text-white',
    bestseller: 'bg-amber-500 text-white',
    default: 'bg-gray-200 text-gray-700',
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
    return (
        <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${variantClasses[variant]} ${className}`}
        >
            {children}
        </span>
    )
}
