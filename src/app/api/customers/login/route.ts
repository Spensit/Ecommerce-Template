/**
 * route.ts — POST /api/customers/login
 *
 * Proxy for customer login. Returns customer data including the customer_id
 * needed for subsequent order API calls.
 */

import { NextRequest, NextResponse } from 'next/server'
import { spensitApi } from '@/lib/api/client'

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as {
            email_address?: string
            password?: string
        }

        if (!body.email_address || !body.password) {
            return NextResponse.json(
                { error: 'email_address and password are required.' },
                { status: 400 }
            )
        }

        const result = await spensitApi.loginCustomer(body.email_address, body.password)
        return NextResponse.json(result)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed'
        console.error('Customer login error:', message)
        // Return 401 for authentication failures so the client can distinguish
        const status = message.includes('401') || message.toLowerCase().includes('invalid') ? 401 : 500
        return NextResponse.json({ error: message }, { status })
    }
}
