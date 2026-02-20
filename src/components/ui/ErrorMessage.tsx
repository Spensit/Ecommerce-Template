/**
 * ErrorMessage.tsx
 *
 * Reusable error display component with an optional retry action.
 * Used on pages and within components when API calls or other
 * operations fail.
 */

import { AlertTriangle } from 'lucide-react'
import Button from './Button'

interface ErrorMessageProps {
    /** The error message to display. */
    message: string
    /** Optional callback invoked when the user clicks the retry button. */
    onRetry?: () => void
    className?: string
}

export default function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center ${className}`}
            role="alert"
        >
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-sm text-red-700">{message}</p>
            {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Try Again
                </Button>
            )}
        </div>
    )
}
