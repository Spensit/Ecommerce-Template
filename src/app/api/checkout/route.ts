/**
 * route.ts (API Route: /api/checkout)
 *
 * Server-side API route that proxies checkout requests to the Spensit API.
 * This keeps the SPENSIT_API_KEY on the server and prevents it from being
 * exposed to the browser.
 *
 * The request body must only contain product_ids and optionally currency.
 * SECURITY: Never forward price, subtotal, total_price, or vat from the
 * client. The API calculates all pricing server-side.
 *
 * Returns the full checkout response including link_id and brand_id. The client uses
 * these to construct the SpensPay redirect URL:
 * https://spenspay.spensit.com/tempcheckout/{brand_id}/{link_id}
 */

import { NextRequest, NextResponse } from 'next/server'
import { spensitApi } from '@/lib/api/client'

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as { 
            cart_items?: Array<{ product_id: string; color: string | null; size: string | null; quantity: number }>
            product_ids?: string[] // Legacy support
            currency?: string 
        }

        // Support both new format (cart_items) and legacy format (product_ids)
        let cartItems: Array<{ product_id: string; color: string | null; size: string | null; quantity: number }> = []
        
        if (body.cart_items && Array.isArray(body.cart_items) && body.cart_items.length > 0) {
            // New format: cart items with variant info
            cartItems = body.cart_items
        } else if (body.product_ids && Array.isArray(body.product_ids) && body.product_ids.length > 0) {
            // Legacy format: convert product_ids to cart_items (no variant info)
            cartItems = body.product_ids.map(id => ({
                product_id: id,
                color: null,
                size: null,
                quantity: 1
            }))
        } else {
            return NextResponse.json(
                { error: 'cart_items or product_ids is required and must be a non-empty array.' },
                { status: 400 }
            )
        }

        // Forward cart_items and currency to the Spensit API.
        // The API will validate stock, fetch product details, and create tempcheckout entry.
        const result = await spensitApi.createCheckout(cartItems, body.currency)

        // Return the full result including link_id for client-side URL construction.
        return NextResponse.json(result)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Checkout failed'
        console.error('Checkout API route error:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
