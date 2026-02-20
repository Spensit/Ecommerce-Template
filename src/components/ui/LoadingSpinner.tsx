/**
 * LoadingSpinner.tsx
 *
 * A centered loading indicator used as a fallback while data is being
 * fetched or a page transition is pending.
 */

interface LoadingSpinnerProps {
    /** Optional descriptive text displayed below the spinner. */
    label?: string
    className?: string
}

export default function LoadingSpinner({ label = 'Loading...', className = '' }: LoadingSpinnerProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 ${className}`} role="status">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-primary)]" />
            {label && <p className="mt-4 text-sm text-gray-500">{label}</p>}
            <span className="sr-only">{label}</span>
        </div>
    )
}
