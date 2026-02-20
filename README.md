<div align="center">

<img src="https://img.shields.io/badge/Spensit-E--Commerce-black?style=for-the-badge&logoColor=white" alt="Spensit E-Commerce" />

# 🛍️ Spensit E-Commerce Template

**Your ready-to-deploy e-commerce storefront with the entire backend already handled.**
Configure your payment methods and products in the Spensit dashboard — then watch your custom site take flight. 🚀

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

[🌐 Live Demo](https://template.spensit.site) · [📖 Docs](https://my.spensit.com/customsitedocs) · [⚡ Quick Start](#-quick-start) · [🌐 Deploy](#-deployment)

</div>

---

## 🎯 What Is This?

This is a **fully production-ready e-commerce storefront** — the entire backend is taken care of for you by Spensit. No building checkout logic, no wiring up payment APIs, no managing orders from scratch.

Here's all you need to do:

1. ✅ **Configure your payment methods** in the Spensit dashboard
2. ✅ **Add your products** in the Spensit dashboard
3. ✅ **Customise your storefront** to look exactly how you want
4. ✅ **Deploy** — and your store is live

That's it. Everything else — payments, orders, product management, currency handling — is handled by Spensit.

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ **Next.js App Router** | Server components, layouts, and streaming out of the box |
| 🛒 **Slide-in Cart Drawer** | Persistent cart with quantity controls |
| 💳 **Secure Checkout** | Server-side price calculation via SpensPay |
| 🌏 **Currency Context** | Consistent symbol display across 80+ currencies |
| 🔍 **Product Filtering** | Search, category, gender, price range, colour, and size |
| 📱 **Fully Responsive** | Mobile-first design that looks great on every device |
| 🧩 **One-file Rebrand** | All UI copy lives in `src/config/site.ts` |
| 🔒 **API Key Server-side** | Your `SPENSIT_API_KEY` is never exposed to the browser |

---

## 📋 Prerequisites

Before you start, make sure you have:

- [Node.js](https://nodejs.org) **v18.17 or later**
- [npm](https://www.npmjs.com) **v9+** *(comes with Node)*
- A free [Spensit](https://spensit.com) account

---

## 🚀 Quick Start

### 1 — Clone the repository
```bash
git clone https://github.com/Spensit/Ecommerce-Template.git
cd Ecommerce-Template
```

### 2 — Install dependencies
```bash
npm install
```

### 3 — Configure environment variables
```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:
```env
# ─── Spensit API (required) ──────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.spensit.com
NEXT_PUBLIC_DOMAIN=localhost              # or your production domain, e.g. mystore.com
NEXT_PUBLIC_BRAND_ID=your-brand-uuid     # copy from Spensit dashboard
SPENSIT_API_KEY=sk_live_xxxxxxxxxxxx     # copy from Spensit Developer API page
SPENSIT_BRAND_ID=your-brand-uuid         # same value as NEXT_PUBLIC_BRAND_ID

# ─── Optional ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_DEFAULT_CURRENCY=USD         # leave blank to use your brand's default
```

### 4 — Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your store is live! 🎉

---

## 🔑 Getting Your API Keys

### Step 1 — Create a Spensit account

Sign up for free at **[spensit.com](https://spensit.com)**.

### Step 2 — Get your API key

1. After signing in, click your **profile avatar** in the **top-right corner**
2. Select **"Developer API"** from the dropdown
3. Click **"Generate New API Key"** (or copy an existing one)
4. Paste it as `SPENSIT_API_KEY` in your `.env.local`

> [!IMPORTANT]
> Your API key is shown **only once** when generated — save it immediately.
> This key must stay **server-side only** — never use it in `NEXT_PUBLIC_*` variables.

### Step 3 — Get your Brand ID

On the same **Developer API** page, your **Brand ID** (a UUID) is displayed. Copy it and set both `NEXT_PUBLIC_BRAND_ID` and `SPENSIT_BRAND_ID` in your `.env.local`.

### Step 4 — Add your domain

Set `NEXT_PUBLIC_DOMAIN` to the domain the Spensit API should accept requests from:

| Environment | Value |
|---|---|
| Local development | `localhost` |
| Production | `mystore.com` *(no `https://`, no trailing slash)* |

> [!TIP]
> You can whitelist multiple domains in your Spensit dashboard — use `localhost` for development and your real domain for production.

---

## 📦 Managing Products & Payments

Everything is managed from your **[Spensit Dashboard](https://spensit.com)** — no code changes required.

### Adding Products

1. Log in to [spensit.com](https://spensit.com)
2. Navigate to **Products** in the sidebar
3. Click **"Add Product"** and fill in name, description, category, pricing, images, variants, and stock
4. Click **Save** — your product is instantly live on your storefront ✅

### Configuring Payment Methods

1. In your dashboard, navigate to **Payments**
2. Connect your preferred payment providers via **SpensPay**
3. Enable the currencies and methods you want to accept
4. Hit **Save** — your checkout is ready to take orders ✅

> [!TIP]
> For the full setup guide including payment configuration, visit the **[Spensit Docs](https://my.spensit.com/customsitedocs)**.

---

## 🎨 Customising Your Storefront

Make it yours — customise your storefront any way you like.

### Store name, copy & navigation

Edit **`src/config/site.ts`** — the **only file** you need to touch to fully rebrand:
```typescript
export const siteConfig = {
  name: 'My Awesome Store',
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
    legal: '© 2025 My Awesome Store. All rights reserved.',
  },
}
```

### Favicon

Replace `src/app/icon.png` with your own PNG (square works best).

### Colours & fonts

Edit `src/app/globals.css` using CSS custom properties:
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
├── app/                        # Next.js App Router
│   ├── api/                    # Server-side API proxy routes
│   │   ├── checkout/           # POST /api/checkout
│   │   └── customers/          # Customer & order routes
│   ├── products/[id]/          # Product detail page
│   ├── shop/                   # Shop / listing page
│   └── layout.tsx              # Root layout (fonts, providers)
├── components/
│   ├── cart/                   # CartDrawer, CartItem, CartSummary
│   ├── home/                   # Hero, FeaturedProducts, SaleBanner
│   ├── layout/                 # Navbar, Footer
│   ├── product/                # ProductInfo, ImageGallery, VariantSelector
│   ├── shop/                   # ProductCard, FilterSidebar, ProductGrid
│   └── ui/                     # Badge, Button — reusable primitives
├── config/
│   └── site.ts                 # ← Rebrand here — all UI copy in one place
├── context/
│   ├── CartContext.tsx          # Cart state (add, remove, update qty)
│   └── CurrencyContext.tsx      # Currency symbol formatting
└── lib/
    ├── api/
    │   ├── client.ts            # SpensitAPIClient + singleton
    │   └── types.ts             # All TypeScript interfaces
    ├── currency-symbols.ts      # 80+ ISO 4217 → symbol mappings
    └── utils/                   # formatPrice, filter helpers
```

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at [localhost:3000](http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server *(run build first)* |
| `npm run lint` | Run ESLint |

---

## 🌐 Deployment

### ▲ Deploy to Vercel *(recommended — zero config)*

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add your environment variables in the Vercel dashboard:
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_DOMAIN       ← set to your Vercel / custom domain
NEXT_PUBLIC_BRAND_ID
SPENSIT_API_KEY
SPENSIT_BRAND_ID
```

4. Click **Deploy** 🚀

> [!TIP]
> Update `NEXT_PUBLIC_DOMAIN` to your production domain (e.g. `mystore.com`) and make sure it's whitelisted in your Spensit dashboard.

### Other platforms *(Railway, Render, etc.)*
```bash
npm run build
npm run start
```

Set the same five environment variables in your platform's settings panel.

---

## 📚 Documentation

| Resource | Link |
|---|---|
| 📖 Full Setup & Customisation Docs | [my.spensit.com/customsitedocs](https://my.spensit.com/customsitedocs) |
| 🌐 Live Demo | [template.spensit.site](https://template.spensit.site) |
| 🔌 API Routes Reference | [`API_ROUTES.md`](./API_ROUTES.md) |
| 🛠️ Node.js Integration Guide | [`NODEJS_IMPLEMENTATION_GUIDE.md`](./NODEJS_IMPLEMENTATION_GUIDE.md) |
| 💡 Client Code Examples | [`CLIENT_EXAMPLES.md`](./CLIENT_EXAMPLES.md) |

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.
```bash
git checkout -b feature/my-feature
git commit -m 'feat: add my feature'
git push origin feature/my-feature
# then open a Pull Request
```

---

## 📄 License

MIT © [Spensit](https://spensit.com)

---

<div align="center">

[Spensit](https://spensit.com) · [Next.js](https://nextjs.org) · [Tailwind CSS](https://tailwindcss.com)

**[🌐 Live Demo](https://template.spensit.site) · [📖 Docs](https://my.spensit.com/customsitedocs) · [🚀 Get Started](#-quick-start)**

</div>