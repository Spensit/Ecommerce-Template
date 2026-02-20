# Windsurf Cascade Prompt: Spensit E-Commerce Template (Next.js 15 / React 19)

Paste this entire file as your first message to Windsurf Cascade in a new, empty project folder.
The Spensit API reference documentation is attached alongside this prompt - refer to it for all
endpoint signatures, request bodies, response shapes, and authentication headers.

---

## Project Overview

Build a production-ready, fully modular e-commerce template website using Next.js 15 (App Router)
and React 19. The site consumes the Spensit API for all product and checkout data.

The primary goal is a template: every directory, component, and configuration file must be
structured so that a developer can locate and modify any piece of the UI or business logic
independently, with minimal effort. Modularity and clarity of structure take priority over
brevity of file count.

All files must have a comment block at the top describing their purpose. All non-obvious logic
blocks must have inline comments explaining what they do and why.

Do not use em dashes in code comments or UI copy. Do not use emojis in code, comments, or UI
copy. Use professional English throughout.

---

## Tech Stack

- **Framework**: Next.js 15, App Router, `app/` directory
- **React**: React 19
- **Language**: TypeScript, strict mode enabled
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **UI Components**: shadcn/ui where appropriate
- **HTTP**: Native `fetch` (Node.js 18+), no third-party HTTP libraries
- **Cart State**: React Context API with `useReducer`, persisted to `localStorage`
- **Font**: `next/font` using Inter or Geist

---

## Environment Variables

Create `.env.local` at the project root. Never hard-code any of these values in source files.

```env
NEXT_PUBLIC_API_URL=https://api.yoursite.com
NEXT_PUBLIC_API_KEY=sk_live_your_api_key_here
NEXT_PUBLIC_DOMAIN=yourdomain.com
NEXT_PUBLIC_BRAND_ID=your-brand-uuid-here
```

All four variables are required. The application must not start without them.

---

## Directory Structure

Generate the following structure exactly. Every folder must have a clear primary file with a
purpose comment at the top.

```
/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── app/
│   ├── layout.tsx                    # Root layout: fonts, providers, Navbar, Footer
│   ├── page.tsx                      # Home page (server component)
│   ├── globals.css                   # Tailwind base + CSS custom properties for theme tokens
│   │
│   ├── shop/
│   │   └── page.tsx                  # Shop all page: product grid + filter sidebar
│   │
│   ├── products/
│   │   └── [id]/
│   │       └── page.tsx              # Single product detail page (server component)
│   │
│   ├── cart/
│   │   └── page.tsx                  # Cart review page (client component)
│   │
│   ├── checkout/
│   │   └── page.tsx                  # Checkout page: builds product_ids from cart, calls
│   │                                 # POST /api/checkout, then redirects to checkout_url
│   │
│   └── admin/
│       └── page.tsx                  # Redirects immediately to https://my.spensit.com/getstarted
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # Site navigation, cart icon with live item count
│   │   └── Footer.tsx                # Site footer with nav links and brand info
│   │
│   ├── home/
│   │   ├── HeroBanner.tsx            # Hero section: headline, subheadline, CTA button
│   │   ├── FeaturedProducts.tsx      # Featured products grid (is_featured=true)
│   │   └── SaleBanner.tsx            # Promotional banner strip
│   │
│   ├── shop/
│   │   ├── ProductGrid.tsx           # Responsive product card grid
│   │   ├── ProductCard.tsx           # Single product card: image, name, price, badges
│   │   ├── FilterSidebar.tsx         # All filter controls (see filter spec below)
│   │   ├── FilterDrawer.tsx          # Mobile slide-over wrapper for FilterSidebar
│   │   └── Pagination.tsx            # Page navigation controls
│   │
│   ├── product/
│   │   ├── ProductImages.tsx         # Image gallery with thumbnail strip and swipe support
│   │   ├── ProductInfo.tsx           # Name, price display, description, badges
│   │   ├── VariantSelector.tsx       # Color and size selectors with per-variant stock awareness
│   │   └── AddToCartButton.tsx       # Quantity selector and add-to-cart CTA
│   │
│   ├── cart/
│   │   ├── CartItem.tsx              # Single cart line item with quantity controls
│   │   ├── CartSummary.tsx           # Subtotal, item count, proceed to checkout CTA
│   │   └── EmptyCart.tsx             # Empty state with link back to shop
│   │
│   ├── checkout/
│   │   └── CheckoutButton.tsx        # Calls POST /api/checkout and redirects to checkout_url
│   │
│   └── ui/
│       ├── Badge.tsx                 # Reusable badge: Sale, New, Featured, Bestseller
│       ├── Button.tsx                # Reusable button with size and variant props
│       ├── LoadingSpinner.tsx        # Centered loading indicator
│       └── ErrorMessage.tsx          # Reusable error display with optional retry action
│
├── context/
│   └── CartContext.tsx               # Cart state, actions, and provider
│
├── lib/
│   ├── api/
│   │   ├── client.ts                 # SpensitAPIClient class - all API calls live here
│   │   └── types.ts                  # TypeScript interfaces for all API request/response shapes
│   │
│   └── utils/
│       ├── currency.ts               # formatPrice(amount, currency) using Intl.NumberFormat
│       └── filters.ts                # buildFilterParams(filters) returns URLSearchParams
│
└── config/
    └── site.ts                       # Site-wide config: name, tagline, nav items, social links,
                                      # hero copy, banner copy - all UI copy lives here
```

