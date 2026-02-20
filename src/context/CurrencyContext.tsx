'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CURRENCY_SYMBOLS, formatAmountForCurrency, type CurrencySymbols } from '@/lib/currency-symbols';

export type Currency = 'USD' | 'AUD' | 'BDT' | 'EUR' | 'GBP' | 'CAD' | 'JPY' | 'INR' | 'SGD' | 'CNY' | 'HKD' | 'NZD' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'HRK' | 'RSD' | 'MXN' | 'BRL' | 'ARS' | 'CLP' | 'COP' | 'PEN' | 'UYU' | 'ZAR' | 'EGP' | 'MAD' | 'NGN' | 'KES' | 'GHS' | 'UGX' | 'TZS' | 'MWK' | 'ZMW' | 'BWP' | 'MUR' | 'SCR' | 'MGA' | 'KRW' | 'THB' | 'VND' | 'IDR' | 'MYR' | 'PHP' | 'LAK' | 'KHR' | 'MMK' | 'BND' | 'FJD' | 'PGK' | 'SBD' | 'TOP' | 'VUV' | 'WST' | 'TVD' | 'KID' | 'AED' | 'SAR' | 'QAR' | 'OMR' | 'KWD' | 'BHD' | 'JOD' | 'ILS' | 'TRY' | 'RUB' | 'UAH' | 'KZT' | 'UZS' | 'KGS' | 'TJS' | 'TMT' | 'AFN' | 'PKR' | 'LKR' | 'NPR' | 'BTN' | 'MVR' | 'IRR' | 'IQD' | 'SYP' | 'LBP' | 'YER' | 'GEL' | 'AMD' | 'AZN' | 'BYN' | 'MDL' | 'ALL' | 'MKD' | 'BAM' | 'RSD' | 'EUR';

// Re-export for backward compatibility
export { CURRENCY_SYMBOLS } from '@/lib/currency-symbols';
export type { CurrencySymbols, CurrencyCode } from '@/lib/currency-symbols';

