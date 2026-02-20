/**
 * page.tsx (Home)
 *
 * Home page server component. Fetches featured products (is_featured=true)
 * and on-sale products (is_on_sale=true) from the Spensit API at request time.
 * Passes data as props to client components for rendering.
 */

import { spensitApi } from '@/lib/api/client'
import type { Product } from '@/lib/api/types'
import HeroBanner from '@/components/home/HeroBanner'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import SaleBanner from '@/components/home/SaleBanner'

export default async function HomePage() {
  let featuredProducts: Product[] = []
  let saleProducts: Product[] = []

  try {
    const [featuredRes, saleRes] = await Promise.all([
      spensitApi.getProducts({ is_featured: true, limit: 8 }),
      spensitApi.getProducts({ is_on_sale: true, limit: 8 }),
    ])
    featuredProducts = featuredRes.data
    saleProducts = saleRes.data
  } catch (error) {
    // Log the error but do not crash the page. Sections will simply not render
    // if their data arrays are empty.
    console.error('Failed to fetch home page products:', error)
  }

  return (
    <>
      <HeroBanner />
      <FeaturedProducts title="Featured Products" products={featuredProducts} />
      <SaleBanner />
      <FeaturedProducts title="On Sale" products={saleProducts} />
    </>
  )
}
