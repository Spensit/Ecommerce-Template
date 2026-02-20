/**
 * page.tsx (Product Detail)
 *
 * Server component that fetches a single product by ID from the Spensit API
 * and renders the product detail layout: image gallery on the left, product
 * info, variant selector, and add-to-cart button on the right.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { spensitApi } from '@/lib/api/client'
import ProductDetailClient from './ProductDetailClient'

interface ProductPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { id } = await params
    try {
        const result = await spensitApi.getProduct(id)
        return {
            title: result.data.name,
            description: result.data.description,
        }
    } catch {
        return { title: 'Product Not Found' }
    }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
    const { id } = await params

    let product
    try {
        const result = await spensitApi.getProduct(id)
        product = result.data
    } catch (error) {
        console.error('Failed to fetch product:', error)
        notFound()
    }

    if (!product) {
        notFound()
    }

    return <ProductDetailClient product={product} />
}
