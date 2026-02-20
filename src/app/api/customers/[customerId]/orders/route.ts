/**
 * route.ts — GET /api/customers/[customerId]/orders
 *
 * Proxy for fetching a customer's order history.
 * Supports query params: page, limit, status, payment_status.
 */

import { NextRequest, NextResponse } from 'next/server'
import { spensitApi } from '@/lib/api/client'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ customerId: string }> }
) {
    try {
        const { customerId } = await params
        const { searchParams } = new URL(request.url)

        const options = {
            page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
            limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
            status: searchParams.get('status') ?? undefined,
            paymentStatus: searchParams.get('payment_status') ?? undefined,
        }

        const result = await spensitApi.getCustomerOrders(customerId, options)
        return NextResponse.json(result)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch orders'
        console.error('Get customer orders error:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
