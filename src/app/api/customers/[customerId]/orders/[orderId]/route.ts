/**
 * route.ts — PATCH /api/customers/[customerId]/orders/[orderId]
 *
 * Proxy for cancelling a customer order.
 * Body: { action: "cancel" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { spensitApi } from '@/lib/api/client'

export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ customerId: string; orderId: string }> }
) {
    try {
        const { customerId, orderId } = await params
        const result = await spensitApi.cancelOrder(customerId, orderId)
        return NextResponse.json(result)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Cancel order failed'
        console.error('Cancel order error:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