---

## API Client (`lib/api/client.ts`)

Implement a `SpensitAPIClient` class. Refer to the attached API documentation for the full
endpoint signatures, accepted query parameters, request body shapes, and response structures.

Key rules:

- All requests must include the three required headers: `x-api-key`, `x-domain`, `x-brand-id`.
- Export a singleton instance configured from `process.env` variables.
- All methods are `async` and return typed responses from `lib/api/types.ts`.
- Throw a descriptive `Error` on non-2xx responses, including the HTTP status code and the
  `error` field from the response body when present.

Methods to implement:

```typescript
getProducts(filters: ProductFilters): Promise<ProductsResponse>
getProduct(id: string): Promise<ProductResponse>
createCheckout(productIds: string[], currency?: string): Promise<CheckoutResponse>
```

**Checkout security rule**: When calling `createCheckout`, the request body must only contain
`product_ids` and optionally `currency`. Never include `price`, `subtotal`, `total_price`, or
`vat`. The API always calculates prices server-side from the database and ignores any
client-supplied pricing fields.

---

## Currency and Pricing Rules

This is a critical requirement. Implement it exactly as described.

1. Each `Product` object returned by the API may include a `currency` field (e.g. `"USD"`,
   `"AUD"`, `"BDT"`). This is the currency in which that product is priced.

2. All prices displayed on the site - product cards, product detail page, cart line items, and
   cart subtotal - must be formatted using the currency of the product, not a hardcoded global
   default.

3. Implement `formatPrice(amount: number, currency: string): string` in `lib/utils/currency.ts`
   using the native `Intl.NumberFormat` API:

   ```typescript
   export function formatPrice(amount: number, currency: string): string {
     return new Intl.NumberFormat('en-US', {
       style: 'currency',
       currency,
       minimumFractionDigits: 2,
       maximumFractionDigits: 2,
     }).format(amount)
   }
   ```

4. Cart subtotal is calculated as the sum of `product.price * quantity` for each line item.
   The `price` field from the API is the authoritative selling price. Use `original_price` only
   for displaying a crossed-out comparison price when `is_on_sale` is true.

5. When multiple products in the cart have different currencies, display each line item's price
   in its own currency. Display the subtotal in the currency of the majority of items, or if
   all items share one currency, use that currency. Add a comment in `CartSummary.tsx`
   explaining this behaviour so the developer can adjust it.

---

## Cart State (`context/CartContext.tsx`)

Use React Context and `useReducer`. Persist the cart array to `localStorage` under the key
`spensit_cart`. Rehydrate from `localStorage` on mount.

### Cart Item Shape

```typescript
interface CartItem {
  productId: string
  name: string
  price: number
  currency: string       // from product.currency - required for price display
  image: string
  color: string | null
  size: string | null
  quantity: number
}
```

### Actions

```typescript
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; color: string | null; size: string | null } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; color: string | null; size: string | null; quantity: number } }
  | { type: 'CLEAR_CART' }
```

### Deduplication

On `ADD_ITEM`, check whether an item with the same `productId`, `color`, and `size` already
exists. If it does, increment its `quantity` rather than adding a new line.

### Exposed Context Values

```typescript
interface CartContextValue {
  items: CartItem[]
  itemCount: number        // total units across all line items
  subtotal: number         // sum of price * quantity for all items
  addItem: (item: CartItem) => void
  removeItem: (productId: string, color: string | null, size: string | null) => void
  updateQuantity: (productId: string, color: string | null, size: string | null, quantity: number) => void
  clearCart: () => void
}
```

---

## Page Specifications

### Home Page (`app/page.tsx`) - Server Component

