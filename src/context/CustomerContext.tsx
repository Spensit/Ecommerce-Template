/**
 * CustomerContext.tsx
 *
 * Global React context for customer authentication state.
 * Manages login, registration, and logout. The logged-in customer
 * is persisted to localStorage so sessions survive page refreshes.
 * API calls are proxied through Next.js API routes so the raw
 * SPENSIT_API_KEY never leaves the server.
 */

'use client'

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react'
import type { Customer } from '@/lib/api/types'

/* -------------------------------------------------------------------------
 * Context types
 * ---------------------------------------------------------------------- */

export interface CustomerContextValue {
    /** Null when no customer is logged in. */
    customer: Customer | null
    /** True while a login or register call is in-flight. */
    isLoading: boolean
    /** Login with email + password. Returns customer on success; throws on failure. */
    login: (email: string, password: string) => Promise<Customer>
    /**
     * Register a new customer account.
     * Returns the created customer on success; throws on failure.
     */
    register: (data: RegisterPayload) => Promise<Customer>
    /** Clear the session from memory and localStorage. */
    logout: () => void
}

export interface RegisterPayload {
    customer_name: string
    email_address: string
    password: string
    phone_number?: string
    billing_address?: string
    delivery_address?: string
}

/* -------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------- */

const STORAGE_KEY = 'spensit_customer'

function loadCustomer(): Customer | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as Customer) : null
    } catch {
        return null
    }
}

function saveCustomer(customer: Customer): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customer))
    } catch {
        // Ignore storage errors (private browsing, quota exceeded, etc.)
    }
}

function clearCustomer(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        // Ignore
    }
}

/* -------------------------------------------------------------------------
 * Context & Provider
 * ---------------------------------------------------------------------- */

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined)

export function CustomerProvider({ children }: { children: ReactNode }) {
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Rehydrate from localStorage on mount.
    useEffect(() => {
        const stored = loadCustomer()
        if (stored) setCustomer(stored)
    }, [])

    const login = useCallback(async (email: string, password: string): Promise<Customer> => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/customers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email_address: email, password }),
            })
            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as { error?: string }
                throw new Error(body.error || `Login failed (${res.status})`)
            }
            const result = (await res.json()) as { data: Customer }
            saveCustomer(result.data)
            setCustomer(result.data)
            return result.data
        } finally {
            setIsLoading(false)
        }
    }, [])

    const register = useCallback(async (data: RegisterPayload): Promise<Customer> => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as { error?: string }
                throw new Error(body.error || `Registration failed (${res.status})`)
            }
            const result = (await res.json()) as { data: Customer }
            // After registration auto-login so the user doesn't have to sign in again.
            return result.data
        } finally {
            setIsLoading(false)
        }
    }, [])

    const logout = useCallback(() => {
        clearCustomer()
        setCustomer(null)
    }, [])

    return (
        <CustomerContext.Provider value={{ customer, isLoading, login, register, logout }}>
            {children}
        </CustomerContext.Provider>
    )
}

/**
 * Hook to consume customer context. Must be inside a CustomerProvider.
 */
export function useCustomer(): CustomerContextValue {
    const ctx = useContext(CustomerContext)
    if (!ctx) throw new Error('useCustomer must be used within a <CustomerProvider>')
    return ctx
}
