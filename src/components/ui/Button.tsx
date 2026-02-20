/**
 * Button.tsx
 *
 * Reusable button component with size and variant props. Supports rendering
 * as a button element or as an anchor tag when an href is provided.
 */

import Link from 'next/link'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseProps {
    variant?: ButtonVariant
    size?: ButtonSize
    children: ReactNode
    className?: string
}

type ButtonAsButton = BaseProps &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
        href?: never
    }

interface ButtonAsLink extends BaseProps {
    href: string
    onClick?: () => void
}

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)]',
    secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400',
    outline:
        'border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400',
    ghost:
        'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400',
    danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
}

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...rest
}: ButtonProps) {
    const base = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50`

    const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

    // Render as Link if an href is provided.
    if ('href' in rest && rest.href) {
        const { href, onClick } = rest as ButtonAsLink
        return (
            <Link href={href} className={classes} onClick={onClick}>
                {children}
            </Link>
        )
    }

    return (
        <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
            {children}
        </button>
    )
}
