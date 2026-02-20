/**
 * client.ts
 *
 * SpensitAPIClient class that encapsulates all communication with the Spensit
 * e-commerce API. A singleton instance is exported, pre-configured from
 * environment variables. All methods are async, return typed responses, and
 * throw descriptive errors on non-2xx status codes.
 *
 * Required env vars: NEXT_PUBLIC_API_URL, SPENSIT_API_KEY, NEXT_PUBLIC_DOMAIN, SPENSIT_BRAND_ID
 */

import type {
    ProductFilters,
    ProductsResponse,
    ProductResponse,
    CheckoutResponse,
    CustomerResponse,
    CustomerOrdersResponse,
} from './types'

class SpensitAPIClient {
    private baseUrl: string
    private headers: Record<string, string>

    constructor(config: {
        apiUrl: string
        apiKey: string
        domain: string
        brandId: string
    }) {
        this.baseUrl = config.apiUrl
        this.headers = {
            'x-api-key': config.apiKey,
            'x-domain': config.domain,
            'x-brand-id': config.brandId,
            'Content-Type': 'application/json',
        }
    }

    /**
     * Internal helper that executes a fetch request with the required headers,
     * parses the JSON response, and throws on non-2xx status codes.
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`
        const config: RequestInit = {
            ...options,
            headers: {
                ...this.headers,
                ...(options.headers as Record<string, string> | undefined),
            },
        }

        try {
            const response = await fetch(url, config)

            if (!response.ok) {
                // Attempt to extract the error message from the API response body
                const errorBody = await response.json().catch(() => ({})) as { error?: string }
                const message = errorBody.error || `API Error: ${response.status} ${response.statusText}`
                throw new Error(`[SpensitAPI ${response.status}] ${message}`)
            }

            return (await response.json()) as T
        } catch (error) {
            // Re-throw errors that we already constructed above
            if (error instanceof Error && error.message.startsWith('[SpensitAPI')) {
                throw error
            }
            // Wrap unexpected network or parsing errors
            throw new Error(
                `[SpensitAPI] Request to ${endpoint} failed: ${error instanceof Error ? error.message : String(error)}`
            )
        }
    }

    /* -----------------------------------------------------------------------
     * Product endpoints
     * -------------------------------------------------------------------- */

    /**
     * Fetch a paginated, filterable list of products.
     *
     * @param filters - Optional query parameters such as category, price range,
     *   colours, etc. See ProductFilters for the full set.
     */
    async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
        const params = new URLSearchParams()

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value))
            }
        })

        const queryString = params.toString()
        const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`

        return this.request<ProductsResponse>(endpoint)
    }

    /**
     * Fetch a single product by its unique ID.
     */
    async getProduct(id: string): Promise<ProductResponse> {
        return this.request<ProductResponse>(`/api/products/${id}`)
    }

    /* -----------------------------------------------------------------------
     * Checkout endpoint
     * -------------------------------------------------------------------- */

    /**
     * Create a new checkout session. The API validates stock, calculates all pricing
     * server-side, and creates a tempcheckout entry.
     *
     * SECURITY: Only cart_items (with product_id, color, size, quantity) and optionally
     * currency are sent. Never include price, subtotal, total_price, or vat in the request
     * body. The API ignores client-supplied pricing fields and always recalculates from
     * the database.
     *
     * @param cartItems - Array of cart items with product_id, color, size, and quantity.
     *   This allows the API to validate stock for specific variants.
     * @param currency - Optional ISO 4217 currency code to request pricing in.
     */
    async createCheckout(
        cartItems: Array<{ product_id: string; color: string | null; size: string | null; quantity: number }>,
        currency?: string
    ): Promise<CheckoutResponse> {
        const payload: { cart_items: Array<{ product_id: string; color: string | null; size: string | null; quantity: number }>; currency?: string } = {
            cart_items: cartItems,
        }
        if (currency) {
            payload.currency = currency
        }

        return this.request<CheckoutResponse>('/api/checkout', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    }

    /* -----------------------------------------------------------------------
     * Customer endpoints
     * -------------------------------------------------------------------- */

    /** Create a new customer account. */
    async createCustomer(payload: {
        customer_name: string
        email_address: string
        password?: string
        phone_number?: string
        billing_address?: string
        delivery_address?: string
        currency?: string
    }): Promise<CustomerResponse> {
        return this.request<CustomerResponse>('/api/customers', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    }

    /** Authenticate a customer. Returns customer data including customer_id. */
    async loginCustomer(emailAddress: string, password: string): Promise<CustomerResponse> {
        return this.request<CustomerResponse>('/api/customers/login', {
            method: 'POST',
            body: JSON.stringify({ email_address: emailAddress, password }),
        })
    }

    /** Fetch a paginated list of orders for a specific customer. */
    async getCustomerOrders(
        customerId: string,
        options?: {
            page?: number
            limit?: number
            status?: string
            paymentStatus?: string
        }
    ): Promise<CustomerOrdersResponse> {
        const params = new URLSearchParams()
        if (options?.page) params.append('page', String(options.page))
        if (options?.limit) params.append('limit', String(options.limit))
        if (options?.status) params.append('status', options.status)
        if (options?.paymentStatus) params.append('payment_status', options.paymentStatus)
        const qs = params.toString()
        return this.request<CustomerOrdersResponse>(
            `/api/customers/${customerId}/orders${qs ? `?${qs}` : ''}`
        )
    }

    /** Cancel a customer order by sending { action: "cancel" }. */
    async cancelOrder(
        customerId: string,
        orderId: string
    ): Promise<{ success: boolean; message?: string }> {
        return this.request(`/api/customers/${customerId}/orders/${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'cancel' }),
        })
    }
}


/* -------------------------------------------------------------------------
 * Singleton instance
 *
 * The client is instantiated once using environment variables. Server
 * components can import `spensitApi` directly. SPENSIT_API_KEY and
 * SPENSIT_BRAND_ID are server-only (no NEXT_PUBLIC_ prefix) so they are
 * never exposed to the browser bundle.
 * ---------------------------------------------------------------------- */

export const spensitApi = new SpensitAPIClient({
    apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
    apiKey: process.env.SPENSIT_API_KEY ?? '',
    domain: process.env.NEXT_PUBLIC_DOMAIN ?? '',
    brandId: process.env.SPENSIT_BRAND_ID ?? '',
})

export default SpensitAPIClient