Fetch featured products (`is_featured=true`, limit 8) and on-sale products (`is_on_sale=true`,
limit 8) from the API at request time. Pass data as props to client components.

Sections in order:

1. `HeroBanner` - Full-width hero. Headline, subheadline, and "Shop Now" button linking to
   `/shop`. All copy is sourced from `config/site.ts`.
2. `FeaturedProducts` - Grid or horizontal scroll of featured products. Each card links to
   `/products/[id]`.
3. `SaleBanner` - Full-width promotional strip. Copy from `config/site.ts`.
4. On-sale products grid - Same layout as featured, filtered to `is_on_sale=true`.

### Shop All Page (`app/shop/page.tsx`) - Server Component

Read filter values from `searchParams`. Build a `ProductFilters` object and call `getProducts`.
Pass results to client components for rendering.

Layout:
- Desktop: two-column layout, filter sidebar on the left, product grid on the right.
- Mobile: single column, "Filters" button opens `FilterDrawer` (slide-over panel).

`FilterSidebar.tsx` must support all of the following controls. Each control updates the URL
query string (using `router.push` or a form submit) so filters are bookmarkable and shareable:

- **Search**: text input, maps to `search` query param
- **Category**: checkbox list, maps to `category`
- **Gender**: radio group (All / Men / Women / Unisex), maps to `gender`
- **Price range**: two number inputs, maps to `price_min` and `price_max`
- **On Sale**: checkbox, maps to `is_on_sale=true`
- **New Arrivals**: checkbox, maps to `is_new=true`
- **Colors**: multi-select checkbox list, maps to `colors` as comma-separated string
- **Sizes**: multi-select checkbox list, maps to `sizes` as comma-separated string
- **In Stock Only**: checkbox, maps to `has_stock=true`

Include a "Clear all filters" button that resets the URL to `/shop` with no query params.

`Pagination.tsx` must use URL-based pagination (`page` query param) so the browser back button
works correctly.

### Product Detail Page (`app/products/[id]/page.tsx`) - Server Component

Fetch the product by ID. Pass to client sub-components.

Layout:
- Left column: `ProductImages` - main image with thumbnail strip. Support keyboard and touch
  swipe navigation between images.
- Right column: `ProductInfo`, `VariantSelector`, `AddToCartButton`.

`VariantSelector.tsx`:
- Render a selector group for each entry in `sizes_available` and each entry in `colors`.
- Use `stock_by_size` and `stock_by_color_size` to determine per-variant availability.
- Disable and visually mark options that have zero stock.
- When a variant is selected, update the available quantity ceiling in `AddToCartButton`.

`AddToCartButton.tsx`:
- Quantity stepper (minus / plus) bounded by 1 and the available stock for the selected variant.
- "Add to Cart" button dispatches `ADD_ITEM` to `CartContext`.
- Show a brief success confirmation (toast or inline message) after adding.
- If no variant is selected and variants exist, show a validation message prompting selection.

Display pricing:
- If `is_on_sale` is true, show `original_price` crossed out and `price` in a highlighted colour.
- Show `discount_percentage` as a badge.
- Format all amounts using `formatPrice(amount, product.currency)`.

### Cart Page (`app/cart/page.tsx`) - Client Component

Read items from `CartContext`. Render `CartItem` for each line, `CartSummary` at the bottom.

`CartItem.tsx`:
- Product image, name, selected color, selected size.
- Quantity stepper using `updateQuantity`.
- Remove button using `removeItem`.
- Line total formatted with `formatPrice`.

`CartSummary.tsx`:
- Item count and subtotal.
- "Proceed to Checkout" button linking to `/checkout`.
- Note in a comment that the subtotal shown here is for display only. The authoritative total
  is always recalculated server-side by the API when the checkout session is created.

### Checkout Page (`app/checkout/page.tsx`) - Client Component

This page must:

1. Read `items` from `CartContext`.
2. If the cart is empty, redirect to `/cart`.
3. Extract the `productId` from each cart item to build the `product_ids` array.
   If a product appears multiple times (different variants or quantities), include its ID
   once per unit (i.e. repeat the ID in the array for each unit of quantity).
4. On user clicking "Confirm and Pay", call `createCheckout(productIds)`.
5. On success, call `clearCart()` and redirect the browser to `result.data.checkout_url`
   using `window.location.href`.
6. Show a loading state while the API call is in progress.
7. Show an error message if the API call fails, with a retry option.

Display an order summary (product names, quantities, prices) above the confirm button.
Include a notice: "Prices are confirmed and secured at checkout. Your total will be calculated
on the next page."

