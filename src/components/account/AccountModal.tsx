/**
 * AccountModal.tsx
 *
 * Slide-in account panel (from the right, just like CartDrawer) that handles:
 *   - Login tab  → email + password → calls /api/customers/login
 *   - Register tab → name + email + password + optional fields → calls /api/customers
 *   - Orders tab  → shown after login; paginated order history with cancel button
 *
 * Session is managed through CustomerContext (persisted in localStorage).
 * The modal is mounted in the root layout and opened via CustomerContext.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    X, LogIn, UserPlus, Package, LogOut, ChevronRight,
    Loader2, AlertCircle, CheckCircle, ShoppingBag, XCircle,
} from 'lucide-react'
import { useCustomer } from '@/context/CustomerContext'
import type { CustomerOrder } from '@/lib/api/types'
import { formatPrice } from '@/lib/utils/currency'
import Button from '@/components/ui/Button'

/* -------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------- */
type Tab = 'login' | 'register' | 'orders'

/* -------------------------------------------------------------------------
 * Status badge helper
 * ---------------------------------------------------------------------- */
function OrderStatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase()
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-indigo-100 text-indigo-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        completed: 'bg-green-100 text-green-800',
    }
    const cls = styles[s] ?? 'bg-gray-100 text-gray-700'
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
            {status}
        </span>
    )
}

/* -------------------------------------------------------------------------
 * Main component
 * ---------------------------------------------------------------------- */
