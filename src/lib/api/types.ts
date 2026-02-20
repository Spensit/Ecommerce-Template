/**
 * types.ts
 *
 * TypeScript interfaces for all Spensit API request and response shapes.
 * These types are consumed by the API client and by components that display
 * product data. Keep this file in sync with the API documentation.
 */

/* -------------------------------------------------------------------------
 * Product
 * ---------------------------------------------------------------------- */

/** A single product returned by the Spensit API. */
export interface Product {
    id: string
    name: string
    sku: string
    description: string
    html_description?: string
    category: string
    gender: string
    price: number
    original_price: number
    currency: string
    discount_percentage: number
    is_on_sale: boolean
    is_featured: boolean
    is_new: boolean
    is_bestseller: boolean
    image_url: string
    images: string[]
    colors: string[]
    sizes_available: string[]
    stock: number
    stock_by_size: Record<string, number>
    stock_by_color_size: Record<string, Record<string, number>>
    materials: string[]
    item_weight_kg: number | null
    brand_id: string
    created_at: string
    updated_at: string
    /** Indicates if the item has no variations (e.g., a watch). When true, hide color/size selectors. */
    standalone_item?: boolean
}

/* -------------------------------------------------------------------------
 * API Responses
 * ---------------------------------------------------------------------- */

/** Pagination metadata returned alongside list endpoints. */
export interface PaginationMeta {
    page: number
    limit: number
    totalProducts: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

/** Envelope for the GET /api/products list endpoint. */
export interface ProductsResponse {
    success: boolean
    data: Product[]
    pagination: PaginationMeta
}

/** Envelope for the GET /api/products/:id endpoint. */
export interface ProductResponse {
    success: boolean
    data: Product
}

/** Cart item data sent to checkout API (includes variant info for stock validation). */
export interface CheckoutCartItem {
    product_id: string
    color: string | null
    size: string | null
    quantity: number
}

/** Data returned inside a successful checkout creation response. */
export interface CheckoutData {
    checkout_url: string
    session_id: string
    /** Unique link identifier used to construct the SpensPay redirect URL. */
    link_id: string
    /** Brand ID used to construct the SpensPay redirect URL. */
    brand_id: string
    currency: string
    subtotal: number
    vat: number
    total_price: number
}

/** Envelope for the POST /api/checkout endpoint. */
export interface CheckoutResponse {
    success: boolean
    data: CheckoutData
}

/** A single customer record returned by the Spensit API. */
export interface CustomerData {
    customer_id: string
    customer_name: string
    email_address: string
    phone_number?: string
    billing_address?: string
    delivery_address?: string
    currency?: string
    brand_id: string
    created_at?: string
}

/** Alias for CustomerData — used by CustomerContext and AccountModal. */
export type Customer = CustomerData

/** Envelope for POST /api/customers and POST /api/customers/login. */
export interface CustomerResponse {
    success: boolean
    data: CustomerData
}

/** A single order item. */
export interface OrderItem {
    product_id: string
    name: string
    quantity: number
    price: number
    color?: string | null
    size?: string | null
}

/** A single order returned by the Spensit API. */
export interface OrderData {
    id: string
    order_status: string
    payment_status: string
    total_price: number
    currency: string
    created_at: string
    items: OrderItem[]
}

/** Alias for OrderData — used by AccountModal. */
export type CustomerOrder = OrderData


/** Envelope for GET /api/customers/:id/orders. */
export interface CustomerOrdersResponse {
    success: boolean
    data: OrderData[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPreviousPage: boolean
    }
}


/* -------------------------------------------------------------------------
 * Filter / Query Parameters
 * ---------------------------------------------------------------------- */

/** All supported query parameters for the product list endpoint. */
export interface ProductFilters {
    page?: number
    limit?: number
    search?: string
    category?: string
    gender?: string
    price_min?: number
    price_max?: number
    is_featured?: boolean
    is_on_sale?: boolean
    is_new?: boolean
    has_stock?: boolean
    colors?: string
    sizes?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
}
