/**
 * currency.ts
 *
 * Utility for formatting monetary amounts using the correct currency symbol
 * from the shared CURRENCY_SYMBOLS map. This ensures every product on the
 * site shows the proper symbol (e.g. ₦ for NGN, ₵ for GHS, ৳ for BDT)
 * rather than relying on locale-specific Intl output which may show codes.
 */

import { CURRENCY_SYMBOLS, formatAmountForCurrency } from '@/lib/currency-symbols'

/**
 * Format a numeric amount with the correct display symbol.
 *
 * @param amount   - The numeric value (e.g. 29.99).
 * @param currency - ISO 4217 currency code from the product or context (e.g. "USD", "NGN", "BDT").
 * @returns A formatted string such as "$29.99", "₦29.99", or "৳29.99".
 */
export function formatPrice(amount: number, currency: string): string {
    const code = (currency || 'USD').toUpperCase()
    const symbol = CURRENCY_SYMBOLS[code] ?? code
    const formatted = formatAmountForCurrency(Number(amount), code)
    return `${symbol}${formatted}`
}

