<div align="center">

# 🛍️ Spensit E-Commerce Template

**A blazing-fast, production-ready e-commerce storefront powered by the [Spensit](https://spensit.com) API.**  
Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

- ⚡ **Next.js App Router** – Server components, layouts, streaming
- 🛒 **Slide-in Cart Drawer** – Persistent cart with quantity controls
- 💳 **Secure Checkout** – Server-side price calculation via SpensPay
- 🌏 **Currency Context** – Consistent symbol display across 80+ currencies
- 🔍 **Product Filtering** – Search, category, gender, price range, colour, size
- 📱 **Fully Responsive** – Mobile-first design
- 🧩 **One-file Rebrand** – All UI copy lives in `src/config/site.ts`
- 🔒 **API Key Server-side** – Your `SPENSIT_API_KEY` is never exposed to the browser

---

## 📋 Prerequisites

Make sure you have these installed before you start:

- [Node.js](https://nodejs.org) **v18.17 or later**
- [npm](https://www.npmjs.com) **v9+** (comes with Node)
- A free [Spensit](https://spensit.com) account

---

## 🚀 Quick Start

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/spensit-ecommerce-template.git
cd spensit-ecommerce-template
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Configure environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local   # if the example file exists, otherwise create it manually
```

Then open `.env.local` and fill in your values (see [Getting Your API Keys](#-getting-your-api-keys) below):

```env
# ─── Spensit API (required) ───────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.spensit.com
NEXT_PUBLIC_DOMAIN=localhost             # or your production domain, e.g. mystore.com
NEXT_PUBLIC_BRAND_ID=your-brand-uuid     # copy from Spensit dashboard
SPENSIT_API_KEY=sk_live_xxxxxxxxxxxx     # copy from Spensit Developer API page
SPENSIT_BRAND_ID=your-brand-uuid         # same value as NEXT_PUBLIC_BRAND_ID

# ─── Optional ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_DEFAULT_CURRENCY=USD         # leave blank to use your brand's default
```

### 4 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your store is live! 🎉

---

## 🔑 Getting Your API Keys

You need a **Spensit account** to get your API key and Brand ID.

### Step 1 — Create a Spensit account

1. Go to **[spensit.com](https://spensit.com)** and sign up for a free account.

### Step 2 — Get your API key

1. After signing in, click your **profile avatar / name** in the **top-right corner**.
2. Select **"Developer API"** from the dropdown menu.
3. Click **"Generate New API Key"** (or copy an existing one).
4. Copy the key — it starts with `sk_live_`.
5. Paste it as `SPENSIT_API_KEY` in your `.env.local`.

> [!IMPORTANT]
> Your API key is shown **only once** when generated. Save it immediately.  
> This key must stay **server-side only** — never use it in `NEXT_PUBLIC_*` variables.

### Step 3 — Get your Brand ID

1. On the same **Developer API** page, your **Brand ID** (a UUID) is displayed.
2. Copy it and paste it as both `NEXT_PUBLIC_BRAND_ID` **and** `SPENSIT_BRAND_ID` in `.env.local`.

### Step 4 — Add your domain

Set `NEXT_PUBLIC_DOMAIN` to the domain that the Spensit API should accept requests from:

| Environment | Value |
|---|---|
| Local development | `localhost` |
| Production | `mystore.com` *(no `https://`, no trailing slash)* |

> [!TIP]
> You can whitelist multiple domains in your Spensit dashboard. Use `localhost`
> for development and your real domain for production.

---

## 📦 Adding Products

Products are managed entirely from your **Spensit dashboard** — no code changes needed.

1. Log in to [spensit.com](https://spensit.com).
2. Navigate to **Products** in your dashboard.
3. Click **"Add Product"** and fill in:
   - Name, description, category, gender
   - Price, sale price, discount percentage
   - Images, colours, sizes, stock levels
4. Click **Save** — the product is instantly available on your storefront via the API.

---

## 🎨 Customising Your Store

### Change store name, copy, and navigation

Edit **`src/config/site.ts`** — this is the **only file** you need to change to rebrand the entire store:

```typescript
export const siteConfig = {
  name: 'My Awesome Store',           // ← shown in navbar & browser tab
  tagline: 'Premium quality clothing',
  description: 'SEO meta description for Google',
  url: 'https://mystore.com',

  hero: {
    headline: 'New Season. New You.',
    subheadline: 'Free shipping on orders over $50.',
    ctaLabel: 'Shop Now',
    backgroundImage: 'https://your-image-url.com/hero.jpg',
  },

  saleBanner: {
    copy: 'Up to 60% off — this weekend only',
  },

  footer: {
    legal: '2025 My Awesome Store. All rights reserved.',
  },
}
```

### Change the favicon

Replace `src/app/icon.png` with your own PNG image (any size, square is best).

### Change colours & fonts

Edit `src/app/globals.css` — the design system uses CSS custom properties:

```css
:root {
  --color-primary: #your-brand-color;
  --color-sale: #your-sale-color;
}
```

---

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # Server-side API proxy routes
│   │   ├── checkout/        # POST /api/checkout
│   │   └── customers/       # Customer & order routes
│   ├── products/[id]/       # Product detail page
│   ├── shop/                # Shop/listing page
│   └── layout.tsx           # Root layout (fonts, providers)
├── components/
│   ├── cart/                # CartDrawer, CartItem, CartSummary
│   ├── home/                # Hero, FeaturedProducts, SaleBanner
│   ├── layout/              # Navbar, Footer
│   ├── product/             # ProductInfo, ImageGallery, VariantSelector
│   ├── shop/                # ProductCard, FilterSidebar, ProductGrid
│   └── ui/                  # Badge, Button — reusable primitives
├── config/
│   └── site.ts              # ← Rebrand here — all UI copy in one place
├── context/
│   ├── CartContext.tsx      # Cart state (add, remove, update qty)
│   └── CurrencyContext.tsx  # Currency symbol formatting
└── lib/
    ├── api/
    │   ├── client.ts        # SpensitAPIClient + singleton
    │   └── types.ts         # All TypeScript interfaces
    ├── currency-symbols.ts  # 80+ ISO 4217 → symbol mappings
    └── utils/               # formatPrice, filter helpers
```

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at [localhost:3000](http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server (run build first) |
| `npm run lint` | Run ESLint |

---

## 🌐 Deployment

### Deploy to Vercel (recommended — zero config)

1. Push your repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Add your environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_DOMAIN` ← set to your Vercel domain or custom domain
   - `NEXT_PUBLIC_BRAND_ID`
   - `SPENSIT_API_KEY`
   - `SPENSIT_BRAND_ID`
4. Click **Deploy**.

> [!TIP]
> Update `NEXT_PUBLIC_DOMAIN` to your production domain (e.g. `mystore.com`)
> and make sure that domain is whitelisted in your Spensit dashboard.

### Other platforms (Railway, Render, etc.)

```bash
npm run build
npm run start
```

Set the same five environment variables in your platform's settings panel.

---

## 📚 Further Documentation

| Document | Description |
|---|---|
| [`API_ROUTES.md`](./API_ROUTES.md) | Complete API reference — all routes, request/response shapes, error codes |
| [`NODEJS_IMPLEMENTATION_GUIDE.md`](./NODEJS_IMPLEMENTATION_GUIDE.md) | Full Node.js integration guide |
| [`CLIENT_EXAMPLES.md`](./CLIENT_EXAMPLES.md) | Code examples in Python, TypeScript, Go, C#, PHP, and more |

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [Your Name](https://github.com/your-username)

---

<div align="center">

Built with ❤️ using [Spensit](https://spensit.com) · [Next.js](https://nextjs.org) · [Tailwind CSS](https://tailwindcss.com)

</div>
#   E c o m m e r c e - T e m p l a t e  
 # Ecommerce-Template