### Admin Page (`app/admin/page.tsx`)

This page must immediately redirect to `https://my.spensit.com/getstarted`.

Use Next.js server-side redirect in the page component:

```typescript
import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('https://my.spensit.com/getstarted')
}
```

No UI is needed. The redirect must happen before any HTML is rendered.

---

## Navigation (`components/layout/Navbar.tsx`)

The navbar must include:
- Site name / logo (from `config/site.ts`) linking to `/`
- Navigation links: Home (`/`), Shop (`/shop`)
- Cart icon (Lucide `ShoppingCart`) with a badge showing `itemCount` from `CartContext`
- The cart icon links to `/cart`
- Responsive: hamburger menu on mobile, horizontal links on desktop

---

## Site Configuration (`config/site.ts`)

All UI copy and site-wide settings must be defined here. This is the single file a developer
edits to rebrand the template. Include at minimum:

```typescript
export const siteConfig = {
  name: 'Your Store Name',
  tagline: 'Your store tagline here',
  description: 'A short description of your store for SEO meta tags',
  url: 'https://yourdomain.com',

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
  ],

  hero: {
    headline: 'Your Hero Headline',
    subheadline: 'Your hero subheadline or supporting copy',
    ctaLabel: 'Shop Now',
    ctaHref: '/shop',
    // Replace with your own image URL or import
    backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
  },

  saleBanner: {
    copy: 'Sale now on - up to 50% off selected items',
    ctaLabel: 'View Sale',
    ctaHref: '/shop?is_on_sale=true',
  },

  footer: {
    links: [
      { label: 'Shop', href: '/shop' },
      { label: 'Cart', href: '/cart' },
    ],
    legal: '2025 Your Store Name. All rights reserved.',
  },
}
```

---

## Design and Styling Requirements

- Use Tailwind CSS utility classes exclusively. No inline styles except where Tailwind cannot
  express the value.
- Define a consistent colour palette as CSS custom properties in `globals.css` under `:root`.
  Use these tokens throughout components rather than hardcoded colour values, so the developer
  can retheme the entire site by editing one file.
- The design must be clean, modern, and minimal. Use generous whitespace.
- All interactive elements must have visible focus states for accessibility.
- Images must use `next/image` with appropriate `width`, `height`, and `alt` attributes.
- All pages must be fully responsive across mobile (320px), tablet (768px), and desktop (1280px).
- Product cards must maintain a consistent aspect ratio for images regardless of source
  image dimensions.

---

## Code Quality Requirements

- TypeScript strict mode must pass with zero errors.
- No `any` types. Use `unknown` with type guards where the shape is genuinely unknown.
- No unused imports or variables.
- All `async` functions must handle errors with `try/catch` and surface meaningful messages.
- Server components fetch data directly using the API client singleton.
- Client components receive data as props from server components where possible, and use
  `useEffect` with `fetch` only when server-side fetching is not possible.
- Do not use `useEffect` to fetch data that can be fetched in a server component.

---

## Commenting Standards

Every file must open with a block comment in this format:

```typescript
/**
 * [filename]
 *
 * [One or two sentences describing what this file does and why it exists.]
 * [Note any important constraints or decisions the developer should be aware of.]
 */
```

Every non-trivial function must have a JSDoc comment describing its parameters and return value.

Inline comments must explain the "why", not restate the "what". For example:

```typescript
// Repeat the product ID once per unit of quantity so the API creates one order line per unit.
const productIds = items.flatMap(item => Array(item.quantity).fill(item.productId))
```

---

## Deliverables Checklist

Before considering the implementation complete, verify:

- [ ] All pages render without TypeScript errors
- [ ] `npm run build` completes with zero errors and zero warnings
- [ ] Home page loads featured and on-sale products from the API
- [ ] Shop page filters update the URL and re-fetch products correctly
- [ ] Product detail page shows correct variant stock states
- [ ] Adding to cart persists across page refreshes (localStorage)
- [ ] Cart subtotal calculates correctly using product prices and quantities
- [ ] Checkout page calls POST /api/checkout with only product_ids (no price fields)
- [ ] Successful checkout redirects to the API-provided checkout_url
- [ ] `/admin` redirects to `https://my.spensit.com/getstarted`
- [ ] All prices are formatted using the product's own currency field
- [ ] Site is fully responsive on mobile, tablet, and desktop
- [ ] All images use `next/image`
- [ ] No hardcoded API keys or credentials in source files
- [ ] `config/site.ts` contains all UI copy and is the only file needed for rebranding
