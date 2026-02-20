/**
 * site.ts
 *
 * Central site configuration file. All UI copy, branding, navigation links, and
 * site-wide settings are defined here. This is the single file a developer edits
 * to rebrand the entire template. No other file should contain hardcoded UI copy.
 */

export const siteConfig = {
  /** The display name of the store, used in the navbar and browser title. */
  name: 'Your Store Name',

  /** A short tagline displayed beneath the store name where applicable. */
  tagline: 'Your store tagline here',

  /** SEO meta description used in the root layout. */
  description: 'A short description of your store for SEO meta tags',

  /** The canonical URL of the deployed site, without a trailing slash. */
  url: 'https://yourdomain.com',

  /** Primary navigation links rendered in the Navbar component. */
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
  ],

  /** Hero banner configuration for the home page. */
  hero: {
    headline: 'Elevate Your Style',
    subheadline: 'Discover our curated collection of premium products designed for modern living.',
    ctaLabel: 'Shop Now',
    ctaHref: '/shop',
    backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
  },

  /** Promotional sale banner displayed on the home page. */
  saleBanner: {
    copy: 'Sale now on - up to 50% off selected items',
    ctaLabel: 'View Sale',
    ctaHref: '/shop?is_on_sale=true',
  },

  /** Footer configuration including links and legal text. */
  footer: {
    links: [
      { label: 'Shop', href: '/shop' },
      { label: 'Cart', href: '/cart' },
    ],
    legal: '2025 Your Store Name. All rights reserved.',
  },
} as const

/** Type representing a single navigation link. */
export type NavLink = (typeof siteConfig.nav)[number]
