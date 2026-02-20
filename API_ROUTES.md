# API Routes Reference — Spensit E-Commerce

Complete reference for all Next.js API routes in this application. Every route
is a **server-side proxy** that forwards requests to the upstream Spensit API
while keeping `SPENSIT_API_KEY` and `SPENSIT_BRAND_ID` out of the browser
bundle.

---

## Table of Contents

1. [Authentication & Headers](#1-authentication--headers)
2. [Environment Variables](#2-environment-variables)
3. [GET /api/products](#3-get-apiproducts)
4. [GET /api/products/:id](#4-get-apiproductsid)
5. [POST /api/checkout](#5-post-apicheckout)
6. [POST /api/customers](#6-post-apicustomers)
7. [POST /api/customers/login](#7-post-apicustomerslogin)
8. [GET /api/customers/:customerId/orders](#8-get-apicustomerscustomeridorders)
9. [PATCH /api/customers/:customerId/orders/:orderId](#9-patch-apicustomerscustomeridordersorderid)
10. [Common Error Responses](#10-common-error-responses)
11. [SpensPay Redirect](#11-spenspay-redirect)
12. [Data Types Reference](#12-data-types-reference)

---

## 1. Authentication & Headers

All calls to the **upstream Spensit API** (from the Next.js server side) require
the three headers below. They are set once on the `SpensitAPIClient` singleton
in `src/lib/api/client.ts` and are **never exposed to the browser**.

| Header | Value | Source |
|---|---|---|
| `x-api-key` | Your API key | `SPENSIT_API_KEY` (server-only env var) |
| `x-domain` | Your authorised domain | `NEXT_PUBLIC_DOMAIN` |
| `x-brand-id` | Your brand UUID | `SPENSIT_BRAND_ID` (server-only env var) |
| `Content-Type` | `application/json` | hardcoded |

> [!IMPORTANT]
> Calls from **browser → Next.js route** do **not** need these headers. The
> proxy adds them automatically. Never send `x-api-key` from the browser.

---

## 2. Environment Variables

| Variable | Exposed to browser | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | ✅ | Base URL of the Spensit API (e.g. `https://api.spensit.com`) |
| `NEXT_PUBLIC_DOMAIN` | ✅ Yes | ✅ | Your site's domain (e.g. `mystore.com`) |
| `NEXT_PUBLIC_BRAND_ID` | ✅ Yes | ✅ | Brand UUID — used by the Navbar account link |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | ✅ Yes | ⬜ Optional | Default ISO 4217 code to seed the CurrencyContext (e.g. `USD`) |
| `SPENSIT_API_KEY` | ❌ No | ✅ | API key — server only, never in `NEXT_PUBLIC_*` |
| `SPENSIT_BRAND_ID` | ❌ No | ✅ | Brand UUID forwarded in `x-brand-id` header — server only |

`.env.local` example:

```env
NEXT_PUBLIC_API_URL=https://api.spensit.com
NEXT_PUBLIC_DOMAIN=mystore.com
NEXT_PUBLIC_BRAND_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_DEFAULT_CURRENCY=USD

SPENSIT_API_KEY=sk_live_your_key_here
SPENSIT_BRAND_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 3. GET /api/products

**Source file:** `src/app/api/` — this endpoint is **not a Next.js route file**.
The `SpensitAPIClient.getProducts()` method is called directly from server
components (RSC) using the singleton. There is no `/api/products/route.ts` in
this project; requests hit the Spensit API directly from server components.

### Query Parameters

All parameters are optional.

| Parameter | Type | Description |
|---|---|---|
| `page` | `number` | Page number (default: `1`) |
| `limit` | `number` | Items per page (default: `20`, max: `100`) |
| `search` | `string` | Full-text search across name, description, SKU |
| `category` | `string` | Filter by category (e.g. `T-Shirts`, `Tops`, `Bottoms`) |
| `gender` | `string` | Filter by gender (`Men`, `Women`, `Unisex`) |
| `price_min` | `number` | Minimum price (inclusive) |
| `price_max` | `number` | Maximum price (inclusive) |
| `is_featured` | `boolean` | `true` to return only featured products |
| `is_on_sale` | `boolean` | `true` to return only sale products |
| `is_new` | `boolean` | `true` to return only new-arrival products |
| `has_stock` | `boolean` | `true` to exclude out-of-stock products |
| `colors` | `string` | Comma-separated colour names (e.g. `Red,Blue`) |
| `sizes` | `string` | Comma-separated sizes (e.g. `S,M,L`) |
| `sort_by` | `string` | Field to sort by (e.g. `price`, `created_at`) |
| `sort_order` | `"asc"` \| `"desc"` | Sort direction (default: `asc`) |

### Success Response `200`

```jsonc
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Classic White Tee",
      "sku": "CWT-001",
      "description": "Plain description text",
      "html_description": "<p>Rich HTML description</p>",
      "category": "T-Shirts",
      "gender": "Unisex",
      "price": 29.99,
      "original_price": 49.99,
      "currency": "USD",
      "discount_percentage": 40,
      "is_on_sale": true,
      "is_featured": false,
      "is_new": true,
      "is_bestseller": false,
      "image_url": "https://cdn.example.com/img.jpg",
      "images": ["https://cdn.example.com/img.jpg", "https://cdn.example.com/img2.jpg"],
      "colors": ["White", "Black"],
      "sizes_available": ["XS", "S", "M", "L", "XL"],
      "stock": 42,
      "stock_by_size": { "S": 10, "M": 20, "L": 12 },
      "stock_by_color_size": { "White": { "S": 5, "M": 10 }, "Black": { "S": 5, "M": 10 } },
      "materials": ["Cotton", "Polyester"],
      "item_weight_kg": 0.25,
      "brand_id": "uuid",
      "standalone_item": false,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-02-01T08:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalProducts": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 4. GET /api/products/:id

Also called directly from server components via `SpensitAPIClient.getProduct(id)`.
No Next.js route file.

### Path Parameters

| Parameter | Required | Description |
|---|---|---|
| `id` | ✅ | UUID of the product (from `Product.id`) |

### Success Response `200`

```jsonc
{
  "success": true,
  "data": { /* single Product object — same shape as array items above */ }
}
```

### Error Response `404`

```json
{ "error": "Product not found" }
```

---

## 5. POST /api/checkout

**Source file:** [`src/app/api/checkout/route.ts`](file:///h:/SpensitEcommerceNextJsDemo/SpensitEcommerceNextJsDemo/src/app/api/checkout/route.ts)

Creates a checkout session. All pricing is **calculated server-side from the
database** — never send price or subtotal fields from the client.

> [!CAUTION]
> Do **NOT** include `price`, `subtotal`, `total_price`, or `vat` in the
> request body. The API ignores them for security and always recalculates from
> the product database.

### Request Body

**Preferred format (with variant info for stock validation):**

```json
{
  "cart_items": [
    {
      "product_id": "uuid-of-product-1",
      "color": "Black",
      "size": "M",
      "quantity": 2
    },
    {
      "product_id": "uuid-of-product-2",
      "color": null,
      "size": "L",
      "quantity": 1
    }
  ],
  "currency": "USD"
}
```

**Legacy format (also supported — no variant stock validation):**

```json
{
  "product_ids": ["uuid1", "uuid2", "uuid3"],
  "currency": "GBP"
}
```

When `product_ids` is used, the route internally converts each entry to a cart
item with `color: null`, `size: null`, `quantity: 1`.

### Request Body Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `cart_items` | `CheckoutCartItem[]` | ✅ (or `product_ids`) | Array of cart items with variant info |
| `cart_items[].product_id` | `string` | ✅ | UUID from the `clothes` table |
| `cart_items[].color` | `string \| null` | ✅ | Selected colour or `null` |
| `cart_items[].size` | `string \| null` | ✅ | Selected size or `null` |
| `cart_items[].quantity` | `number` | ✅ | Item quantity (≥ 1) |
| `product_ids` | `string[]` | ✅ (or `cart_items`) | Legacy: array of product UUIDs |
| `currency` | `string` | ⬜ Optional | ISO 4217 code — uses brand default if omitted |

### Success Response `200`

```jsonc
{
  "success": true,
  "data": {
    "checkout_url": "https://spenspay.spensit.com/tempcheckout/brand-uuid/link-uuid",
    "session_id": "session-uuid",
    "link_id": "link-uuid",
    "brand_id": "brand-uuid",
    "currency": "USD",
    "subtotal": 59.98,
    "vat": 11.99,
    "total_price": 71.97
  }
}
```

### SpensPay redirect URL pattern

```
https://spenspay.spensit.com/tempcheckout/{brand_id}/{link_id}
```

The client can either navigate to `checkout_url` directly, or construct the URL
from `brand_id` and `link_id`.

### Error Responses

| Status | Condition | Body |
|---|---|---|
| `400` | `cart_items` and `product_ids` both missing or empty | `{ "error": "cart_items or product_ids is required and must be a non-empty array." }` |
| `500` | Upstream API error or network failure | `{ "error": "<error message>" }` |

---

## 6. POST /api/customers

**Source file:** [`src/app/api/customers/route.ts`](file:///h:/SpensitEcommerceNextJsDemo/SpensitEcommerceNextJsDemo/src/app/api/customers/route.ts)

Registers a new customer account. Forwards allowed fields only to the Spensit
API — the `SPENSIT_API_KEY` is never exposed to the browser.

### Request Body

```json
{
  "customer_name": "Jane Doe",
  "email_address": "jane@example.com",
  "password": "securepassword123",
  "phone_number": "+4412345678",
  "billing_address": "123 High St, London",
  "delivery_address": "456 Elm St, Manchester",
  "currency": "GBP"
}
```

### Request Body Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `customer_name` | `string` | ✅ | Customer's full name |
| `email_address` | `string` | ✅ | Unique email address |
| `password` | `string` | ⬜ Optional | Plain-text — hashed by the API before storage |
| `phone_number` | `string` | ⬜ Optional | Customer phone number |
| `billing_address` | `string` | ⬜ Optional | Billing address |
| `delivery_address` | `string` | ⬜ Optional | Delivery address |
| `currency` | `string` | ⬜ Optional | Preferred ISO 4217 code — uses brand default if omitted |

### Success Response `200`

```jsonc
{
  "success": true,
  "data": {
    "customer_id": "uuid",
    "customer_name": "Jane Doe",
    "email_address": "jane@example.com",
    "phone_number": "+4412345678",
    "billing_address": "123 High St, London",
    "delivery_address": "456 Elm St, Manchester",
    "currency": "GBP",
    "brand_id": "uuid",
    "created_at": "2024-02-01T10:00:00Z"
    // password is never returned
  }
}
```

### Error Responses

| Status | Condition | Body |
|---|---|---|
| `400` | `customer_name` or `email_address` missing | `{ "error": "customer_name and email_address are required." }` |
| `500` | Upstream API error | `{ "error": "<error message>" }` |

---

## 7. POST /api/customers/login

**Source file:** [`src/app/api/customers/login/route.ts`](file:///h:/SpensitEcommerceNextJsDemo/SpensitEcommerceNextJsDemo/src/app/api/customers/login/route.ts)

Authenticates a customer. Returns the full customer record including
`customer_id` — store this client-side to authenticate subsequent order calls.

### Request Body

```json
{
  "email_address": "jane@example.com",
  "password": "securepassword123"
}
```

### Request Body Fields

| Field | Type | Required |
|---|---|---|
| `email_address` | `string` | ✅ |
| `password` | `string` | ✅ |

### Success Response `200`

```jsonc
{
  "success": true,
  "data": {
    "customer_id": "uuid",          // ← save this for order API calls
    "customer_name": "Jane Doe",
    "email_address": "jane@example.com",
    "phone_number": "+4412345678",
    "currency": "GBP",
    "brand_id": "uuid"
  }
}
```

### Error Responses

| Status | Condition | Body |
|---|---|---|
| `400` | `email_address` or `password` missing | `{ "error": "email_address and password are required." }` |
| `401` | Wrong credentials (API returns 401 or "invalid" in message) | `{ "error": "Invalid email or password" }` |
| `500` | Upstream API / network error | `{ "error": "<error message>" }` |

---

## 8. GET /api/customers/:customerId/orders

**Source file:** [`src/app/api/customers/[customerId]/orders/route.ts`](file:///h:/SpensitEcommerceNextJsDemo/SpensitEcommerceNextJsDemo/src/app/api/customers/%5BcustomerId%5D/orders/route.ts)

Returns a paginated list of orders for a customer. Use the `customer_id`
returned by the login endpoint.

### Path Parameters

| Parameter | Required | Description |
|---|---|---|
| `customerId` | ✅ | Customer UUID from login response |

### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page (max `100`) |
| `status` | `string` | — | Filter by `order_status` (e.g. `pending`, `shipped`, `delivered`, `cancelled`) |
| `payment_status` | `string` | — | Filter by `payment_status` (e.g. `paid`, `unpaid`, `refunded`) |

### Success Response `200`

```jsonc
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "order_status": "shipped",
      "payment_status": "paid",
      "total_price": 71.97,
      "currency": "USD",
      "created_at": "2024-02-01T12:00:00Z",
      "items": [
        {
          "product_id": "uuid",
          "name": "Classic White Tee",
          "quantity": 2,
          "price": 29.99,
          "color": "White",
          "size": "M"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Error Responses

| Status | Condition | Body |
|---|---|---|
| `500` | API / network error | `{ "error": "<error message>" }` |

---

## 9. PATCH /api/customers/:customerId/orders/:orderId

**Source file:** [`src/app/api/customers/[customerId]/orders/[orderId]/route.ts`](file:///h:/SpensitEcommerceNextJsDemo/SpensitEcommerceNextJsDemo/src/app/api/customers/%5BcustomerId%5D/orders/%5BorderId%5D/route.ts)

Cancels an order. The request body is not read from the client — the route
directly forwards `{ action: "cancel" }` to the upstream API.

### Path Parameters

| Parameter | Required | Description |
|---|---|---|
| `customerId` | ✅ | Customer UUID |
| `orderId` | ✅ | Order UUID to cancel |

### Request Body

No body required from the client. The route internally sends:

```json
{ "action": "cancel" }
```

### Success Response `200`

```jsonc
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": "order-uuid",
    "order_status": "cancelled",
    "payment_status": "refunded"
    // ...rest of order fields
  }
}
```

### Error Responses

| Status | Condition | Body |
|---|---|---|
| `500` | API / network error or order already cancelled | `{ "error": "<error message>" }` |

---

## 10. Common Error Responses

All routes share this error envelope:

```json
{ "error": "Human-readable error message" }
```

The error message is derived from the upstream Spensit API response body when
available, otherwise falls back to a generic message.

The upstream error format is:

```
[SpensitAPI {status}] {upstream error message}
```

---

## 11. SpensPay Redirect

After a successful checkout, redirect the user to the payment page:

```
https://spenspay.spensit.com/tempcheckout/{brand_id}/{link_id}
```

Both `brand_id` and `link_id` are returned in the `POST /api/checkout` response
`data` object. The `checkout_url` field contains the pre-constructed URL.

**In the browser (Next.js client component):**

```typescript
const res = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cart_items: [...] })
})
const { data } = await res.json()
window.location.href = data.checkout_url
```

---

## 12. Data Types Reference

These TypeScript types are defined in [`src/lib/api/types.ts`](file:///h:/SpensitEcommerceNextJsDemo/SpensitEcommerceNextJsDemo/src/lib/api/types.ts).

### `Product`

```typescript
interface Product {
  id: string
  name: string
  sku: string
  description: string
  html_description?: string           // Rich HTML — render with dangerouslySetInnerHTML
  category: string
  gender: string
  price: number                       // Current price (discounted if on sale)
  original_price: number              // Pre-discount price
  currency: string                    // ISO 4217 code, e.g. "USD"
  discount_percentage: number
  is_on_sale: boolean
  is_featured: boolean
  is_new: boolean
  is_bestseller: boolean
  image_url: string                   // Primary display image
  images: string[]                    // Full gallery
  colors: string[]
  sizes_available: string[]
  stock: number                       // Total stock across all variants
  stock_by_size: Record<string, number>
  stock_by_color_size: Record<string, Record<string, number>>
  materials: string[]
  item_weight_kg: number | null
  brand_id: string
  standalone_item?: boolean           // true = no colour/size selectors (e.g. a watch)
  created_at: string                  // ISO 8601 timestamp
  updated_at: string
}
```

### `CheckoutCartItem`

```typescript
interface CheckoutCartItem {
  product_id: string
  color: string | null
  size: string | null
  quantity: number
}
```

### `CheckoutData`

```typescript
interface CheckoutData {
  checkout_url: string    // Pre-built SpensPay URL — redirect here
  session_id: string
  link_id: string         // Used to build checkout_url manually
  brand_id: string        // Used to build checkout_url manually
  currency: string
  subtotal: number        // Pre-VAT total (server-calculated)
  vat: number             // VAT amount (server-calculated)
  total_price: number     // Grand total (server-calculated)
}
```

### `PaginationMeta`

```typescript
interface PaginationMeta {
  page: number
  limit: number
  totalProducts: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
```

### `ProductFilters` (query params for product list)

```typescript
interface ProductFilters {
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
  colors?: string        // comma-separated, e.g. "Red,Blue"
  sizes?: string         // comma-separated, e.g. "S,M,L"
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
```

---

## Quick Reference Summary

| Route | Method | Auth Required | Description |
|---|---|---|---|
| `/api/products` | `GET` | Server-side only | List products with filters & pagination |
| `/api/products/:id` | `GET` | Server-side only | Single product detail |
| `/api/checkout` | `POST` | Proxied | Create checkout — prices always server-calculated |
| `/api/customers` | `POST` | Proxied | Register new customer |
| `/api/customers/login` | `POST` | Proxied | Customer login — returns `customer_id` |
| `/api/customers/:id/orders` | `GET` | Proxied | Customer order history |
| `/api/customers/:id/orders/:orderId` | `PATCH` | Proxied | Cancel an order |

> [!NOTE]
> "Proxied" means the Next.js route handler forwards the request to the upstream
> Spensit API after attaching the server-side API key. No client-side
> authentication headers are needed for these routes from the browser.