interface AccountModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
    const { customer, isLoading, login, register, logout } = useCustomer()

    // Auto-switch to orders when already signed in
    const [tab, setTab] = useState<Tab>(customer ? 'orders' : 'login')

    // Login form
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginError, setLoginError] = useState<string | null>(null)

    // Register form
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [regPhone, setRegPhone] = useState('')
    const [regBilling, setRegBilling] = useState('')
    const [regDelivery, setRegDelivery] = useState('')
    const [regError, setRegError] = useState<string | null>(null)
    const [regSuccess, setRegSuccess] = useState(false)

    // Orders
    const [orders, setOrders] = useState<CustomerOrder[]>([])
    const [ordersLoading, setOrdersLoading] = useState(false)
    const [ordersError, setOrdersError] = useState<string | null>(null)
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [cancelSuccess, setCancelSuccess] = useState<string | null>(null)
    const [ordersPage, setOrdersPage] = useState(1)
    const [ordersHasMore, setOrdersHasMore] = useState(false)

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    // Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    // Sync tab when customer state changes (login / logout)
    useEffect(() => {
        setTab(customer ? 'orders' : 'login')
    }, [customer])

    // Fetch orders when on the orders tab and logged in
    const fetchOrders = useCallback(async (page = 1) => {
        if (!customer) return
        setOrdersLoading(true)
        setOrdersError(null)
        try {
            const res = await fetch(
                `/api/customers/${customer.customer_id}/orders?page=${page}&limit=10`
            )
            if (!res.ok) {
                const b = (await res.json().catch(() => ({}))) as { error?: string }
                throw new Error(b.error ?? `Failed to load orders (${res.status})`)
            }
            const data = (await res.json()) as {
                data: CustomerOrder[]
                pagination: { hasNextPage: boolean }
            }
            setOrders(page === 1 ? data.data : (prev) => [...prev, ...data.data])
            setOrdersHasMore(data.pagination?.hasNextPage ?? false)
            setOrdersPage(page)
        } catch (err) {
            setOrdersError(err instanceof Error ? err.message : 'Failed to load orders')
        } finally {
            setOrdersLoading(false)
        }
    }, [customer])

    useEffect(() => {
        if (tab === 'orders' && customer) {
            fetchOrders(1)
        }
    }, [tab, customer, fetchOrders])

    // ---- Handlers ----

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoginError(null)
        try {
            await login(loginEmail, loginPassword)
            setLoginEmail('')
            setLoginPassword('')
        } catch (err) {
            setLoginError(err instanceof Error ? err.message : 'Login failed')
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        setRegError(null)
        setRegSuccess(false)
        try {
            await register({
                customer_name: regName,
                email_address: regEmail,
                password: regPassword,
                phone_number: regPhone || undefined,
                billing_address: regBilling || undefined,
                delivery_address: regDelivery || undefined,
            })
            setRegSuccess(true)
            // Auto switch to login after 1.5 s
            setTimeout(() => {
                setRegName(''); setRegEmail(''); setRegPassword('')
                setRegPhone(''); setRegBilling(''); setRegDelivery('')
                setRegSuccess(false)
                setTab('login')
            }, 1500)
        } catch (err) {
            setRegError(err instanceof Error ? err.message : 'Registration failed')
        }
    }

    async function handleCancel(orderId: string) {
        if (!customer) return
        setCancellingId(orderId)
        setCancelSuccess(null)
        try {
            const res = await fetch(
                `/api/customers/${customer.customer_id}/orders/${orderId}`,
                { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }
            )
            if (!res.ok) {
                const b = (await res.json().catch(() => ({}))) as { error?: string }
                throw new Error(b.error ?? 'Cancel failed')
            }
            setCancelSuccess(orderId)
            // Refresh orders list
            await fetchOrders(1)
            setTimeout(() => setCancelSuccess(null), 2000)
        } catch (err) {
            setOrdersError(err instanceof Error ? err.message : 'Cancel failed')
        } finally {
            setCancellingId(null)
        }
    }

    function handleLogout() {
        logout()
        onClose()
    }

    // ---- Render ----
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                role="dialog"
                aria-modal="true"
                aria-label="Account"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {customer ? `Hi, ${customer.customer_name.split(' ')[0]}` : 'My Account'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Close account panel"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs (only show when not logged in) */}
                {!customer && (
                    <div className="flex border-b border-gray-200">
                        {(['login', 'register'] as Tab[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t
                                        ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {t === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Orders tab nav when logged in */}
                {customer && (
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setTab('orders')}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${tab === 'orders'
                                    ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Package className="h-4 w-4" />
                            My Orders
                        </button>
                    </div>
                )}

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">

                    {/* ── LOGIN ── */}
                    {!customer && tab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="••••••••"
                                />
                            </div>
                            {loginError && (
                                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    {loginError}
                                </div>
                            )}
                            <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                                {isLoading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
                                ) : (
                                    <><LogIn className="h-4 w-4" />Sign In</>
                                )}
                            </Button>
                            <p className="text-center text-sm text-gray-500">
                                No account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setTab('register')}
                                    className="font-medium text-[var(--color-primary)] hover:underline"
                                >
                                    Create one
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ── REGISTER ── */}
                    {!customer && tab === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            {regSuccess && (
                                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                    Account created! Redirecting to sign in…
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Full name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Email address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Phone (optional)
                                </label>
                                <input
                                    type="tel"
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Billing address (optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={regBilling}
                                    onChange={(e) => setRegBilling(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="123 Main St, City, Country"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Delivery address (optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={regDelivery}
                                    onChange={(e) => setRegDelivery(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    placeholder="Same as billing, or different"
                                />
                            </div>
                            {regError && (
                                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    {regError}
                                </div>
                            )}
                            <Button type="submit" disabled={isLoading || regSuccess} size="lg" className="w-full">
                                {isLoading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
                                ) : (
                                    <><UserPlus className="h-4 w-4" />Create Account</>
                                )}
                            </Button>
                            <p className="text-center text-sm text-gray-500">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setTab('login')}
                                    className="font-medium text-[var(--color-primary)] hover:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ── ORDERS ── */}
                    {customer && tab === 'orders' && (
                        <div className="space-y-4">
                            {/* Account info strip */}
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                <p className="text-sm font-medium text-gray-900">{customer.customer_name}</p>
                                <p className="text-xs text-gray-500">{customer.email_address}</p>
                            </div>

                            {ordersError && (
                                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    {ordersError}
                                </div>
                            )}

                            {ordersLoading && orders.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="flex flex-col items-center py-12 text-center">
                                    <ShoppingBag className="h-10 w-10 text-gray-300" />
                                    <p className="mt-3 text-sm font-medium text-gray-700">No orders yet</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Your completed purchases will appear here.
                                    </p>
                                    <Button
                                        href="/shop"
                                        size="sm"
                                        variant="outline"
                                        className="mt-4"
                                        onClick={onClose}
                                    >
                                        Browse Shop <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-gray-400">
                                        Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
                                    </p>
                                    {orders.map((order) => {
                                        const isCancellable =
                                            !['cancelled', 'delivered', 'completed'].includes(
                                                order.order_status.toLowerCase()
                                            )
                                        return (
                                            <div
                                                key={order.id}
                                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs text-gray-400">
                                                            #{order.id.slice(0, 8).toUpperCase()}
                                                        </p>
                                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                                            {formatPrice(order.total_price, order.currency)}
                                                        </p>
                                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                            <OrderStatusBadge status={order.order_status} />
                                                            <OrderStatusBadge status={order.payment_status} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <p className="whitespace-nowrap text-xs text-gray-400">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                        {isCancellable && (
                                                            <button
                                                                onClick={() => handleCancel(order.id)}
                                                                disabled={cancellingId === order.id}
                                                                className="flex items-center gap-1 rounded text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                                                aria-label="Cancel order"
                                                            >
                                                                {cancellingId === order.id ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : cancelSuccess === order.id ? (
                                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-3 w-3" />
                                                                )}
                                                                {cancelSuccess === order.id ? 'Cancelled' : 'Cancel'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {ordersHasMore && (
                                        <Button
                                            onClick={() => fetchOrders(ordersPage + 1)}
                                            disabled={ordersLoading}
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            {ordersLoading
                                                ? <><Loader2 className="h-3 w-3 animate-spin" />Loading…</>
                                                : 'Load more orders'
                                            }
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer — Logout button when logged in */}
                {customer && (
                    <div className="border-t border-gray-200 px-6 py-4">
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                            className="w-full text-gray-600"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}