export const CURRENCY_OPTIONS = [
  // Major currencies
  { value: 'USD' as Currency, label: 'USD - US Dollar', symbol: '$', category: 'Major' },
  { value: 'EUR' as Currency, label: 'EUR - Euro', symbol: '€', category: 'Major' },
  { value: 'GBP' as Currency, label: 'GBP - British Pound', symbol: '£', category: 'Major' },
  { value: 'JPY' as Currency, label: 'JPY - Japanese Yen', symbol: '¥', category: 'Major' },
  { value: 'AUD' as Currency, label: 'AUD - Australian Dollar', symbol: 'A$', category: 'Major' },
  { value: 'CAD' as Currency, label: 'CAD - Canadian Dollar', symbol: 'C$', category: 'Major' },
  { value: 'CHF' as Currency, label: 'CHF - Swiss Franc', symbol: 'CHF', category: 'Major' },
  { value: 'CNY' as Currency, label: 'CNY - Chinese Yuan', symbol: '¥', category: 'Major' },

  // Asian currencies
  { value: 'BDT' as Currency, label: 'BDT - Bangladeshi Taka', symbol: '৳', category: 'Asian' },
  { value: 'INR' as Currency, label: 'INR - Indian Rupee', symbol: '₹', category: 'Asian' },
  { value: 'SGD' as Currency, label: 'SGD - Singapore Dollar', symbol: 'S$', category: 'Asian' },
  { value: 'HKD' as Currency, label: 'HKD - Hong Kong Dollar', symbol: 'HK$', category: 'Asian' },
  { value: 'KRW' as Currency, label: 'KRW - South Korean Won', symbol: '₩', category: 'Asian' },
  { value: 'THB' as Currency, label: 'THB - Thai Baht', symbol: '฿', category: 'Asian' },
  { value: 'VND' as Currency, label: 'VND - Vietnamese Dong', symbol: '₫', category: 'Asian' },
  { value: 'IDR' as Currency, label: 'IDR - Indonesian Rupiah', symbol: 'Rp', category: 'Asian' },
  { value: 'MYR' as Currency, label: 'MYR - Malaysian Ringgit', symbol: 'RM', category: 'Asian' },
  { value: 'PHP' as Currency, label: 'PHP - Philippine Peso', symbol: '₱', category: 'Asian' },
  { value: 'PKR' as Currency, label: 'PKR - Pakistani Rupee', symbol: '₨', category: 'Asian' },
  { value: 'LKR' as Currency, label: 'LKR - Sri Lankan Rupee', symbol: '₨', category: 'Asian' },

  // European currencies
  { value: 'SEK' as Currency, label: 'SEK - Swedish Krona', symbol: 'kr', category: 'European' },
  { value: 'NOK' as Currency, label: 'NOK - Norwegian Krone', symbol: 'kr', category: 'European' },
  { value: 'DKK' as Currency, label: 'DKK - Danish Krone', symbol: 'kr', category: 'European' },
  { value: 'PLN' as Currency, label: 'PLN - Polish Złoty', symbol: 'zł', category: 'European' },
  { value: 'CZK' as Currency, label: 'CZK - Czech Koruna', symbol: 'Kč', category: 'European' },
  { value: 'HUF' as Currency, label: 'HUF - Hungarian Forint', symbol: 'Ft', category: 'European' },
  { value: 'TRY' as Currency, label: 'TRY - Turkish Lira', symbol: '₺', category: 'European' },
  { value: 'RUB' as Currency, label: 'RUB - Russian Ruble', symbol: '₽', category: 'European' },

  // Middle Eastern currencies
  { value: 'AED' as Currency, label: 'AED - UAE Dirham', symbol: 'د.إ', category: 'Middle East' },
  { value: 'SAR' as Currency, label: 'SAR - Saudi Riyal', symbol: '﷼', category: 'Middle East' },
  { value: 'QAR' as Currency, label: 'QAR - Qatari Riyal', symbol: '﷼', category: 'Middle East' },
  { value: 'KWD' as Currency, label: 'KWD - Kuwaiti Dinar', symbol: 'د.ك', category: 'Middle East' },
  { value: 'BHD' as Currency, label: 'BHD - Bahraini Dinar', symbol: '.د.ب', category: 'Middle East' },
  { value: 'JOD' as Currency, label: 'JOD - Jordanian Dinar', symbol: 'د.ا', category: 'Middle East' },
  { value: 'ILS' as Currency, label: 'ILS - Israeli Shekel', symbol: '₪', category: 'Middle East' },

  // African currencies
  { value: 'ZAR' as Currency, label: 'ZAR - South African Rand', symbol: 'R', category: 'African' },
  { value: 'EGP' as Currency, label: 'EGP - Egyptian Pound', symbol: '£', category: 'African' },
  { value: 'NGN' as Currency, label: 'NGN - Nigerian Naira', symbol: '₦', category: 'African' },
  { value: 'KES' as Currency, label: 'KES - Kenyan Shilling', symbol: 'KSh', category: 'African' },
  { value: 'GHS' as Currency, label: 'GHS - Ghanaian Cedi', symbol: '₵', category: 'African' },
  { value: 'MAD' as Currency, label: 'MAD - Moroccan Dirham', symbol: 'د.م.', category: 'African' },

  // American currencies
  { value: 'MXN' as Currency, label: 'MXN - Mexican Peso', symbol: '$', category: 'American' },
  { value: 'BRL' as Currency, label: 'BRL - Brazilian Real', symbol: 'R$', category: 'American' },
  { value: 'ARS' as Currency, label: 'ARS - Argentine Peso', symbol: '$', category: 'American' },
  { value: 'CLP' as Currency, label: 'CLP - Chilean Peso', symbol: '$', category: 'American' },
  { value: 'COP' as Currency, label: 'COP - Colombian Peso', symbol: '$', category: 'American' },
  { value: 'PEN' as Currency, label: 'PEN - Peruvian Sol', symbol: 'S/', category: 'American' },

  // Other currencies
  { value: 'NZD' as Currency, label: 'NZD - New Zealand Dollar', symbol: 'NZ$', category: 'Other' }
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getCurrencySymbol: () => string;
  formatAmount: (amount: number) => string;
  isLoading: boolean;
  updateBrandCurrency: (brandId: string, currency: Currency) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  brandId?: string;
  defaultCurrency?: string;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
  children,
  brandId,
  defaultCurrency
}) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [isLoading, setIsLoading] = useState(true);

  // Load currency from brand or fallback to localStorage
  useEffect(() => {
    const initializeCurrency = () => {
      try {
        if (defaultCurrency && Object.keys(CURRENCY_SYMBOLS).includes(defaultCurrency)) {
          setCurrencyState(defaultCurrency as Currency);
        } else {
          // Fallback to localStorage for backward compatibility
          const savedCurrency = localStorage.getItem('app-currency') as Currency;
          if (savedCurrency && Object.keys(CURRENCY_SYMBOLS).includes(savedCurrency)) {
            setCurrencyState(savedCurrency);
          }
        }
      } catch (error) {
        console.error('Error initializing currency:', error);
        setCurrencyState('USD'); // Default fallback
      } finally {
        setIsLoading(false);
      }
    };

    initializeCurrency();
  }, [defaultCurrency]);

  // Save currency to localStorage when it changes (for backward compatibility)
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('app-currency', newCurrency);
    } catch (error) {
      console.error('Error saving currency to localStorage:', error);
    }
  };

  // updateBrandCurrency is kept in the interface for forward-compatibility but
  // does nothing unless a server-side Supabase integration is wired up.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateBrandCurrency = async (_brandId: string, _currency: Currency): Promise<void> => {
    // No-op: implement using your own Supabase/API integration if needed.
    console.warn('updateBrandCurrency: not implemented in this build.');
  };

  const getCurrencySymbol = () => {
    const code = currency?.toUpperCase?.() ?? 'USD';
    return CURRENCY_SYMBOLS[code] ?? CURRENCY_SYMBOLS['USD'] ?? '$';
  };

  const formatAmount = (amount: number) => {
    const code = currency?.toUpperCase?.() ?? 'USD';
    const symbol = CURRENCY_SYMBOLS[code] ?? CURRENCY_SYMBOLS['USD'] ?? '$';
    const formatted = formatAmountForCurrency(Number(amount), code);
    return `${symbol}${formatted}`;
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    getCurrencySymbol,
    formatAmount,
    isLoading,
    updateBrandCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};            