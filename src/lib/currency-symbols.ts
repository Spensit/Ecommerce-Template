/**
 * currency-symbols.ts
 *
 * Maps ISO 4217 currency codes to their display symbols.
 * Used by CurrencyContext to render currency symbols without
 * relying on locale-specific Intl.NumberFormat output.
 */

export type CurrencyCode = string

export type CurrencySymbols = Record<string, string>

/** Map of ISO 4217 currency code → display symbol. */
export const CURRENCY_SYMBOLS: CurrencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    HKD: 'HK$',
    NZD: 'NZ$',
    SGD: 'S$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    RON: 'lei',
    BGN: 'лв',
    HRK: 'kn',
    RSD: 'din',
    MXN: 'MX$',
    BRL: 'R$',
    ARS: '$',
    CLP: '$',
    COP: '$',
    PEN: 'S/',
    UYU: '$U',
    ZAR: 'R',
    EGP: '£',
    MAD: 'د.م.',
    NGN: '₦',
    KES: 'KSh',
    GHS: '₵',
    UGX: 'USh',
    TZS: 'TSh',
    MWK: 'MK',
    ZMW: 'ZK',
    BWP: 'P',
    MUR: '₨',
    SCR: '₨',
    MGA: 'Ar',
    KRW: '₩',
    THB: '฿',
    VND: '₫',
    IDR: 'Rp',
    MYR: 'RM',
    PHP: '₱',
    LAK: '₭',
    KHR: '៛',
    MMK: 'K',
    BND: 'B$',
    FJD: 'FJ$',
    PGK: 'K',
    INR: '₹',
    PKR: '₨',
    LKR: '₨',
    NPR: '₨',
    BTN: 'Nu',
    MVR: 'Rf',
    BDT: '৳',
    AED: 'د.إ',
    SAR: '﷼',
    QAR: '﷼',
    OMR: '﷼',
    KWD: 'د.ك',
    BHD: '.د.ب',
    JOD: 'د.ا',
    ILS: '₪',
    TRY: '₺',
    RUB: '₽',
    UAH: '₴',
    KZT: '₸',
    GEL: '₾',
    AMD: '֏',
    AZN: '₼',
    BYN: 'Br',
    MDL: 'L',
    IRR: '﷼',
    IQD: 'ع.د',
    SYP: '£',
    LBP: 'ل.ل',
    YER: '﷼',
    AFN: '؋',
    UZS: 'soʻm',
    KGS: 'с',
    TJS: 'SM',
    TMT: 'T',
    ALL: 'L',
    MKD: 'ден',
    BAM: 'KM',
}

/**
 * Return the display symbol for a given ISO 4217 currency code.
 * Falls back to the code itself when no symbol is found.
 */
export function getCurrencySymbol(code: string): string {
    return CURRENCY_SYMBOLS[code?.toUpperCase()] ?? code ?? '$'
}

/**
 * Format a numeric amount using the correct symbol and decimal rules.
 * Currency codes with no decimal places (e.g. JPY, KRW) are handled.
 */
export function formatAmountForCurrency(amount: number, code: string): string {
    const noDecimals = ['JPY', 'KRW', 'VND', 'IDR', 'UGX', 'TZS', 'MGA', 'LAK', 'KHR', 'MMK', 'BIF', 'GNF', 'PYG', 'RWF', 'XAF', 'XOF']
    const decimals = noDecimals.includes(code?.toUpperCase()) ? 0 : 2
    return amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
